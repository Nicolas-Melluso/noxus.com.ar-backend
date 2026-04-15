import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('noxura_recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('json')
  ingredients: Array<{
    name: string;
    quantity: string;
    calories: number;
  }>;

  @Column('int')
  totalCalories: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column('text', { nullable: true })
  preparation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
