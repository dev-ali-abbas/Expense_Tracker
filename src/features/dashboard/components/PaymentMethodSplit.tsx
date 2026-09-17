import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QrCode, Wallet } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { formatINR } from '@/shared/utils/currency';

interface PaymentMethodSplitProps {
  cashPaise: number;
  upiPaise: number;
  totalPaise: number;
}

export function PaymentMethodSplit({
  cashPaise,
  upiPaise,
  totalPaise,
}: PaymentMethodSplitProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const upiPercent = totalPaise > 0 ? Math.round((upiPaise / totalPaise) * 100) : 0;
  const cashPercent = totalPaise > 0 ? 100 - upiPercent : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginTop: spacing.md,
        },
      ]}
    >
      <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
        Payment Method Split
      </Text>

      {/* Proportional Split Bar */}
      <View
        style={[
          styles.splitBarContainer,
          {
            backgroundColor: colors.surfaceSubtle,
            borderRadius: borderRadius.full,
            height: 12,
          },
        ]}
      >
        {totalPaise > 0 ? (
          <>
            <View
              style={{
                width: `${upiPercent}%`,
                height: '100%',
                backgroundColor: colors.upi,
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6,
                borderTopRightRadius: upiPercent === 100 ? 6 : 0,
                borderBottomRightRadius: upiPercent === 100 ? 6 : 0,
              }}
            />
            <View
              style={{
                width: `${cashPercent}%`,
                height: '100%',
                backgroundColor: colors.cash,
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                borderTopLeftRadius: cashPercent === 100 ? 6 : 0,
                borderBottomLeftRadius: cashPercent === 100 ? 6 : 0,
              }}
            />
          </>
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceSubtle }} />
        )}
      </View>

      {/* UPI & Cash Details */}
      <View style={[styles.detailRow, { marginTop: spacing.md }]}>
        {/* UPI Info */}
        <View style={styles.methodInfo}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: colors.upi }]} />
            <QrCode size={14} color={colors.upi} style={{ marginHorizontal: 4 }} />
            <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
              UPI ({upiPercent}%)
            </Text>
          </View>
          <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: 2 }]}>
            {formatINR(upiPaise)}
          </Text>
        </View>

        {/* Cash Info */}
        <View style={[styles.methodInfo, { alignItems: 'flex-end' }]}>
          <View style={styles.labelRow}>
            <Wallet size={14} color={colors.cash} style={{ marginHorizontal: 4 }} />
            <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
              Cash ({cashPercent}%)
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.cash, marginLeft: 6 }]} />
          </View>
          <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: 2 }]}>
            {formatINR(cashPaise)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  splitBarContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
