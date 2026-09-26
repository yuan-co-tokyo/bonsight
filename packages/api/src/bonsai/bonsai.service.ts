import {
  ForbiddenException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';
import {
  S3Client,
  DeleteObjectsCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';

import { randomUUID } from 'node:crypto';
import type {
  Bonsai,
  PrismaClient,
  PurchaseCheck,
} from '../../generated/prisma';

@Injectable()
export class BonsaiService {
  private readonly logger = new Logger(BonsaiService.name);
  private readonly cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN ?? '';
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION });
  private readonly bucket = process.env.S3_BUCKET_NAME ?? '';

  constructor(@Inject(PrismaService) private readonly prisma: PrismaClient) {}

  private toResponseDto(bonsai: Bonsai) {
    return {
      ...bonsai,
      coverImageUrl: bonsai.coverImageKey
        ? `${this.cloudfrontDomain}/${bonsai.coverImageKey}`
        : null,
    };
  }

  async getBonsais(owner: string) {
    const bonsais = await this.prisma.bonsai.findMany({
      where: { owner },
      orderBy: { createdAt: 'desc' },
    });
    return bonsais.map((b) => this.toResponseDto(b));
  }

  async getBonsai(id: string, owner: string) {
    const bonsai = await this.prisma.bonsai.findUnique({ where: { id } });
    if (!bonsai || bonsai.owner !== owner) {
      throw new NotFoundException(`Bonsai ${id} not found`);
    }
    return this.toResponseDto(bonsai);
  }

  async createBonsai(createBonsaiDto: CreateBonsaiDto, owner: string) {
    if (createBonsaiDto.coverImageKey) {
      const coverPrefix = `users/${owner}/covers/`;
      if (!createBonsaiDto.coverImageKey.startsWith(coverPrefix)) {
        throw new ForbiddenException('coverImageKey prefix mismatch');
      }
    }
    const { purchaseCheckId, ...fields } = createBonsaiDto;
    const data = {
      ...fields,
      acquiredAt:
        fields.acquiredAt == null
          ? fields.acquiredAt
          : new Date(fields.acquiredAt),
      owner,
    };
    if (!purchaseCheckId)
      return this.toResponseDto(await this.prisma.bonsai.create({ data }));

    // The conditional claim serializes simultaneous registrations. A losing
    // transaction rolls back its new bonsai as well as the claim.
    const { bonsai, check } = await this.prisma.$transaction(async (tx) => {
      const check = await tx.purchaseCheck.findUnique({
        where: { id: purchaseCheckId },
      });
      if (!check) throw new NotFoundException('購入前チェックが見つかりません');
      if (check.owner !== owner) throw new ForbiddenException();
      if (check.bonsaiId || check.status === 'PURCHASED')
        throw new ConflictException('このチェックからは登録済みです');
      const bonsai = await tx.bonsai.create({ data });
      const claimed = await tx.purchaseCheck.updateMany({
        where: {
          id: purchaseCheckId,
          owner,
          bonsaiId: null,
          status: { in: ['CONSIDERING', 'PASSED'] },
        },
        data: { status: 'PURCHASED', bonsaiId: bonsai.id },
      });
      if (claimed.count !== 1)
        throw new ConflictException('このチェックからは登録済みです');
      return { bonsai, check };
    });
    return this.copyPurchasePhotos(bonsai, check);
  }

  private async copyPurchasePhotos(bonsai: Bonsai, check: PurchaseCheck) {
    let photoCopyFailed = false;
    const labels: Record<string, string> = {
      OVERALL: '全体',
      BASE: '根元',
      FOLIAGE: '葉',
    };
    for (const [index, source] of check.photoKeys.entries()) {
      const role = check.photoRoles[index];
      const copy = async (key: string) => {
        if (!source.startsWith(`users/${bonsai.owner}/purchase-checks/`))
          throw new Error('Photo owner prefix mismatch');
        await this.s3.send(
          new CopyObjectCommand({
            Bucket: this.bucket,
            Key: key,
            CopySource: `${this.bucket}/${source.split('/').map(encodeURIComponent).join('/')}`,
          }),
        );
      };
      const extension = source.split('.').pop()?.toLowerCase() ?? 'jpg';
      if (role === 'OVERALL' && !bonsai.coverImageKey) {
        try {
          const key = `users/${bonsai.owner}/covers/${randomUUID()}.${extension}`;
          await copy(key);
          await this.prisma.bonsai.update({
            where: { id: bonsai.id },
            data: { coverImageKey: key },
          });
          bonsai = { ...bonsai, coverImageKey: key };
        } catch (error) {
          photoCopyFailed = true;
          this.logger.warn(
            `Purchase cover copy failed for bonsai ${bonsai.id}: ${String(error)}`,
          );
        }
      }
      try {
        const key = `users/${bonsai.owner}/bonsai/${bonsai.id}/${randomUUID()}.${extension}`;
        await copy(key);
        await this.prisma.media.create({
          data: {
            bonsaiId: bonsai.id,
            s3Key: key,
            type: 'PHOTO',
            takenAt: check.createdAt,
            caption: `購入前チェック（${labels[role] ?? role}）`,
          },
        });
      } catch (error) {
        photoCopyFailed = true;
        this.logger.warn(
          `Purchase photo copy failed for bonsai ${bonsai.id}: ${String(error)}`,
        );
      }
    }
    return { ...this.toResponseDto(bonsai), photoCopyFailed };
  }

  async updateBonsai(
    id: string,
    updateBonsaiDto: UpdateBonsaiDto,
    owner: string,
  ) {
    await this.getBonsai(id, owner);
    if (updateBonsaiDto.coverImageKey) {
      const coverPrefix = `users/${owner}/covers/`;
      if (!updateBonsaiDto.coverImageKey.startsWith(coverPrefix)) {
        throw new ForbiddenException('coverImageKey prefix mismatch');
      }
    }
    const bonsai = await this.prisma.bonsai.update({
      where: { id },
      data: {
        ...updateBonsaiDto,
        acquiredAt:
          updateBonsaiDto.acquiredAt == null
            ? updateBonsaiDto.acquiredAt
            : new Date(updateBonsaiDto.acquiredAt),
      },
    });
    return this.toResponseDto(bonsai);
  }

  async deleteBonsai(id: string, owner: string) {
    const bonsai = await this.getBonsai(id, owner);

    const mediaItems = await this.prisma.media.findMany({
      where: { bonsaiId: id },
      select: { s3Key: true },
    });

    const s3Keys: string[] = mediaItems.map((m: { s3Key: string }) => m.s3Key);
    if (bonsai.coverImageKey) {
      s3Keys.push(bonsai.coverImageKey);
    }

    // Keep the purchase check as PURCHASED but drop its link to the deleted bonsai.
    const [, deleted] = await this.prisma.$transaction([
      this.prisma.purchaseCheck.updateMany({
        where: { bonsaiId: id },
        data: { bonsaiId: null },
      }),
      this.prisma.bonsai.delete({ where: { id } }),
    ]);

    if (s3Keys.length > 0 && this.bucket) {
      try {
        await this.s3.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: { Objects: s3Keys.map((Key) => ({ Key })) },
          }),
        );
      } catch (err) {
        this.logger.error(`S3 cleanup failed for bonsai ${id}`, err);
      }
    }

    return deleted;
  }
}
