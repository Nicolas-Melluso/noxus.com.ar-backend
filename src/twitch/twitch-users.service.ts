// src/twitch/twitch-users.service.ts
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TwitchApiService } from './twitch-api.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchUser } from './twitch-users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TwitchUsersService {
  constructor(
    @InjectRepository(TwitchUser)
    private readonly usersRepository: Repository<TwitchUser>,
  
    @Inject(forwardRef(() => TwitchApiService))
    private readonly twitchApiService: TwitchApiService
  ) {} // ✅ Inyección correcta

  async handleTwitchChatMessage(username: string, message: string) {
    let user = await this.usersRepository.findOneBy({ username });

    if (!user) return; // Ignorar usuarios sin dragón

    // 1. Calcular XP (ej: 5 XP por mensaje)
    const xpToAdd = 5;

    // 2. Añadir XP acumulativo
    user.xp += xpToAdd;
    user.lastInteractionTime = new Date();

    // 3. Guardar cambios
    await this.usersRepository.save(user);

    // 4. Verificar evolución
    await this.checkEvolution(user);
  }

  // src/twitch/twitch-users.service.ts
  async addXpFromChat(username: string, message: string) {
    let user = await this.usersRepository.findOneBy({ username });

    if (!user) return; // Ignorar si el usuario no tiene dragón

    user.xp += 5; // 5 XP por mensaje
    await this.usersRepository.save(user);

    await this.checkEvolution(user); // Verificar evolución
  }

  private readonly xpStages = {
    egg: 0,
    baby: 1000,
    young: 3000,
    mid: 6000,
    adult: 10000,
    elder: 15000,
    ancient: 25000,
    mythical: 40000,
    celestial: 60000,
    legendary: 100000,
  };

  async checkEvolution(user: TwitchUser) {
    const stages = Object.keys(this.xpStages);
    const currentStage = user.dragonStage;
    const currentIndex = stages.indexOf(currentStage);
  
    for (let i = currentIndex + 1; i < stages.length; i++) {
      const nextStage = stages[i];
      const requiredXp = this.xpStages[nextStage];
  
      if (user.xp >= requiredXp) {
        user.dragonStage = nextStage;
        await this.usersRepository.save(user);
        return "AAA";
      }
    }
    return null;
  }

  async updateDragon(username: string) {
    //Comprobar si tiene dragon
    // SI NO TIENE crearle uno
    // SI YA TIENE mostrarle el dragón y su XP

    try {
      const isLive = await this.twitchApiService.isStreamerLive(); // ✅ Ahora está disponible
      //return `Estado del stream: ${isLive ? 'En vivo 🎥' : 'Offline 🛑'}`;
      return "Los Dragones están hibernando, pronto habrá más noticias de ellos!"
    } catch (error) {
      console.error('Error al verificar stream:', error.message);
      return 'Error al verificar el estado del stream';
    }
  }
}