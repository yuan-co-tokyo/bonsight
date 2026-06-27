import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  s3Key!: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  takenAt?: string;

  @IsOptional()
  @IsIn(['PHOTO', 'VIDEO'])
  type?: 'PHOTO' | 'VIDEO';
}
