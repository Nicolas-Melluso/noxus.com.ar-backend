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

@Module({
  imports: [TypeOrmModule.forFeature([
    Transaction, Debt, Budget, Notification, Recurring, CustomKeyword
  ])],
  controllers: [FinanzasController],
  providers: [FinanzasService],
})
export class FinanzasModule {}
