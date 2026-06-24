import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';

// TODO: 認証は第三陣でCognito subに置換。暫定的に固定devユーザーを使用
const DEV_OWNER = 'dev-user-cognito-sub-TODO-replace-in-phase3';

@Injectable()
export class BonsaiService {
  constructor(private readonly prisma: PrismaService) {}

  async getBonsais() {
    // TODO: 認証後は owner = cognito sub でフィルタ
    return this.prisma.bonsai.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getBonsai(id: string) {
    const bonsai = await this.prisma.bonsai.findUnique({ where: { id } });
    if (!bonsai) {
      throw new NotFoundException(`Bonsai ${id} not found`);
    }
    return bonsai;
  }

  async createBonsai(createBonsaiDto: CreateBonsaiDto) {
    return this.prisma.bonsai.create({
      data: {
        ...createBonsaiDto,
        owner: DEV_OWNER,
      },
    });
  }

  async updateBonsai(id: string, updateBonsaiDto: UpdateBonsaiDto) {
    await this.getBonsai(id);
    return this.prisma.bonsai.update({
      where: { id },
      data: updateBonsaiDto,
    });
  }

  async deleteBonsai(id: string) {
    await this.getBonsai(id);
    return this.prisma.bonsai.delete({ where: { id } });
  }
}
