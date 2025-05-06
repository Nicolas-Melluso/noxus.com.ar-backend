// src/twitch/twitch-users.service.ts
import { Injectable } from '@nestjs/common';
import { TwitchApiService } from './twitch-api.service';

@Injectable()
export class TwitchUsersService {
  twitchApiService: TwitchApiService;
  constructor() {
  }

  async updateDragon(username: string) {
    console.log("user", username);
    
    const isLive = await this.twitchApiService.isStreamerLive();

    console.log("TW", isLive);
    
    return "Testing Command pls wait";
  }
}