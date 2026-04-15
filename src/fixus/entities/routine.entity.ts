import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('fixus_routines')
export class Routine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  day: string;

  @Column({ nullable: true })
  personId: string; // ID de la persona (cliente del trainer)

  @Column({ nullable: true })
  personName: string; // Nombre de la persona

  @Column({ type: 'json', default: () => "'[]'" })
  blocks: Array<{
    id: string;
    name: string;
    time: string;
    color: string;
    exercises: Array<{
      id: string;
      name: string;
      reps: string;
      sets: string;
    }>;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
