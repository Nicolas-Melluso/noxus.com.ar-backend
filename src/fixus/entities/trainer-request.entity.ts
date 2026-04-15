import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('fixus_trainer_requests')
export class TrainerRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  trainerId: number; // ID del trainer que envía la solicitud

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainerId' })
  trainer: User;

  @Column()
  clientEmail: string; // Email del cliente que recibe la solicitud

  @Column()
  trainerCode: string; // Código del trainer (NDX-XXXXX)

  @Column()
  personId: string; // ID de la persona asignada por el trainer

  @Column()
  personName: string; // Nombre de la persona

  @Column({ type: 'json', default: () => "'[]'" })
  routines: Array<any>; // Rutinas asociadas a la persona

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
