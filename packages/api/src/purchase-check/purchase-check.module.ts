import { Module } from '@nestjs/common';
import { PurchaseCheckController } from './purchase-check.controller';
import { PurchaseCheckService } from './purchase-check.service';
@Module({
  controllers: [PurchaseCheckController],
  providers: [PurchaseCheckService],
})
export class PurchaseCheckModule {}
