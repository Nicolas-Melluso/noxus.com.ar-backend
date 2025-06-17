import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Events } from './event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Events]),
  ],
  providers: [EventService],
  controllers: [EventsController],
  exports: [EventService]
})
export class EventModule {}
