import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CategorySpending } from '@/shared/types/models';
import { useTheme } from '@/shared/theme/ThemeContext';
import { CategoryIcon } from '@/shared/components/CategoryIcon';
import { formatINR } from '@/shared/utils/currency';

interface CategoryBreakdownProps {
  categories: CategorySpending[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();

  if (categories.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginTop: spacing.lg,
        },
      ]}
    >
      <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
        Where did your money go?
      </Text>

      <View style={{ gap: spacing.md }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.categoryId}
            activeOpacity={0.7}
            onPress={() => router.push('/transactions')}
            style={styles.categoryItem}
          >
            {/* Top row: Icon, Name, and Amount */}
            <View style={styles.topRow}>
              <View style={styles.leftCol}>
                <CategoryIcon
                  icon={cat.categoryIcon}
                  color={cat.categoryColor}
                  size={16}
                  containerSize={32}
                />
                <Text
                  numberOfLines={1}
                  style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600', marginLeft: spacing.sm }]}
                >
                  {cat.categoryName}
                </Text>
              </View>

              <View style={styles.rightCol}>
                <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {formatINR(cat.totalPaise)}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 6 }]}>
                  ({cat.percentage}%)
                </Text>
              </View>
            </View>

            {/* Horizontal progress bar */}
            <View
              style={[
                styles.progressBarBg,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: borderRadius.full,
                  marginTop: 6,
                },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: cat.categoryColor,
                    width: `${Math.min(Math.max(cat.percentage, 2), 100)}%`,
                    borderRadius: borderRadius.full,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  categoryItem: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
});
