// src/twitch/twitch-user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()

@Entity('twitchUsers')
export class TwitchUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  dragonName: string;

  @Column()
  dragonStage: string;

  @Column()
  stageStartTime: Date;

  @Column('json')
  traits: Record<string, any>;

  @Column()
  eggType: string;

  @Column()
  rarity: string;

  @Column({ default: 0 })
  xp: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastInteractionTime: Date;
}