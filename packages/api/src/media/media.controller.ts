import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { CreateMediaDto, MediaService } from './media.service';
import { PresignRequestDto } from './dto/presign-request.dto';

@UseGuards(CognitoAuthGuard)
@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('bonsai/:bonsaiId/media')
  getMedia(@Param('bonsaiId') bonsaiId: string, @Req() req: any) {
    return this.mediaService.getMedia(bonsaiId, req.user.sub);
  }

  @Post('media/presign')
  presign(@Body() dto: PresignRequestDto, @Req() req: any) {
    return this.mediaService.presign(dto, req.user.sub);
  }

  @Post('bonsai/:bonsaiId/media')
  createMedia(
    @Param('bonsaiId') bonsaiId: string,
    @Body() createMediaDto: CreateMediaDto,
    @Req() req: any,
  ) {
    return this.mediaService.createMedia(bonsaiId, createMediaDto, req.user.sub);
  }
}
