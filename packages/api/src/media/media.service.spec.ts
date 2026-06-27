import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { PresignRequestDto } from './dto/presign-request.dto';

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
const VALID_S3KEY = `users/${OWNER}/bonsai/${BONSAI_ID}/ts-photo.jpg`;

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

  describe('PresignRequestDto validation', () => {
    it('fails validation when all fields are missing', async () => {
      const dto = Object.assign(new PresignRequestDto(), {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('passes validation with all required string fields', async () => {
      const dto = Object.assign(new PresignRequestDto(), {
        bonsaiId: 'b1',
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('CreateMediaDto validation', () => {
    it('fails validation when s3Key is missing', async () => {
      const dto = Object.assign(new CreateMediaDto(), {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 's3Key')).toBe(true);
    });

    it('passes validation with required s3Key', async () => {
      const dto = Object.assign(new CreateMediaDto(), { s3Key: 'users/sub/bonsai/id/file.jpg' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('fails validation when type is invalid', async () => {
      const dto = Object.assign(new CreateMediaDto(), { s3Key: 'key', type: 'AUDIO' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'type')).toBe(true);
    });
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

    it('type=cover returns s3Key with users/{sub}/covers/ prefix', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('https://s3.presigned.cover');

      const result = await service.presign(
        { filename: 'cover.jpg', contentType: 'image/jpeg', type: 'cover' },
        OWNER,
      );

      expect(result.presignedUrl).toBe('https://s3.presigned.cover');
      expect(result.s3Key).toMatch(
        new RegExp(`^users/${OWNER}/covers/\\d+-cover\\.jpg$`),
      );
    });

    it('type=cover succeeds without bonsaiId', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('https://s3.presigned.cover');

      await expect(
        service.presign(
          { filename: 'cover.jpg', contentType: 'image/jpeg', type: 'cover' },
          OWNER,
        ),
      ).resolves.toBeDefined();
      expect(prisma.bonsai.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('createMedia', () => {
    it('creates a media record and returns it with cloudfrontUrl', async () => {
      prisma.bonsai.findUnique.mockResolvedValue(BONSAI);
      const created = { id: 'media-1', bonsaiId: BONSAI_ID, s3Key: VALID_S3KEY };
      prisma.media.create.mockResolvedValue(created);

      const result = await service.createMedia(BONSAI_ID, { s3Key: VALID_S3KEY }, OWNER);

      expect(result.s3Key).toBe(VALID_S3KEY);
      expect(result.cloudfrontUrl).toBe(
        `https://xxxx.cloudfront.net/${VALID_S3KEY}`,
      );
    });

    it('throws ForbiddenException for another user\'s bonsai', async () => {
      prisma.bonsai.findUnique.mockResolvedValue({ ...BONSAI, owner: OTHER });

      await expect(
        service.createMedia(BONSAI_ID, { s3Key: VALID_S3KEY }, OWNER),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws ForbiddenException when s3Key prefix does not match owner/bonsaiId', async () => {
      prisma.bonsai.findUnique.mockResolvedValue(BONSAI);

      const maliciousKey = `users/${OTHER}/bonsai/${BONSAI_ID}/stolen.jpg`;
      await expect(
        service.createMedia(BONSAI_ID, { s3Key: maliciousKey }, OWNER),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws ForbiddenException when s3Key uses different bonsaiId', async () => {
      prisma.bonsai.findUnique.mockResolvedValue(BONSAI);

      const wrongBonsaiKey = `users/${OWNER}/bonsai/other-bonsai/file.jpg`;
      await expect(
        service.createMedia(BONSAI_ID, { s3Key: wrongBonsaiKey }, OWNER),
      ).rejects.toBeInstanceOf(ForbiddenException);
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
