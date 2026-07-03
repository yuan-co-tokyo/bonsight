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
import { CareLogService, CreateCareLogDto, UpdateCareLogDto } from './care-log.service';

@Controller('bonsai/:bonsaiId/care-logs')
@UseGuards(CognitoAuthGuard)
export class CareLogController {
  constructor(private readonly careLogService: CareLogService) {}

  @Get()
  findAll(@Param('bonsaiId') bonsaiId: string, @Req() req: any) {
    return this.careLogService.findAll(bonsaiId, req.user.sub);
  }

  @Post()
  create(
    @Param('bonsaiId') bonsaiId: string,
    @Body() dto: CreateCareLogDto,
    @Req() req: any,
  ) {
    return this.careLogService.create(bonsaiId, dto, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('bonsaiId') bonsaiId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCareLogDto,
    @Req() req: any,
  ) {
    return this.careLogService.update(bonsaiId, id, dto, req.user.sub);
  }

  @Delete(':id')
  remove(
    @Param('bonsaiId') bonsaiId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.careLogService.remove(bonsaiId, id, req.user.sub);
  }
}
