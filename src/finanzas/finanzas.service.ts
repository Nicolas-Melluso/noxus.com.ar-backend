import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Debt } from './debt.entity';
import { Budget } from './budget.entity';
import { Notification } from './notification.entity';
import { Recurring } from './recurring.entity';
import { CustomKeyword } from './custom-keyword.entity';

@Injectable()
export class FinanzasService {
  constructor(
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(Debt) private debtRepo: Repository<Debt>,
    @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    @InjectRepository(Recurring) private recurringRepo: Repository<Recurring>,
    @InjectRepository(CustomKeyword) private customKeywordRepo: Repository<CustomKeyword>,
  ) {}

  async saveAllData(userId: number, data: any) {
      // Borra datos previos del usuario (opcional)
      await this.transactionRepo.delete({ userId });
      await this.debtRepo.delete({ userId });
      await this.budgetRepo.delete({ userId });
      await this.notificationRepo.delete({ userId });
      await this.recurringRepo.delete({ userId });
      await this.customKeywordRepo.delete({ userId });
      // Inserta nuevos datos
      await this.transactionRepo.save(data.transactions.map((t) => ({ ...t, userId })));
      await this.debtRepo.save(data.debts.map((d) => ({ ...d, userId })));
      await this.budgetRepo.save(data.budgets.map((b) => ({ ...b, userId })));
      await this.notificationRepo.save(data.notifications.map((n) => ({ ...n, userId })));
      await this.recurringRepo.save(data.recurring.map((r) => ({ ...r, userId })));
      // Custom keywords es un objeto, lo convertimos a array de strings
      const keywordsArr = Object.keys(data.customKeywords || {}).map((keyword) => ({ userId, keyword }));
      await this.customKeywordRepo.save(keywordsArr);
      return { ok: true };
    }

    // ...existing code...

    async getUserTransactions(userId: number) {
      return await this.transactionRepo.find({ where: { userId } });
    }

    async saveUserTransactions(userId: number, transactions: any[]) {
      
      // Validar que el usuario existe antes de guardar
      // Permitir userId como string o number y validar NaN/null
      const numUserId = Number(userId);
      if (!userId || isNaN(numUserId)) {
        console.error('[saveUserTransactions] userId inválido:', userId);
        throw new Error('userId inválido en la sesión. Reautentica.');
      }
      const userExists = await this.transactionRepo.manager.query('SELECT id FROM users WHERE id = ?', [numUserId]);
      
      if (!userExists.length) {
        throw new Error('El usuario no existe en la base de datos. Reautentica tu sesión.');
      }
        // Filtrar y limpiar transacciones: solo nuevas (sin id definido o igual a 0), y eliminar cualquier campo id
        const txWithUser = transactions
          .filter(t => t.id === undefined || t.id === null || t.id === 0)
          .map((t) => {
            const { userId: _ignored, id: _id, ...rest } = t;
            return { ...rest, userId: numUserId };
          });
          
      // Borra todas las transacciones previas del usuario
      await this.transactionRepo.delete({ userId });
        // Inserta las nuevas transacciones con el userId correcto
        await this.transactionRepo.save(txWithUser);
       
        return { ok: true };
    }
  }
