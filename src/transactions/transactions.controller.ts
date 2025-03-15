// src/transactions/transactions.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transactions.entity';
import { UsersService } from 'src/users/users.service';
import { CreateTransactionDto } from 'src/users/user.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService
  ) {}

  @Get()
  findAll(): Promise<Transaction[]> {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Transaction> {
    return this.transactionsService.findOne(id);
  }

  @Post()
  create(@Body() transaction: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.create(transaction);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() transaction: Transaction): Promise<Transaction> {
    return this.transactionsService.update(id, transaction);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.transactionsService.remove(id);
  }
}