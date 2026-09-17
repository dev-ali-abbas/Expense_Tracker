export type PaymentMethod = 'CASH' | 'UPI';

export interface Expense {
  id: string;
  amount: number; // Stored in integer paise (minor units: ₹1.00 = 100 paise)
  paymentMethod: PaymentMethod;
  categoryId: string;
  description?: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Hex color code
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  amount: number; // Stored in integer paise
  month: number; // 1 - 12
  year: number; // e.g. 2026
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

export type SortOption =
  | 'DATE_DESC'
  | 'DATE_ASC'
  | 'AMOUNT_DESC'
  | 'AMOUNT_ASC';

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  categoryId?: string;
  minAmount?: number; // In paise
  maxAmount?: number; // In paise
  search?: string;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalPaise: number;
  percentage: number;
  transactionCount: number;
}

export interface PeriodComparison {
  currentTotalPaise: number;
  previousTotalPaise: number;
  differencePaise: number;
  percentageChange: number | null; // null if previous === 0 to avoid Infinity%
  isIncrease: boolean;
}
