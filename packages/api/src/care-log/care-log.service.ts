import { Injectable, NotFoundException } from '@nestjs/common';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CareType } from '../prisma/prisma-types';
import { PrismaService } from '../prisma/prisma.service';

export class CreateCareLogDto {
  @IsEnum(CareType) type!: CareType;
  @IsDateString() date!: string;
  @IsOptional() @IsString() memo?: string;
}

export class UpdateCareLogDto {
  @IsOptional() @IsEnum(CareType) type?: CareType;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() memo?: string;
}

@Injectable()
export class CareLogService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyBonsaiOwner(bonsaiId: string, sub: string) {
    const bonsai = await this.prisma.bonsai.findFirst({
      where: { id: bonsaiId, owner: sub },
    });
    if (!bonsai) throw new NotFoundException('盆栽が見つかりません');
    return bonsai;
  }

  async findAll(bonsaiId: string, sub: string) {
    await this.verifyBonsaiOwner(bonsaiId, sub);
    return this.prisma.careLog.findMany({
      where: { bonsaiId },
      orderBy: { date: 'asc' },
    });
  }

  async create(bonsaiId: string, dto: CreateCareLogDto, sub: string) {
    await this.verifyBonsaiOwner(bonsaiId, sub);
    return this.prisma.careLog.create({
      data: { bonsaiId, type: dto.type, date: new Date(dto.date), memo: dto.memo },
    });
  }

  async update(bonsaiId: string, id: string, dto: UpdateCareLogDto, sub: string) {
    await this.verifyBonsaiOwner(bonsaiId, sub);
    const log = await this.prisma.careLog.findFirst({ where: { id, bonsaiId } });
    if (!log) throw new NotFoundException('世話ログが見つかりません');
    return this.prisma.careLog.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.memo !== undefined && { memo: dto.memo }),
      },
    });
  }

  async remove(bonsaiId: string, id: string, sub: string) {
    await this.verifyBonsaiOwner(bonsaiId, sub);
    const log = await this.prisma.careLog.findFirst({ where: { id, bonsaiId } });
    if (!log) throw new NotFoundException('世話ログが見つかりません');
    return this.prisma.careLog.delete({ where: { id } });
  }
}
