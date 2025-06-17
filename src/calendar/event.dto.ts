import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  time: string; // HH:mm

  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];
}