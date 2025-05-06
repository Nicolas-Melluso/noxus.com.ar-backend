// src/twitch/twitch-users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchUser } from './twitch-users.entity';
import { Dragon } from './dragon.entity';
import { TwitchApiService } from './twitch-api.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

enum XpSource {
  CHAT = 'chat',
  RAID = 'raid',
  SUB = 'sub',
  PASSIVE = 'passive',
}
@Injectable()
export class TwitchUsersService {
  private clientId: string;
  
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

  private readonly stageTranslations = {
    egg: 'Huevo',
    baby: 'Bebé',
    young: 'Joven',
    mid: 'Adolescente',
    adult: 'Adulto',
    elder: 'Mayor',
    ancient: 'Ancestral',
  };

  // Asegúrate de importar TwitchApiService
  constructor(
    @InjectRepository(TwitchUser)
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly twitchUsersRepository: Repository<TwitchUser>,
    private readonly twitchApiService: TwitchApiService,
  ) {
    this.clientId = this.configService.get<string>('TWITCH_CLIENT_ID');
  }

  async updateDragon(username: string): Promise<string> {
    const isLive = await this.twitchApiService.isStreamerLive();

    console.log("TW", isLive);
    
    return 'Haciendo pruebas';
    try {
      const isLive = await this.twitchApiService.isStreamerLive();
      if (!isLive) {
        return 'No se otorgó XP porque el stream está offline.';
      }
    } catch (error) {
      return 'Error verificando el estado del stream. Inténtalo más tarde.';
    }

    let user = await this.twitchUsersRepository.findOneBy({ username });

    if (!user) {
      return this.createNewDragon(username);
    }

    this.addExperience(user);
    const evolutionResult = await this.checkEvolution(user);

    if (evolutionResult) return evolutionResult;

    return this.getStatusMessage(user);
  }

  private addExperience(user: TwitchUser): void {
    const now = new Date();
    const timeDiff = now.getTime() - user.lastInteractionTime.getTime();
    const minutesPassed = Math.floor(timeDiff / 60000); // 1 XP per minute
    user.xp += minutesPassed + 1; // +1 XP per interaction
    user.lastInteractionTime = now;
  }

  async addXp(username: string, amount: number, source: XpSource): Promise<void> {
    const user = await this.twitchUsersRepository.findOneBy({ username });
    if (!user) return;
  
    user.xp += amount;
    await this.twitchUsersRepository.save(user);
  
    await this.checkEvolution(user);
  }

  async isUserFollowing(username: string): Promise<boolean> {
    const accessToken = await this.twitchApiService.getAccessToken();
    
    const response = await firstValueFrom(
      this.httpService.get(`https://api.twitch.tv/helix/users/follows?from_id={userId}&to_id={streamerId}`, {
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    
    return response.data.total > 0;
  }

  private async checkEvolution(user: TwitchUser): Promise<string | null> {
    const stages = Object.keys(this.xpStages);
    const currentIndex = stages.indexOf(user.dragonStage);
    
    // Busca la siguiente etapa donde el XP actual es suficiente
    for (let i = currentIndex + 1; i < stages.length; i++) {
      const nextStage = stages[i];
      const requiredXp = this.xpStages[nextStage];
      
      if (user.xp >= requiredXp) {
        user.dragonStage = nextStage;
        user.stageStartTime = new Date();
        const message = this.getEvolutionMessage(user, nextStage);
        await this.twitchUsersRepository.save(user);
        return message;
      }
    }
    return null;
  }

  private async getStatusMessage(user: TwitchUser): Promise<string> {
    const nextStage = this.getNextStage(user.dragonStage);
    const requiredXp = this.xpStages[nextStage];
    const stageName = this.stageTranslations[user.dragonStage];
    await this.twitchUsersRepository.save(user);
    return `Tu Dragón ${stageName} ${user.dragonName} (${user.rarity} ${user.eggType}) lleva ${user.xp}/${requiredXp} XP. ¡Sigue interactuando!`;
  }

  private getNextStage(currentStage: string): string {
    const stages = ['egg', 'baby', 'young', 'mid', 'adult', 'elder', 'ancient'];
    const currentIndex = stages.indexOf(currentStage);
    return stages[currentIndex + 1] || currentStage;
  }

  private getEvolutionMessage(user: TwitchUser, newStage: string): string {
    const messages = {
      baby: `¡El Huevo ${user.eggType} ha eclosionado! ${user.dragonName} es un Dragón Bebé. ¡Cuida a tu pequeño! 🐣`,
      young: `¡${user.dragonName} ha crecido! Ahora es un Dragón Joven ${user.eggType}. Le encanta ${Dragon.generateTraits().ability}. 🐉`,
      mid: `¡${user.dragonName} está experimentando la adolescencia! Es un Dragón con mucho para ofrecer ${user.eggType}. 💥`,
      adult: `¡${user.dragonName} alcanzó la madurez! Es un Dragón Adulto ${user.eggType}. Su poder es ${user.rarity.toLowerCase()}. 🔥`,
      elder: `¡${user.dragonName} es ahora un Dragón Mayor! Protege el reino con su fuerza ${user.eggType}. 🌟`,
      ancient: `¡${user.dragonName} se ha convertido en un Dragón Ancestral! Su rareza ${user.rarity} lo hace legendario. ⭐👑`,
    };
    return messages[newStage] || '¡Tu dragón ha evolucionado!';
  }

  private async createNewDragon(username: string): Promise<string> {

    const isFollowing = await this.isUserFollowing(username);
    if (!isFollowing) {
      return 'Solo los seguidores pueden recibir un huevo de dragón.';
    }
    
    const { eggType, rarity } = Dragon.generateEggDetails();
    const dragonName = Dragon.generateName();
    const traits = Dragon.generateTraits();

    const newUser = this.twitchUsersRepository.create({
      username,
      dragonName,
      dragonStage: 'egg',
      stageStartTime: new Date(),
      lastInteractionTime: new Date(),
      traits,
      eggType,
      rarity,
      xp: 0,
    });

    await this.twitchUsersRepository.save(newUser);
    return `¡${username}, te ha sido entregado un Huevo ${eggType} ${rarity}! Su nombre es ${dragonName}. 🥚`;
  }
}