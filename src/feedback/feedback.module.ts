import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackResponse } from './feedback.entity';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackResponse])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
