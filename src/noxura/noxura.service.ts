import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { DailyMeal } from './entities/daily-meal.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class NoxuraService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(DailyMeal)
    private dailyMealRepository: Repository<DailyMeal>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  // ====== RECIPES ======
  async getRecipes(userId: number) {
    return this.recipeRepository.find({ where: { userId } });
  }

  async getRecipe(id: number, userId: number) {
    return this.recipeRepository.findOne({ where: { id, userId } });
  }

  async createRecipe(userId: number, data: any) {
    const recipe = this.recipeRepository.create({ ...data, userId });
    return this.recipeRepository.save(recipe);
  }

  async updateRecipe(id: number, userId: number, data: any) {
    await this.recipeRepository.update({ id, userId }, data);
    return this.getRecipe(id, userId);
  }

  async deleteRecipe(id: number, userId: number) {
    await this.recipeRepository.delete({ id, userId });
    return { success: true };
  }

  // ====== DAILY MEALS ======
  async getDailyMeals(userId: number, startDate?: string, endDate?: string) {
    const query = this.dailyMealRepository.createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId });

    if (startDate) {
      query.andWhere('meal.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('meal.date <= :endDate', { endDate });
    }

    return query.orderBy('meal.date', 'DESC').getMany();
  }

  async getDailyMeal(date: string, userId: number) {
    return this.dailyMealRepository.findOne({ where: { date, userId } });
  }

  async getMonthlyMeals(userId: number, month: number, year: number) {
    // month es 0-11 (como en JavaScript), convertir a 1-12 para SQL
    const monthNum = month + 1;
    const monthStr = String(monthNum).padStart(2, '0');
    const yearStr = String(year);
    const datePrefix = `${yearStr}-${monthStr}`;

    const meals = await this.dailyMealRepository.find({
      where: {
        userId,
      },
    });

    // Filtrar por mes (más eficiente en memoria que en SQL con LIKE)
    const monthlyMeals = meals.filter(meal => 
      meal.date.startsWith(datePrefix)
    );

    // Convertir a objeto indexado por fecha
    const result: Record<string, any> = {};
    monthlyMeals.forEach(meal => {
      result[meal.date] = {
        meals: meal.meals || [],
        totalCalories: meal.totalCalories || 0,
        validated: meal.validated || false
      };
    });

    return {
      month,
      year,
      dailyMeals: result,
    };
  }

  async saveDailyMeal(userId: number, date: string, meals: any[]) {
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    
    const existing = await this.getDailyMeal(date, userId);
    if (existing) {
      existing.meals = meals;
      existing.totalCalories = totalCalories;
      return this.dailyMealRepository.save(existing);
    }

    const dailyMeal = this.dailyMealRepository.create({
      userId,
      date,
      meals,
      totalCalories,
    });
    return this.dailyMealRepository.save(dailyMeal);
  }

  async deleteDailyMeal(date: string, userId: number) {
    await this.dailyMealRepository.delete({ date, userId });
    return { success: true };
  }

  async validateDailyMeal(date: string, userId: number, validatorId: number) {
    const meal = await this.getDailyMeal(date, userId);
    if (!meal) {
      throw new Error('Daily meal not found');
    }

    meal.validated = true;
    meal.validatedBy = validatorId;
    meal.validatedAt = new Date();
    
    // Actualizar perfil del usuario (agregar puntos)
    await this.addPoints(userId, 10);
    
    // Actualizar contador de validaciones del validador
    const validatorProfile = await this.getOrCreateProfile(validatorId);
    validatorProfile.validationsGiven++;
    await this.userProfileRepository.save(validatorProfile);

    return this.dailyMealRepository.save(meal);
  }

  // ====== USER PROFILES ======
  async getProfile(userId: number) {
    return this.getOrCreateProfile(userId);
  }

  async getOrCreateProfile(userId: number) {
    let profile = await this.userProfileRepository.findOne({ where: { userId } });
    
    if (!profile) {
      profile = this.userProfileRepository.create({
        userId,
        username: `User${userId}`,
        points: 0,
        league: 'bronce',
      });
      await this.userProfileRepository.save(profile);
    }

    return profile;
  }

  async updateProfile(userId: number, data: any) {
    const profile = await this.getOrCreateProfile(userId);
    Object.assign(profile, data);
    return this.userProfileRepository.save(profile);
  }

  async addPoints(userId: number, points: number) {
    const profile = await this.getOrCreateProfile(userId);
    profile.points += points;
    
    // Actualizar liga basado en puntos
    profile.league = this.calculateLeague(profile.points);
    
    return this.userProfileRepository.save(profile);
  }

  async getRanking(limit: number = 100) {
    return this.userProfileRepository.find({
      order: { points: 'DESC' },
      take: limit,
    });
  }

  private calculateLeague(points: number): string {
    if (points >= 10000) return 'onix';
    if (points >= 5000) return 'diamante';
    if (points >= 2500) return 'platino';
    if (points >= 1000) return 'oro';
    if (points >= 500) return 'plata';
    return 'bronce';
  }

  // Actualizar racha de días consecutivos
  async updateConsecutiveDays(userId: number) {
    const profile = await this.getOrCreateProfile(userId);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (profile.lastLoginDate === yesterday) {
      profile.consecutiveDays++;
    } else if (profile.lastLoginDate !== today) {
      profile.consecutiveDays = 1;
    }

    profile.lastLoginDate = today;
    return this.userProfileRepository.save(profile);
  }
}
