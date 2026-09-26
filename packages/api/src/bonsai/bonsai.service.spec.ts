import {
  BadRequestException,
  ValidationPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';
import { BonsaiService } from './bonsai.service';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
  },
}));

const OWNER = 'cognito-sub-abc123';
const OTHER = 'cognito-sub-other';
const CLOUDFRONT = 'https://xxxx.cloudfront.net';
const VALID_COVER_KEY = `users/${OWNER}/covers/1234567890-cover.jpg`;

const originalEnv = process.env;

describe('BonsaiService', () => {
  const prisma = {
    bonsai: {
      findMany: jest.fn<Promise<unknown>, [unknown]>(),
      create: jest.fn<Promise<unknown>, [unknown]>(),
      findUnique: jest.fn<Promise<unknown>, [unknown]>(),
      update: jest.fn<Promise<unknown>, [unknown]>(),
      delete: jest.fn<Promise<unknown>, [unknown]>(),
    },
    purchaseCheck: {
      updateMany: jest.fn<Promise<unknown>, [unknown]>(),
    },
    media: {
      findMany: jest.fn<Promise<unknown>, [unknown]>(),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  let service: BonsaiService;

  beforeAll(() => {
    process.env = { ...originalEnv, CLOUDFRONT_DOMAIN: CLOUDFRONT };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BonsaiService(prisma as never);
  });

  const pipe = new ValidationPipe({ whitelist: true, transform: true });

  it.each(['2026-06-01', '2026-06-01T00:00:00.000Z'])(
    '日付%sをDateとしてcreate/updateへ保存する',
    async (acquiredAt) => {
      prisma.bonsai.create.mockResolvedValue({ id: 'b1' });
      prisma.bonsai.findUnique.mockResolvedValue({ id: 'b1', owner: OWNER });
      prisma.bonsai.update.mockResolvedValue({ id: 'b1' });
      const create = (await pipe.transform(
        { name: '松', acquiredAt },
        { type: 'body', metatype: CreateBonsaiDto },
      )) as CreateBonsaiDto;
      await service.createBonsai(create, OWNER);
      expect(prisma.bonsai.create.mock.calls[0][0]).toHaveProperty(
        'data.acquiredAt',
        new Date('2026-06-01T00:00:00Z'),
      );
      const update = (await pipe.transform(
        { acquiredAt },
        { type: 'body', metatype: UpdateBonsaiDto },
      )) as UpdateBonsaiDto;
      await service.updateBonsai('b1', update, OWNER);
      expect(prisma.bonsai.update.mock.calls[0][0]).toHaveProperty(
        'data.acquiredAt',
        new Date('2026-06-01T00:00:00Z'),
      );
    },
  );

  it.each([null, ''])(
    '更新時のnull/空文字をDBのnullにする: %s',
    async (empty) => {
      prisma.bonsai.findUnique.mockResolvedValue({ id: 'b1', owner: OWNER });
      prisma.bonsai.update.mockResolvedValue({ id: 'b1' });
      const fields = [
        'nickname',
        'species',
        'estimatedAge',
        'acquiredAt',
        'origin',
        'potInfo',
        'style',
        'currentState',
        'coverImageKey',
      ];
      const dto = (await pipe.transform(
        Object.fromEntries(fields.map((key) => [key, empty])),
        { type: 'body', metatype: UpdateBonsaiDto },
      )) as UpdateBonsaiDto;
      await service.updateBonsai('b1', dto, OWNER);
      for (const key of fields)
        expect(prisma.bonsai.update.mock.calls[0][0]).toHaveProperty(
          `data.${key}`,
          null,
        );
    },
  );

  it.each([
    { acquiredAt: '2026-02-30' },
    { acquiredAt: 'invalid' },
    { acquiredAt: 123 },
    { estimatedAge: '約25年' },
    { estimatedAge: '25' },
    { estimatedAge: -1 },
    { estimatedAge: 1.5 },
    { estimatedAge: 2147483648 },
    { species: 123 },
    { name: null },
  ])('不正入力はcreate/updateとも400で拒否: %j', async (invalid) => {
    for (const metatype of [CreateBonsaiDto, UpdateBonsaiDto]) {
      await expect(
        pipe.transform({ name: '松', ...invalid }, { type: 'body', metatype }),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(prisma.bonsai.create).not.toHaveBeenCalled();
    expect(prisma.bonsai.update).not.toHaveBeenCalled();
  });

  it('finds all bonsai for the authenticated owner ordered by newest first', async () => {
    const bonsais = [
      { id: 'bonsai-1', name: 'Goyomatsu', owner: OWNER, coverImageKey: null },
    ];
    prisma.bonsai.findMany.mockResolvedValue(bonsais);

    const result = await service.getBonsais(OWNER);
    expect(result).toMatchObject([
      { id: 'bonsai-1', name: 'Goyomatsu', owner: OWNER },
    ]);
    expect(prisma.bonsai.findMany).toHaveBeenCalledWith({
      where: { owner: OWNER },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('creates a bonsai with the authenticated owner', async () => {
    const created = {
      id: 'bonsai-1',
      name: 'Kaede',
      owner: OWNER,
      coverImageKey: null,
    };
    prisma.bonsai.create.mockResolvedValue(created);

    const result = await service.createBonsai({ name: 'Kaede' }, OWNER);
    expect(result).toMatchObject({
      id: 'bonsai-1',
      name: 'Kaede',
      owner: OWNER,
    });
    expect(prisma.bonsai.create).toHaveBeenCalledWith({
      data: {
        name: 'Kaede',
        owner: OWNER,
      },
    });
  });

  it('returns a bonsai when found by id and owner matches', async () => {
    const bonsai = {
      id: 'bonsai-1',
      name: 'Shinpaku',
      owner: OWNER,
      coverImageKey: null,
    };
    prisma.bonsai.findUnique.mockResolvedValue(bonsai);

    const result = await service.getBonsai('bonsai-1', OWNER);
    expect(result).toMatchObject({
      id: 'bonsai-1',
      name: 'Shinpaku',
      owner: OWNER,
    });
    expect(prisma.bonsai.findUnique).toHaveBeenCalledWith({
      where: { id: 'bonsai-1' },
    });
  });

  it('throws NotFoundException when bonsai does not exist', async () => {
    prisma.bonsai.findUnique.mockResolvedValue(null);

    await expect(service.getBonsai('missing', OWNER)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException when bonsai belongs to a different owner', async () => {
    const bonsai = { id: 'bonsai-1', name: 'Shinpaku', owner: 'other-sub' };
    prisma.bonsai.findUnique.mockResolvedValue(bonsai);

    await expect(service.getBonsai('bonsai-1', OWNER)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('checks ownership before updating a bonsai', async () => {
    const existing = {
      id: 'bonsai-1',
      name: 'Old name',
      owner: OWNER,
      coverImageKey: null,
    };
    const updated = {
      id: 'bonsai-1',
      name: 'New name',
      owner: OWNER,
      coverImageKey: null,
    };
    prisma.bonsai.findUnique.mockResolvedValue(existing);
    prisma.bonsai.update.mockResolvedValue(updated);

    const result = await service.updateBonsai(
      'bonsai-1',
      { name: 'New name' },
      OWNER,
    );
    expect(result).toMatchObject({
      id: 'bonsai-1',
      name: 'New name',
      owner: OWNER,
    });
    expect(prisma.bonsai.findUnique).toHaveBeenCalledWith({
      where: { id: 'bonsai-1' },
    });
    expect(prisma.bonsai.update).toHaveBeenCalledWith({
      where: { id: 'bonsai-1' },
      data: { name: 'New name' },
    });
  });

  it('creates a bonsai with coverImageKey and persists it to DB', async () => {
    const created = {
      id: 'b2',
      name: 'Matsu',
      owner: OWNER,
      coverImageKey: VALID_COVER_KEY,
    };
    prisma.bonsai.create.mockResolvedValue(created);

    const result = await service.createBonsai(
      { name: 'Matsu', coverImageKey: VALID_COVER_KEY },
      OWNER,
    );
    expect(result).toMatchObject({ coverImageKey: VALID_COVER_KEY });
    expect(prisma.bonsai.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        coverImageKey: VALID_COVER_KEY,
        owner: OWNER,
      }),
    });
  });

  it('throws ForbiddenException when coverImageKey prefix does not match owner', async () => {
    const maliciousKey = `users/${OTHER}/covers/ts-cover.jpg`;

    await expect(
      service.createBonsai(
        { name: 'Matsu', coverImageKey: maliciousKey },
        OWNER,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.bonsai.create).not.toHaveBeenCalled();
  });

  it('returns coverImageUrl with CLOUDFRONT_DOMAIN when coverImageKey is set', async () => {
    const bonsai = {
      id: 'b3',
      name: 'Kaede',
      owner: OWNER,
      coverImageKey: VALID_COVER_KEY,
    };
    prisma.bonsai.findUnique.mockResolvedValue(bonsai);

    const result = await service.getBonsai('b3', OWNER);
    expect(result.coverImageUrl).toBe(`${CLOUDFRONT}/${VALID_COVER_KEY}`);
  });

  it('returns coverImageUrl as null when coverImageKey is absent', async () => {
    const bonsai = {
      id: 'b4',
      name: 'Keyaki',
      owner: OWNER,
      coverImageKey: null,
    };
    prisma.bonsai.findUnique.mockResolvedValue(bonsai);

    const result = await service.getBonsai('b4', OWNER);
    expect(result.coverImageUrl).toBeNull();
  });

  it('unlinks purchase checks when deleting a bonsai', async () => {
    const bonsai = {
      id: 'b5',
      name: 'Matsu',
      owner: OWNER,
      coverImageKey: null,
    };
    prisma.bonsai.findUnique.mockResolvedValue(bonsai);
    prisma.media.findMany.mockResolvedValue([]);
    prisma.purchaseCheck.updateMany.mockResolvedValue({ count: 1 });
    prisma.bonsai.delete.mockResolvedValue(bonsai);

    await service.deleteBonsai('b5', OWNER);
    expect(prisma.purchaseCheck.updateMany).toHaveBeenCalledWith({
      where: { bonsaiId: 'b5' },
      data: { bonsaiId: null },
    });
    expect(prisma.bonsai.delete).toHaveBeenCalledWith({ where: { id: 'b5' } });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
