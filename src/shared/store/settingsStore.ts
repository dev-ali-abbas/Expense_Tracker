import { create } from 'zustand';
import { settingsRepository } from '../../database/repositories/settingsRepository';
import { PaymentMethod } from '../types/models';
import { ThemeMode } from '../theme/ThemeContext';

interface SettingsState {
  themeMode: ThemeMode;
  defaultPaymentMethod: PaymentMethod;
  currency: string;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setDefaultPaymentMethod: (method: PaymentMethod) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'system',
  defaultPaymentMethod: 'UPI',
  currency: 'INR',
  isLoaded: false,

  loadSettings: async () => {
    try {
      const allSettings = await settingsRepository.getAll();
      set({
        themeMode: (allSettings.theme as ThemeMode) || 'system',
        defaultPaymentMethod: (allSettings.default_payment_method as PaymentMethod) || 'UPI',
        currency: allSettings.currency || 'INR',
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      await settingsRepository.set('theme', mode);
    } catch (err) {
      console.error('Failed to save theme setting', err);
    }
  },

  setDefaultPaymentMethod: async (method: PaymentMethod) => {
    set({ defaultPaymentMethod: method });
    try {
      await settingsRepository.set('default_payment_method', method);
    } catch (err) {
      console.error('Failed to save default payment method setting', err);
    }
  },
}));
