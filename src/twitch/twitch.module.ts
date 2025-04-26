// src/transactions/transactions.module.ts
import { Module } from '@nestjs/common';
import { TwitchController } from './twitch.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [TwitchController],
})
export class TransactionsModule {}