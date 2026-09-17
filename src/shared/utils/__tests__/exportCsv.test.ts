import { describe, test, expect } from '@jest/globals';
import { generateExpensesCsv } from '../exportCsv';
import { Expense, Category } from '../../types/models';

describe('CSV Export (PRD Section 33)', () => {
  const categories: Category[] = [
    { id: 'cat-food', name: 'Food & Dining', icon: 'Utensils', color: '#F97316', isDefault: true, createdAt: '', updatedAt: '' },
    { id: 'cat-bills', name: 'Bills', icon: 'Receipt', color: '#8B5CF6', isDefault: true, createdAt: '', updatedAt: '' },
  ];

  const expenses: Expense[] = [
    {
      id: '1',
      amount: 25050, // ₹250.50
      paymentMethod: 'UPI',
      categoryId: 'cat-food',
      description: 'Team Lunch, "Special" Pizza',
      date: '2026-09-17',
      createdAt: '2026-09-17T12:30:00.000Z',
      updatedAt: '2026-09-17T12:30:00.000Z',
    },
    {
      id: '2',
      amount: 100000, // ₹1,000.00
      paymentMethod: 'CASH',
      categoryId: 'cat-bills',
      description: 'Electricity',
      date: '2026-09-16',
      createdAt: '2026-09-16T10:00:00.000Z',
      updatedAt: '2026-09-16T10:00:00.000Z',
    },
  ];

  test('generates valid CSV with required PRD columns', () => {
    const csv = generateExpensesCsv(expenses, categories);
    const lines = csv.split('\r\n');

    expect(lines[0]).toBe('Date,Amount,Payment Method,Category,Description,Created At');
    expect(lines).toHaveLength(3); // 1 header + 2 data rows
  });

  test('escapes commas, quotes and category names properly', () => {
    const csv = generateExpensesCsv(expenses, categories);
    const lines = csv.split('\r\n');

    // Row 1: description has comma and quotes -> "Team Lunch, ""Special"" Pizza"
    // Category has comma/& -> "Food & Dining"
    expect(lines[1]).toContain('"Team Lunch, ""Special"" Pizza"');
    expect(lines[1]).toContain('250.50');
    expect(lines[1]).toContain('UPI');
    expect(lines[1]).toContain('Food & Dining');

    // Row 2: straightforward values
    expect(lines[2]).toBe('2026-09-16,1000.00,CASH,Bills,Electricity,2026-09-16T10:00:00.000Z');
  });
});
