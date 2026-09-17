import { create } from 'zustand';
import { budgetRepository } from '../../../database/repositories/budgetRepository';

interface BudgetState {
  monthlyBudgetPaise: number | null;
  isLoading: boolean;
  loadBudget: (year: number, month: number) => Promise<void>;
  saveBudget: (amountPaise: number, year: number, month: number) => Promise<void>;
  clearBudget: (year: number, month: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  monthlyBudgetPaise: null,
  isLoading: false,

  loadBudget: async (year, month) => {
    set({ isLoading: true });
    try {
      const budget = await budgetRepository.getBudget(year, month);
      set({ monthlyBudgetPaise: budget ? budget.amount : null, isLoading: false });
    } catch {
      set({ monthlyBudgetPaise: null, isLoading: false });
    }
  },

  saveBudget: async (amountPaise, year, month) => {
    set({ isLoading: true });
    try {
      await budgetRepository.setBudget(amountPaise, year, month);
      set({ monthlyBudgetPaise: amountPaise, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  clearBudget: async (year, month) => {
    set({ isLoading: true });
    try {
      await budgetRepository.deleteBudget(year, month);
      set({ monthlyBudgetPaise: null, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));
