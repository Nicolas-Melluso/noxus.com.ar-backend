import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('fixus_linked_trainers')
export class LinkedTrainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientId: number; // ID del cliente personal

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @Column()
  trainerId: number; // ID del trainer

  @Column()
  trainerName: string;

  @Column()
  trainerEmail: string;

  @Column()
  trainerCode: string; // NDX-XXXXX

  @Column({ type: 'json', default: () => "'[]'" })
  routines: Array<any>; // Rutinas del trainer

  @CreateDateColumn()
  acceptedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
