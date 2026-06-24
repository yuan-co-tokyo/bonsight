import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { CreateMediaDto, MediaService } from './media.service';

@UseGuards(CognitoAuthGuard)
@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('bonsai/:bonsaiId/media')
  getMedia(@Param('bonsaiId') bonsaiId: string) {
    return this.mediaService.getMedia(bonsaiId);
  }

  @Post('media/presign')
  presign() {
    return this.mediaService.presign();
  }

  @Post('bonsai/:bonsaiId/media')
  createMedia(
    @Param('bonsaiId') bonsaiId: string,
    @Body() createMediaDto: CreateMediaDto,
  ) {
    return this.mediaService.createMedia(bonsaiId, createMediaDto);
  }
}
