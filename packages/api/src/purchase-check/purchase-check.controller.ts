import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { CreatePurchaseCheckDto } from './create-purchase-check.dto';
import { PurchaseCheckService } from './purchase-check.service';

import { UpdatePurchaseCheckDto } from './update-purchase-check.dto';

type AuthRequest = { user: { sub: string } };
@UseGuards(CognitoAuthGuard)
@Controller('purchase-checks')
export class PurchaseCheckController {
  constructor(private readonly service: PurchaseCheckService) {}
  @Post() create(@Body() dto: CreatePurchaseCheckDto, @Req() req: AuthRequest) {
    return this.service.create(dto, req.user.sub);
  }
  @Get() list(@Req() req: AuthRequest) {
    return this.service.list(req.user.sub);
  }
  @Get(':id') get(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.service.get(id, req.user.sub);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseCheckDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, dto, req.user.sub);
  }
  @Delete(':id') delete(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.service.delete(id, req.user.sub);
  }
}
