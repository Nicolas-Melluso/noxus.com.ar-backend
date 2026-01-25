import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('v2_transacciones')
export class V2Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'varchar', length: 32 })
  date: string; // ISO 8601

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 8 })
  currency: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 64 })
  category: string;

  @Column({ type: 'varchar', length: 16 })
  type: string; // income/expense

  @Column({ type: 'varchar', length: 32, nullable: true })
  paymentMethod: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'int', nullable: true })
  recurringId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  extra: any;
}
