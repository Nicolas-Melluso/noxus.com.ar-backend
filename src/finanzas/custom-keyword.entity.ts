import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class CustomKeyword {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: number;
  @Column()
  keyword: string;
  @Column({ nullable: true })
  type: string;
  @Column({ nullable: true })
  category: string;
}
