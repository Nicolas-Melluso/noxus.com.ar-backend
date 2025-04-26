// src/twitch/twitch.controller.ts
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { TwitchUsersService } from './twitch-users.service';

@Controller('twitch')
export class TwitchController {
  constructor(private readonly twitchUsersService: TwitchUsersService) {}

  @Post()
  async create(@Body() command: any, @Res() res: Response) {
    console.log("Ingresé", command);

    // Extraer el nombre de usuario del evento
    const username = command?.event?.user?.username || 'UsuarioDesconocido';

    // Incrementar el contador de mensajes del usuario
    const user = await this.twitchUsersService.incrementMessages(username);

    // Obtener el nivel del usuario
    const { level, roleName } = this.twitchUsersService.getLevel(user.messagesSent);

    // Construir la respuesta en formato text/plain
    const responseText = `Tu rol es: ${roleName} (Nivel ${level}, ${user.messagesSent} mensajes)`;

    // Enviar la respuesta al cliente
    res.type('text/plain');
    res.send(responseText);
  }
}