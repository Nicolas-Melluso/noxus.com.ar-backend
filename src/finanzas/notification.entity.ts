import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: number;
  @Column()
  type: string;
  @Column()
  title: string;
  @Column()
  message: string;
  @Column({ nullable: true })
  date: string;
  @Column({ nullable: true })
  read: boolean;
}
