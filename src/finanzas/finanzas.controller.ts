import { Controller, Post, Get, Body, UseGuards, Request, Param, Put, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinanzasService } from './finanzas.service';

@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  // POST /finanzas/export  -> guarda todo el paquete (saveAllData)
  @Post('export')
  @UseGuards(JwtAuthGuard)
  async exportData(@Request() req, @Body() data: any) {
    return this.finanzasService.saveAllData(req.user.id, data);
  }

  // GET /finanzas/transactions -> obtener transacciones del usuario
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Request() req) {
    return this.finanzasService.getUserTransactions(req.user.id);
  }

  // POST /finanzas/transactions -> guardar/transacciones del usuario
  @Post('transactions')
  @UseGuards(JwtAuthGuard)
  async saveTransactions(@Request() req, @Body() transactions: any[]) {
    return this.finanzasService.saveUserTransactions(req.user.id, transactions);
  }

  // GET /finanzas/debts -> obtener deudas del usuario
  @Get('debts')
  @UseGuards(JwtAuthGuard)
  async getDebts(@Request() req) {
    return this.finanzasService.getUserDebts(req.user.id);
  }

  // POST /finanzas/debts -> guardar deudas del usuario
  @Post('debts')
  @UseGuards(JwtAuthGuard)
  async saveDebts(@Request() req, @Body() debts: any[]) {
    return this.finanzasService.saveUserDebts(req.user.id, debts);
  }

  // POST /finanzas/debts/item -> crear una deuda individual (CRUD)
  @Post('debts/item')
  @UseGuards(JwtAuthGuard)
  async createDebt(@Request() req, @Body() debt: any) {
    return this.finanzasService.createDebt(req.user.id, debt);
  }

  // GET /finanzas/debts/:id -> obtener una deuda por id
  @Get('debts/:id')
  @UseGuards(JwtAuthGuard)
  async getDebt(@Request() req, @Param('id') id: string) {
    return this.finanzasService.getDebtById(req.user.id, Number(id));
  }

  // PUT /finanzas/debts/:id -> actualizar una deuda
  @Put('debts/:id')
  @UseGuards(JwtAuthGuard)
  async updateDebt(@Request() req, @Param('id') id: string, @Body() debt: any) {
    return this.finanzasService.updateDebt(req.user.id, Number(id), debt);
  }

  // DELETE /finanzas/debts/:id -> borrar una deuda
  @Delete('debts/:id')
  @UseGuards(JwtAuthGuard)
  async deleteDebt(@Request() req, @Param('id') id: string) {
    return this.finanzasService.deleteDebt(req.user.id, Number(id));
  }

  // Item-level CRUD for recurrings
  @Post('recurrings/item')
  @UseGuards(JwtAuthGuard)
  async createRecurring(@Request() req, @Body() recurring: any) {
    return this.finanzasService.createRecurring(req.user.id, recurring);
  }

  @Get('recurrings/:id')
  @UseGuards(JwtAuthGuard)
  async getRecurring(@Request() req, @Param('id') id: string) {
    return this.finanzasService.getRecurringById(req.user.id, Number(id));
  }

  @Put('recurrings/:id')
  @UseGuards(JwtAuthGuard)
  async updateRecurring(@Request() req, @Param('id') id: string, @Body() recurring: any) {
    return this.finanzasService.updateRecurring(req.user.id, Number(id), recurring);
  }

  @Delete('recurrings/:id')
  @UseGuards(JwtAuthGuard)
  async deleteRecurring(@Request() req, @Param('id') id: string) {
    return this.finanzasService.deleteRecurring(req.user.id, Number(id));
  }

  // GET /finanzas/recurrings -> obtener recurrings del usuario
  @Get('recurrings')
  @UseGuards(JwtAuthGuard)
  async getRecurrings(@Request() req) {
    return this.finanzasService.getUserRecurrings(req.user.id);
  }

  // POST /finanzas/recurrings -> guardar recurrings del usuario
  @Post('recurrings')
  @UseGuards(JwtAuthGuard)
  async saveRecurrings(@Request() req, @Body() recurrings: any[]) {
    return this.finanzasService.saveUserRecurrings(req.user.id, recurrings);
  }

  // GET /finanzas/budgets -> obtener budgets del usuario
  @Get('budgets')
  @UseGuards(JwtAuthGuard)
  async getBudgets(@Request() req) {
    return this.finanzasService.getUserBudgets(req.user.id);
  }

  // POST /finanzas/budgets -> guardar budgets del usuario
  @Post('budgets')
  @UseGuards(JwtAuthGuard)
  async saveBudgets(@Request() req, @Body() budgets: any[]) {
    return this.finanzasService.saveUserBudgets(req.user.id, budgets);
  }

  // GET /finanzas/notifications -> obtener notifications del usuario
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Request() req) {
    return this.finanzasService.getUserNotifications(req.user.id);
  }

  // POST /finanzas/notifications -> guardar notifications del usuario
  @Post('notifications')
  @UseGuards(JwtAuthGuard)
  async saveNotifications(@Request() req, @Body() notifications: any[]) {
    return this.finanzasService.saveUserNotifications(req.user.id, notifications);
  }

  // GET /finanzas/custom-keywords -> obtener custom keywords del usuario
  @Get('custom-keywords')
  @UseGuards(JwtAuthGuard)
  async getCustomKeywords(@Request() req) {
    return this.finanzasService.getCustomKeywords(req.user.id);
  }

  // POST /finanzas/custom-keywords -> guardar custom keywords del usuario
  @Post('custom-keywords')
  @UseGuards(JwtAuthGuard)
  async saveCustomKeywords(@Request() req, @Body() payload: any) {
    return this.finanzasService.saveCustomKeywords(req.user.id, payload);
  }
}
