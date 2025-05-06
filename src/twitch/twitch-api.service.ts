// src/twitch/twitch-api.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('TWITCH_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('TWITCH_CLIENT_SECRET');
    this.streamerUsername = this.configService.get<string>('TWITCH_STREAMER_USERNAME');
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // ✅ Usa this.httpService.post() en lugar de axiosRef.post()
    const tokenResponse = await firstValueFrom(
      this.httpService.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
          },
        },
      ),
    );

    this.accessToken = tokenResponse.data.access_token;
    this.tokenExpiry = Date.now() + tokenResponse.data.expires_in * 1000;
    return this.accessToken;
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
}