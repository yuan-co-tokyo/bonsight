import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';

@Injectable()
export class BonsaiService {
  constructor(private readonly prisma: PrismaService) {}

  async getBonsais(owner: string) {
    return this.prisma.bonsai.findMany({
      where: { owner },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBonsai(id: string, owner: string) {
    const bonsai = await this.prisma.bonsai.findUnique({ where: { id } });
    if (!bonsai || bonsai.owner !== owner) {
      throw new NotFoundException(`Bonsai ${id} not found`);
    }
    return bonsai;
  }

  async createBonsai(createBonsaiDto: CreateBonsaiDto, owner: string) {
    return this.prisma.bonsai.create({
      data: {
        ...createBonsaiDto,
        owner,
      },
    });
  }

  async updateBonsai(
    id: string,
    updateBonsaiDto: UpdateBonsaiDto,
    owner: string,
  ) {
    await this.getBonsai(id, owner);
    return this.prisma.bonsai.update({
      where: { id },
      data: updateBonsaiDto,
    });
  }

  async deleteBonsai(id: string, owner: string) {
    await this.getBonsai(id, owner);
    return this.prisma.bonsai.delete({ where: { id } });
  }
}
