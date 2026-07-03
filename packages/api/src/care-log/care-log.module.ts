import { Module } from '@nestjs/common';
import { CareLogController } from './care-log.controller';
import { CareLogService } from './care-log.service';

@Module({
  controllers: [CareLogController],
  providers: [CareLogService],
})
export class CareLogModule {}
