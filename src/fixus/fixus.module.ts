import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixusController } from './fixus.controller';
import { FixusService } from './fixus.service';
import { Routine } from './entities/routine.entity';
import { Person } from './entities/person.entity';
import { TrainerCode } from './entities/trainer-code.entity';
import { TrainerRequest } from './entities/trainer-request.entity';
import { LinkedTrainer } from './entities/linked-trainer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Routine,
      Person,
      TrainerCode,
      TrainerRequest,
      LinkedTrainer,
    ]),
  ],
  controllers: [FixusController],
  providers: [FixusService],
  exports: [FixusService],
})
export class FixusModule {}
