import { NotFoundException } from '@nestjs/common';
import { CareLogService, CreateCareLogDto } from './care-log.service';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
  },
  CareType: {
    WATERING: 'WATERING',
    FERTILIZING: 'FERTILIZING',
    PRUNING: 'PRUNING',
    WIRING: 'WIRING',
    REPOTTING: 'REPOTTING',
    PEST_CONTROL: 'PEST_CONTROL',
  },
}));

const WATERING = 'WATERING';
const PRUNING = 'PRUNING';

const OWNER = 'cognito-sub-abc123';
const OTHER = 'cognito-sub-other';
const BONSAI_ID = 'bonsai-001';
const LOG_ID = 'log-001';
const DATE_STR = '2026-07-03T00:00:00.000Z';

describe('CareLogService', () => {
  const prisma = {
    bonsai: {
      findFirst: jest.fn(),
    },
    careLog: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: CareLogService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CareLogService(prisma as never);
  });

  it('findAll: returns care logs for verified bonsai owner', async () => {
    const bonsai = { id: BONSAI_ID, owner: OWNER };
    const logs = [
      { id: LOG_ID, bonsaiId: BONSAI_ID, type: WATERING, date: new Date(DATE_STR) },
    ];
    prisma.bonsai.findFirst.mockResolvedValue(bonsai);
    prisma.careLog.findMany.mockResolvedValue(logs);

    const result = await service.findAll(BONSAI_ID, OWNER);
    expect(result).toEqual(logs);
    expect(prisma.bonsai.findFirst).toHaveBeenCalledWith({
      where: { id: BONSAI_ID, owner: OWNER },
    });
    expect(prisma.careLog.findMany).toHaveBeenCalledWith({
      where: { bonsaiId: BONSAI_ID },
      orderBy: { date: 'asc' },
    });
  });

  it('findAll: throws NotFoundException for non-owner bonsai', async () => {
    prisma.bonsai.findFirst.mockResolvedValue(null);

    await expect(service.findAll(BONSAI_ID, OTHER)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.careLog.findMany).not.toHaveBeenCalled();
  });

  it('create: creates a care log with WATERING type, date, and memo', async () => {
    const bonsai = { id: BONSAI_ID, owner: OWNER };
    const dto: CreateCareLogDto = { type: WATERING as any, date: DATE_STR, memo: '午前中' };
    const created = {
      id: LOG_ID,
      bonsaiId: BONSAI_ID,
      type: WATERING,
      date: new Date(DATE_STR),
      memo: '午前中',
    };
    prisma.bonsai.findFirst.mockResolvedValue(bonsai);
    prisma.careLog.create.mockResolvedValue(created);

    const result = await service.create(BONSAI_ID, dto, OWNER);
    expect(result).toEqual(created);
    expect(prisma.careLog.create).toHaveBeenCalledWith({
      data: {
        bonsaiId: BONSAI_ID,
        type: WATERING,
        date: new Date(DATE_STR),
        memo: '午前中',
      },
    });
  });

  it('update: updates an existing care log', async () => {
    const bonsai = { id: BONSAI_ID, owner: OWNER };
    const existingLog = { id: LOG_ID, bonsaiId: BONSAI_ID, type: WATERING };
    const updated = { id: LOG_ID, bonsaiId: BONSAI_ID, type: PRUNING };
    prisma.bonsai.findFirst.mockResolvedValue(bonsai);
    prisma.careLog.findFirst.mockResolvedValue(existingLog);
    prisma.careLog.update.mockResolvedValue(updated);

    const result = await service.update(BONSAI_ID, LOG_ID, { type: PRUNING as any }, OWNER);
    expect(result).toEqual(updated);
    expect(prisma.careLog.update).toHaveBeenCalledWith({
      where: { id: LOG_ID },
      data: { type: PRUNING },
    });
  });

  it('update: throws NotFoundException when log does not belong to bonsai', async () => {
    const bonsai = { id: BONSAI_ID, owner: OWNER };
    prisma.bonsai.findFirst.mockResolvedValue(bonsai);
    prisma.careLog.findFirst.mockResolvedValue(null);

    await expect(
      service.update(BONSAI_ID, 'nonexistent', { type: PRUNING as any }, OWNER),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.careLog.update).not.toHaveBeenCalled();
  });

  it('remove: deletes a care log', async () => {
    const bonsai = { id: BONSAI_ID, owner: OWNER };
    const existingLog = { id: LOG_ID, bonsaiId: BONSAI_ID };
    const deleted = { id: LOG_ID };
    prisma.bonsai.findFirst.mockResolvedValue(bonsai);
    prisma.careLog.findFirst.mockResolvedValue(existingLog);
    prisma.careLog.delete.mockResolvedValue(deleted);

    const result = await service.remove(BONSAI_ID, LOG_ID, OWNER);
    expect(result).toEqual(deleted);
    expect(prisma.careLog.delete).toHaveBeenCalledWith({ where: { id: LOG_ID } });
  });
});
