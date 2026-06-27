import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';

@Injectable()
export class BonsaiService {
  private readonly cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN ?? '';

  constructor(private readonly prisma: PrismaService) {}

  private toResponseDto(bonsai: any) {
    return {
      ...bonsai,
      coverImageUrl: bonsai.coverImageKey
        ? `${this.cloudfrontDomain}/${bonsai.coverImageKey}`
        : null,
    };
  }

  async getBonsais(owner: string) {
    const bonsais = await this.prisma.bonsai.findMany({
      where: { owner },
      orderBy: { createdAt: 'desc' },
    });
    return bonsais.map((b: any) => this.toResponseDto(b));
  }

  async getBonsai(id: string, owner: string) {
    const bonsai = await this.prisma.bonsai.findUnique({ where: { id } });
    if (!bonsai || bonsai.owner !== owner) {
      throw new NotFoundException(`Bonsai ${id} not found`);
    }
    return this.toResponseDto(bonsai);
  }

  async createBonsai(createBonsaiDto: CreateBonsaiDto, owner: string) {
    if (createBonsaiDto.coverImageKey) {
      const coverPrefix = `users/${owner}/covers/`;
      if (!createBonsaiDto.coverImageKey.startsWith(coverPrefix)) {
        throw new ForbiddenException('coverImageKey prefix mismatch');
      }
    }
    const bonsai = await this.prisma.bonsai.create({
      data: {
        ...createBonsaiDto,
        owner,
      },
    });
    return this.toResponseDto(bonsai);
  }

  async updateBonsai(
    id: string,
    updateBonsaiDto: UpdateBonsaiDto,
    owner: string,
  ) {
    await this.getBonsai(id, owner);
    if (updateBonsaiDto.coverImageKey) {
      const coverPrefix = `users/${owner}/covers/`;
      if (!updateBonsaiDto.coverImageKey.startsWith(coverPrefix)) {
        throw new ForbiddenException('coverImageKey prefix mismatch');
      }
    }
    const bonsai = await this.prisma.bonsai.update({
      where: { id },
      data: updateBonsaiDto,
    });
    return this.toResponseDto(bonsai);
  }

  async deleteBonsai(id: string, owner: string) {
    await this.getBonsai(id, owner);
    return this.prisma.bonsai.delete({ where: { id } });
  }
}
