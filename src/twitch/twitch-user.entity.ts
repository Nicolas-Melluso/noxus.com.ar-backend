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

  @Column({ default: 'egg' }) // Estados: egg, baby, young, adult, elder, ancient
  dragonStage: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @Column({ type: 'json', nullable: true }) // Cambiamos jsonb a json
  traits: Record<string, any>;
}