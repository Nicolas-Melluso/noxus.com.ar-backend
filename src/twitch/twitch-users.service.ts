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

  // Generar un nombre aleatorio para el dragón
  generateRandomName(): string {
    const prefixes = ['Dra', 'Nox', 'Zyl', 'Kai', 'Frie', 'God', 'Anash'];
    const suffixes = ['gon', 'rax', 'thar', 'vyr', 'nor', 'ren', 'zyx'];
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

  // Calcular el tiempo necesario para la siguiente etapa
  getRequiredTimeForNextStage(currentStage: string): number {
    const stageTimes = {
      egg: 0, // Inmediato
      baby: 10 * 60, // 10 minutos
      young: 20 * 60, // 20 minutos
      adult: 30 * 60, // 30 minutos
      elder: 60 * 60, // 1 hora
      ancient: 2 * 60 * 60, // 2 horas
    };
    return stageTimes[currentStage] || 0;
  }

  // Actualizar el dragón del usuario
  async updateDragon(username: string): Promise<string> {
    let user = await this.twitchUsersRepository.findOneBy({ username });

    if (!user) {
      // Si el usuario no existe, crearlo con un huevo misterioso
      const dragonName = this.generateRandomName();
      const traits = this.generateRandomTraits();
      user = this.twitchUsersRepository.create({
        username,
        dragonName,
        dragonStage: 'egg',
        lastUpdated: new Date(),
        traits,
        growthTimerStart: new Date(), // Comienza el timer
        isGrowing: true, // Activar el crecimiento
      });
      await this.twitchUsersRepository.save(user);

      return `¡${username}, te ha sido entregado un dragón! Su nombre es ${dragonName}. Cuida bien tu huevo misterioso. 🥚`;
    }

    // Detener el crecimiento si son las 5 AM
    const now = new Date();
    const isStreamOver = (now.getHours() >= 3 && now.getHours() <= 9); // Detener a las 3 AM y 9 AM
    if (isStreamOver) {
      user.isGrowing = false;
      user.growthTimerStart = null;
      await this.twitchUsersRepository.save(user);
      return `Parece que tu Dragón está durmiendo. ¡Vuelve mañana para ver si ha crecido! ⏳`;
    } else {
      user.isGrowing = true;
      user.growthTimerStart = new Date();
      await this.twitchUsersRepository.save(user);
    }

    // Calcular el tiempo transcurrido desde la última actualización
    if (user.isGrowing && user.growthTimerStart) {
      const timeDiff = (now.getTime() - user.growthTimerStart.getTime()) / 1000; // Diferencia en segundos
      const requiredTime = this.getRequiredTimeForNextStage(user.dragonStage);

      // Adelantar el reloj por interacción (2 minutos adicionales)
      const interactionBonus = 2 * 60; // 2 minutos en segundos
      const totalElapsedTime = timeDiff + interactionBonus;

      console.log(totalElapsedTime);

      if (totalElapsedTime >= requiredTime) {
        user.dragonStage = this.calculateNextStage(user.dragonStage);
        user.lastUpdated = now;
        user.growthTimerStart = now; // Reiniciar el timer para la siguiente etapa
      }
    }

    // Guardar los cambios
    await this.twitchUsersRepository.save(user);

    // Construir el mensaje de respuesta
    switch (user.dragonStage) {
      case 'egg':
        return `Tu dragón sigue siendo un huevo misterioso. Dale tiempo para eclosionar. 🥚`;
      case 'baby':
        return `${user.dragonName} es un Dragón bebé. ¡Cuida bien a tu pequeño dragón! ❤️`;
      case 'young':
        return `${user.dragonName} es un Dragón joven. Le encanta ${user.traits.ability}. 🐉`;
      case 'adult':
        return `${user.dragonName} es un Dragón adulto. Es ${user.traits.personality} y protege su territorio. 🔥`;
      case 'elder':
        return `${user.dragonName} es un Dragón mayor. Tiene mucha sabiduría y experiencia. 🌟`;
      case 'ancient':
        return `${user.dragonName} es un Dragón ancestral. ¡Es una leyenda viviente! ⭐👑`;
      default:
        return `Tu dragón está en un estado desconocido. ¡Algo extraño ha ocurrido! 😱`;
    }
  }
}