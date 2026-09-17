import { describe, test, expect } from '@jest/globals';
import {
  toPaise,
  toRupees,
  formatINR,
  formatIndianNumber,
  calculatePercentageChange,
  calculateComparison,
  calculateTotalSpent,
  calculateCashSpent,
  calculateUpiSpent,
} from '../currency';

describe('Financial & Currency Utilities', () => {
  describe('toPaise & toRupees conversion', () => {
    test('converts rupees to paise safely without floating-point inaccuracies', () => {
      expect(toPaise(250)).toBe(25000);
      expect(toPaise(250.5)).toBe(25050);
      expect(toPaise(10.99)).toBe(1099);
      expect(toPaise(0)).toBe(0);
      expect(toPaise(0.01)).toBe(1);
      expect(toPaise(0.004)).toBe(0);
      expect(toPaise(0.006)).toBe(1);
    });

    test('converts paise to rupees accurately', () => {
      expect(toRupees(25000)).toBe(250);
      expect(toRupees(25050)).toBe(250.5);
      expect(toRupees(1099)).toBe(10.99);
      expect(toRupees(0)).toBe(0);
      expect(toRupees(1)).toBe(0.01);
    });
  });

  describe('Indian Number & Currency Formatting', () => {
    test('formats numbers using the Indian numbering system', () => {
      expect(formatIndianNumber(500)).toBe('500');
      expect(formatIndianNumber(1000)).toBe('1,000');
      expect(formatIndianNumber(10000)).toBe('10,000');
      expect(formatIndianNumber(100000)).toBe('1,00,000');
      expect(formatIndianNumber(1000000)).toBe('10,00,000');
      expect(formatIndianNumber(10000000)).toBe('1,00,00,000');
    });

    test('formats INR with rupee symbol', () => {
      expect(formatINR(25000)).toBe('₹250');
      expect(formatINR(25050)).toBe('₹250.50');
      expect(formatINR(10000000)).toBe('₹1,00,000');
      expect(formatINR(0)).toBe('₹0');
      expect(formatINR(25000, { forceDecimals: true })).toBe('₹250.00');
    });
  });

  describe('Percentage change and Period comparison (PRD Section 24 & 56)', () => {
    test('PRD Test Case: current 1,200 vs previous 1,000 -> +20%', () => {
      const current = toPaise(1200);
      const previous = toPaise(1000);
      const result = calculateComparison(current, previous);

      expect(result.differencePaise).toBe(toPaise(200));
      expect(result.percentageChange).toBe(20);
      expect(result.isIncrease).toBe(true);
    });

    test('PRD Critical Rule: previous = 0 -> percentage is null (never Infinity%)', () => {
      const current = toPaise(500);
      const previous = 0;
      const result = calculateComparison(current, previous);

      expect(result.differencePaise).toBe(toPaise(500));
      expect(result.percentageChange).toBeNull();
      expect(result.isIncrease).toBe(true);
    });

    test('handles decreased spending', () => {
      const current = toPaise(800);
      const previous = toPaise(1000);
      const result = calculateComparison(current, previous);

      expect(result.differencePaise).toBe(-toPaise(200));
      expect(result.percentageChange).toBe(-20);
      expect(result.isIncrease).toBe(false);
    });
  });

  describe('Aggregated Calculations (PRD Section 56)', () => {
    test('PRD Test Case: Food ₹100 Cash, Food ₹200 UPI, Travel ₹300 UPI', () => {
      const items = [
        { amount: toPaise(100), paymentMethod: 'CASH' },
        { amount: toPaise(200), paymentMethod: 'UPI' },
        { amount: toPaise(300), paymentMethod: 'UPI' },
      ];

      expect(calculateTotalSpent(items)).toBe(toPaise(600));
      expect(calculateCashSpent(items)).toBe(toPaise(100));
      expect(calculateUpiSpent(items)).toBe(toPaise(500));
    });
  });
});
