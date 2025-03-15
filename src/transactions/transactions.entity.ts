import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('libro_diario')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal')
    monto: number;

    @Column()
    descripcion: string;

    @Column({ type: 'date' })
    fecha: string;

    @Column()
    tipo: string;

    @ManyToOne(() => User, (user) => user.transactions)
    @JoinColumn({ name: 'userId' }) // ← Usa el nombre real de la columna
    user: User;
}