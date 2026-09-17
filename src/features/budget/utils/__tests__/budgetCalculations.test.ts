import { describe, test, expect } from '@jest/globals';
import { calculateBudgetStatus } from '../budgetCalculations';

describe('Budget Feature Calculations (PRD Section 27)', () => {
  test('PRD Case 1: Under budget with remaining amount and near budget flag (₹42,850 / ₹50,000)', () => {
    const status = calculateBudgetStatus(4285000, 5000000); // in paise

    expect(status.hasBudget).toBe(true);
    expect(status.remainingPaise).toBe(715000); // ₹7,150
    expect(status.overBudgetPaise).toBe(0);
    expect(status.percentage).toBe(86);
    expect(status.isNearBudget).toBe(true);
    expect(status.isOverBudget).toBe(false);
  });

  test('PRD Case 2: Exceeded budget (₹52,400 / ₹50,000)', () => {
    const status = calculateBudgetStatus(5240000, 5000000); // in paise

    expect(status.hasBudget).toBe(true);
    expect(status.remainingPaise).toBe(0);
    expect(status.overBudgetPaise).toBe(240000); // ₹2,400
    expect(status.percentage).toBe(105);
    expect(status.isOverBudget).toBe(true);
    expect(status.isNearBudget).toBe(false);
  });

  test('handles no configured budget gracefully', () => {
    const status = calculateBudgetStatus(25000, null);

    expect(status.hasBudget).toBe(false);
    expect(status.isOverBudget).toBe(false);
    expect(status.remainingPaise).toBe(0);
  });
});
