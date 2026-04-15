import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { V2Balance } from './v2-balance.entity';

@Injectable()
export class V2BalanceService {
  constructor(
    @InjectRepository(V2Balance)
    private readonly v2BalanceRepo: Repository<V2Balance>,
  ) {}

  async getUserBalance(userId: number): Promise<V2Balance> {
    let balance = await this.v2BalanceRepo.findOne({ where: { userId } });
    if (!balance) {
      balance = this.v2BalanceRepo.create({ userId });
      await this.v2BalanceRepo.save(balance);
    }
    return balance;
  }

  async setUserBalance(userId: number, data: Partial<V2Balance>): Promise<V2Balance> {
    let balance = await this.v2BalanceRepo.findOne({ where: { userId } });
    if (!balance) {
      balance = this.v2BalanceRepo.create({ userId, ...data });
    } else {
      Object.assign(balance, data);
    }
    return await this.v2BalanceRepo.save(balance);
  }
}
