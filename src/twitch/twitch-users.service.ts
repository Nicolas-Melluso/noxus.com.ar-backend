// src/twitch/twitch-users.service.ts
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TwitchApiService } from './twitch-api.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchUser } from './twitch-users.entity';
import { Repository } from 'typeorm';
import { Dragon } from './dragon.entity';

@Injectable()
export class TwitchUsersService {
  constructor(
    @InjectRepository(TwitchUser)
    private readonly usersRepository: Repository<TwitchUser>,

    @Inject(forwardRef(() => TwitchApiService))
    private readonly twitchApiService: TwitchApiService,
  ) {} // ✅ Inyección correcta

  async updateDragon(event) {
    const username = event.chatter_user_name;

    const trainer = await this.checkUserIsTrainer(username);

    let message: string;

    const userWithDragon = await this.createDragon(username);

    if (trainer) {
      message = `${username}, ya tienes un dragón llamado ${userWithDragon.dragonName}. ¡Cuida bien de él!`;
    } else {
      message = `${username}, ¡felicidades! Has recibido un nuevo dragón: ${userWithDragon.dragonName} (${userWithDragon.rarity} - ${userWithDragon.eggType} 🐣)`;
    }

    try {
      const isLive = await this.twitchApiService.isStreamerLive();
      if (isLive) {
        return message;
      } else {
        return 'Los Dragones están durmiendo, vuelve más tarde cuando estemos ON!';
      }
    } catch (error) {
      console.error('Error al verificar stream:', error.message);
      return 'Error al verificar el estado del stream';
    }
  }

  async checkUserIsTrainer(username) {
    const exist = await this.usersRepository.findBy({
      username: username,
    });

    return Array.isArray(exist) ? exist.length > 0 : false;
  }

  async createDragon(username: string): Promise<TwitchUser> {
    // Genera el dragón con datos aleatorios
    const dragon = new Dragon(
      '',
      'egg',
      { personality: '', ability: '' },
      '',
      '',
    );

    // Busca al usuario en la BD
    let user = await this.usersRepository.findOneBy({ username });

    // Si no existe, creamos uno nuevo
    if (!user) {
      user = this.usersRepository.create({
        username,
        dragonName: dragon.name,
        dragonStage: 'egg',
        stageStartTime: new Date(),
        traits: dragon.traits,
        eggType: dragon.eggType,
        rarity: dragon.rarity,
        xp: 0,
        lastInteractionTime: new Date(),
      });
    } else {
      // Si ya tiene un dragón, actualizamos solo si hace falta
      user.dragonName = dragon.name;
      user.dragonStage = 'egg';
      user.stageStartTime = new Date();
      user.traits = dragon.traits;
      user.eggType = dragon.eggType;
      user.rarity = dragon.rarity;
      user.lastInteractionTime = new Date();
    }

    // Guardamos o actualizamos
    return await this.usersRepository.save(user);
  }
}
