import { Injectable } from '@nestjs/common';

export class CreateAdviceDto {
  mediaId?: string;
}

@Injectable()
export class AdviceService {
  createAdvice(bonsaiId: string, createAdviceDto: CreateAdviceDto) {
    // TODO: Bedrock未結線
    return { bonsaiId, ...createAdviceDto };
  }

  getAdvices(bonsaiId: string) {
    // TODO: Prisma未結線
    return [];
  }
}
