import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: string; // YYYY-MM-DD

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ 
    type: 'enum',
    enum: ['publico', 'privado', 'partido', 'entrenamiento'],
    default: 'publico'
  })
  type: string;

  @Column({ nullable: true })
  color: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  
}