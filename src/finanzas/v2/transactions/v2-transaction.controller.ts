import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { V2TransactionService } from './v2-transaction.service';

@Controller('finanzas/v2/transactions')
export class V2TransactionController {
  constructor(private readonly v2TransactionService: V2TransactionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Request() req) {
    console.log('[BACKEND] GET transacciones usuario', req.user.id);
    return this.v2TransactionService.getUserTransactions(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTransaction(@Request() req, @Body() tx: any) {
    console.log('[BACKEND] POST crear transacción', req.user.id, tx);
    return this.v2TransactionService.createUserTransaction(req.user.id, tx);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  async saveTransactions(@Request() req, @Body() transactions: any[]) {
    console.log('[BACKEND] POST bulk transacciones', req.user.id, transactions);
    return this.v2TransactionService.saveUserTransactions(req.user.id, transactions);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateTransaction(@Request() req, @Param('id') id: number, @Body() updates: any) {
    console.log('[BACKEND] PUT actualizar transacción', req.user.id, id, updates);
    return this.v2TransactionService.updateUserTransaction(req.user.id, id, updates);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteTransaction(@Request() req, @Param('id') id: number) {
    console.log('[BACKEND] DELETE eliminar transacción', req.user.id, id);
    return this.v2TransactionService.deleteUserTransaction(req.user.id, id);
  }
}
