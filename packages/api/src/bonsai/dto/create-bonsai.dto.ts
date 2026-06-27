import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBonsaiDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsString()
  @IsOptional()
  acquiredAt?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedAge?: number;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  potInfo?: string;

  @IsString()
  @IsOptional()
  style?: string;

  @IsString()
  @IsOptional()
  currentState?: string;

  @IsString()
  @IsOptional()
  coverImageKey?: string;
}
