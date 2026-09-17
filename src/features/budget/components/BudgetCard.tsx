import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { Target, AlertCircle, CheckCircle2, Edit2, X } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { calculateBudgetStatus } from '../utils/budgetCalculations';
import { useBudgetStore } from '../store/budgetStore';
import { formatINR, toPaise, toRupees } from '@/shared/utils/currency';

interface BudgetCardProps {
  spentPaise: number;
  year: number;
  month: number;
}

export function BudgetCard({ spentPaise, year, month }: BudgetCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const monthlyBudgetPaise = useBudgetStore((s) => s.monthlyBudgetPaise);
  const saveBudget = useBudgetStore((s) => s.saveBudget);
  const clearBudget = useBudgetStore((s) => s.clearBudget);

  const [modalVisible, setModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState(
    monthlyBudgetPaise ? toRupees(monthlyBudgetPaise).toString() : ''
  );

  const status = calculateBudgetStatus(spentPaise, monthlyBudgetPaise);

  const handleOpenModal = () => {
    setBudgetInput(monthlyBudgetPaise ? toRupees(monthlyBudgetPaise).toString() : '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const parsed = parseFloat(budgetInput);
    if (!isNaN(parsed) && parsed > 0) {
      await saveBudget(toPaise(parsed), year, month);
    } else {
      await clearBudget(year, month);
    }
    setModalVisible(false);
  };

  const getStatusColor = () => {
    if (status.isOverBudget) return colors.danger;
    if (status.isNearBudget) return colors.warning;
    return colors.success;
  };

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
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Target size={18} color={colors.primary} />
          <Text style={[typography.titleMedium, { color: colors.textPrimary, marginLeft: 8 }]}>
            Monthly Budget
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleOpenModal}
          style={[styles.editBtn, { backgroundColor: colors.surfaceSubtle }]}
        >
          {status.hasBudget ? (
            <Edit2 size={14} color={colors.textSecondary} />
          ) : (
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              + Set
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {status.hasBudget ? (
        <View style={{ marginTop: spacing.md }}>
          <View style={styles.amountRow}>
            <Text style={[typography.titleLarge, { color: colors.textPrimary, fontWeight: '700' }]}>
              {formatINR(status.spentPaise)}
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
              {' '}
              / {formatINR(status.budgetPaise)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressBarBg,
              { backgroundColor: colors.surfaceSubtle, borderRadius: borderRadius.full, marginTop: 8 },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: getStatusColor(),
                  width: `${Math.min(status.percentage, 100)}%`,
                  borderRadius: borderRadius.full,
                },
              ]}
            />
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadgeRow, { marginTop: spacing.sm }]}>
            {status.isOverBudget ? (
              <View style={styles.badgeContent}>
                <AlertCircle size={14} color={colors.danger} />
                <Text style={[typography.caption, { color: colors.danger, fontWeight: '700', marginLeft: 4 }]}>
                  {formatINR(status.overBudgetPaise)} over budget ({status.percentage}%)
                </Text>
              </View>
            ) : (
              <View style={styles.badgeContent}>
                <CheckCircle2 size={14} color={getStatusColor()} />
                <Text
                  style={[
                    typography.caption,
                    { color: getStatusColor(), fontWeight: '700', marginLeft: 4 },
                  ]}
                >
                  {formatINR(status.remainingPaise)} remaining ({status.percentage}% spent)
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={{ marginTop: spacing.sm }}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            No monthly budget configured. Set a limit to track your spending.
          </Text>
        </View>
      )}

      {/* Set/Edit Budget Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.dialog,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderRadius: borderRadius.lg,
                padding: spacing.xl,
              },
            ]}
          >
            <View style={styles.dialogHeader}>
              <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
                Monthly Budget
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Enter target spending budget for this month (in Rupees):
            </Text>

            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                  marginTop: spacing.md,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Text style={[typography.titleMedium, { color: colors.primary, fontWeight: '700' }]}>₹</Text>
              <TextInput
                autoFocus
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={setBudgetInput}
                placeholder="50000"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, typography.titleMedium, { color: colors.textPrimary }]}
              />
            </View>

            <View style={[styles.modalActions, { marginTop: spacing.xl, gap: spacing.sm }]}>
              {monthlyBudgetPaise ? (
                <TouchableOpacity
                  onPress={async () => {
                    await clearBudget(year, month);
                    setModalVisible(false);
                  }}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: `${colors.danger}15`, borderRadius: borderRadius.md },
                  ]}
                >
                  <Text style={[typography.button, { color: colors.danger }]}>Clear</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.primary, borderRadius: borderRadius.md, flex: 1 },
                ]}
              >
                <Text style={[typography.button, { color: colors.primaryText }]}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    height: '100%',
  },
  modalActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
