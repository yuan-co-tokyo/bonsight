import { PartialType } from '@nestjs/mapped-types';
import { CreateBonsaiDto } from './create-bonsai.dto';

export class UpdateBonsaiDto extends PartialType(CreateBonsaiDto) {}
