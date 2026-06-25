import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { MeService, UpdateUserDto } from './me.service';

@UseGuards(CognitoAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getMe(@Req() req: any) {
    return this.meService.getMe(req.user.sub);
  }

  @Patch()
  updateMe(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    return this.meService.updateMe(updateUserDto, req.user.sub);
  }
}
