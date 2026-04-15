import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column()
  type: string;
  @Column()
  description: string;
  @Column('decimal',{precision:12,scale:2})
  amount: number;
  @Column({ nullable: true })
  category: string;
  @Column({ nullable: true })
  date: string;
  @Column({ nullable: true })
  currency: string;
}
