// src/twitch/twitch-users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchUser } from './twitch-user.entity';
import { Dragon } from './dragon.entity';

@Injectable()
export class TwitchUsersService {
  private readonly xpStages = {
    egg: 0,
    baby: 5000,
    young: 10000,
    mid: 20000,
    adult: 40000,
    elder: 130000,
    ancient: 260000,
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

  constructor(
    @InjectRepository(TwitchUser)
    private readonly twitchUsersRepository: Repository<TwitchUser>,
  ) {}

  async updateDragon(username: string): Promise<string> {
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

  private async checkEvolution(user: TwitchUser): Promise<string | null> {
    const nextStage = this.getNextStage(user.dragonStage);
    const requiredXp = this.xpStages[nextStage];

    if (user.xp >= requiredXp) {
      user.dragonStage = nextStage;
      user.xp = 0;
      user.stageStartTime = new Date();
      const message = this.getEvolutionMessage(user, nextStage);
      await this.twitchUsersRepository.save(user);
      return message;
    }
    return null;
  }

  private getStatusMessage(user: TwitchUser): string {
    const nextStage = this.getNextStage(user.dragonStage);
    const requiredXp = this.xpStages[nextStage];
    const stageName = this.stageTranslations[user.dragonStage];
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