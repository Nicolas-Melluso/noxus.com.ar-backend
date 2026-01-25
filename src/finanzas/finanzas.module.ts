import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanzasController } from './finanzas.controller';
import { FinanzasService } from './finanzas.service';
import { Transaction } from './transaction.entity';
import { Debt } from './debt.entity';
import { Budget } from './budget.entity';
import { Notification } from './notification.entity';
import { Recurring } from './recurring.entity';
import { CustomKeyword } from './custom-keyword.entity';

// V2 imports
import { V2Transaction } from './v2/transactions/v2-transaction.entity';
import { V2TransactionController } from './v2/transactions/v2-transaction.controller';
import { V2TransactionService } from './v2/transactions/v2-transaction.service';

import { V2Balance } from './v2/balance/v2-balance.entity';
import { V2BalanceService } from './v2/balance/v2-balance.service';
import { V2BalanceController } from './v2/balance/v2-balance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    Transaction, Debt, Budget, Notification, Recurring, CustomKeyword,
    V2Transaction, V2Balance
  ])],
  controllers: [FinanzasController, V2TransactionController, V2BalanceController],
  providers: [FinanzasService, V2TransactionService, V2BalanceService],
})
export class FinanzasModule {}
