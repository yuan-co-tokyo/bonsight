import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AdviceService, CreateAdviceDto } from './advice.service';

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
