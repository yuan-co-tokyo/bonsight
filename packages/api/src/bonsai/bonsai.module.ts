import { Module } from '@nestjs/common';
import { BonsaiController } from './bonsai.controller';
import { BonsaiService } from './bonsai.service';

@Module({
  controllers: [BonsaiController],
  providers: [BonsaiService],
})
export class BonsaiModule {}
