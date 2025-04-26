// src/twitch/twitch.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { TwitchUsersService } from './twitch-users.service';

@Controller('twitch')
export class TwitchController {
  constructor(private readonly twitchUsersService: TwitchUsersService) {}

  // Endpoint para registrar mensajes
  @Post('message')
  async handleMessage(@Body() messageEvent: any) {
    const username = messageEvent?.event?.user?.username || 'UsuarioDesconocido';

    // Incrementar el contador de mensajes del usuario
    await this.twitchUsersService.incrementMessages(username);

    console.log(messageEvent);

    return; // No devolvemos nada al chat
  }
}