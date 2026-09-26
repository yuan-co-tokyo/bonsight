import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateBonsaiDto } from './create-bonsai.dto';

export class UpdateBonsaiDto extends PartialType(
  OmitType(CreateBonsaiDto, ['purchaseCheckId'] as const),
  {
    skipNullProperties: false,
  },
) {}
