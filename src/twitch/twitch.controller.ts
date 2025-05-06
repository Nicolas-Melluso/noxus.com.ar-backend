// src/twitch/twitch.controller.ts
import { Controller, Post, Body, Res, Headers } from '@nestjs/common';
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

  @Post('events')
  async handleTwitchEvent(
    @Headers() headers: any,
    @Body() event: any,
    @Res() res: Response,
  ) {
    // 1. Verificar firma del evento (importante para seguridad)
    const isValid = await this.twitchApiService.verifyTwitchEvent(headers, event);
    if (!isValid) {
      return res.status(403).send('Forbidden');
    }

    // 2. Manejar los tipos de mensaje: verificación, notificación y revocación
    const messageType = headers['twitch-eventsub-message-type']?.toLowerCase();

    if (messageType === 'webhook_callback_verification') {
      // ✅ Confirmación de webhook (primera vez)
      return res.status(200).set('Content-Type', 'text/plain').send(event.challenge);
    }

    if (messageType === 'notification') {
      // 🧬 Procesar evento (ej: mensaje en el chat)
      await this.twitchUsersService.handleTwitchChatMessage(event.event.user_name, event.event.message);
      return res.status(204).send(); // Respuesta rápida requerida por Twitch
    }

    if (messageType === 'revocation') {
      // ⚠️ La suscripción fue revocada
      console.log('🚨 Suscripción revocada:', event.subscription.status);
      return res.status(204).send();
    }

    // ❌ Tipo de evento desconocido
    return res.status(400).send('Unknown message type');
  }
}