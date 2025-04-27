// src/twitch/twitch-users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchUser } from './twitch-user.entity';

@Injectable()
export class TwitchUsersService {
  constructor(
    @InjectRepository(TwitchUser)
    private readonly twitchUsersRepository: Repository<TwitchUser>,
  ) {}

  getXpForStage(stage: string): number {
    const xpStages = {
      egg: 0,
      baby: 100,
      young: 300,
      adult: 700,
      elder: 1500,
      ancient: 3000,
    };
    return xpStages[stage] || 0;
  }

  // Generar un nombre aleatorio para el dragón
  generateRandomName(): string {
    const prefixes = [
      'Dra', 'Nox', 'Zyl', 'Kai', 'Frie', 'God', 'Anash',
      'Aur', 'Veln', 'Thal', 'Ignis', 'Zephyr', 'Lun', 'Sol',
      'Neb', 'Astra', 'Pyro', 'Hydro', 'Geo', 'Cryo', 'Electro'
    ];
    const suffixes = [
      'gon', 'rax', 'thar', 'vyr', 'nor', 'ren', 'zyx',
      'thos', 'mar', 'vex', 'nir', 'syl', 'kai', 'thra',
      'zul', 'grim', 'fyr', 'nox', 'lith', 'vent', 'mir'
    ];
    const numbers = Math.floor(Math.random() * 100);
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${numbers}`;
  }


  // Generar características aleatorias para el dragón
  generateRandomTraits(): Record<string, any> {
    const personalities = ['valiente', 'juguetón', 'sabio', 'travieso', 'noble'];
    const abilities = ['volar alto', 'escupir fuego', 'controlar el clima', 'respirar bajo el agua', 'subscribirse', 'jugar voley', 'meterse donde no lo llaman'];
    return {
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      ability: abilities[Math.floor(Math.random() * abilities.length)],
    };
  }

  // Calcular el siguiente estado del dragón
  calculateNextStage(currentStage: string): string {
    const stages = ['egg', 'baby', 'young', 'adult', 'elder', 'ancient'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      return stages[currentIndex + 1];
    }
    return currentStage;
  }

  // Generar tipo y rareza del huevo
  generateEggDetails(): { eggType: string; rarity: string } {
    const eggTypes = ['', '', '', '', '', '', '', 'Mágico', 'Fuego', 'Espectral', 'Agua', 'Tierra'];
    const rarities = [
      { name: 'Común', chance: 0.75 }, // Aumentamos a 75%
      { name: 'Raro', chance: 0.15 }, // Reducimos a 15%
      { name: 'Muy Raro', chance: 0.06 }, // Reducimos a 6%
      { name: 'Épico', chance: 0.03 }, // Reducimos a 3%
      { name: 'Mítico', chance: 0.008 }, // Reducimos a 0.8%
      { name: 'Legendario', chance: 0.002 }, // Reducimos a 0.2%
    ];
  
    const randomEggType = eggTypes[Math.floor(Math.random() * eggTypes.length)];
  
    let cumulativeChance = 0;
    const randomRarity = rarities.find((rarity) => {
      cumulativeChance += rarity.chance;
      return Math.random() < cumulativeChance;
    });
  
    return {
      eggType: randomEggType,
      rarity: randomRarity?.name || 'Común',
    };
  }

  // Historia por etapa
  getStageStory(dragonName: string, eggType: string, rarity: string, stage: string): string {
    const stories = {
      baby: `El ${eggType} ${dragonName} ha eclosionado. ¡Es un bebé lleno de energía!`,
      young: `Tu ${eggType} ${dragonName} ha crecido rápidamente gracias a su rareza ${rarity}. Ahora puede volar cortas distancias.`,
      adult: `¡${dragonName} ha alcanzado la madurez! Su poder ${eggType} lo hace temido por todos.`,
      elder: `El sabio ${dragonName} ahora protege el reino con su fuerza ${eggType}.`,
      ancient: `El legendario ${dragonName} ha vivido durante siglos. Su rareza ${rarity} lo hace único.`,
    };

    return stories[stage] || 'Tu dragón está en un estado desconocido.';
  }

  async updateDragon(username: string): Promise<string> {
    let user = await this.twitchUsersRepository.findOneBy({ username });

    if (!user) {
      // Crear usuario con XP inicial
      const dragonName = this.generateRandomName();
      const traits = this.generateRandomTraits();
      const { eggType, rarity } = this.generateEggDetails();

      user = this.twitchUsersRepository.create({
        username,
        dragonName,
        dragonStage: 'egg',
        lastUpdated: new Date(),
        traits,
        growthTimerStart: new Date(),
        isGrowing: true,
        eggType,
        rarity,
        xp: 0,
      });
      await this.twitchUsersRepository.save(user);

      return `¡${username}, te ha sido entregado un ${rarity} Huevo ${eggType}! Su nombre es ${dragonName}. 🥚 Empieza con 0 XP.`;
    }

    // Detener crecimiento a las 5 AM
    const now = new Date();
    const isStreamOver = now.getHours() >= 5;
    if (isStreamOver) {
      user.isGrowing = false;
      user.growthTimerStart = null;
      await this.twitchUsersRepository.save(user);
      return `Tu dragón está durmiendo. ¡Vuelve mañana! ⏳`;
    }

    // Calcular tiempo transcurrido y XP ganada
    if (user.isGrowing && user.lastUpdated) {
      const timeDiff = (now.getTime() - user.lastUpdated.getTime()) / 1000;
      const interactionBonus = 1 * 60; // 1 minuto de bonus por interacción
      const totalElapsedTime = timeDiff + interactionBonus;

      // XP ganada en esta interacción
      const xpGained = Math.floor(totalElapsedTime / 60); // 1 XP por minuto
      user.xp += xpGained;

      // XP requerida para la siguiente etapa
      const nextStage = this.calculateNextStage(user.dragonStage);
      const requiredXp = this.getXpForStage(nextStage);

      // Si tiene suficiente XP, evoluciona
      if (user.xp >= requiredXp && nextStage !== user.dragonStage) {
        user.dragonStage = nextStage;
        user.lastUpdated = now;
        user.xp = 0; // Reiniciar XP para la siguiente etapa

        const story = this.getStageStory(user.dragonName, user.eggType, user.rarity, user.dragonStage);
        return `${story} ¡Tu dragón ha evolucionado a ${user.dragonStage}! 🎉 Ahora tiene ${user.xp}/${requiredXp} XP.`;
      }
    }

    // Guardar cambios
    await this.twitchUsersRepository.save(user);

    // Mensaje con progreso de XP
    const currentXp = user.xp;
    const requiredXp = this.getXpForStage(this.calculateNextStage(user.dragonStage));
    return `Tu ${user.rarity} ${user.eggType} ${user.dragonName} está en etapa ${user.dragonStage}. `
      + `Progreso: ${currentXp}/${requiredXp} XP. ¡Sigue usando !dragon para ganar más!`;
  }
}

