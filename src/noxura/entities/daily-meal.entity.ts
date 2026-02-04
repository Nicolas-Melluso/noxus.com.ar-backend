import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('noxura_daily_meals')
export class DailyMeal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column('json')
  meals: Array<{
    id: string;
    name: string;
    category: string;
    calories: number;
    time: string;
    ingredients?: Array<{
      name: string;
      quantity: string;
      calories: number;
    }>;
  }>;

  @Column('int')
  totalCalories: number;

  @Column({ default: false })
  validated: boolean;

  @Column({ type: 'int', nullable: true })
  validatedBy: number; // userId del validador

  @Column({ type: 'timestamp', nullable: true })
  validatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
