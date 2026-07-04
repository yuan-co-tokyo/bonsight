import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
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
