import { Injectable } from '@nestjs/common';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';

@Injectable()
export class BonsaiService {
  getBonsais() {
    // TODO: Prisma未結線
    return [];
  }

  getBonsai(id: string) {
    // TODO: Prisma未結線
    return { id };
  }

  createBonsai(createBonsaiDto: CreateBonsaiDto) {
    // TODO: Prisma未結線
    return createBonsaiDto;
  }

  updateBonsai(id: string, updateBonsaiDto: UpdateBonsaiDto) {
    // TODO: Prisma未結線
    return { id, ...updateBonsaiDto };
  }

  deleteBonsai(id: string) {
    // TODO: Prisma未結線
    return { id, deleted: true };
  }
}
