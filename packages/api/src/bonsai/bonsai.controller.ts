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
import { BonsaiService } from './bonsai.service';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';

@UseGuards(CognitoAuthGuard)
@Controller('bonsai')
export class BonsaiController {
  constructor(private readonly bonsaiService: BonsaiService) {}

  @Get()
  getBonsais(@Req() req: any) {
    return this.bonsaiService.getBonsais(req.user.sub);
  }

  @Get(':id')
  getBonsai(@Param('id') id: string, @Req() req: any) {
    return this.bonsaiService.getBonsai(id, req.user.sub);
  }

  @Post()
  createBonsai(@Body() createBonsaiDto: CreateBonsaiDto, @Req() req: any) {
    return this.bonsaiService.createBonsai(createBonsaiDto, req.user.sub);
  }

  @Patch(':id')
  updateBonsai(
    @Param('id') id: string,
    @Body() updateBonsaiDto: UpdateBonsaiDto,
    @Req() req: any,
  ) {
    return this.bonsaiService.updateBonsai(id, updateBonsaiDto, req.user.sub);
  }

  @Delete(':id')
  deleteBonsai(@Param('id') id: string, @Req() req: any) {
    return this.bonsaiService.deleteBonsai(id, req.user.sub);
  }
}
