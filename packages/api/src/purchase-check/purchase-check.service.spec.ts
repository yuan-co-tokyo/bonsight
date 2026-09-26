jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  GetObjectCommand: jest.fn((input: unknown) => input),
  DeleteObjectsCommand: jest.fn((input: unknown) => input),
}));
import { S3Client } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { BedrockService } from '../bedrock/bedrock.service';
import type { PrismaClient } from '../../generated/prisma';
import { PurchaseCheckService } from './purchase-check.service';
import { CreatePurchaseCheckDto } from './create-purchase-check.dto';
import { sampleResult } from './purchase-check.fixture';

import { UpdatePurchaseCheckDto } from './update-purchase-check.dto';

const key = 'users/me/purchase-checks/123-photo.jpg';
const check = {
  id: 'c1',
  owner: 'me',
  photoKeys: [key],
  photoRoles: ['OVERALL'],
  species: null,
  heightCm: null,
  price: 9800,
  sellerNote: null,
  experience: 'BEGINNER',
  result: sampleResult,
  createdAt: new Date(),
};
const query = () => jest.fn<Promise<unknown>, [unknown]>();
describe('PurchaseCheckService', () => {
  const prisma = {
    user: { findFirst: query() },
    purchaseCheck: {
      create: query(),
      findMany: query(),
      findUnique: query(),
      delete: query(),
      updateMany: query(),
    },
  };
  const converse = jest.fn<
    Promise<unknown>,
    [Parameters<BedrockService['converse']>[0]]
  >();
  const send = query();
  let service: PurchaseCheckService;
  beforeEach(() => {
    jest.clearAllMocks();
    send.mockReset();
    converse.mockReset();
    (S3Client as jest.Mock).mockImplementation(() => ({ send }));
    send.mockResolvedValue({
      Body: {
        transformToByteArray: () => Promise.resolve(new Uint8Array([1])),
      },
    });
    prisma.user.findFirst.mockResolvedValue({ region: '東京' });
    prisma.purchaseCheck.create.mockResolvedValue(check);
    prisma.purchaseCheck.findMany.mockResolvedValue([check]);
    prisma.purchaseCheck.findUnique.mockResolvedValue(check);
    converse.mockResolvedValue({
      output: {
        message: {
          content: [
            { toolUse: { name: 'record_purchase_check', input: sampleResult } },
          ],
        },
      },
    });
    service = new PurchaseCheckService(
      prisma as unknown as PrismaClient,
      { converse } as unknown as BedrockService,
    );
  });
  const dto: CreatePurchaseCheckDto = {
    photoKeys: [key],
    photoRoles: ['OVERALL'],
    experience: 'BEGINNER',
    price: 9800,
  };
  it('診断して保存するが価格はモデルへ渡さない', async () => {
    expect(await service.create(dto, 'me')).toMatchObject({
      id: 'c1',
      price: 9800,
    });
    expect(prisma.purchaseCheck.create.mock.calls[0][0]).toHaveProperty(
      'data.price',
      9800,
    );
    expect(JSON.stringify(converse.mock.calls[0][0].messages)).not.toContain(
      '9800',
    );
    expect(converse.mock.calls[0][0]).toHaveProperty(
      'toolConfig.toolChoice.tool.name',
      'record_purchase_check',
    );
  });
  it.each([{ photoKeys: [] }, { photoKeys: [key, key, key, key] }])(
    '写真件数が範囲外なら400',
    async ({ photoKeys }) => {
      await expect(
        service.create({ ...dto, photoKeys }, 'me'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(converse).not.toHaveBeenCalled();
    },
  );
  it.each([
    { roles: [] },
    { roles: ['BASE'] },
    { roles: ['OVERALL', 'OVERALL'] },
    { roles: ['OVERALL', 'BASE'] },
  ])('ロール欠落/重複/長さ不一致は400: %j', async ({ roles }) => {
    await expect(
      service.create(
        { ...dto, photoRoles: roles as CreatePurchaseCheckDto['photoRoles'] },
        'me',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('全体と葉だけでも正しいラベルを送る', async () => {
    await service.create(
      {
        ...dto,
        photoKeys: [key, 'users/me/purchase-checks/leaf.png'],
        photoRoles: ['OVERALL', 'FOLIAGE'],
      },
      'me',
    );
    expect(JSON.stringify(converse.mock.calls[0][0].messages)).toContain('葉');
    expect(prisma.purchaseCheck.create.mock.calls[0][0]).toHaveProperty(
      'data.photoRoles',
      ['OVERALL', 'FOLIAGE'],
    );
  });
  it('他人の写真は403', async () => {
    await expect(
      service.create(
        { ...dto, photoKeys: ['users/other/purchase-checks/a.jpg'] },
        'me',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(send).not.toHaveBeenCalled();
  });
  it('一覧は自分の分だけ新しい順', async () => {
    await service.list('me');
    expect(prisma.purchaseCheck.findMany).toHaveBeenCalledWith({
      where: { owner: 'me' },
      orderBy: { createdAt: 'desc' },
    });
  });
  it('取得と削除は所有者を検証する', async () => {
    await expect(service.get('c1', 'other')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.delete('c1', 'other')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(send).not.toHaveBeenCalled();
    expect(prisma.purchaseCheck.delete).not.toHaveBeenCalled();
    prisma.purchaseCheck.findUnique.mockResolvedValue(null);
    await expect(service.get('missing', 'me')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('写真を削除してから記録を削除する', async () => {
    send.mockResolvedValue({});
    await expect(service.delete('c1', 'me')).resolves.toEqual({ id: 'c1' });
    expect(send.mock.calls[0][0]).toHaveProperty('Delete.Objects', [
      { Key: key },
    ]);
    expect(prisma.purchaseCheck.delete).toHaveBeenCalledWith({
      where: { id: 'c1' },
    });
  });
  it('S3の一部削除失敗では記録を残して再試行できる', async () => {
    send.mockResolvedValue({ Errors: [{ Key: key, Code: 'AccessDenied' }] });
    await expect(service.delete('c1', 'me')).rejects.toThrow();
    expect(prisma.purchaseCheck.delete).not.toHaveBeenCalled();
  });
  it.each([
    ['ThrottlingException', 503],
    ['ResourceNotFoundException', 503],
    ['AccessDeniedException', 500],
    ['ValidationException', 400],
    ['Error', 503],
  ])('Bedrock %sをHTTP %sへ変換する', async (name, status) => {
    converse.mockRejectedValue(Object.assign(new Error('test'), { name }));
    await expect(service.create(dto, 'me')).rejects.toMatchObject({ status });
    expect(prisma.purchaseCheck.create).not.toHaveBeenCalled();
  });
  it('DTOは価格/樹高/件数/経験/ロールを検証する', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true });
    for (const invalid of [
      { photoKeys: [] },
      { photoRoles: undefined },
      { experience: 'EXPERT' },
      { price: -1 },
      { heightCm: 1.5 },
      { photoKeys: [key, key] },
    ]) {
      await expect(
        pipe.transform(
          { ...dto, ...invalid },
          { type: 'body', metatype: CreatePurchaseCheckDto },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
  });
  it.each(['CONSIDERING', 'PASSED'] as const)(
    'updates status to %s for an unregistered owned check',
    async (status) => {
      prisma.purchaseCheck.updateMany.mockResolvedValue({ count: 1 });
      await service.update('c1', { status }, 'me');
      expect(prisma.purchaseCheck.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'c1',
          owner: 'me',
          bonsaiId: null,
          status: { in: ['CONSIDERING', 'PASSED'] },
        },
        data: { status },
      });
    },
  );
  it('cannot update a purchased check', async () => {
    prisma.purchaseCheck.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.update('c1', { status: 'PASSED' }, 'me'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('cannot update another owner check', async () => {
    await expect(
      service.update('c1', { status: 'PASSED' }, 'other'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.purchaseCheck.updateMany).not.toHaveBeenCalled();
  });
  it.each(['PURCHASED', 'invalid', null, undefined])(
    'rejects status %s at the API boundary',
    async (status) => {
      const pipe = new ValidationPipe({ whitelist: true, transform: true });
      await expect(
        pipe.transform(
          { status },
          { type: 'body', metatype: UpdatePurchaseCheckDto },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
});
