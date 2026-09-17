import { describe, test, expect } from '@jest/globals';
import { getComparisonDates, calculateReportsSummary } from '../reportsAnalytics';
import { Expense, Category } from '../../types/models';

describe('Reports & Period Comparisons (PRD Section 23 & 24)', () => {
  const fixedDate = new Date(2026, 8, 17); // Sep 17, 2026

  test('getComparisonDates computes correct week boundaries', () => {
    const dates = getComparisonDates('WEEK', fixedDate);
    expect(dates.currentStart).toBe('2026-09-14'); // Monday
    expect(dates.currentEnd).toBe('2026-09-20'); // Sunday
    expect(dates.previousStart).toBe('2026-09-07');
    expect(dates.previousEnd).toBe('2026-09-13');
  });

  test('getComparisonDates computes correct month boundaries', () => {
    const dates = getComparisonDates('MONTH', fixedDate);
    expect(dates.currentStart).toBe('2026-09-01');
    expect(dates.currentEnd).toBe('2026-09-30');
    expect(dates.previousStart).toBe('2026-08-01');
    expect(dates.previousEnd).toBe('2026-08-31');
    expect(dates.daysInPeriod).toBe(30);
  });

  test('getComparisonDates computes correct year boundaries', () => {
    const dates = getComparisonDates('YEAR', fixedDate);
    expect(dates.currentStart).toBe('2026-01-01');
    expect(dates.currentEnd).toBe('2026-12-31');
    expect(dates.previousStart).toBe('2025-01-01');
    expect(dates.previousEnd).toBe('2025-12-31');
  });

  test('calculateReportsSummary generates accurate PRD metrics and factual insights', () => {
    const categories: Category[] = [
      { id: 'c-food', name: 'Food', icon: 'Utensils', color: '#F97316', isDefault: true, createdAt: '', updatedAt: '' },
      { id: 'c-bills', name: 'Bills', icon: 'Receipt', color: '#8B5CF6', isDefault: true, createdAt: '', updatedAt: '' },
    ];

    const expenses: Expense[] = [
      // September (current)
      { id: '1', amount: 300000, paymentMethod: 'UPI', categoryId: 'c-food', date: '2026-09-12', createdAt: '', updatedAt: '' }, // ₹3,000
      { id: '2', amount: 200000, paymentMethod: 'UPI', categoryId: 'c-food', date: '2026-09-15', createdAt: '', updatedAt: '' }, // ₹2,000
      { id: '3', amount: 100000, paymentMethod: 'CASH', categoryId: 'c-bills', date: '2026-09-15', createdAt: '', updatedAt: '' }, // ₹1,000
      // August (previous)
      { id: '4', amount: 500000, paymentMethod: 'UPI', categoryId: 'c-food', date: '2026-08-10', createdAt: '', updatedAt: '' }, // ₹5,000
    ];

    const dates = getComparisonDates('MONTH', fixedDate);
    const summary = calculateReportsSummary(expenses, dates, categories);

    expect(summary.totalPaise).toBe(600000); // ₹6,000
    expect(summary.cashPaise).toBe(100000); // ₹1,000
    expect(summary.upiPaise).toBe(500000); // ₹5,000
    expect(summary.transactionCount).toBe(3);

    // Peak day: Sep 15 (₹3,000: 2000 + 1000) or Sep 12 (₹3,000)
    expect(summary.highestSpendingDay?.amountPaise).toBe(300000);

    // Comparison: current 6000 vs previous 5000 -> +20%
    expect(summary.comparison.percentageChange).toBe(20);
    expect(summary.comparison.isIncrease).toBe(true);

    // Factual insights
    expect(summary.insights.length).toBeGreaterThan(0);
    expect(summary.insights[0]).toContain('Food');
    expect(summary.insights[1]).toContain('UPI spending accounts for');
  });
});
