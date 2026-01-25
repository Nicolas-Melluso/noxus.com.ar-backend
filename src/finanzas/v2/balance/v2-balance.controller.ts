import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { V2BalanceService } from './v2-balance.service';

@Controller('finanzas/v2/balance')
export class V2BalanceController {
  constructor(private readonly v2BalanceService: V2BalanceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBalance(@Request() req) {
    return this.v2BalanceService.getUserBalance(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async setBalance(@Request() req, @Body() data) {
    return this.v2BalanceService.setUserBalance(req.user.id, data);
  }
}
