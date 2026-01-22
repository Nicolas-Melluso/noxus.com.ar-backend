import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinanzasService } from './finanzas.service';

@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

@Get('transactions')
  @UseGuards(JwtAuthGuard)
  @Post('export')
  async exportData(@Request() req, @Body() data: any) {
    // req.user.id viene del JWT
    return this.finanzasService.saveAllData(req.user.id, data);
  }

  // Nuevo endpoint: GET /finanzas/transactions
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(@Request() req) {
    // Devuelve solo las transacciones del usuario autenticado
    return this.finanzasService.getUserTransactions(req.user.id);
  }

  // Nuevo endpoint: POST /finanzas/transactions
  @UseGuards(JwtAuthGuard)
  @Post('transactions')
  async saveTransactions(@Request() req, @Body() transactions: any[]) {
    // Guarda solo las transacciones del usuario autenticado
    return this.finanzasService.saveUserTransactions(req.user.id, transactions);
  }
}
