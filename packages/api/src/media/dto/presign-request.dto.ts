import { IsString } from 'class-validator';

export class PresignRequestDto {
  @IsString()
  bonsaiId!: string;

  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;
}
