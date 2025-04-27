// src/twitch/twitch-user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('twitch_users')
export class TwitchUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  dragonName: string;

  @Column({ default: 'egg' })
  dragonStage: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @Column({ type: 'json', nullable: true })
  traits: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  growthTimerStart: Date;

  @Column({ default: false })
  isGrowing: boolean;

  @Column({ nullable: true })
  eggType: string;

  @Column({ nullable: true })
  rarity: string;

  @Column({ default: 0 })
  xp: number; // Nuevo campo para experiencia
}