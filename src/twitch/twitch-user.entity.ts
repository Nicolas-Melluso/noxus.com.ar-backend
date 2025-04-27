// src/twitch/twitch-user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('twitch_users')
export class TwitchUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  dragonName: string;

  @Column({ default: 'egg' }) // Campos en inglés para la base de datos
  dragonStage: string;

  @Column({ type: 'timestamp' })
  stageStartTime: Date;

  @Column({ type: 'json' })
  traits: Record<string, any>;

  @Column({ default: true })
  isGrowing: boolean;

  @Column()
  eggType: string;

  @Column()
  rarity: string;

  @Column({ default: 0 })
  xp: number;
}