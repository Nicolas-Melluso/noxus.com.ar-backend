// src/twitch/twitch-api.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import axios from 'axios';
import { StaticAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';

@Injectable()
export class TwitchApiService {
  private clientId: string;
  private clientSecret: string;
  private streamerUsername: string;
  private accessToken: string | null = null;
  private tokenExpiry = 0;
  private readonly webhookSecret: string;
  private callbackUrl: string; // URL de tu endpoint, por ejemplo: https://miapp.com/twitch/eventsub
  
  
  constructor(
    private readonly httpService: HttpService,
  ) {
    this.clientId = process.env.TWITCH_CLIENT_ID;
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET;
    this.streamerUsername = process.env.TWITCH_STREAMER_USERNAME;
    this.webhookSecret = process.env.TWITCH_WEBHOOK_SECRET;
    this.callbackUrl = "https://api.noxus.com.ar/twitch/events";
    this.init();
  }

  async init () {
    const clientId = 'y7nji3wysooktkgklle0fucrmxqsy8';
    const accessToken = 'ikcclml0be7cdwsa7o9aqqdwr0e5c3';
    const authProvider = new StaticAuthProvider(clientId, accessToken);

    const bot = new Bot({
      authProvider,
      channels: ['satisfiedpear'],
      commands: [
        createBotCommand('dice', (params, { reply }) => {
          const diceRoll = Math.floor(Math.random() * 6) + 1;
          reply(`You rolled a ${diceRoll}`);
        }),
        createBotCommand('slap', (params, { userName, say }) => {
          say(`${userName} slaps ${params.join(' ')} around a bit with a large trout`);
        })
      ]
    });

  bot.onMessage(({ broadcasterName, userName, text }) => {
    console.log(`[${broadcasterName}] ${userName}: ${text}`);
    bot.say(userName, "say something");
  });

  // Eventos de subscripción
  bot.onSub(({ broadcasterName, userName }) => {
    bot.say(broadcasterName, `Thanks to @${userName} for subscribing to the channel!`);
  });
  
  bot.onResub(({ broadcasterName, userName, months }) => {
    bot.say(broadcasterName, `Thanks to @${userName} for subscribing to the channel for a total of ${months} months!`);
  });
  
  bot.onSubGift(({ broadcasterName, gifterName, userName }) => {
    bot.say(broadcasterName, `Thanks to @${gifterName} for gifting a subscription to @${userName}!`);
  });

  }
  async verifyTwitchEvent(headers: any, body: any): Promise<boolean> {
    const messageSignature = headers['twitch-eventsub-message-signature'] || '';
    const messageId = headers['twitch-eventsub-message-id'];
    const timestamp = headers['twitch-eventsub-message-timestamp'];
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const message = `${messageId}${timestamp}${JSON.stringify(body)}`;
    const digest = `sha256=${hmac.update(message).digest('hex')}`;

    return crypto.timingSafeEqual(
      Buffer.from(messageSignature),
      Buffer.from(digest),
    );
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {

      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('grant_type', 'client_credentials');
  
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://id.twitch.tv/oauth2/token',
          params.toString(), // ✅ Codifica el cuerpo como URL
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', // ✅ Asegura el header
            },
          },
        ),
      );

      console.log(tokenResponse);
  
      this.accessToken = tokenResponse.data.access_token;
      this.tokenExpiry = Date.now() + tokenResponse.data.expires_in * 1000;
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error al obtener token:', error.response?.data || error.message);
      throw error;
    }
  }

  async isStreamerLive(): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    // ✅ Usa this.httpService.get() en lugar de axiosRef.get()
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

   /**
   * Realiza una solicitud a Twitch para suscribir el endpoint a un evento específico.
   * @param eventType Tipo de evento en Twitch (por ejemplo, "channel.follow")
   * @param broadcasterUserId ID del canal sobre el que queremos recibir eventos
   */
   async subscribeToEvent(eventType: string, broadcasterUserId: string) {
    const accessToken = await this.getAccessToken();

    // Payload de la suscripción según la documentación de Twitch EventSub
    const payload = {
      type: eventType,
      version: '1',
      condition: {
        broadcaster_user_id: broadcasterUserId,
      },
      transport: {
        method: 'webhook',
        callback: this.callbackUrl,
        secret: this.webhookSecret,
      },
    };

    const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', payload, {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }
}