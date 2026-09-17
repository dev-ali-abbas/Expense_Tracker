import { PeriodComparison } from '../types/models';

/**
 * Converts INR Rupees (e.g. 250.50) to integer Paise (25050).
 * Uses Math.round to avoid IEEE-754 floating point arithmetic issues.
 */
export function toPaise(rupees: number): number {
  if (isNaN(rupees) || !isFinite(rupees)) return 0;
  return Math.round(rupees * 100);
}

/**
 * Converts integer Paise (e.g. 25050) to INR Rupees (250.50).
 */
export function toRupees(paise: number): number {
  if (isNaN(paise) || !isFinite(paise)) return 0;
  return paise / 100;
}

/**
 * Formats a number according to the Indian numbering system (Lakhs, Crores).
 * Example:
 *  1000 -> 1,000
 *  10000 -> 10,000
 *  100000 -> 1,00,000
 *  10000000 -> 1,00,00,000
 */
export function formatIndianNumber(num: number): string {
  const isNegative = num < 0;
  const absNum = Math.abs(Math.floor(num));
  const numStr = absNum.toString();

  if (numStr.length <= 3) {
    return (isNegative ? '-' : '') + numStr;
  }

  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return (isNegative ? '-' : '') + formattedOther + ',' + lastThree;
}

/**
 * Formats integer paise into a standard Indian Rupee string with the ₹ symbol.
 * Example:
 *  25000 paise -> "₹250"
 *  25050 paise -> "₹250.50"
 *  10000000 paise (₹1,00,000) -> "₹1,00,000"
 */
export function formatINR(paise: number, options: { forceDecimals?: boolean } = {}): string {
  if (isNaN(paise) || !isFinite(paise)) return '₹0';

  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const wholeRupees = Math.floor(absPaise / 100);
  const remainderPaise = absPaise % 100;

  const formattedRupees = formatIndianNumber(wholeRupees);

  if (options.forceDecimals || remainderPaise > 0) {
    const paddedPaise = remainderPaise.toString().padStart(2, '0');
    return `${isNegative ? '-' : ''}₹${formattedRupees}.${paddedPaise}`;
  }

  return `${isNegative ? '-' : ''}₹${formattedRupees}`;
}

/**
 * Calculates percentage change between two amounts.
 * Per PRD Section 24 & 56:
 * If previous === 0, returns null (do not show Infinity% or misleading values).
 */
export function calculatePercentageChange(currentPaise: number, previousPaise: number): number | null {
  if (previousPaise === 0) {
    return null;
  }
  const diff = currentPaise - previousPaise;
  const percentage = (diff / previousPaise) * 100;
  return Math.round(percentage * 100) / 100;
}

/**
 * Generates a full comparison object between current and previous period spending.
 */
export function calculateComparison(currentPaise: number, previousPaise: number): PeriodComparison {
  const differencePaise = currentPaise - previousPaise;
  const percentageChange = calculatePercentageChange(currentPaise, previousPaise);

  return {
    currentTotalPaise: currentPaise,
    previousTotalPaise: previousPaise,
    differencePaise,
    percentageChange,
    isIncrease: differencePaise > 0,
  };
}

/**
 * Sums amounts from transactions.
 */
export function calculateTotalSpent(items: { amount: number }[]): number {
  return items.reduce((acc, item) => acc + (item.amount || 0), 0);
}

/**
 * Sums cash transactions.
 */
export function calculateCashSpent(items: { amount: number; paymentMethod: string }[]): number {
  return items
    .filter((item) => item.paymentMethod === 'CASH')
    .reduce((acc, item) => acc + (item.amount || 0), 0);
}

/**
 * Sums UPI transactions.
 */
export function calculateUpiSpent(items: { amount: number; paymentMethod: string }[]): number {
  return items
    .filter((item) => item.paymentMethod === 'UPI')
    .reduce((acc, item) => acc + (item.amount || 0), 0);
}
