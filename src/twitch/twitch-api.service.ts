// src/twitch/twitch-api.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class TwitchApiService {
  private clientId: string;
  private clientSecret: string;
  private streamerUsername: string;
  private appAccessToken: string | null = null;
  private appTokenExpiry = 0;
  private botUserToken: string | null = null;
  private botTokenExpiry = 0;
  private refreshToken: string;
  private broadcasterRefreshToken: string;
  private readonly webhookSecret: string;
  private callbackUrl: string = "https://api.noxus.com.ar/twitch/events";

  constructor(
    private readonly httpService: HttpService,
  ) {
    this.clientId = process.env.TWITCH_CLIENT_ID;
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET;
    this.streamerUsername = process.env.TWITCH_STREAMER_USERNAME;
    this.webhookSecret = process.env.TWITCH_WEBHOOK_SECRET;
    this.refreshToken = process.env.TWITCH_BOT_REFRESH_TOKEN;

    if (!this.webhookSecret) {
      throw new Error('TWITCH_WEBHOOK_SECRET no está definido en las variables de entorno');
    }
  }

  // Verificación de firma de eventos
  async verifyTwitchEvent(headers: any, body: any): Promise<boolean> {
    const messageSignature = headers['twitch-eventsub-message-signature'];
    const messageId = headers['twitch-eventsub-message-id'];
    const timestamp = headers['twitch-eventsub-message-timestamp'];
  
    if (!messageSignature || !messageId || !timestamp) {
      console.warn('Faltan headers requeridos para verificar el evento');
      return false;
    }
  
    try {
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      const message = `${messageId}${timestamp}${JSON.stringify(body)}`;
      const digest = `sha256=${hmac.update(message).digest('hex')}`;
      
      return crypto.timingSafeEqual(
        Buffer.from(messageSignature),
        Buffer.from(digest),
      );
    } catch (error) {
      console.error('Error verificando firma:', error.message);
      return false;
    }
  }

  // Obtiene token de aplicación (para EventSub)
  async getAppAccessToken(): Promise<string> {
    if (this.appAccessToken && Date.now() < this.appTokenExpiry) {
      return this.appAccessToken;
    }

    try {
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('grant_type', 'client_credentials');
      
      const response = await firstValueFrom(
        this.httpService.post(
          'https://id.twitch.tv/oauth2/token',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
      );

      this.appAccessToken = response.data.access_token;
      this.appTokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.appAccessToken;
    } catch (error) {
      console.error('Error obteniendo App Token:', error.response?.data);
      throw error;
    }
  }

  // Obtiene token de usuario con renovación automática
  async getUserAccessToken(): Promise<string> {
    if (this.botUserToken && Date.now() < this.botTokenExpiry) {
      return this.botUserToken;
    }

    try {
      if (this.refreshToken) {
        return this.refreshUserToken(this.refreshToken);
      }
      throw new Error('Necesitas iniciar el flujo OAuth para obtener un token de usuario');
    } catch (error) {
      console.error('Error obteniendo User Token:', error);
      throw error;
    }
  }

  // Renueva token de usuario
  private async refreshUserToken(refreshToken: string): Promise<string> {
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await firstValueFrom(
      this.httpService.post(
        'https://id.twitch.tv/oauth2/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
    );

    this.botUserToken = response.data.access_token;
    this.botTokenExpiry = Date.now() + response.data.expires_in * 1000;
    this.refreshToken = response.data.refresh_token || this.refreshToken;
    
    // Actualiza variable de entorno si es posible
    process.env.TWITCH_BOT_REFRESH_TOKEN = this.refreshToken;
    
    return this.botUserToken;
  }

  // Verifica si el streamer está en vivo
  async isStreamerLive(): Promise<boolean> {
    const accessToken = await this.getUserAccessToken();

    const response = await firstValueFrom(
      this.httpService.get('https://api.twitch.tv/helix/streams', {
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          user_login: this.streamerUsername,
        },
      }),
    );

    return response.data.data.length > 0;
  }

  // Suscribe a eventos de Twitch
  async subscribeToEvent(eventType: string, broadcasterUserId: string) {
    const accessToken = await this.getAppAccessToken();
    
    const payload = {
      type: eventType,
      version: '1',
      condition: { broadcaster_user_id: broadcasterUserId },
      transport: {
        method: 'webhook',
        callback: this.callbackUrl,
        secret: this.webhookSecret,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.twitch.tv/helix/eventsub/subscriptions',
        payload,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );
    
    return response.data;
  }

  // Envía mensaje de chat usando Helix API
  async sendChatMessage(broadcasterId: string, message: string) {
    const accessToken = await this.getUserAccessToken();
    
    await firstValueFrom(
      this.httpService.post(
        `https://api.twitch.tv/helix/chat/messages`,
        {
          broadcaster_id: broadcasterId,
          sender_id: process.env.BOT_USER_ID,
          message,
        },
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );
  }

  // Maneja mensajes de chat desde EventSub
  handleChatMessage(event: any) {
    console.log(`Nuevo mensaje de ${event.user_name}: ${event.message}`);
    
    // Ejemplo de comando
    if (event.message.toLowerCase() === '!hello') {
      this.sendChatMessage(event.broadcaster_user_id, `@${event.user_name}, heya!`);
    }
  }

  // Inicia flujo OAuth (puede ir en un controlador)
  getAuthRedirectUrl(): string {
    const clientId = this.clientId;
    const redirectUri = encodeURIComponent(process.env.TWITCH_REDIRECT_URI);
    const scope = encodeURIComponent('user:read:chat user:write:chat user:bot');
    
    return `https://id.twitch.tv/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `force_verify=true`;
  }
}