import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  date: string;

  @Column({ name: 'read', type: 'boolean', default: false })
  read: boolean;
}
