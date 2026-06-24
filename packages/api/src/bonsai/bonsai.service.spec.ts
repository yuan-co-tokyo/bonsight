import { NotFoundException } from '@nestjs/common';
import { BonsaiService } from './bonsai.service';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
  },
}));

const OWNER = 'cognito-sub-abc123';

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

  it('finds all bonsai for the authenticated owner ordered by newest first', async () => {
    const bonsais = [{ id: 'bonsai-1', name: 'Goyomatsu', owner: OWNER }];
    prisma.bonsai.findMany.mockResolvedValue(bonsais);

    await expect(service.getBonsais(OWNER)).resolves.toBe(bonsais);
    expect(prisma.bonsai.findMany).toHaveBeenCalledWith({
      where: { owner: OWNER },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('creates a bonsai with the authenticated owner', async () => {
    const created = { id: 'bonsai-1', name: 'Kaede', owner: OWNER };
    prisma.bonsai.create.mockResolvedValue(created);

    await expect(service.createBonsai({ name: 'Kaede' }, OWNER)).resolves.toBe(
      created,
    );
    expect(prisma.bonsai.create).toHaveBeenCalledWith({
      data: {
        name: 'Kaede',
        owner: OWNER,
      },
    });
  });

  it('returns a bonsai when found by id and owner matches', async () => {
    const bonsai = { id: 'bonsai-1', name: 'Shinpaku', owner: OWNER };
    prisma.bonsai.findUnique.mockResolvedValue(bonsai);

    await expect(service.getBonsai('bonsai-1', OWNER)).resolves.toBe(bonsai);
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

    await expect(
      service.getBonsai('bonsai-1', OWNER),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('checks ownership before updating a bonsai', async () => {
    const existing = { id: 'bonsai-1', name: 'Old name', owner: OWNER };
    const updated = { id: 'bonsai-1', name: 'New name', owner: OWNER };
    prisma.bonsai.findUnique.mockResolvedValue(existing);
    prisma.bonsai.update.mockResolvedValue(updated);

    await expect(
      service.updateBonsai('bonsai-1', { name: 'New name' }, OWNER),
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
