import { NotFoundException } from '@nestjs/common';
import { BonsaiService } from './bonsai.service';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
  },
}));

describe('BonsaiService', () => {
  const prisma = {
    bonsai: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: BonsaiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BonsaiService(prisma as never);
  });

  it('finds all bonsai ordered by newest first', async () => {
    const bonsais = [{ id: 'bonsai-1', name: 'Goyomatsu' }];
    prisma.bonsai.findMany.mockResolvedValue(bonsais);

    await expect(service.getBonsais()).resolves.toBe(bonsais);
    expect(prisma.bonsai.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  it('sets the temporary dev owner when creating a bonsai', async () => {
    const created = { id: 'bonsai-1', name: 'Kaede' };
    prisma.bonsai.create.mockResolvedValue(created);

    await expect(service.createBonsai({ name: 'Kaede' })).resolves.toBe(
      created,
    );
    expect(prisma.bonsai.create).toHaveBeenCalledWith({
      data: {
        name: 'Kaede',
        owner: 'dev-user-cognito-sub-TODO-replace-in-phase3',
      },
    });
  });

  it('returns a bonsai when found by id', async () => {
    const bonsai = { id: 'bonsai-1', name: 'Shinpaku' };
    prisma.bonsai.findUnique.mockResolvedValue(bonsai);

    await expect(service.getBonsai('bonsai-1')).resolves.toBe(bonsai);
    expect(prisma.bonsai.findUnique).toHaveBeenCalledWith({
      where: { id: 'bonsai-1' },
    });
  });

  it('throws NotFoundException when a bonsai does not exist', async () => {
    prisma.bonsai.findUnique.mockResolvedValue(null);

    await expect(service.getBonsai('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('checks existence before updating a bonsai', async () => {
    const existing = { id: 'bonsai-1', name: 'Old name' };
    const updated = { id: 'bonsai-1', name: 'New name' };
    prisma.bonsai.findUnique.mockResolvedValue(existing);
    prisma.bonsai.update.mockResolvedValue(updated);

    await expect(
      service.updateBonsai('bonsai-1', { name: 'New name' }),
    ).resolves.toBe(updated);
    expect(prisma.bonsai.findUnique).toHaveBeenCalledWith({
      where: { id: 'bonsai-1' },
    });
    expect(prisma.bonsai.update).toHaveBeenCalledWith({
      where: { id: 'bonsai-1' },
      data: { name: 'New name' },
    });
  });
});
