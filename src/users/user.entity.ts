import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from '../transactions/transactions.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // Relación con Transaction (OneToMany)
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}