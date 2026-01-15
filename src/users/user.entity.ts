import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'socio' })
  role: 'admin' | 'entrenador' | 'socio' | 'jugador' | 'planilla' | 'tesorero' | 'livosam' | 'unilivo';

  @Column({ nullable: true })
  refreshToken: string;

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async saveWithHash() {
    await this.hashPassword();
    return this;
  }
}