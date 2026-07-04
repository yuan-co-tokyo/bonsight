import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PresignRequestDto } from './dto/presign-request.dto';
import { CreateMediaDto } from './dto/create-media.dto';

export { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION });
  private readonly bucket = process.env.S3_BUCKET_NAME!;
  private readonly cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN!;

  constructor(private readonly prisma: PrismaService) {}

  private async verifyBonsaiOwner(bonsaiId: string, sub: string) {
    const bonsai = await this.prisma.bonsai.findUnique({ where: { id: bonsaiId } });
    if (!bonsai) throw new NotFoundException(`Bonsai ${bonsaiId} not found`);
    if (bonsai.owner !== sub) throw new ForbiddenException();
    return bonsai;
  }

  async presign(dto: PresignRequestDto, sub: string) {
    const timestamp = Date.now();
    let s3Key: string;
    if (dto.type === 'cover') {
      s3Key = `users/${sub}/covers/${timestamp}-${dto.filename}`;
    } else {
      await this.verifyBonsaiOwner(dto.bonsaiId!, sub);
      s3Key = `users/${sub}/bonsai/${dto.bonsaiId}/${timestamp}-${dto.filename}`;
    }
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: dto.contentType,
    });
    const presignedUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { presignedUrl, s3Key };
  }

  async createMedia(bonsaiId: string, dto: CreateMediaDto, sub: string) {
    await this.verifyBonsaiOwner(bonsaiId, sub);
    const expectedPrefix = `users/${sub}/bonsai/${bonsaiId}/`;
    if (!dto.s3Key.startsWith(expectedPrefix)) {
      throw new ForbiddenException('s3Key prefix mismatch');
    }
    const media = await this.prisma.media.create({
      data: {
        bonsaiId,
        s3Key: dto.s3Key,
        caption: dto.caption,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : undefined,
        type: dto.type ?? 'PHOTO',
      },
    });
    const cloudfrontUrl = `${this.cloudfrontDomain}/${media.s3Key}`;
    return { ...media, cloudfrontUrl };
  }

  async getMedia(bonsaiId: string, sub: string) {
    await this.verifyBonsaiOwner(bonsaiId, sub);
    const items = await this.prisma.media.findMany({
      where: { bonsaiId },
      orderBy: { takenAt: 'asc' },
    });
    return items.map((m) => ({
      ...m,
      cloudfrontUrl: `${this.cloudfrontDomain}/${m.s3Key}`,
    }));
  }

  async deleteMedia(bonsaiId: string, id: string, sub: string) {
    await this.verifyBonsaiOwner(bonsaiId, sub);

    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException(`Media ${id} not found`);
    if (media.bonsaiId !== bonsaiId) throw new ForbiddenException('Media does not belong to this bonsai');

    await this.prisma.media.delete({ where: { id } });

    if (this.bucket) {
      try {
        await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: media.s3Key }));
      } catch {
        // best-effort: S3 failure does not affect DB result
      }
    }

    try {
      await this.prisma.aIAdvice.updateMany({ where: { mediaId: id }, data: { mediaId: null } });
    } catch {
      // best-effort: FK absent, failure is non-fatal
    }

    return { id };
  }
}
