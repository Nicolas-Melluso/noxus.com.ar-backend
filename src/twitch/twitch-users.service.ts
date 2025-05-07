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

  async updateDragon(event) {

    const username = event.chatter_user_name;
    
    /** OBJETIVO */
    // Conectando Twitch
    // Moddear Repo
    // Moddear con parametros de un archivo o un websocket
    // Connectar juego y twitch y server por websocket.js

    /** RUTA */
    //Comprobar si tiene dragon
    const trainer = this.checkUserIsTrainer(username);

    console.log(trainer);
    
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

  async checkUserIsTrainer(username) {
    const exist = await this.usersRepository.findBy({
      username: username
    })

    return Array.isArray(exist) ? exist.length > 0 : false;
  }
}