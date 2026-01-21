import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: number;
  @Column()
  category: string;
  @Column('decimal',{precision:12,scale:2})
  amount: number;
  @Column({ nullable: true })
  period: string;
  @Column({ nullable: true })
  periodKey: string;
}
