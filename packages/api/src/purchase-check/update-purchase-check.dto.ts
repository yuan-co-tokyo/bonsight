import { IsIn } from 'class-validator';

export class UpdatePurchaseCheckDto {
  @IsIn(['CONSIDERING', 'PASSED'])
  status!: 'CONSIDERING' | 'PASSED';
}
