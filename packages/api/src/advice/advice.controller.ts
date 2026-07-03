import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { AdviceService, CreateAdviceDto } from './advice.service';

@UseGuards(CognitoAuthGuard)
@Controller('bonsai/:bonsaiId/advice')
export class AdviceController {
  constructor(private readonly adviceService: AdviceService) {}

  @Post()
  createAdvice(
    @Param('bonsaiId') bonsaiId: string,
    @Body() dto: CreateAdviceDto,
    @Req() req: any,
  ) {
    return this.adviceService.createAdvice(bonsaiId, dto, req.user.sub);
  }

  @Get()
  getAdvices(@Param('bonsaiId') bonsaiId: string, @Req() req: any) {
    return this.adviceService.getAdvices(bonsaiId, req.user.sub);
  }
}
