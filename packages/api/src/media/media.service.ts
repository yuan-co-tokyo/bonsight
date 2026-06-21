import { Injectable } from '@nestjs/common';

export class CreateMediaDto {
  s3Key!: string;
  caption?: string;
  takenAt?: string;
  type?: 'PHOTO' | 'VIDEO';
}

@Injectable()
export class MediaService {
  getMedia(bonsaiId: string) {
    // TODO: Prisma未結線
    return [];
  }

  presign() {
    // TODO: S3未結線
    return { uploadUrl: '', key: '' };
  }

  createMedia(bonsaiId: string, createMediaDto: CreateMediaDto) {
    // TODO: Prisma未結線
    return { bonsaiId, ...createMediaDto };
  }
}
