import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';

@Injectable()
export class BonsaiService {
  private readonly logger = new Logger(BonsaiService.name);
  private readonly cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN ?? '';
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION });
  private readonly bucket = process.env.S3_BUCKET_NAME ?? '';

  constructor(private readonly prisma: PrismaService) {}

  private toResponseDto(bonsai: any) {
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
    return bonsais.map((b: any) => this.toResponseDto(b));
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
    const bonsai = await this.prisma.bonsai.create({
      data: {
        ...createBonsaiDto,
        owner,
      },
    });
    return this.toResponseDto(bonsai);
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
      data: updateBonsaiDto,
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

    const deleted = await this.prisma.bonsai.delete({ where: { id } });

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
