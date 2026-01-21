// src/twitch/twitch.controller.ts
import { Controller, Post, Body, Res, Headers, Get, Query, HttpStatus, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { TwitchUsersService } from './twitch-users.service';
import { TwitchApiService } from './twitch-api.service';
import { firstValueFrom } from 'rxjs';

@Controller('twitch')
export class TwitchController {
  constructor(
    private readonly twitchApiService: TwitchApiService,
  ) {}

  /**
   * Webhook para recibir eventos de Twitch EventSub
   */
  @Post('events')
  async handleEventSub(
    @Body() body: any,
    @Headers() headers: any,
    @Res() res: Response
  ) {
    try {
      // Verificar firma del evento
      const isValid = await this.twitchApiService.verifyTwitchEvent(headers, body);
      if (!isValid) {
        console.warn('Evento con firma inválida rechazado');
        return res.status(HttpStatus.FORBIDDEN).send('Invalid signature');
      }

      const messageType = headers['twitch-eventsub-message-type'];
      
      // Verificación de webhook
      if (messageType === 'webhook_callback_verification') {
        return res.type('text/plain').send(body.challenge);
      }

      // Notificación de evento
      if (messageType === 'notification') {
        await this.processTwitchEvent(body);
      }

      return res.status(HttpStatus.OK).send('Event processed');
    } catch (error) {
      console.error('Error procesando evento:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Processing error');
    }
  }

  /**
   * Procesa eventos específicos de Twitch
   */
  private async processTwitchEvent(event: any) {
    switch (event.subscription.type) {
      case 'channel.chat.message':
        this.twitchApiService.handleChatMessage(event.event);
        break;
      case 'channel.follow':
        // Lógica para seguir
        break;
      case 'channel.raid':
        // Lógica para raids
        break;
      default:
        console.log(`Evento no manejado: ${event.subscription.type}`);
    }
  }

  /**
   * Inicia el flujo OAuth
   */
  @Get('auth')
  async startOAuth(@Res() res: Response) {
    const authUrl = this.twitchApiService.getAuthRedirectUrl();
    res.redirect(authUrl);
  }

  /**
   * Callback para OAuth
   */
  @Get('callback')
  async handleOAuthCallback(
    @Query('code') code: string,
    @Res() res: Response
  ) {
    if (!code) {
      throw new BadRequestException('Código de autorización requerido');
    }

    try {
      const params = new URLSearchParams();
      params.append('client_id', this.twitchApiService['clientId']);
      params.append('client_secret', this.twitchApiService['clientSecret']);
      params.append('code', code);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', process.env.TWITCH_REDIRECT_URI);

      const response = await firstValueFrom(
        this.twitchApiService['httpService'].post(
          'https://id.twitch.tv/oauth2/token',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
      );

      // Guarda estos tokens en un lugar seguro
      this.twitchApiService['refreshToken'] = response.data.refresh_token;
      this.twitchApiService['botUserToken'] = response.data.access_token;
      
      // Redirige con éxito
      res.redirect(`${process.env.FRONTEND_URL}/twitch-auth-success`);
    } catch (error) {
      console.error('Error en callback OAuth:', error.response?.data || error.message);
      res.redirect(`${process.env.FRONTEND_URL}/twitch-auth-failure`);
    }
  }

  @Get('setup')
  async setupBot(@Res() res: Response) {
    try {
      // 1. Obtener tokens necesarios
      const appToken = await this.twitchApiService.getAppAccessToken();
      const userToken = await this.twitchApiService.getUserAccessToken();
      
      // 2. Verificar si ya existe suscripción
      const existingSubs = await this.checkExistingSubscription(appToken);
      
      let subscriptionResult = null;
      if (!existingSubs) {
        // 3. Suscribirse a eventos de chat
        subscriptionResult = await this.twitchApiService.subscribeToEvent(
          'channel.chat.message', 
          process.env.BOT_USER_ID
        );
      }

      // 4. Enviar mensaje de prueba al chat
      await this.twitchApiService.sendChatMessage(
        process.env.BOT_USER_ID,
        "✅ Bot configurado exitosamente! ¡Estoy listo para responder en el chat!"
      );

      return res.status(HttpStatus.OK).json({
        status: 'success',
        tokens: {
          appTokenExpiry: new Date(this.twitchApiService['appTokenExpiry']).toISOString(),
          userTokenExpiry: new Date(this.twitchApiService['botTokenExpiry']).toISOString()
        },
        subscription: existingSubs || subscriptionResult,
        testMessageSent: true
      });
    } catch (error) {
      console.error('Error en setup:', error.response?.data || error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: error.message,
        details: error.response?.data
      });
    }
  }

  /**
   * Verifica si ya existe una suscripción activa
   */
  private async checkExistingSubscription(appToken: string) {
    const response = await firstValueFrom(
      this.twitchApiService['httpService'].get(
        'https://api.twitch.tv/helix/eventsub/subscriptions',
        {
          headers: {
            'Client-ID': this.twitchApiService['clientId'],
            'Authorization': `Bearer ${appToken}`,
          }
        }
      )
    );

    const activeSubs = response.data.data.filter(
      sub => 
        sub.type === 'channel.chat.message' && 
        sub.condition.broadcaster_user_id === process.env.BOT_USER_ID
    );

    return activeSubs[0] || null;
  }

  /**
   * Suscribe a eventos de Twitch
   */
  @Get('subscribe/chat')
  async subscribeToChatEvents(
    @Query('broadcasterId') broadcasterId: string,
    @Res() res: Response
  ) {
    if (!broadcasterId) {
      throw new BadRequestException('broadcasterId requerido');
    }

    try {
      const result = await this.twitchApiService.subscribeToEvent(
        'channel.chat.message', 
        broadcasterId
      );
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('Error suscribiendo a eventos:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'No se pudo crear la suscripción'
      });
    }
  }

  /**
   * Health check
   */
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}