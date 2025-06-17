import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Events } from './event.entity';
import { EventService } from './event.service';
import { CreateEventDto } from './event.dto';

@Controller('calendar')
export class EventsController {
  constructor(private readonly eventRepository: EventService) {}

  // CREAR EVENTO (solo admin)
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
}