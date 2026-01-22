import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
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
}
