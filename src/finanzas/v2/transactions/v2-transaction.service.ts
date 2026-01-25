import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { V2Transaction } from './v2-transaction.entity';

@Injectable()
export class V2TransactionService {
  constructor(
    @InjectRepository(V2Transaction)
    private readonly v2TransactionRepo: Repository<V2Transaction>,
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
    return { saved: txs.length };
  }
}
