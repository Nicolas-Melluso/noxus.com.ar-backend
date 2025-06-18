import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Events {
  @PrimaryGeneratedColumn()
  eventId: number;

  @Column()
  date: string; // Formato: YYYY-MM-DD

  @Column()
  title: string;

  @Column()
  time: string; // Ej: "15:00"

  @Column()
  description: string;

  @Column('simple-array', { default: ['socio'] }) // Roles que pueden ver el evento
  roles: string[];

  @Column({ type: 'enum', enum: ['entrenamiento', 'partido', 'recreativo', 'feriado'] })
  type: string;

  @Column('simple-array', { default: [] })
  attendees: number[]; // IDs de usuarios que asistirán

  @Column('simple-array', { default: [] })
  scorers: number[]; // IDs de planilleros solicitados
}