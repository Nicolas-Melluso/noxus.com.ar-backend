import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class Recurring {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: number;
  @Column()
  description: string;
  @Column('decimal',{precision:12,scale:2})
  amount: number;
  @Column({ nullable: true })
  frequency: string;
  @Column({ nullable: true })
  nextDate: string;
  @Column({ nullable: true })
  active: boolean;
}
