import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

const emptyToNull = ({ value }: { value: unknown }): unknown =>
  value === '' ? null : value;

export class CreateBonsaiDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @Transform(emptyToNull)
  @IsOptional()
  nickname?: string | null;

  @IsString()
  @Transform(emptyToNull)
  @IsOptional()
  species?: string | null;

  @IsDateString({ strict: true })
  @Transform(emptyToNull)
  @IsOptional()
  acquiredAt?: string | null;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  @Transform(emptyToNull)
  @IsOptional()
  estimatedAge?: number | null;

  @IsString()
  @Transform(emptyToNull)
  @IsOptional()
  origin?: string | null;

  @IsString()
  @Transform(emptyToNull)
  @IsOptional()
  potInfo?: string | null;

  @IsString()
  @Transform(emptyToNull)
  @IsOptional()
  style?: string | null;

  @IsString()
  @Transform(emptyToNull)
  @IsOptional()
  currentState?: string | null;

  @IsString()
  @Transform(emptyToNull)
  @IsOptional()
  coverImageKey?: string | null;
}
