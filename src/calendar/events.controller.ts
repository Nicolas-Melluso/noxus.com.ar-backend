import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Events } from './event.entity';
import { EventService } from './event.service';
import { CreateEventDto } from './event.dto';
import { RsvpDto } from './rsvp.dto';
import { ScorerDto } from './scorer.dto';

@Controller('calendar')
export class EventsController {
  constructor(private readonly eventRepository: EventService) {}

  @Post()
  async createEvent(@Body() event: CreateEventDto): Promise<Events> {
    return this.eventRepository.create(event);
  }

  // OBTENER EVENTOS POR MES Y AÑO (filtrado por rol)
  @Get('/events')
  async getAllEventsByMonth(
    @Query('month') month: number,
    @Query('year') year: number
  ): Promise<Events[]> { // Asegúrate de que req.user tenga el rol del usuario
    return this.eventRepository.findEventsByMonth(year, month);
  }

  // Asistencia a evento
  @Post('/rsvp')
  async rsvp(@Body() rsvpData: RsvpDto): Promise<Events[]> {
    const event = await this.eventRepository.findOneBy({ date: rsvpData.date });
    if (!event) throw new Error('Evento no encontrado');
    
    // Actualizar asistentes
    if (rsvpData.action === 'attend' && !event.attendees.includes(rsvpData.userId)) {
      event.attendees.push(rsvpData.userId);
    } else if (rsvpData.action === 'not-attend') {
      event.attendees = event.attendees.filter(id => id !== rsvpData.userId);
    }

    return [await this.eventRepository.save(event)];
  }

  // Solicitar ser planillero
  @Post('/request-scorer')
  async requestScorer(@Body() scorerData: ScorerDto): Promise<Events> {
    const event = await this.eventRepository.findOneBy({ date: scorerData.date });
    if (!event) throw new Error('Evento no encontrado');

    // Añadir al array de planilleros
    if (!event.scorers.includes(scorerData.scorerId)) {
      event.scorers.push(scorerData.scorerId);
    }

    return this.eventRepository.save(event);
  }
}