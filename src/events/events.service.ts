import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>
  ) {}

  async getEventsByMonth(year: number, month: number) {
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = `${year}-${String(month).padStart(2, '0')}-31`;
    
    return await this.eventRepository.find({
      where: {
        date: Between(firstDay, lastDay)
      }
    });
  }

  async create(eventData: Partial<Event>) {
    const event = this.eventRepository.create(eventData);
    return await this.eventRepository.save(event);
  }
}