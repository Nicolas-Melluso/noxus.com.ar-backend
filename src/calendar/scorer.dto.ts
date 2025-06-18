import { IsString, IsNumber } from 'class-validator';

export class ScorerDto {
  @IsString()
  date: string;

  @IsNumber()
  scorerId: number;
}