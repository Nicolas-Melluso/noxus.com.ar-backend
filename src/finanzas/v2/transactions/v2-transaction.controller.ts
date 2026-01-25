import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { V2TransactionService } from './v2-transaction.service';

@Controller('finanzas/v2/transactions')
export class V2TransactionController {
  constructor(private readonly v2TransactionService: V2TransactionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Request() req) {
    return this.v2TransactionService.getUserTransactions(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async saveTransactions(@Request() req, @Body() transactions: any[]) {
    return this.v2TransactionService.saveUserTransactions(req.user.id, transactions);
  }
}
