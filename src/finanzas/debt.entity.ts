import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class Debt {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: number;
  @Column()
  description: string;
  @Column('decimal',{precision:12,scale:2})
  amount: number;
  @Column({ nullable: true })
  date: string;
  @Column({ nullable: true })
  paid: boolean;
}
