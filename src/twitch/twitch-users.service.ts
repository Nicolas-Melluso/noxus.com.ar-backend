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

  // Obtener o crear un usuario
  async findOrCreate(username: string): Promise<TwitchUser> {
    let user = await this.twitchUsersRepository.findOneBy({ username });

    if (!user) {
      // Si el usuario no existe, crearlo con 0 mensajes
      user = this.twitchUsersRepository.create({ username, messagesSent: 0 });
      await this.twitchUsersRepository.save(user);
    }

    return user;
  }

  // Incrementar el contador de mensajes
  async incrementMessages(username: string): Promise<TwitchUser> {
    const user = await this.findOrCreate(username);

    // Incrementar el contador de mensajes
    user.messagesSent += 1;
    return this.twitchUsersRepository.save(user);
  }

  // Obtener el nivel del usuario
  getLevel(messagesSent: number): { level: number; roleName: string } {
    const levels = [
      { min: 0, max: 199, name: 'Lurker 🐌' },
      { min: 200, max: 499, name: 'Espectador Novato 👀' },
      { min: 500, max: 999, name: 'Curioso Aprendiz 🧑‍🎓' },
      { min: 1000, max: 1999, name: 'Explorador Fiel 🧭' },
      { min: 2000, max: 3999, name: 'Guardián del Chat 🛡️' },
      { min: 4000, max: 7999, name: 'Guerrero del Stream ⚔️' },
      { min: 8000, max: 15999, name: 'Defensor del Reino 🏰' },
      { min: 16000, max: 31999, name: 'Maestro del Chat 🧙‍♂️' },
      { min: 32000, max: 63999, name: 'Dragón Joven 🔥' },
      { min: 64000, max: 127999, name: 'Dragón Legendario 🐉' },
      { min: 128000, max: Infinity, name: 'Dragón Supremo 🌟👑' },
    ];

    // Encontrar el nivel correspondiente
    const level = levels.find((lvl) => messagesSent >= lvl.min && messagesSent <= lvl.max);
    return {
      level: levels.indexOf(level) + 1,
      roleName: level.name,
    };
  }
}