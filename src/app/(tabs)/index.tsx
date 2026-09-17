import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { useExpenseStore } from '@/features/expenses/store/expenseStore';
import {
  formatINR,
  calculateTotalSpent,
  calculateCashSpent,
  calculateUpiSpent,
  calculateComparison,
} from '@/shared/utils/currency';
import {
  calculateDailyTotals,
  calculateCategoryTotals,
} from '@/shared/utils/analytics';
import { ExpenseItem } from '@/features/expenses/components/ExpenseItem';
import { PeriodSelector } from '@/features/dashboard/components/PeriodSelector';
import { PaymentMethodSplit } from '@/features/dashboard/components/PaymentMethodSplit';
import { CategoryBreakdown } from '@/features/dashboard/components/CategoryBreakdown';
import { SpendingTrendChart } from '@/features/dashboard/components/SpendingTrendChart';
import { BudgetCard } from '@/features/budget/components/BudgetCard';
import { useBudgetStore } from '@/features/budget/store/budgetStore';

export default function HomeScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();

  const categories = useCategoryStore((s) => s.categories);
  const expenses = useExpenseStore((s) => s.expenses);
  const loadExpenses = useExpenseStore((s) => s.loadExpenses);
  const isLoading = useExpenseStore((s) => s.isLoading);
  const loadBudget = useBudgetStore((s) => s.loadBudget);

  // Period state (default current year and month)
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    loadExpenses();
    loadBudget(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Target month prefix: YYYY-MM
  const monthPrefix = useMemo(() => {
    return `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  // Previous month prefix for period comparison (PRD Section 24)
  const prevMonthPrefix = useMemo(() => {
    const prevDate = new Date(selectedYear, selectedMonth - 2, 1);
    const prevY = prevDate.getFullYear();
    const prevM = (prevDate.getMonth() + 1).toString().padStart(2, '0');
    return `${prevY}-${prevM}`;
  }, [selectedYear, selectedMonth]);

  // Current selected month expenses
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(monthPrefix));
  }, [expenses, monthPrefix]);

  // Previous month expenses
  const prevMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(prevMonthPrefix));
  }, [expenses, prevMonthPrefix]);

  // Totals & Comparisons
  const totalSpentPaise = useMemo(() => calculateTotalSpent(monthExpenses), [monthExpenses]);
  const prevTotalSpentPaise = useMemo(() => calculateTotalSpent(prevMonthExpenses), [prevMonthExpenses]);
  const cashSpentPaise = useMemo(() => calculateCashSpent(monthExpenses), [monthExpenses]);
  const upiSpentPaise = useMemo(() => calculateUpiSpent(monthExpenses), [monthExpenses]);

  const comparison = useMemo(() => {
    return calculateComparison(totalSpentPaise, prevTotalSpentPaise);
  }, [totalSpentPaise, prevTotalSpentPaise]);

  // Visual Analytics data
  const categoryTotals = useMemo(() => {
    return calculateCategoryTotals(monthExpenses, categories);
  }, [monthExpenses, categories]);

  const dailyTotals = useMemo(() => {
    return calculateDailyTotals(monthExpenses, selectedYear, selectedMonth);
  }, [monthExpenses, selectedYear, selectedMonth]);

  // Recent 5 transactions across all expenses
  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.container, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadExpenses()}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Greeting & Quick Add button */}
        <View style={styles.header}>
          <View>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
              Expense Tracker
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Add Expense"
            onPress={() => router.push('/add-expense')}
            style={[
              styles.quickAddHeaderBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Plus size={16} color={colors.primaryText} strokeWidth={2.5} />
            <Text style={[typography.caption, { color: colors.primaryText, fontWeight: '700', marginLeft: 4 }]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. Period Selector (PRD Section 11 & 30) */}
        <PeriodSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onChangePeriod={(y, m) => {
            setSelectedYear(y);
            setSelectedMonth(m);
          }}
        />

        {/* 2. Total Spending Overview Card (PRD Section 11 & 24) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.lg,
              padding: spacing.xl,
            },
          ]}
        >
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
            ]}
          >
            Total Spent
          </Text>
          <Text
            style={[
              typography.displayLarge,
              { color: colors.textPrimary, marginVertical: spacing.xs },
            ]}
          >
            {formatINR(totalSpentPaise)}
          </Text>

          {/* Accurate Period Comparison (PRD Section 24 & 56) */}
          <View style={styles.comparisonRow}>
            {comparison.percentageChange !== null ? (
              <View
                style={[
                  styles.comparisonBadge,
                  {
                    backgroundColor: comparison.isIncrease ? `${colors.danger}15` : `${colors.success}15`,
                    borderRadius: borderRadius.sm,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    marginRight: 6,
                  },
                ]}
              >
                {comparison.isIncrease ? (
                  <TrendingUp size={12} color={colors.danger} />
                ) : (
                  <TrendingDown size={12} color={colors.success} />
                )}
                <Text
                  style={[
                    typography.caption,
                    {
                      color: comparison.isIncrease ? colors.danger : colors.success,
                      fontWeight: '700',
                      marginLeft: 4,
                    },
                  ]}
                >
                  {comparison.isIncrease ? '+' : ''}
                  {comparison.percentageChange}%
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.comparisonBadge,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderRadius: borderRadius.sm,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    marginRight: 6,
                  },
                ]}
              >
                <Minus size={12} color={colors.textMuted} />
              </View>
            )}

            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {comparison.percentageChange !== null
                ? 'vs previous month'
                : 'No previous month spending'}
            </Text>
          </View>
        </View>

        {/* Monthly Budget Card (PRD Section 27) */}
        <BudgetCard
          spentPaise={totalSpentPaise}
          year={selectedYear}
          month={selectedMonth}
        />

        {/* 3. Cash vs UPI Split (PRD Section 12 & 30) */}
        <PaymentMethodSplit
          cashPaise={cashSpentPaise}
          upiPaise={upiSpentPaise}
          totalPaise={totalSpentPaise}
        />

        {/* 4. Category Breakdown (PRD Section 13 & 30) */}
        <CategoryBreakdown categories={categoryTotals} />

        {/* 5. Spending Trend Chart (PRD Section 14 & 30) */}
        <SpendingTrendChart dailyTotals={dailyTotals} />

        {/* 6. Recent Transactions Section (PRD Section 15 & 30) */}
        <View style={[styles.section, { marginTop: spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
              Recent Transactions
            </Text>
            {expenses.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/transactions')}
                style={styles.viewAllRow}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                  View All
                </Text>
                <ArrowRight size={14} color={colors.primary} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            )}
          </View>

          {recentExpenses.length > 0 ? (
            <View style={{ marginTop: spacing.md }}>
              {recentExpenses.map((exp) => (
                <ExpenseItem
                  key={exp.id}
                  expense={exp}
                  onPress={(item) => router.push(`/expense/${item.id}`)}
                />
              ))}
            </View>
          ) : (
            /* Empty State for Transactions (PRD Section 43) */
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.cardBorder,
                  borderRadius: borderRadius.lg,
                  padding: spacing.xxl,
                  marginTop: spacing.md,
                },
              ]}
            >
              <Text style={[typography.titleMedium, { color: colors.textPrimary, textAlign: 'center' }]}>
                No expenses yet
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
                ]}
              >
                Start tracking your spending by adding your first expense.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Add Expense"
                style={[
                  styles.addButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.full,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.xl,
                    marginTop: spacing.lg,
                  },
                ]}
                onPress={() => router.push('/add-expense')}
              >
                <Plus size={18} color={colors.primaryText} strokeWidth={2.5} />
                <Text style={[typography.button, { color: colors.primaryText, marginLeft: 8 }]}>
                  Add Expense
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickAddHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
