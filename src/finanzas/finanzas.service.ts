import { Injectable, BadRequestException } from '@nestjs/common';
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
      if (!data || typeof data !== 'object') {
        throw new BadRequestException('Missing or invalid payload for saveAllData');
      }

      // Normalizar arrays (si no vienen, usar arrays vacíos)
      const transactionsArr = Array.isArray(data.transactions) ? data.transactions : [];
      const debtsArr = Array.isArray(data.debts) ? data.debts : [];
      const budgetsArr = Array.isArray(data.budgets) ? data.budgets : [];
      const notificationsArr = Array.isArray(data.notifications) ? data.notifications : [];
      const recurringsArr = Array.isArray(data.recurring) ? data.recurring : [];

      // Borra datos previos del usuario (opcional)
      await this.transactionRepo.delete({ userId });
      await this.debtRepo.delete({ userId });
      await this.budgetRepo.delete({ userId });
      await this.notificationRepo.delete({ userId });
      await this.recurringRepo.delete({ userId });
      await this.customKeywordRepo.delete({ userId });

      // Inserta nuevos datos *sin* respetar ids del cliente (evitar colisiones/overflows)
      const stripId = (obj: any) => {
        if (!obj || typeof obj !== 'object') return obj;
        const { id, ...rest } = obj;
        return rest;
      };

      const txToSave = transactionsArr.map((t) => ({ ...stripId(t), userId }));
      const debtsToSave = debtsArr.map((d) => ({ ...stripId(d), userId }));
      const budgetsToSave = budgetsArr.map((b) => ({ ...stripId(b), userId }));
      const notificationsToSave = notificationsArr.map((n) => ({ ...stripId(n), userId }));
      const recurringsToSave = recurringsArr.map((r) => ({ ...stripId(r), userId }));

      // Log small summary for debugging migrations
      console.log('[saveAllData] migrating counts ->', {
        transactions: txToSave.length,
        debts: debtsToSave.length,
        budgets: budgetsToSave.length,
        notifications: notificationsToSave.length,
        recurrings: recurringsToSave.length,
      });

      await this.transactionRepo.save(txToSave);
      await this.debtRepo.save(debtsToSave);
      await this.budgetRepo.save(budgetsToSave);
      await this.notificationRepo.save(notificationsToSave);
      await this.recurringRepo.save(recurringsToSave);

      // Custom keywords es un objeto, lo convertimos a array de strings
      const keywordsObj = data.customKeywords || {};
      const keywordsArr = Array.isArray(keywordsObj)
        ? keywordsObj.map((k: any) => ({ userId, keyword: String(k) }))
        : Object.keys(keywordsObj).map((keyword) => ({ userId, keyword }));
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

      if (!Array.isArray(transactions)) transactions = [];

      // Normalizar: eliminar cualquier id proporcionado por el cliente y asignar userId
      const txWithUser = transactions.map((t) => {
        const { userId: _ignored, id: _id, ...rest } = t || {};
        return { ...rest, userId: numUserId };
      });

      console.log(`[saveUserTransactions] user=${numUserId} received ${transactions.length} items, saving ${txWithUser.length}`);

      // Borra todas las transacciones previas del usuario
      await this.transactionRepo.delete({ userId: numUserId });

      // Inserta las transacciones con el userId correcto
      if (txWithUser.length > 0) {
        await this.transactionRepo.save(txWithUser);
      }

      return { ok: true, saved: txWithUser.length };
    }
  }
