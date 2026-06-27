import { IsIn, IsOptional, IsString } from 'class-validator';

export class PresignRequestDto {
  @IsOptional()
  @IsString()
  bonsaiId?: string;

  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;

  @IsOptional()
  @IsIn(['media', 'cover'])
  type?: string;
}
