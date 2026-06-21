import { Body, Controller, Get, Patch } from '@nestjs/common';
import { MeService, UpdateUserDto } from './me.service';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getMe() {
    return this.meService.getMe();
  }

  @Patch()
  updateMe(@Body() updateUserDto: UpdateUserDto) {
    return this.meService.updateMe(updateUserDto);
  }
}
