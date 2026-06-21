import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BonsaiService } from './bonsai.service';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';

@Controller('bonsai')
export class BonsaiController {
  constructor(private readonly bonsaiService: BonsaiService) {}

  @Get()
  getBonsais() {
    return this.bonsaiService.getBonsais();
  }

  @Get(':id')
  getBonsai(@Param('id') id: string) {
    return this.bonsaiService.getBonsai(id);
  }

  @Post()
  createBonsai(@Body() createBonsaiDto: CreateBonsaiDto) {
    return this.bonsaiService.createBonsai(createBonsaiDto);
  }

  @Patch(':id')
  updateBonsai(
    @Param('id') id: string,
    @Body() updateBonsaiDto: UpdateBonsaiDto,
  ) {
    return this.bonsaiService.updateBonsai(id, updateBonsaiDto);
  }

  @Delete(':id')
  deleteBonsai(@Param('id') id: string) {
    return this.bonsaiService.deleteBonsai(id);
  }
}
