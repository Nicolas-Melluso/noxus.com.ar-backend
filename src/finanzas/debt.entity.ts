import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column()
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  date: string;

  // Paid should be numeric (amount already paid), not boolean
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  paid: number;

  @Column({ default: 'ARS' })
  currency: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 'pending' })
  status: string;
}
