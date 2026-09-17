import { Expense, Category, CategorySpending } from '../types/models';

export interface DailyTotal {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1 - 31
  totalPaise: number;
}

/**
 * Calculates daily totals for all days in a month.
 */
export function calculateDailyTotals(
  expenses: Expense[],
  year: number,
  month: number // 1-12
): DailyTotal[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyMap: { [day: number]: number } = {};

  for (let i = 1; i <= daysInMonth; i++) {
    dailyMap[i] = 0;
  }

  const monthPrefix = `${year}-${month.toString().padStart(2, '0')}`;

  for (const exp of expenses) {
    if (exp.date.startsWith(monthPrefix)) {
      const day = parseInt(exp.date.split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        dailyMap[day] = (dailyMap[day] || 0) + exp.amount;
      }
    }
  }

  return Object.keys(dailyMap).map((dStr) => {
    const day = parseInt(dStr, 10);
    return {
      date: `${monthPrefix}-${day.toString().padStart(2, '0')}`,
      dayNumber: day,
      totalPaise: dailyMap[day],
    };
  });
}

/**
 * Calculates category breakdown with percentages for a set of expenses.
 */
export function calculateCategoryTotals(
  expenses: Expense[],
  categories: Category[]
): CategorySpending[] {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryMap: {
    [catId: string]: { totalPaise: number; count: number };
  } = {};

  for (const exp of expenses) {
    if (!categoryMap[exp.categoryId]) {
      categoryMap[exp.categoryId] = { totalPaise: 0, count: 0 };
    }
    categoryMap[exp.categoryId].totalPaise += exp.amount;
    categoryMap[exp.categoryId].count += 1;
  }

  const result: CategorySpending[] = [];

  for (const cat of categories) {
    const data = categoryMap[cat.id];
    if (data && data.totalPaise > 0) {
      result.push({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        categoryIcon: cat.icon,
        totalPaise: data.totalPaise,
        transactionCount: data.count,
        percentage:
          total > 0 ? Math.round((data.totalPaise / total) * 1000) / 10 : 0,
      });
    }
  }

  // Sort highest spending category first
  result.sort((a, b) => b.totalPaise - a.totalPaise);

  return result;
}

/**
 * Calculates average daily spend for a month or active days.
 */
export function calculateAverageDailySpend(
  totalPaise: number,
  daysCount: number
): number {
  if (daysCount <= 0 || totalPaise <= 0) return 0;
  return Math.round(totalPaise / daysCount);
}

/**
 * Finds the highest spending day in a set of daily totals.
 */
export function calculateHighestSpendingDay(
  dailyTotals: DailyTotal[]
): DailyTotal | null {
  let highest: DailyTotal | null = null;
  for (const day of dailyTotals) {
    if (day.totalPaise > 0) {
      if (!highest || day.totalPaise > highest.totalPaise) {
        highest = day;
      }
    }
  }
  return highest;
}
