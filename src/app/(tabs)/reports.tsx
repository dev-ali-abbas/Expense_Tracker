import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Zap,
  Lightbulb,
  QrCode,
  Wallet,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useExpenseStore } from '@/features/expenses/store/expenseStore';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import {
  ComparisonMode,
  getComparisonDates,
  calculateReportsSummary,
} from '@/shared/utils/reportsAnalytics';
import { formatINR } from '@/shared/utils/currency';
import { CategoryBreakdown } from '@/features/dashboard/components/CategoryBreakdown';

export default function ReportsScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();

  const expenses = useExpenseStore((s) => s.expenses);
  const loadExpenses = useExpenseStore((s) => s.loadExpenses);
  const isLoading = useExpenseStore((s) => s.isLoading);
  const categories = useCategoryStore((s) => s.categories);

  const [mode, setMode] = useState<ComparisonMode>('MONTH');
  const [periodOffset, setPeriodOffset] = useState<number>(0);

  useEffect(() => {
    loadExpenses();
  }, []);

  // Compute reference date adjusted by periodOffset
  const referenceDate = useMemo(() => {
    const d = new Date();
    if (mode === 'WEEK') {
      d.setDate(d.getDate() + periodOffset * 7);
    } else if (mode === 'MONTH') {
      d.setMonth(d.getMonth() + periodOffset);
    } else if (mode === 'YEAR') {
      d.setFullYear(d.getFullYear() + periodOffset);
    }
    return d;
  }, [mode, periodOffset]);

  const periodDates = useMemo(() => {
    return getComparisonDates(mode, referenceDate);
  }, [mode, referenceDate]);

  const summary = useMemo(() => {
    return calculateReportsSummary(expenses, periodDates, categories);
  }, [expenses, periodDates, categories]);

  const modes: { label: string; value: ComparisonMode }[] = [
    { label: 'Weekly', value: 'WEEK' },
    { label: 'Monthly', value: 'MONTH' },
    { label: 'Yearly', value: 'YEAR' },
  ];

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
            Reports & Insights
          </Text>
        </View>

        {/* 1. Comparison Mode Segmented Toggle (PRD Section 24) */}
        <View
          style={[
            styles.modeSegmentContainer,
            {
              backgroundColor: colors.surfaceSubtle,
              borderRadius: borderRadius.md,
              marginTop: spacing.md,
              padding: 4,
            },
          ]}
        >
          {modes.map((m) => {
            const isSelected = mode === m.value;
            return (
              <TouchableOpacity
                key={m.value}
                activeOpacity={0.8}
                onPress={() => {
                  setMode(m.value);
                  setPeriodOffset(0);
                }}
                style={[
                  styles.modeTab,
                  {
                    backgroundColor: isSelected ? colors.card : 'transparent',
                    borderRadius: borderRadius.sm,
                    borderColor: isSelected ? colors.cardBorder : 'transparent',
                    borderWidth: isSelected ? 1 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isSelected ? colors.textPrimary : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Period Navigation Bar */}
        <View
          style={[
            styles.navRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.sm,
              paddingVertical: 8,
              marginTop: spacing.md,
            },
          ]}
        >
          <TouchableOpacity
            accessibilityLabel="Previous period"
            onPress={() => setPeriodOffset((prev) => prev - 1)}
            style={[styles.arrowButton, { backgroundColor: colors.surfaceSubtle }]}
          >
            <ChevronLeft size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
            {periodDates.label}
          </Text>

          <TouchableOpacity
            accessibilityLabel="Next period"
            onPress={() => setPeriodOffset((prev) => prev + 1)}
            style={[styles.arrowButton, { backgroundColor: colors.surfaceSubtle }]}
          >
            <ChevronRight size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {summary.totalPaise > 0 ? (
          <>
            {/* 3. Executive Total Spent & Comparison Card (PRD Section 23 & 24) */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  borderRadius: borderRadius.lg,
                  padding: spacing.xl,
                  marginTop: spacing.lg,
                },
              ]}
            >
              <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                Total Spent
              </Text>
              <Text style={[typography.displayLarge, { color: colors.textPrimary, marginVertical: spacing.xs }]}>
                {formatINR(summary.totalPaise)}
              </Text>

              {/* Comparison Indicator */}
              <View style={styles.comparisonRow}>
                {summary.comparison.percentageChange !== null ? (
                  <View
                    style={[
                      styles.comparisonBadge,
                      {
                        backgroundColor: summary.comparison.isIncrease
                          ? `${colors.danger}15`
                          : `${colors.success}15`,
                        borderRadius: borderRadius.sm,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        marginRight: 6,
                      },
                    ]}
                  >
                    {summary.comparison.isIncrease ? (
                      <TrendingUp size={12} color={colors.danger} />
                    ) : (
                      <TrendingDown size={12} color={colors.success} />
                    )}
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: summary.comparison.isIncrease ? colors.danger : colors.success,
                          fontWeight: '700',
                          marginLeft: 4,
                        },
                      ]}
                    >
                      {summary.comparison.isIncrease ? '+' : ''}
                      {summary.comparison.percentageChange}%
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
                  {summary.comparison.percentageChange !== null
                    ? `vs previous ${mode.toLowerCase()}`
                    : 'No previous period spending'}
                </Text>
              </View>
            </View>

            {/* 4. Key Metrics Grid: Avg Per Day, Highest Day, Transactions (PRD Section 23) */}
            <View style={[styles.metricsGrid, { marginTop: spacing.md, gap: spacing.sm }]}>
              {/* Daily Average */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={styles.metricIconRow}>
                  <Clock size={16} color={colors.textSecondary} />
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    Avg / day
                  </Text>
                </View>
                <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: spacing.xs, fontWeight: '700' }]}>
                  {formatINR(summary.averageDailySpendPaise)}
                </Text>
              </View>

              {/* Peak Spending Day */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={styles.metricIconRow}>
                  <Zap size={16} color={colors.warning} />
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    Peak Day
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={[typography.titleMedium, { color: colors.textPrimary, marginTop: spacing.xs, fontWeight: '700' }]}
                >
                  {summary.highestSpendingDay
                    ? summary.highestSpendingDay.formattedDate
                    : 'None'}
                </Text>
                {summary.highestSpendingDay && (
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {formatINR(summary.highestSpendingDay.amountPaise)}
                  </Text>
                )}
              </View>

              {/* Transactions Count */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={styles.metricIconRow}>
                  <Calendar size={16} color={colors.primary} />
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    Count
                  </Text>
                </View>
                <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: spacing.xs, fontWeight: '700' }]}>
                  {summary.transactionCount}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  records
                </Text>
              </View>
            </View>

            {/* 5. Payment Method Split Cards (PRD Section 12 & 23) */}
            <View style={[styles.paymentRow, { marginTop: spacing.md, gap: spacing.md }]}>
              <View
                style={[
                  styles.paymentCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={styles.paymentHeader}>
                  <View style={[styles.badge, { backgroundColor: `${colors.upi}1A` }]}>
                    <QrCode size={16} color={colors.upi} />
                  </View>
                  <Text style={[typography.caption, { color: colors.upi, fontWeight: '700' }]}>
                    UPI
                  </Text>
                </View>
                <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: spacing.xs, fontWeight: '700' }]}>
                  {formatINR(summary.upiPaise)}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {summary.totalPaise > 0 ? Math.round((summary.upiPaise / summary.totalPaise) * 100) : 0}% of total
                </Text>
              </View>

              <View
                style={[
                  styles.paymentCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={styles.paymentHeader}>
                  <View style={[styles.badge, { backgroundColor: `${colors.cash}1A` }]}>
                    <Wallet size={16} color={colors.cash} />
                  </View>
                  <Text style={[typography.caption, { color: colors.cash, fontWeight: '700' }]}>
                    Cash
                  </Text>
                </View>
                <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: spacing.xs, fontWeight: '700' }]}>
                  {formatINR(summary.cashPaise)}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {summary.totalPaise > 0 ? Math.round((summary.cashPaise / summary.totalPaise) * 100) : 0}% of total
                </Text>
              </View>
            </View>

            {/* 6. Category Breakdown with Horizontal Bars (PRD Section 13) */}
            <CategoryBreakdown categories={summary.categoryBreakdown} />

            {/* 7. Factual Insights Section (PRD Section 29) */}
            {summary.insights.length > 0 && (
              <View
                style={[
                  styles.insightsCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.lg,
                    padding: spacing.lg,
                    marginTop: spacing.lg,
                  },
                ]}
              >
                <View style={styles.insightsHeader}>
                  <Lightbulb size={20} color={colors.warning} />
                  <Text style={[typography.titleMedium, { color: colors.textPrimary, marginLeft: 8 }]}>
                    Key Insights
                  </Text>
                </View>

                <View style={[styles.insightsList, { marginTop: spacing.md, gap: spacing.sm }]}>
                  {summary.insights.map((insight, idx) => (
                    <View key={idx} style={styles.insightBulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                      <Text
                        style={[
                          typography.bodyMedium,
                          { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 },
                        ]}
                      >
                        {insight}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          /* Empty State for Period */
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.cardBorder,
                borderRadius: borderRadius.lg,
                padding: spacing.xxl,
                marginTop: spacing.xl,
              },
            ]}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, textAlign: 'center' }]}>
              No spending recorded
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
              ]}
            >
              No expenses were recorded for {periodDates.label}.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
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
  },
  modeSegmentContainer: {
    flexDirection: 'row',
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
  },
  paymentCard: {
    flex: 1,
    borderWidth: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    padding: 6,
    borderRadius: 8,
  },
  insightsCard: {
    borderWidth: 1,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightsList: {
    width: '100%',
  },
  insightBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
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
