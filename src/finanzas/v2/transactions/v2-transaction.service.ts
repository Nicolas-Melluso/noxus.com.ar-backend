import { Injectable } from '@nestjs/common';
import { V2BalanceService } from '../balance/v2-balance.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { V2Transaction } from './v2-transaction.entity';

@Injectable()
export class V2TransactionService {
  constructor(
    @InjectRepository(V2Transaction)
    private readonly v2TransactionRepo: Repository<V2Transaction>,
    private readonly v2BalanceService: V2BalanceService,
  ) {}

  async getUserTransactions(userId: number): Promise<V2Transaction[]> {
    return this.v2TransactionRepo.find({ where: { userId, deleted: false } });
  }

  async saveUserTransactions(userId: number, transactions: Partial<V2Transaction>[]): Promise<any> {
    // Soft delete previas
    await this.v2TransactionRepo.update({ userId, deleted: false }, { deleted: true });
    // Insertar nuevas
    const txs = transactions.map(t => ({ ...t, userId, deleted: false }));
    await this.v2TransactionRepo.save(txs);

    // Recalcular balance
    // Sumar ingresos, egresos y deudas por moneda
    const balanceData = {
      usd_ingresos: 0, usd_egresos: 0, usd_deudas: 0,
      ars_ingresos: 0, ars_egresos: 0, ars_deudas: 0,
      eur_ingresos: 0, eur_egresos: 0, eur_deudas: 0
    };
    for (const tx of txs) {
      const { amount = 0, type, currency = 'ARS' } = tx;
      if (type === 'income') balanceData[`${currency.toLowerCase()}_ingresos`] += Number(amount);
      else if (type === 'expense') balanceData[`${currency.toLowerCase()}_egresos`] += Number(amount);
      else if (type === 'debt') balanceData[`${currency.toLowerCase()}_deudas`] += Number(amount);
    }
    await this.v2BalanceService.setUserBalance(userId, balanceData);

    return { saved: txs.length };
  }
}
