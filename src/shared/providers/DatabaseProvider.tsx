import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { initDatabase } from '../../database/database';
import { useCategoryStore } from '../../features/categories/store/categoryStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTheme } from '../theme/ThemeContext';

interface DatabaseContextType {
  isInitialized: boolean;
  initError: string | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  initError: null,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const { colors, typography } = useTheme();

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        await Promise.all([loadCategories(), loadSettings()]);
        setIsInitialized(true);
      } catch (e) {
        console.error('Database initialization error:', e);
        setInitError(e instanceof Error ? e.message : 'Database initialization failed');
        // Still allow app to render with error state
        setIsInitialized(true);
      }
    }

    prepare();
  }, []);

  if (!isInitialized) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, typography.bodyMedium, { color: colors.textSecondary }]}>
          Loading Expense Tracker...
        </Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ isInitialized, initError }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
});
