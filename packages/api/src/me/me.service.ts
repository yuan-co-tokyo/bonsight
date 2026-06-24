import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateUserDto {
  displayName?: string;
  region?: string;
  climatezone?: string;
}

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(sub: string) {
    return this.prisma.user.upsert({
      where: { cognitoSub: sub },
      create: { cognitoSub: sub, displayName: '' },
      update: {},
    });
  }

  async updateMe(updateUserDto: UpdateUserDto, sub: string) {
    return this.prisma.user.update({
      where: { cognitoSub: sub },
      data: updateUserDto,
    });
  }
}
