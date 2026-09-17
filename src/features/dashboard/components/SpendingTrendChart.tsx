import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DailyTotal } from '@/shared/utils/analytics';
import { useTheme } from '@/shared/theme/ThemeContext';
import { formatINR } from '@/shared/utils/currency';

interface SpendingTrendChartProps {
  dailyTotals: DailyTotal[];
}

export function SpendingTrendChart({ dailyTotals }: SpendingTrendChartProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [selectedDay, setSelectedDay] = useState<DailyTotal | null>(null);

  const maxDailyPaise = Math.max(...dailyTotals.map((d) => d.totalPaise), 0);

  // If no spending in the entire month, don't show an empty bar chart
  if (maxDailyPaise === 0) {
    return null;
  }

  const activeDays = dailyTotals.filter((d) => d.totalPaise > 0);

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
      <View style={styles.headerRow}>
        <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
          Daily Spending Trend
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {activeDays.length} active day{activeDays.length === 1 ? '' : 's'}
        </Text>
      </View>

      {/* Selected Day Tooltip */}
      <View
        style={[
          styles.tooltipContainer,
          {
            backgroundColor: colors.surfaceSubtle,
            borderRadius: borderRadius.sm,
            paddingVertical: 4,
            paddingHorizontal: spacing.sm,
            marginTop: spacing.xs,
          },
        ]}
      >
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {selectedDay
            ? `Day ${selectedDay.dayNumber}: ${formatINR(selectedDay.totalPaise)}`
            : 'Tap any bar to view day total'}
        </Text>
      </View>

      {/* Scrollable horizontal bar chart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartScroll}
      >
        <View style={styles.barsContainer}>
          {dailyTotals.map((item) => {
            const isSelected = selectedDay?.dayNumber === item.dayNumber;
            const isHighest = item.totalPaise === maxDailyPaise && maxDailyPaise > 0;
            const heightPercent =
              maxDailyPaise > 0 ? (item.totalPaise / maxDailyPaise) * 100 : 0;
            const barHeight = Math.max(heightPercent * 1.1, 4); // max height ~110px

            let barColor = colors.surfaceSubtle;
            if (item.totalPaise > 0) {
              barColor = isHighest ? colors.warning : colors.primary;
              if (isSelected) barColor = colors.upi;
            }

            return (
              <TouchableOpacity
                key={item.dayNumber}
                activeOpacity={0.7}
                onPress={() => setSelectedDay(item)}
                style={styles.dayCol}
              >
                <View style={styles.barSlot}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: barColor,
                        borderRadius: 3,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: isSelected ? colors.primary : colors.textMuted,
                      fontWeight: isSelected || isHighest ? '700' : '400',
                    },
                  ]}
                >
                  {item.dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chartScroll: {
    paddingVertical: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    gap: 4,
  },
  dayCol: {
    alignItems: 'center',
    width: 20,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barSlot: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: 10,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 10,
    marginTop: 6,
  },
});
