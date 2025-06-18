import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateEventDto {
  @IsString()
  date: string;

  @IsString()
  title: string;

  @IsString()
  time: string;

  @IsString()
  description: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  homeTeam: string;

  @IsOptional()
  @IsString()
  awayTeam: string;

  @IsOptional()
  @IsString()
  place: string;

  @IsOptional()
  price: number;

  @IsOptional()
  @IsArray()
  roles: string[];
}