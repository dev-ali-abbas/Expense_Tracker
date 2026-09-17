import { create } from 'zustand';
import { Expense, ExpenseFilters, SortOption } from '../../../shared/types/models';
import { expenseRepository } from '../../../database/repositories/expenseRepository';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  loadExpenses: (filters?: ExpenseFilters, sortBy?: SortOption) => Promise<void>;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  updateExpense: (data: Partial<Expense> & { id: string }) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  getExpenseById: (id: string) => Expense | undefined;
}

function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,

  loadExpenses: async (filters, sortBy = 'DATE_DESC') => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await expenseRepository.getExpenses(filters, sortBy);
      set({ expenses, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load expenses',
        isLoading: false,
      });
    }
  },

  addExpense: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await expenseRepository.createExpense({
        ...data,
        id: generateId(),
      });

      set((state) => {
        const updated = [newExpense, ...state.expenses];
        // Keep sorted by date descending then createdAt descending
        updated.sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return b.createdAt.localeCompare(a.createdAt);
        });
        return { expenses: updated, isLoading: false };
      });

      return newExpense;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save expense',
        isLoading: false,
      });
      throw err;
    }
  },

  updateExpense: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await expenseRepository.updateExpense(data);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === updated.id ? updated : e)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update expense',
        isLoading: false,
      });
      throw err;
    }
  },

  deleteExpense: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await expenseRepository.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete expense',
        isLoading: false,
      });
      throw err;
    }
  },

  getExpenseById: (id: string) => {
    return get().expenses.find((e) => e.id === id);
  },
}));
