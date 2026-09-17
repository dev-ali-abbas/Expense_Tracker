import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Expense } from '@/shared/types/models';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { CategoryIcon } from '@/shared/components/CategoryIcon';
import { formatINR } from '@/shared/utils/currency';

interface ExpenseItemProps {
  expense: Expense;
  onPress: (expense: Expense) => void;
}

export function ExpenseItem({ expense, onPress }: ExpenseItemProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const category = useCategoryStore((s) => s.getCategoryById(expense.categoryId));

  const categoryName = category?.name || 'Unknown';
  const categoryIcon = category?.icon || 'MoreHorizontal';
  const categoryColor = category?.color || '#64748B';

  const isUPI = expense.paymentMethod === 'UPI';
  const paymentColor = isUPI ? colors.upi : colors.cash;

  // Format created time (e.g. 1:25 PM)
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${categoryName} expense of ${formatINR(expense.amount)}`}
      onPress={() => onPress(expense)}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: borderRadius.md,
          padding: spacing.md,
        },
      ]}
    >
      <CategoryIcon
        icon={categoryIcon}
        color={categoryColor}
        size={20}
        containerSize={42}
      />

      <View style={[styles.content, { marginLeft: spacing.md }]}>
        <View style={styles.topRow}>
          <Text
            numberOfLines={1}
            style={[typography.titleMedium, { color: colors.textPrimary, flex: 1 }]}
          >
            {categoryName}
          </Text>
          <Text style={[typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
            {formatINR(expense.amount)}
          </Text>
        </View>

        <View style={[styles.bottomRow, { marginTop: 4 }]}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.paymentBadge,
                {
                  backgroundColor: `${paymentColor}15`,
                  borderColor: `${paymentColor}30`,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  { color: paymentColor, fontWeight: '700', fontSize: 10 },
                ]}
              >
                {expense.paymentMethod}
              </Text>
            </View>

            {expense.description ? (
              <Text
                numberOfLines={1}
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginLeft: spacing.xs, flex: 1 },
                ]}
              >
                {expense.description}
              </Text>
            ) : null}
          </View>

          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {formatTime(expense.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  paymentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
});
