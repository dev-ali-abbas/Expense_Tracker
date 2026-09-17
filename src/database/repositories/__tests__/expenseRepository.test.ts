import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { ExpenseRepository } from '../expenseRepository';
import * as databaseModule from '../../database';

jest.mock('../../database');

describe('ExpenseRepository', () => {
  let repository: ExpenseRepository;
  let mockDb: any;

  beforeEach(() => {
    repository = new ExpenseRepository();
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
    };
    (databaseModule.getDatabase as any).mockResolvedValue(mockDb);
  });

  test('createExpense persists expense in minor units (paise)', async () => {
    mockDb.runAsync.mockResolvedValue({});

    const created = await repository.createExpense({
      id: 'exp-1',
      amount: 25050, // ₹250.50
      paymentMethod: 'UPI',
      categoryId: 'cat-food',
      description: 'Team Lunch',
      date: '2026-09-17',
    });

    expect(created.amount).toBe(25050);
    expect(created.paymentMethod).toBe('UPI');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO expenses'),
      expect.arrayContaining(['exp-1', 25050, 'UPI', 'cat-food', 'Team Lunch', '2026-09-17'])
    );
  });

  test('getExpenses maps database rows to Expense models', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      {
        id: 'exp-1',
        amount: 50000,
        payment_method: 'CASH',
        category_id: 'cat-groceries',
        description: 'Supermarket',
        date: '2026-09-17',
        created_at: '2026-09-17T12:00:00.000Z',
        updated_at: '2026-09-17T12:00:00.000Z',
      },
    ]);

    const result = await repository.getExpenses();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'exp-1',
      amount: 50000,
      paymentMethod: 'CASH',
      categoryId: 'cat-groceries',
      description: 'Supermarket',
      date: '2026-09-17',
      createdAt: '2026-09-17T12:00:00.000Z',
      updatedAt: '2026-09-17T12:00:00.000Z',
    });
  });

  test('getSummary aggregates total, cash, and upi sums', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      total: 60000,
      cash: 10000,
      upi: 50000,
      count: 3,
    });

    const summary = await repository.getSummary('2026-09-01', '2026-09-30');
    expect(summary.totalPaise).toBe(60000);
    expect(summary.cashPaise).toBe(10000);
    expect(summary.upiPaise).toBe(50000);
    expect(summary.count).toBe(3);
  });

  test('deleteExpense executes DELETE SQL statement', async () => {
    mockDb.runAsync.mockResolvedValue({});

    await repository.deleteExpense('exp-1');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM expenses WHERE id = ?;',
      ['exp-1']
    );
  });
});
