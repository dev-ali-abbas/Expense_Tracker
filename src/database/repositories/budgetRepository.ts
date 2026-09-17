import { getDatabase } from '../database';
import { Budget } from '../../shared/types/models';

interface BudgetRow {
  id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

function mapRowToBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    amount: row.amount,
    month: row.month,
    year: row.year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class BudgetRepository {
  async getBudget(year: number, month: number): Promise<Budget | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BudgetRow>(
      'SELECT * FROM budgets WHERE year = ? AND month = ?;',
      [year, month]
    );
    return row ? mapRowToBudget(row) : null;
  }

  async setBudget(amountPaise: number, year: number, month: number): Promise<Budget> {
    const db = await getDatabase();
    const existing = await this.getBudget(year, month);
    const now = new Date().toISOString();

    if (existing) {
      await db.runAsync(
        'UPDATE budgets SET amount = ?, updated_at = ? WHERE id = ?;',
        [amountPaise, now, existing.id]
      );
      return {
        ...existing,
        amount: amountPaise,
        updatedAt: now,
      };
    } else {
      const id = `bdg-${year}-${month}`;
      await db.runAsync(
        `INSERT INTO budgets (id, amount, month, year, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [id, amountPaise, month, year, now, now]
      );
      return {
        id,
        amount: amountPaise,
        month,
        year,
        createdAt: now,
        updatedAt: now,
      };
    }
  }

  async deleteBudget(year: number, month: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'DELETE FROM budgets WHERE year = ? AND month = ?;',
      [year, month]
    );
  }
}

export const budgetRepository = new BudgetRepository();
