import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('v2_balances')
export class V2Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  usd_ingresos: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  usd_egresos: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  usd_deudas: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  ars_ingresos: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  ars_egresos: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  ars_deudas: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  eur_ingresos: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  eur_egresos: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  eur_deudas: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
