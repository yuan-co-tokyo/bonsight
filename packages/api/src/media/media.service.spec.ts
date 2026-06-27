import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MediaService, CreateMediaDto } from './media.service';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
  },
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const OWNER = 'cognito-sub-owner';
const OTHER = 'cognito-sub-other';
const BONSAI_ID = 'bonsai-001';
const BONSAI = { id: BONSAI_ID, owner: OWNER, name: 'Goyomatsu' };

const originalEnv = process.env;

describe('MediaService', () => {
  const prisma = {
    bonsai: {
      findUnique: jest.fn(),
    },
    media: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  let service: MediaService;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      AWS_REGION: 'ap-northeast-1',
      S3_BUCKET_NAME: 'bonsight-dev-media',
      CLOUDFRONT_DOMAIN: 'https://xxxx.cloudfront.net',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MediaService(prisma as never);
  });

  describe('presign', () => {
    it('returns presignedUrl and s3Key with correct key pattern', async () => {
      prisma.bonsai.findUnique.mockResolvedValue(BONSAI);
      (getSignedUrl as jest.Mock).mockResolvedValue('https://s3.presigned.url');

      const result = await service.presign(
        { bonsaiId: BONSAI_ID, filename: 'photo.jpg', contentType: 'image/jpeg' },
        OWNER,
      );

      expect(result.presignedUrl).toBe('https://s3.presigned.url');
      expect(result.s3Key).toMatch(
        new RegExp(`^users/${OWNER}/bonsai/${BONSAI_ID}/\\d+-photo\\.jpg$`),
      );
    });

    it('throws ForbiddenException when bonsai belongs to another user', async () => {
      prisma.bonsai.findUnique.mockResolvedValue({ ...BONSAI, owner: OTHER });

      await expect(
        service.presign(
          { bonsaiId: BONSAI_ID, filename: 'photo.jpg', contentType: 'image/jpeg' },
          OWNER,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFoundException when bonsai does not exist', async () => {
      prisma.bonsai.findUnique.mockResolvedValue(null);

      await expect(
        service.presign(
          { bonsaiId: 'missing', filename: 'photo.jpg', contentType: 'image/jpeg' },
          OWNER,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('createMedia', () => {
    const dto: CreateMediaDto = { s3Key: 'users/owner/bonsai/001/ts-photo.jpg' };

    it('creates a media record and returns it with cloudfrontUrl', async () => {
      prisma.bonsai.findUnique.mockResolvedValue(BONSAI);
      const created = { id: 'media-1', bonsaiId: BONSAI_ID, s3Key: dto.s3Key };
      prisma.media.create.mockResolvedValue(created);

      const result = await service.createMedia(BONSAI_ID, dto, OWNER);

      expect(result.s3Key).toBe(dto.s3Key);
      expect(result.cloudfrontUrl).toBe(
        `https://xxxx.cloudfront.net/${dto.s3Key}`,
      );
    });

    it('throws ForbiddenException for another user\'s bonsai', async () => {
      prisma.bonsai.findUnique.mockResolvedValue({ ...BONSAI, owner: OTHER });

      await expect(service.createMedia(BONSAI_ID, dto, OWNER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('getMedia', () => {
    it('returns media list with cloudfrontUrl ordered by takenAt asc', async () => {
      prisma.bonsai.findUnique.mockResolvedValue(BONSAI);
      const items = [
        { id: 'm1', bonsaiId: BONSAI_ID, s3Key: 'key1', takenAt: new Date('2025-01-01') },
        { id: 'm2', bonsaiId: BONSAI_ID, s3Key: 'key2', takenAt: new Date('2025-06-01') },
      ];
      prisma.media.findMany.mockResolvedValue(items);

      const result = await service.getMedia(BONSAI_ID, OWNER);

      expect(result).toHaveLength(2);
      expect(result[0].cloudfrontUrl).toBe('https://xxxx.cloudfront.net/key1');
      expect(result[1].cloudfrontUrl).toBe('https://xxxx.cloudfront.net/key2');
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: { bonsaiId: BONSAI_ID },
        orderBy: { takenAt: 'asc' },
      });
    });

    it('throws ForbiddenException for another user\'s bonsai', async () => {
      prisma.bonsai.findUnique.mockResolvedValue({ ...BONSAI, owner: OTHER });

      await expect(service.getMedia(BONSAI_ID, OWNER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
