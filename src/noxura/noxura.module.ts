import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoxuraController } from './noxura.controller';
import { NoxuraService } from './noxura.service';
import { Recipe } from './entities/recipe.entity';
import { DailyMeal } from './entities/daily-meal.entity';
import { UserProfile } from './entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, DailyMeal, UserProfile]),
  ],
  controllers: [NoxuraController],
  providers: [NoxuraService],
  exports: [NoxuraService],
})
export class NoxuraModule {}
