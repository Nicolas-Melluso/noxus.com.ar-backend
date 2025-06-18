import { IsString, IsNumber } from 'class-validator';

export class RsvpDto {
  @IsString()
  date: string;

  @IsNumber()
  userId: number;

  @IsString()
  action: string;
}