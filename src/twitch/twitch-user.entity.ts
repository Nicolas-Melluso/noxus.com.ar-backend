// src/twitch/twitch-user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('twitch_users') // Cambiamos el nombre de la tabla a twitch_users
export class TwitchUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ default: 0 })
  messagesSent: number;
}