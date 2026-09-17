import { Platform } from 'react-native';
import { Expense, Category } from '../types/models';
import { toRupees } from './currency';

/**
 * Escapes a cell for RFC-4180 compliant CSV.
 */
function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = val.toString();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates valid CSV string from expenses per PRD Section 33.
 * Columns: Date, Amount, Payment Method, Category, Description, Created At
 */
export function generateExpensesCsv(
  expenses: Expense[],
  categories: Category[]
): string {
  const headers = ['Date', 'Amount', 'Payment Method', 'Category', 'Description', 'Created At'];
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const rows = expenses.map((e) => {
    const categoryName = categoryMap.get(e.categoryId) || 'Uncategorized';
    const amountRupees = toRupees(e.amount).toFixed(2);

    return [
      escapeCsvCell(e.date),
      escapeCsvCell(amountRupees),
      escapeCsvCell(e.paymentMethod),
      escapeCsvCell(categoryName),
      escapeCsvCell(e.description || ''),
      escapeCsvCell(e.createdAt),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers download or file sharing of the CSV.
 */
export function downloadCsv(filename: string, csvContent: string): void {
  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // For native environments, log or alert
    console.log(`[CSV Export] Generated ${filename} (${csvContent.length} bytes)`);
  }
}
