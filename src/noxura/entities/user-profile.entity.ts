import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('noxura_user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column()
  username: string;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'varchar', length: 20, default: 'bronce' })
  league: string; // bronce, plata, oro, platino, diamante, onix

  @Column({ type: 'int', default: 0 })
  validationsGiven: number;

  @Column({ type: 'int', default: 0 })
  validationsReceived: number;

  @Column({ type: 'int', default: 0 })
  consecutiveDays: number;

  @Column({ type: 'date', nullable: true })
  lastLoginDate: string;

  @Column({ type: 'json', nullable: true })
  achievements: Array<{
    id: string;
    name: string;
    date: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
