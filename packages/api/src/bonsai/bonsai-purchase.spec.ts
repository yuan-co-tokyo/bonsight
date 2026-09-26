jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  CopyObjectCommand: jest.fn((input: unknown) => input),
  DeleteObjectsCommand: jest.fn((input: unknown) => input),
}));
import { S3Client } from '@aws-sdk/client-s3';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '../../generated/prisma';
import { BonsaiService } from './bonsai.service';
const query = () => jest.fn<Promise<unknown>, [unknown]>();
const check = {
  id: 'c1',
  owner: 'me',
  status: 'CONSIDERING',
  bonsaiId: null,
  photoKeys: [
    'users/me/purchase-checks/whole photo.jpg',
    'users/me/purchase-checks/base.jpg',
  ],
  photoRoles: ['OVERALL', 'BASE'],
  createdAt: new Date('2026-09-25T00:00:00Z'),
};
describe('purchase check registration', () => {
  const tx = {
    bonsai: { create: query() },
    purchaseCheck: { findUnique: query(), updateMany: query() },
  };
  const prisma = {
    $transaction: jest.fn(
      (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
    ),
    bonsai: { update: query() },
    media: { create: query() },
  };
  const send = query();
  let service: BonsaiService;
  beforeEach(() => {
    jest.clearAllMocks();
    send.mockReset().mockResolvedValue({});
    (S3Client as jest.Mock).mockImplementation(() => ({ send }));
    tx.purchaseCheck.findUnique.mockResolvedValue(check);
    tx.purchaseCheck.updateMany.mockResolvedValue({ count: 1 });
    tx.bonsai.create.mockResolvedValue({
      id: 'b1',
      owner: 'me',
      name: '松',
      coverImageKey: null,
    });
    service = new BonsaiService(prisma as unknown as PrismaClient);
  });
  it('copies overall as cover and all photos as Media, and claims the check in the creation transaction', async () => {
    const result = await service.createBonsai(
      { name: '松', purchaseCheckId: 'c1' },
      'me',
    );
    expect(result).toMatchObject({
      id: 'b1',
      photoCopyFailed: false,
      coverImageKey: expect.stringMatching(
        /^users\/me\/covers\/.+\.jpg$/,
      ) as unknown,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.purchaseCheck.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'c1',
        owner: 'me',
        bonsaiId: null,
        status: { in: ['CONSIDERING', 'PASSED'] },
      },
      data: { status: 'PURCHASED', bonsaiId: 'b1' },
    });
    expect(tx.bonsai.create).toHaveBeenCalledWith({
      data: { name: '松', owner: 'me' },
    });
    expect(send).toHaveBeenCalledTimes(3);
    expect(send.mock.calls[0][0]).toHaveProperty(
      'CopySource',
      expect.stringContaining('whole%20photo.jpg'),
    );
    expect(prisma.media.create).toHaveBeenNthCalledWith(1, {
      data: {
        bonsaiId: 'b1',
        s3Key: expect.stringMatching(
          /^users\/me\/bonsai\/b1\/.+\.jpg$/,
        ) as unknown,
        type: 'PHOTO',
        caption: '購入前チェック（全体）',
        takenAt: check.createdAt,
      },
    });
    expect(prisma.media.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        caption: '購入前チェック（根元）',
      }) as unknown,
    });
  });
  it('prefers the cover chosen in the form but still copies all Media', async () => {
    const coverImageKey = 'users/me/covers/chosen.jpg';
    tx.bonsai.create.mockResolvedValue({
      id: 'b1',
      owner: 'me',
      coverImageKey,
    });
    const result = await service.createBonsai(
      { name: '松', purchaseCheckId: 'c1', coverImageKey },
      'me',
    );
    expect(result.coverImageKey).toBe(coverImageKey);
    expect(send).toHaveBeenCalledTimes(2);
    expect(prisma.bonsai.update).not.toHaveBeenCalled();
  });
  it('returns a successful registration with warning when every copy fails', async () => {
    send.mockRejectedValue(new Error('S3 unavailable'));
    const result = await service.createBonsai(
      { name: '松', purchaseCheckId: 'c1' },
      'me',
    );
    expect(result).toMatchObject({ id: 'b1', photoCopyFailed: true });
    expect(tx.purchaseCheck.updateMany).toHaveBeenCalled();
    expect(prisma.media.create).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(3);
  });
  it('continues Media copies after a failed cover copy', async () => {
    send.mockRejectedValueOnce(new Error('cover failed'));
    const result = await service.createBonsai(
      { name: '松', purchaseCheckId: 'c1' },
      'me',
    );
    expect(result).toMatchObject({ photoCopyFailed: true });
    expect(prisma.media.create).toHaveBeenCalledTimes(2);
  });
  it.each([
    [null, NotFoundException],
    [{ ...check, owner: 'other' }, ForbiddenException],
    [{ ...check, bonsaiId: 'already', status: 'PURCHASED' }, ConflictException],
  ])(
    'rejects an unavailable check before creation',
    async (record, exception) => {
      tx.purchaseCheck.findUnique.mockResolvedValue(record);
      await expect(
        service.createBonsai({ name: '松', purchaseCheckId: 'c1' }, 'me'),
      ).rejects.toBeInstanceOf(exception);
      expect(tx.bonsai.create).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    },
  );
  it('rejects a lost concurrent claim from inside the transaction before copying', async () => {
    tx.purchaseCheck.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.createBonsai({ name: '松', purchaseCheckId: 'c1' }, 'me'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(send).not.toHaveBeenCalled();
  });
});
