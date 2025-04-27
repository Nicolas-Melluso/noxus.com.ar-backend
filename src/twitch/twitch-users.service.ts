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

  // XP requerida para cada etapa (en minutos)
  private readonly xpStages = {
    egg: 0,
    baby: 5000,
    young: 10000,
    mid: 20000,
    adult: 40000,
    elder: 130000,
    ancient: 260000,
  };

  // Traducción de etapas para los mensajes
  private readonly stageTranslations = {
    egg: 'Huevo',
    baby: 'Bebé',
    young: 'Joven',
    mid: 'Adolescente',
    adult: 'Adulto',
    elder: 'Mayor',
    ancient: 'Ancestral',
  };

  // Generar nombre aleatorio (más creativo)
  generateDragonName(): string {
    const prefixes = [
      'Aurora', 'Vortex', 'Ignis', 'Zephyr', 'Lunar', 'Solaris',
      'Nebula', 'Astrum', 'Pyralis', 'Hydros', 'Geonis', 'Cryos',
    ];
    const suffixes = [
      'Gore', 'Raxton', 'Thalass', 'Vyrn', 'Norelia', 'Zyphra',
      'Thorn', 'Maris', 'Vexel', 'Nirvana', 'Sylvan', 'Kaelith',
    ];
    const number = Math.floor(Math.random() * 1000);
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${number}`;
  }

  // Generar características en español
  generateTraits(): Record<string, any> {
    const personalities = ['Valiente', 'Juguetón', 'Sabio', 'Travieso', 'Noble'];
    const abilities = ['Volar alto', 'Escupir fuego', 'Controlar el clima', 'Respirar bajo el agua'];
    return {
      personalidad: personalities[Math.floor(Math.random() * personalities.length)],
      habilidad: abilities[Math.floor(Math.random() * abilities.length)],
    };
  }

  // Detalles del huevo (con más variedad)
  generateEggDetails(): { eggType: string; rarity: string } {
    const eggTypes = ['Mágico', 'Fuego', 'Espectral', 'Agua', 'Tierra'];
    const rarities = [
      { nombre: 'Común', probabilidad: 0.75 },
      { nombre: 'Raro', probabilidad: 0.15 },
      { nombre: 'Épico', probabilidad: 0.06 },
      { nombre: 'Legendario', probabilidad: 0.03 },
      { nombre: 'Mítico', probabilidad: 0.009 },
      { nombre: 'Celestial', probabilidad: 0.001 },
    ];

    let probabilidadAcumulada = 0;
    const rareza = rarities.find(r => {
      probabilidadAcumulada += r.probabilidad;
      return Math.random() < probabilidadAcumulada;
    })?.nombre || 'Común';

    return {
      eggType: eggTypes[Math.floor(Math.random() * eggTypes.length)],
      rarity: rareza,
    };
  }

  // Calcular XP ganada desde la última evolución
  calculateXpEarned(lastStageTime: Date): number {
    const now = new Date();
    const diffSegundos = (now.getTime() - lastStageTime.getTime()) / 1000;
    return Math.floor(diffSegundos / 60); // 1 XP por minuto real
  }

  // Verificar si el dragón puede evolucionar
  canEvolve(currentStage: string, xp: number): boolean {
    return xp >= this.xpStages[currentStage];
  }

  // Obtener mensaje de evolución
  getEvolutionMessage(dragonName: string, eggType: string, rarity: string, newStage: string): string {
    const mensajes = {
      baby: `¡El Huevo ${eggType} ha eclosionado! ${dragonName} es un Dragón Bebé. ¡Cuida a tu pequeño! 🐣`,
      young: `¡${dragonName} ha crecido! Ahora es un Dragón Joven ${eggType}. Le encanta ${this.generateTraits().habilidad}. 🐉`,
      mid: `¡${dragonName} está experimentando la adolescencia! Es un Dragón con mucho para ofrecer ${eggType}. 💥`,
      adult: `¡${dragonName} alcanzó la madurez! Es un Dragón Adulto ${eggType}. Su poder es ${rarity.toLowerCase()}. 🔥`,
      elder: `¡${dragonName} es ahora un Dragón Mayor! Protege el reino con su fuerza ${eggType}. 🌟`,
      ancient: `¡${dragonName} se ha convertido en un Dragón Ancestral! Su rareza ${rarity} lo hace legendario. ⭐👑`,
    };
    return mensajes[newStage] || '¡Tu dragón ha evolucionado!';
  }

  // Actualizar estado del dragón
  async updateDragon(username: string): Promise<string> {
    let user = await this.twitchUsersRepository.findOneBy({ username });

    if (!user) {
      // Crear nuevo usuario
      const { eggType, rarity } = this.generateEggDetails();
      const dragonName = this.generateDragonName();
      const traits = this.generateTraits();

      user = this.twitchUsersRepository.create({
        username,
        dragonName,
        dragonStage: 'egg',
        stageStartTime: new Date(), // Tiempo de inicio de la etapa
        traits,
        eggType,
        rarity,
        xp: 0,
      });
      await this.twitchUsersRepository.save(user);
      return `¡${username}, te ha sido entregado un Huevo ${eggType} ${rarity}! Su nombre es ${dragonName}. 🥚`;
    }

    // Detener crecimiento a las 5 AM
    const now = new Date();
    if (now.getHours() >= 5 && now.getHours() <= 9) {
      user.isGrowing = false;
      await this.twitchUsersRepository.save(user);
      return `Tu dragón está durmiendo. ¡Vuelve mañana! ⏳`;
    }

    // Calcular XP ganada
    const xpGanada = this.calculateXpEarned(user.stageStartTime);
    user.xp += xpGanada;

    // Verificar evolución
    const nextStage = this.calculateNextStage(user.dragonStage);
    if (this.canEvolve(user.dragonStage, user.xp)) {
      user.dragonStage = nextStage;
      user.xp = 0;
      user.stageStartTime = new Date(); // Reiniciar timer para la nueva etapa
      const mensajeEvolucion = this.getEvolutionMessage(user.dragonName, user.eggType, user.rarity, nextStage);
      await this.twitchUsersRepository.save(user);
      return mensajeEvolucion;
    }

    // Guardar progreso y enviar mensaje
    await this.twitchUsersRepository.save(user);
    const xpRequerida = this.xpStages[nextStage];
    const stageName = this.stageTranslations[user.dragonStage];
    return `Tu Dragón ${stageName} ${user.dragonName} (${user.rarity} ${user.eggType}) lleva ${user.xp}/${xpRequerida} XP. ¡Sigue interactuando!`;
  }

  // Calcular siguiente etapa (mantener en inglés para la base de datos)
  private calculateNextStage(currentStage: string): string {
    const stages = ['egg', 'baby', 'young', 'adult', 'elder', 'ancient'];
    const index = stages.indexOf(currentStage);
    return index < stages.length - 1 ? stages[index + 1] : currentStage;
  }
}