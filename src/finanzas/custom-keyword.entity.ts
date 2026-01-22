import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('custom_keywords')
export class CustomKeyword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column()
  keyword: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  category: string;
}
