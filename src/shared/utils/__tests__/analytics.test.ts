import { describe, test, expect } from '@jest/globals';
import {
  calculateDailyTotals,
  calculateCategoryTotals,
  calculateAverageDailySpend,
  calculateHighestSpendingDay,
} from '../analytics';
import { Expense, Category } from '../../types/models';

describe('Analytics Calculations', () => {
  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Food', icon: 'Utensils', color: '#FF0000', isDefault: true, createdAt: '', updatedAt: '' },
    { id: 'cat-2', name: 'Transport', icon: 'Car', color: '#00FF00', isDefault: true, createdAt: '', updatedAt: '' },
    { id: 'cat-3', name: 'Shopping', icon: 'ShoppingBag', color: '#0000FF', isDefault: true, createdAt: '', updatedAt: '' },
  ];

  const mockExpenses: Expense[] = [
    { id: '1', amount: 10000, paymentMethod: 'UPI', categoryId: 'cat-1', date: '2026-09-05', createdAt: '', updatedAt: '' },
    { id: '2', amount: 20000, paymentMethod: 'CASH', categoryId: 'cat-1', date: '2026-09-05', createdAt: '', updatedAt: '' },
    { id: '3', amount: 30000, paymentMethod: 'UPI', categoryId: 'cat-2', date: '2026-09-12', createdAt: '', updatedAt: '' },
    { id: '4', amount: 40000, paymentMethod: 'UPI', categoryId: 'cat-3', date: '2026-09-12', createdAt: '', updatedAt: '' },
    { id: '5', amount: 15000, paymentMethod: 'CASH', categoryId: 'cat-1', date: '2026-08-15', createdAt: '', updatedAt: '' }, // Previous month
  ];

  test('calculateDailyTotals aggregates by day within target month', () => {
    const daily = calculateDailyTotals(mockExpenses, 2026, 9);
    expect(daily).toHaveLength(30); // September has 30 days

    const day5 = daily.find((d) => d.dayNumber === 5);
    expect(day5?.totalPaise).toBe(30000); // 10000 + 20000

    const day12 = daily.find((d) => d.dayNumber === 12);
    expect(day12?.totalPaise).toBe(70000); // 30000 + 40000

    const day1 = daily.find((d) => d.dayNumber === 1);
    expect(day1?.totalPaise).toBe(0);
  });

  test('calculateCategoryTotals computes amounts, percentages, and sorts descending', () => {
    const septExpenses = mockExpenses.filter((e) => e.date.startsWith('2026-09'));
    const breakdown = calculateCategoryTotals(septExpenses, mockCategories);

    expect(breakdown).toHaveLength(3);
    // Total = 10000 + 20000 + 30000 + 40000 = 100000 paise (₹1,000)
    // Shopping = 40000 (40%)
    // Food = 30000 (30%)
    // Transport = 30000 (30%)
    expect(breakdown[0].categoryName).toBe('Shopping');
    expect(breakdown[0].totalPaise).toBe(40000);
    expect(breakdown[0].percentage).toBe(40);

    expect(breakdown[1].totalPaise).toBe(30000);
    expect(breakdown[1].percentage).toBe(30);
  });

  test('calculateHighestSpendingDay correctly identifies peak day', () => {
    const daily = calculateDailyTotals(mockExpenses, 2026, 9);
    const highest = calculateHighestSpendingDay(daily);

    expect(highest).not.toBeNull();
    expect(highest?.dayNumber).toBe(12);
    expect(highest?.totalPaise).toBe(70000);
  });

  test('calculateAverageDailySpend calculates correctly', () => {
    expect(calculateAverageDailySpend(300000, 30)).toBe(10000);
    expect(calculateAverageDailySpend(0, 30)).toBe(0);
  });
});
