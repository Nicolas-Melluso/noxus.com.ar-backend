import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('recurrings')
export class Recurring {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column()
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  category: string;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number;

  @Column({ name: 'amount_type', nullable: true })
  amountType: string;

  @Column('decimal', { name: 'variable_percentage', precision: 8, scale: 2, nullable: true })
  variablePercentage: number;

  @Column('decimal', { name: 'incremental_amount', precision: 12, scale: 2, nullable: true })
  incrementalAmount: number;

  @Column({ name: 'periodic_months', type: 'int', nullable: true })
  periodicMonths: number;

  @Column({ name: 'remaining_periods', type: 'int', nullable: true })
  remainingPeriods: number;

  @Column({ nullable: true })
  frequency: string;

  @Column({ nullable: true })
  nextDate: string;

  @Column({ nullable: true })
  active: boolean;

  // Track number of executions (per year, or total)
  @Column({ name: 'execution_count', type: 'int', nullable: true, default: 0 })
  executionCount: number;
}
