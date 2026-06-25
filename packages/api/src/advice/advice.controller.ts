import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { AdviceService, CreateAdviceDto } from './advice.service';

@UseGuards(CognitoAuthGuard)
@Controller('bonsai/:bonsaiId/advice')
export class AdviceController {
  constructor(private readonly adviceService: AdviceService) {}

  @Post()
  createAdvice(
    @Param('bonsaiId') bonsaiId: string,
    @Body() createAdviceDto: CreateAdviceDto,
  ) {
    return this.adviceService.createAdvice(bonsaiId, createAdviceDto);
  }

  @Get()
  getAdvices(@Param('bonsaiId') bonsaiId: string) {
    return this.adviceService.getAdvices(bonsaiId);
  }
}
