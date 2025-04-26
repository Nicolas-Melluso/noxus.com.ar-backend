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
    const prefixes = ['Dra', 'Nox', 'Zyl', 'Kai', 'Fen'];
    const suffixes = ['gon', 'rax', 'thar', 'vyr', 'nor'];
    const numbers = Math.floor(Math.random() * 100);
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${numbers}`;
  }

  // Generar características aleatorias para el dragón
  generateRandomTraits(): Record<string, any> {
    const personalities = ['valiente', 'juguetón', 'sabio', 'travieso', 'noble'];
    const abilities = ['volar alto', 'escupir fuego', 'controlar el clima', 'respirar bajo el agua'];
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
      });
      await this.twitchUsersRepository.save(user);

      return `¡${username}, te ha sido entregado un dragón! Su nombre es ${dragonName}. Cuida bien tu huevo misterioso. 🥚`;
    }

    // Calcular el tiempo transcurrido desde la última actualización
    const now = new Date();
    const timeDiff = (now.getTime() - user.lastUpdated.getTime()) / 1000; // Diferencia en segundos

    // Determinar si el dragón crece basado en el tiempo transcurrido
    let nextStage = user.dragonStage;
    if (timeDiff >= 600) { // Ejemplo: crece cada 10 minutos
      nextStage = this.calculateNextStage(user.dragonStage);
    }

    // Actualizar el dragón
    user.dragonStage = nextStage;
    user.lastUpdated = now;
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