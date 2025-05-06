// src/twitch/twitch-api.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TwitchApiService {
  private clientId: string;
  private clientSecret: string;
  private streamerUsername: string;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(
    private readonly httpService: HttpService,
  ) {
    this.clientId = process.env.TWITCH_CLIENT_ID;
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET;
    this.streamerUsername = process.env.TWITCH_STREAMER_USERNAME;

    console.log('✅ CLIENT_ID:', this.clientId);
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🌐 Enviando a Twitch:', {
        url: 'https://id.twitch.tv/oauth2/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          client_id: this.clientId,
          client_secret: '*********', // Oculta el secreto
          grant_type: 'client_credentials',
        },
      });

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

    console.log("AC", accessToken);

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
}