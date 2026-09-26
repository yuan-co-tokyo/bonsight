import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePurchaseCheckDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ArrayUnique()
  @IsString({ each: true })
  photoKeys!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ArrayUnique()
  @IsIn(['OVERALL', 'BASE', 'FOLIAGE'], { each: true })
  photoRoles!: ('OVERALL' | 'BASE' | 'FOLIAGE')[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  species?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  heightCm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  sellerNote?: string;

  @IsIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  experience: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER';
}
