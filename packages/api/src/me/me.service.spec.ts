import { MeService, UpdateUserDto } from './me.service';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
  },
}));

const SUB = 'cognito-sub-abc123';

describe('MeService', () => {
  const prisma = {
    user: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: MeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MeService(prisma as never);
  });

  it('getMe: upserts user by cognitoSub', async () => {
    const user = { id: '1', cognitoSub: SUB, displayName: '' };
    prisma.user.upsert.mockResolvedValue(user);

    const result = await service.getMe(SUB);
    expect(result).toEqual(user);
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { cognitoSub: SUB },
      create: { cognitoSub: SUB, displayName: '' },
      update: {},
    });
  });

  it('updateMe: saves region and climatezone (whitelist:true 下でも剥ぎ取られない)', async () => {
    const dto: UpdateUserDto = { region: '関東', climatezone: '温帯' };
    const updated = { id: '1', cognitoSub: SUB, displayName: '', region: '関東', climatezone: '温帯' };
    prisma.user.update.mockResolvedValue(updated);

    const result = await service.updateMe(dto, SUB);
    expect(result).toEqual(updated);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { cognitoSub: SUB },
      data: dto,
    });
  });

  it('updateMe: saves displayName', async () => {
    const dto: UpdateUserDto = { displayName: 'テストユーザ' };
    const updated = { id: '1', cognitoSub: SUB, displayName: 'テストユーザ' };
    prisma.user.update.mockResolvedValue(updated);

    const result = await service.updateMe(dto, SUB);
    expect(result).toEqual(updated);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { cognitoSub: SUB },
      data: { displayName: 'テストユーザ' },
    });
  });
});
