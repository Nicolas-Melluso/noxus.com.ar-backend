import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Event } from './event.entity';
import { EventsService } from './events.service';

@Controller('calendar')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events')
  getEvents(
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    return this.eventsService.getEventsByMonth(year, month);
  }

  @Post('events')
  @Roles('admin', 'entrenador')
  createEvent(@Body() eventData: Partial<Event>,  @Req() req: any) {
    const creatorId = req.user.userId;
    return this.eventsService.create({ ...eventData, creatorId});
  }
}