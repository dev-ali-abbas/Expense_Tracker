import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';

interface PeriodSelectorProps {
  selectedYear: number;
  selectedMonth: number; // 1 - 12
  onChangePeriod: (year: number, month: number) => void;
}

export function PeriodSelector({
  selectedYear,
  selectedMonth,
  onChangePeriod,
}: PeriodSelectorProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
  });

  const handlePrev = () => {
    if (selectedMonth === 1) {
      onChangePeriod(selectedYear - 1, 12);
    } else {
      onChangePeriod(selectedYear, selectedMonth - 1);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 12) {
      onChangePeriod(selectedYear + 1, 1);
    } else {
      onChangePeriod(selectedYear, selectedMonth + 1);
    }
  };

  const handleReset = () => {
    onChangePeriod(currentYear, currentMonth);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: borderRadius.md,
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
        },
      ]}
    >
      <TouchableOpacity
        accessibilityLabel="Previous month"
        onPress={handlePrev}
        style={[styles.arrowButton, { backgroundColor: colors.surfaceSubtle }]}
      >
        <ChevronLeft size={18} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.centerSection}>
        <Text style={[typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
          {monthName} {selectedYear}
        </Text>
      </View>

      <View style={styles.rightActions}>
        {!isCurrentMonth && (
          <TouchableOpacity
            accessibilityLabel="Reset to current month"
            onPress={handleReset}
            style={[styles.arrowButton, { backgroundColor: colors.surfaceSubtle, marginRight: 4 }]}
          >
            <RotateCcw size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          accessibilityLabel="Next month"
          onPress={handleNext}
          style={[styles.arrowButton, { backgroundColor: colors.surfaceSubtle }]}
        >
          <ChevronRight size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginBottom: 16,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
