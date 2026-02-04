import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NoxuraService } from './noxura.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('noxura')
@UseGuards(JwtAuthGuard)
export class NoxuraController {
  constructor(private readonly noxuraService: NoxuraService) {}

  // ====== RECIPES ======
  @Get('recipes')
  async getRecipes(@Request() req) {
    return this.noxuraService.getRecipes(req.user.userId);
  }

  @Get('recipes/:id')
  async getRecipe(@Request() req, @Param('id') id: number) {
    return this.noxuraService.getRecipe(id, req.user.userId);
  }

  @Post('recipes')
  async createRecipe(@Request() req, @Body() data: any) {
    return this.noxuraService.createRecipe(req.user.userId, data);
  }

  @Put('recipes/:id')
  async updateRecipe(@Request() req, @Param('id') id: number, @Body() data: any) {
    return this.noxuraService.updateRecipe(id, req.user.userId, data);
  }

  @Delete('recipes/:id')
  async deleteRecipe(@Request() req, @Param('id') id: number) {
    return this.noxuraService.deleteRecipe(id, req.user.userId);
  }

  // ====== DAILY MEALS ======
  @Get('meals')
  async getDailyMeals(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.noxuraService.getDailyMeals(req.user.userId, startDate, endDate);
  }

  @Get('meals/:date')
  async getDailyMeal(@Request() req, @Param('date') date: string) {
    return this.noxuraService.getDailyMeal(date, req.user.userId);
  }

  @Post('meals')
  async saveDailyMeal(@Request() req, @Body() data: { date: string; meals: any[] }) {
    return this.noxuraService.saveDailyMeal(req.user.userId, data.date, data.meals);
  }

  @Post('meals/:date/validate')
  async validateMeal(@Request() req, @Param('date') date: string, @Body() data: { userId: number }) {
    return this.noxuraService.validateDailyMeal(date, data.userId, req.user.userId);
  }

  // ====== USER PROFILE ======
  @Get('profile')
  async getProfile(@Request() req) {
    return this.noxuraService.getProfile(req.user.userId);
  }

  @Get('profile/:userId')
  async getUserProfile(@Param('userId') userId: number) {
    return this.noxuraService.getProfile(userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() data: any) {
    return this.noxuraService.updateProfile(req.user.userId, data);
  }

  @Post('profile/points')
  async addPoints(@Request() req, @Body() data: { points: number }) {
    return this.noxuraService.addPoints(req.user.userId, data.points);
  }

  @Post('profile/login')
  async updateLogin(@Request() req) {
    return this.noxuraService.updateConsecutiveDays(req.user.userId);
  }

  // ====== RANKING ======
  @Get('ranking')
  async getRanking(@Query('limit') limit?: number) {
    return this.noxuraService.getRanking(limit ? parseInt(limit as any) : 100);
  }
}
