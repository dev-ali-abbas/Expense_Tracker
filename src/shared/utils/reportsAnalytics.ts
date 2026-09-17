import { Expense, Category, CategorySpending, PeriodComparison } from '../types/models';
import {
  calculateTotalSpent,
  calculateCashSpent,
  calculateUpiSpent,
  calculateComparison,
  formatINR,
} from './currency';
import { calculateCategoryTotals } from './analytics';

export type ComparisonMode = 'WEEK' | 'MONTH' | 'YEAR';

export interface PeriodDates {
  currentStart: string; // YYYY-MM-DD
  currentEnd: string; // YYYY-MM-DD
  previousStart: string; // YYYY-MM-DD
  previousEnd: string; // YYYY-MM-DD
  label: string; // e.g. "September 2026", "Week 38, 2026", "Year 2026"
  daysInPeriod: number;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Computes boundary dates for current and previous period.
 */
export function getComparisonDates(
  mode: ComparisonMode,
  referenceDate = new Date()
): PeriodDates {
  const ref = new Date(referenceDate);

  switch (mode) {
    case 'WEEK': {
      // Monday of current week
      const d = new Date(ref);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const currentStart = new Date(d.setDate(diff));
      const currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + 6);

      // Previous week Monday - Sunday
      const previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      const previousEnd = new Date(currentEnd);
      previousEnd.setDate(previousEnd.getDate() - 7);

      return {
        currentStart: formatDate(currentStart),
        currentEnd: formatDate(currentEnd),
        previousStart: formatDate(previousStart),
        previousEnd: formatDate(previousEnd),
        label: `This Week (${formatDate(currentStart).substring(5)} to ${formatDate(currentEnd).substring(5)})`,
        daysInPeriod: 7,
      };
    }

    case 'MONTH': {
      const y = ref.getFullYear();
      const m = ref.getMonth(); // 0-indexed
      const currentStart = new Date(y, m, 1);
      const currentEnd = new Date(y, m + 1, 0);
      const daysInMonth = currentEnd.getDate();

      const previousStart = new Date(y, m - 1, 1);
      const previousEnd = new Date(y, m, 0);

      const monthName = currentStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      return {
        currentStart: formatDate(currentStart),
        currentEnd: formatDate(currentEnd),
        previousStart: formatDate(previousStart),
        previousEnd: formatDate(previousEnd),
        label: monthName,
        daysInPeriod: daysInMonth,
      };
    }

    case 'YEAR': {
      const y = ref.getFullYear();
      const currentStart = new Date(y, 0, 1);
      const currentEnd = new Date(y, 11, 31);

      const previousStart = new Date(y - 1, 0, 1);
      const previousEnd = new Date(y - 1, 11, 31);

      return {
        currentStart: formatDate(currentStart),
        currentEnd: formatDate(currentEnd),
        previousStart: formatDate(previousStart),
        previousEnd: formatDate(previousEnd),
        label: `Year ${y}`,
        daysInPeriod: 365,
      };
    }
  }
}

export interface ReportsSummary {
  totalPaise: number;
  cashPaise: number;
  upiPaise: number;
  transactionCount: number;
  averageDailySpendPaise: number;
  highestSpendingDay: { date: string; amountPaise: number; formattedDate: string } | null;
  comparison: PeriodComparison;
  categoryBreakdown: CategorySpending[];
  insights: string[];
}

/**
 * Calculates complete analytical summary and factual insights for a period.
 */
export function calculateReportsSummary(
  expenses: Expense[],
  period: PeriodDates,
  categories: Category[]
): ReportsSummary {
  // Current period expenses
  const currentExpenses = expenses.filter(
    (e) => e.date >= period.currentStart && e.date <= period.currentEnd
  );

  // Previous period expenses
  const previousExpenses = expenses.filter(
    (e) => e.date >= period.previousStart && e.date <= period.previousEnd
  );

  const totalPaise = calculateTotalSpent(currentExpenses);
  const prevTotalPaise = calculateTotalSpent(previousExpenses);
  const cashPaise = calculateCashSpent(currentExpenses);
  const upiPaise = calculateUpiSpent(currentExpenses);
  const transactionCount = currentExpenses.length;

  const comparison = calculateComparison(totalPaise, prevTotalPaise);
  const categoryBreakdown = calculateCategoryTotals(currentExpenses, categories);

  // Average daily spend
  const averageDailySpendPaise =
    period.daysInPeriod > 0 && totalPaise > 0
      ? Math.round(totalPaise / period.daysInPeriod)
      : 0;

  // Highest spending day
  const dayMap: { [dateStr: string]: number } = {};
  for (const exp of currentExpenses) {
    dayMap[exp.date] = (dayMap[exp.date] || 0) + exp.amount;
  }

  let highestSpendingDay: ReportsSummary['highestSpendingDay'] = null;
  for (const [dateStr, amount] of Object.entries(dayMap)) {
    if (!highestSpendingDay || amount > highestSpendingDay.amountPaise) {
      let formatted = dateStr;
      try {
        const parts = dateStr.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        formatted = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      } catch {
        formatted = dateStr;
      }
      highestSpendingDay = { date: dateStr, amountPaise: amount, formattedDate: formatted };
    }
  }

  // Factual Insights Generation (PRD Section 29)
  const insights: string[] = [];

  if (totalPaise > 0) {
    // 1. Top category insight
    if (categoryBreakdown.length > 0) {
      const topCat = categoryBreakdown[0];
      insights.push(
        `You spent ${formatINR(topCat.totalPaise)} on ${topCat.categoryName}, which accounts for ${topCat.percentage}% of spending.`
      );
    }

    // 2. UPI vs Cash breakdown insight
    if (upiPaise > 0 || cashPaise > 0) {
      const upiPct = Math.round((upiPaise / totalPaise) * 100);
      if (upiPct >= 50) {
        insights.push(`UPI spending accounts for ${upiPct}% of your total spending.`);
      } else {
        const cashPct = 100 - upiPct;
        insights.push(`Cash spending accounts for ${cashPct}% of your total spending.`);
      }
    }

    // 3. Peak spending day insight
    if (highestSpendingDay) {
      insights.push(
        `Your highest spending day was ${highestSpendingDay.formattedDate} (${formatINR(highestSpendingDay.amountPaise)}).`
      );
    }

    // 4. Period comparison insight
    if (comparison.percentageChange !== null && prevTotalPaise > 0) {
      const absDiff = Math.abs(comparison.differencePaise);
      if (comparison.isIncrease) {
        insights.push(
          `You spent ${formatINR(absDiff)} more than the previous period (+${comparison.percentageChange}%).`
        );
      } else {
        insights.push(
          `You saved ${formatINR(absDiff)} compared to the previous period (${comparison.percentageChange}%).`
        );
      }
    }
  }

  return {
    totalPaise,
    cashPaise,
    upiPaise,
    transactionCount,
    averageDailySpendPaise,
    highestSpendingDay,
    comparison,
    categoryBreakdown,
    insights,
  };
}
