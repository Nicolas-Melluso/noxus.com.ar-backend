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

    // Helper to strip client-provided id
    private stripId(obj: any) {
      if (!obj || typeof obj !== 'object') return obj;
      const { id, ...rest } = obj as any;
      return rest;
    }

    // Debts
    async getUserDebts(userId: number) {
      return await this.debtRepo.find({ where: { userId } });
    }

    async saveUserDebts(userId: number, debts: any[]) {
      if (!Array.isArray(debts)) debts = [];
      const debtsToSave = debts.map(d => ({ ...this.stripId(d), userId }));
      await this.debtRepo.delete({ userId });
      if (debtsToSave.length) await this.debtRepo.save(debtsToSave);
      return { ok: true, saved: debtsToSave.length };
    }

    // CRUD por ítem para debts
    async createDebt(userId: number, debt: any) {
      const payload = { ...this.stripId(debt), userId };
      const saved = await this.debtRepo.save(payload);
      return { ok: true, debt: saved };
    }

    async getDebtById(userId: number, id: number) {
      return await this.debtRepo.findOne({ where: { id, userId } });
    }

    async updateDebt(userId: number, id: number, debt: any) {
      const payload = { ...this.stripId(debt), userId };
      await this.debtRepo.update({ id, userId }, payload);
      const updated = await this.debtRepo.findOne({ where: { id, userId } });
      return { ok: true, debt: updated };
    }

    async deleteDebt(userId: number, id: number) {
      const res = await this.debtRepo.delete({ id, userId });
      return { ok: true, affected: res.affected };
    }

    // Recurrings
    async getUserRecurrings(userId: number) {
      return await this.recurringRepo.find({ where: { userId } });
    }

    async saveUserRecurrings(userId: number, recurrings: any[]) {
      if (!Array.isArray(recurrings)) recurrings = [];
      const toSave = recurrings.map(r => ({ ...this.stripId(r), userId }));
      await this.recurringRepo.delete({ userId });
      if (toSave.length) await this.recurringRepo.save(toSave);
      return { ok: true, saved: toSave.length };
    }

    // Budgets
    async getUserBudgets(userId: number) {
      return await this.budgetRepo.find({ where: { userId } });
    }

    async saveUserBudgets(userId: number, budgets: any[]) {
      if (!Array.isArray(budgets)) budgets = [];
      const toSave = budgets.map(b => ({ ...this.stripId(b), userId }));
      await this.budgetRepo.delete({ userId });
      if (toSave.length) await this.budgetRepo.save(toSave);
      return { ok: true, saved: toSave.length };
    }

    // Notifications
    async getUserNotifications(userId: number) {
      return await this.notificationRepo.find({ where: { userId } });
    }

    async saveUserNotifications(userId: number, notifications: any[]) {
      if (!Array.isArray(notifications)) notifications = [];
      const toSave = notifications.map(n => ({ ...this.stripId(n), userId }));
      await this.notificationRepo.delete({ userId });
      if (toSave.length) await this.notificationRepo.save(toSave);
      return { ok: true, saved: toSave.length };
    }

    // Custom keywords
    async getCustomKeywords(userId: number) {
      return await this.customKeywordRepo.find({ where: { userId } });
    }

    async saveCustomKeywords(userId: number, payload: any) {
      // payload can be array or object mapping
      let arr: any[] = [];
      if (Array.isArray(payload)) arr = payload.map((k: any) => ({ keyword: String(k) }));
      else if (payload && typeof payload === 'object') {
        if (Array.isArray(payload)) arr = payload.map((k: any) => ({ keyword: String(k) }));
        else if (Object.keys(payload).length) {
          // payload could be { type: { ... }, category: { ... } } -> flatten values
          const flat: string[] = [];
          Object.values(payload).forEach((v: any) => {
            if (Array.isArray(v)) flat.push(...v.map((x: any) => String(x)));
            else if (typeof v === 'object') Object.values(v).forEach((vv: any) => { if (Array.isArray(vv)) flat.push(...vv.map((x: any) => String(x))); });
          });
          arr = flat.map(k => ({ keyword: String(k) }));
        }
      }
      const toSave = arr.map(k => ({ ...k, userId }));
      await this.customKeywordRepo.delete({ userId });
      if (toSave.length) await this.customKeywordRepo.save(toSave);
      return { ok: true, saved: toSave.length };
    }
  }
