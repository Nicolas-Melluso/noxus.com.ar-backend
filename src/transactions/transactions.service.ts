// src/transactions/transactions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transactions.entity';
import { CreateTransactionDto } from 'src/users/user.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(User) // ← Asegúrate de inyectar el repositorio de User
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<Transaction[]> {
    console.log("intentando");
    
    return this.transactionsRepository.find();
  }

  findOne(id: number): Promise<Transaction> {
    return this.transactionsRepository.findOneBy({ id });
  }

  async create(dto: CreateTransactionDto) {
          // Verificar que el usuario exista
          const user = await this.usersRepository.findOneBy({ userId: dto.userId });
          if (!user) {
            throw new NotFoundException('Usuario no encontrado');
          }
        
          // Crear la transacción
          const transaction = this.transactionsRepository.create({
            ...dto,
            user: user,
          });
          return this.transactionsRepository.save(transaction);
        }

  async update(id: number, transaction: Partial<Transaction>): Promise<Transaction> {
    await this.transactionsRepository.update(id, transaction);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.transactionsRepository.delete(id);
  }
}