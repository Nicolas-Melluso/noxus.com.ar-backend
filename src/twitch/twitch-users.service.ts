// src/twitch/twitch-users.service.ts
import { Injectable } from '@nestjs/common';
import { TwitchApiService } from './twitch-api.service';

@Injectable()
export class TwitchUsersService {
  constructor(private readonly twitchApiService: TwitchApiService) {} // ✅ Inyección correcta

  async updateDragon(username: string) {
    console.log("user", username);
    
    try {
      const isLive = await this.twitchApiService.isStreamerLive(); // ✅ Ahora está disponible
      console.log("TW", isLive);
      return `Estado del stream: ${isLive ? 'En vivo 🎥' : 'Offline 🛑'}`;
    } catch (error) {
      console.error('Error al verificar stream:', error.message);
      return 'Error al verificar el estado del stream';
    }
  }
}