// src/twitch/twitch.controller.ts
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { TwitchUsersService } from './twitch-users.service';

@Controller('twitch')
export class TwitchController {
  constructor(private readonly twitchUsersService: TwitchUsersService) {}

  @Post('dragon')
  async handleDragonCommand(@Body() command: any, @Res() res: Response) {
    console.log("OWN3D", command);
    
    const username = command?.event?.user?.username || 'UsuarioDesconocido';

    // Obtener o actualizar el dragón del usuario
    const responseMessage = await this.twitchUsersService.updateDragon(username);

    // Enviar la respuesta al chat
    res.type('text/plain');
    res.send(responseMessage);
  }
}