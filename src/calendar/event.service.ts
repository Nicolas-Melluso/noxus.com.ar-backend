import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Events } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Events)
    private eventRepository: Repository<Events>,
  ) {}

  // Devuelve eventos por mes y rol
  async findEventsByMonth(year: number, month: number): Promise<Events[]> {
    const monthStr = month.toString().padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    return this.eventRepository
      .createQueryBuilder('event')
      .where('event.date BETWEEN :start AND :end', { start: startDate, end: endDate })
      .getMany();
  }

  // Crear evento
  async create(eventData: Partial<Events>): Promise<Events> {
    const event = this.eventRepository.create(eventData);
    return this.eventRepository.save(event);
  }

  // Borrar evento (solo admin)
  async delete(id: number): Promise<void> {
    await this.eventRepository.delete(id);
  }
}