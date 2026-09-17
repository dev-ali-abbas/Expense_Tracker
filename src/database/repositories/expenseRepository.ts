import { getDatabase } from '../database';
import {
  Expense,
  ExpenseFilters,
  SortOption,
  PaymentMethod,
  CategorySpending,
} from '../../shared/types/models';

interface ExpenseRow {
  id: string;
  amount: number;
  payment_method: 'CASH' | 'UPI';
  category_id: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

interface CategoryBreakdownRow {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total_paise: number;
  transaction_count: number;
}

function mapRowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: row.amount,
    paymentMethod: row.payment_method,
    categoryId: row.category_id,
    description: row.description || undefined,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ExpenseRepository {
  async getExpenses(filters?: ExpenseFilters, sortBy: SortOption = 'DATE_DESC'): Promise<Expense[]> {
    const db = await getDatabase();
    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    if (filters?.startDate) {
      whereClauses.push('date >= ?');
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      whereClauses.push('date <= ?');
      params.push(filters.endDate);
    }
    if (filters?.paymentMethod) {
      whereClauses.push('payment_method = ?');
      params.push(filters.paymentMethod);
    }
    if (filters?.categoryId) {
      whereClauses.push('category_id = ?');
      params.push(filters.categoryId);
    }
    if (filters?.minAmount !== undefined) {
      whereClauses.push('amount >= ?');
      params.push(filters.minAmount);
    }
    if (filters?.maxAmount !== undefined) {
      whereClauses.push('amount <= ?');
      params.push(filters.maxAmount);
    }
    if (filters?.search && filters.search.trim()) {
      whereClauses.push('(description LIKE ? OR category_id IN (SELECT id FROM categories WHERE name LIKE ?))');
      const searchParam = `%${filters.search.trim()}%`;
      params.push(searchParam, searchParam);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderSql = 'ORDER BY date DESC, created_at DESC';
    switch (sortBy) {
      case 'DATE_ASC':
        orderSql = 'ORDER BY date ASC, created_at ASC';
        break;
      case 'AMOUNT_DESC':
        orderSql = 'ORDER BY amount DESC';
        break;
      case 'AMOUNT_ASC':
        orderSql = 'ORDER BY amount ASC';
        break;
      case 'DATE_DESC':
      default:
        orderSql = 'ORDER BY date DESC, created_at DESC';
        break;
    }

    const query = `SELECT * FROM expenses ${whereSql} ${orderSql};`;
    const rows = await db.getAllAsync<ExpenseRow>(query, params);
    return rows.map(mapRowToExpense);
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ExpenseRow>(
      'SELECT * FROM expenses WHERE id = ?;',
      [id]
    );
    return row ? mapRowToExpense(row) : null;
  }

  async createExpense(expense: Omit<Expense, 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO expenses (id, amount, payment_method, category_id, description, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ? ,?);`,
      [
        expense.id,
        expense.amount,
        expense.paymentMethod,
        expense.categoryId,
        expense.description || null,
        expense.date,
        now,
        now,
      ]
    );

    return {
      ...expense,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateExpense(expense: Partial<Expense> & { id: string }): Promise<Expense> {
    const db = await getDatabase();
    const existing = await this.getExpenseById(expense.id);
    if (!existing) {
      throw new Error(`Expense with ID ${expense.id} not found`);
    }

    const updated: Expense = {
      ...existing,
      ...expense,
      updatedAt: new Date().toISOString(),
    };

    await db.runAsync(
      `UPDATE expenses
       SET amount = ?, payment_method = ?, category_id = ?, description = ?, date = ?, updated_at = ?
       WHERE id = ?;`,
      [
        updated.amount,
        updated.paymentMethod,
        updated.categoryId,
        updated.description || null,
        updated.date,
        updated.updatedAt,
        updated.id,
      ]
    );

    return updated;
  }

  async deleteExpense(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
  }

  async getSummary(startDate: string, endDate: string): Promise<{
    totalPaise: number;
    cashPaise: number;
    upiPaise: number;
    count: number;
  }> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      total: number | null;
      cash: number | null;
      upi: number | null;
      count: number;
    }>(
      `SELECT
         COALESCE(SUM(amount), 0) as total,
         COALESCE(SUM(CASE WHEN payment_method = 'CASH' THEN amount ELSE 0 END), 0) as cash,
         COALESCE(SUM(CASE WHEN payment_method = 'UPI' THEN amount ELSE 0 END), 0) as upi,
         COUNT(*) as count
       FROM expenses
       WHERE date >= ? AND date <= ?;`,
      [startDate, endDate]
    );

    return {
      totalPaise: row?.total || 0,
      cashPaise: row?.cash || 0,
      upiPaise: row?.upi || 0,
      count: row?.count || 0,
    };
  }

  async getCategoryBreakdown(startDate: string, endDate: string): Promise<CategorySpending[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<CategoryBreakdownRow>(
      `SELECT
         c.id as category_id,
         c.name as category_name,
         c.color as category_color,
         c.icon as category_icon,
         COALESCE(SUM(e.amount), 0) as total_paise,
         COUNT(e.id) as transaction_count
       FROM categories c
       JOIN expenses e ON c.id = e.category_id
       WHERE e.date >= ? AND e.date <= ?
       GROUP BY c.id, c.name, c.color, c.icon
       ORDER BY total_paise DESC;`,
      [startDate, endDate]
    );

    const grandTotal = rows.reduce((acc, r) => acc + (r.total_paise || 0), 0);

    return rows.map((r) => ({
      categoryId: r.category_id,
      categoryName: r.category_name,
      categoryColor: r.category_color,
      categoryIcon: r.category_icon,
      totalPaise: r.total_paise,
      transactionCount: r.transaction_count,
      percentage: grandTotal > 0 ? Math.round((r.total_paise / grandTotal) * 1000) / 10 : 0,
    }));
  }
}

export const expenseRepository = new ExpenseRepository();
