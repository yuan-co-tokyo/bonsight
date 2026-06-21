import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateMediaDto, MediaService } from './media.service';

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
