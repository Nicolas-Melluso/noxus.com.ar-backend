// src/twitch/twitch.controller.ts
import { Controller, Post, Body } from '@nestjs/common';

@Controller('twitch')
export class TwitchController {
  constructor(
  ) {}

  @Post()
  create(@Body() command: any) {
    return "Hola llegue" + command
  }

}