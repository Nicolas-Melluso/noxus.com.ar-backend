// src/twitch/twitch.controller.ts
import { Controller, Post, Body, Res, Headers, Get, Query } from '@nestjs/common';
import { Response } from 'express';
import { TwitchUsersService } from './twitch-users.service';
import { TwitchApiService } from './twitch-api.service';

@Controller('twitch')
export class TwitchController {
  constructor(
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchUsersService: TwitchUsersService
  ) {}

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

  /**
   * Endpoint para recibir las notificaciones de Twitch EventSub.
   * - Si el mensaje es de verificación (challenge), se responde con el challenge recibido.
   * - De lo contrario, se procesa la notificación (e.g., evento de 'channel.follow').
   */
  @Post('events')
  async handleEventSub(
    @Body() body: any,
    @Headers('twitch-eventsub-message-type') messageType: string,
  ) {
    // Twitch envía el challenge durante la verificación del endpoint
    if (messageType === 'webhook_callback_verification') {
      return body.challenge;
    }
    // Aquí puedes implementar la lógica para cada tipo de evento recibido.
    console.log('Notificación de EventSub recibida:', body);
    return { status: 'ok' };
  }

  /**
   * Endpoint para suscribir un evento, por ejemplo, 'channel.follow'
   * Puedes llamarlo manualmente o integrarlo en tu lógica según lo requieras.
   */
  @Get('subscribe')
  async subscribeToFollowEvent(@Query('broadcasterUserId') broadcasterUserId: string) {
    const result = await this.twitchApiService.subscribeToEvent('channel.follow', broadcasterUserId);
    return result;
  }
}