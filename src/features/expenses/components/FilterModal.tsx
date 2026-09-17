import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { X, Calendar, QrCode, Wallet, Check, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { CategoryIcon } from '@/shared/components/CategoryIcon';
import { PaymentMethod, ExpenseFilters } from '@/shared/types/models';
import { DatePreset, getDateRangeForPreset } from '@/shared/utils/dateFilters';
import { toPaise, toRupees } from '@/shared/utils/currency';

interface FilterModalProps {
  visible: boolean;
  filters: ExpenseFilters;
  onClose: () => void;
  onApply: (newFilters: ExpenseFilters) => void;
  onClear: () => void;
}

export function FilterModal({
  visible,
  filters,
  onClose,
  onApply,
  onClear,
}: FilterModalProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const categories = useCategoryStore((s) => s.categories);

  const [datePreset, setDatePreset] = useState<DatePreset>('ALL');
  const [customStartDate, setCustomStartDate] = useState(filters.startDate || '');
  const [customEndDate, setCustomEndDate] = useState(filters.endDate || '');
  const [paymentMethod, setPaymentMethod] = useState<'ALL' | PaymentMethod>(
    filters.paymentMethod || 'ALL'
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    filters.categoryId || 'ALL'
  );
  const [minAmountStr, setMinAmountStr] = useState<string>(
    filters.minAmount ? toRupees(filters.minAmount).toString() : ''
  );
  const [maxAmountStr, setMaxAmountStr] = useState<string>(
    filters.maxAmount ? toRupees(filters.maxAmount).toString() : ''
  );

  useEffect(() => {
    if (visible) {
      setPaymentMethod(filters.paymentMethod || 'ALL');
      setSelectedCategoryId(filters.categoryId || 'ALL');
      setCustomStartDate(filters.startDate || '');
      setCustomEndDate(filters.endDate || '');
      setMinAmountStr(filters.minAmount ? toRupees(filters.minAmount).toString() : '');
      setMaxAmountStr(filters.maxAmount ? toRupees(filters.maxAmount).toString() : '');
    }
  }, [visible, filters]);

  const datePresets: { label: string; value: DatePreset }[] = [
    { label: 'All Time', value: 'ALL' },
    { label: 'Today', value: 'TODAY' },
    { label: 'Yesterday', value: 'YESTERDAY' },
    { label: 'This Week', value: 'THIS_WEEK' },
    { label: 'This Month', value: 'THIS_MONTH' },
    { label: 'Last Month', value: 'LAST_MONTH' },
    { label: 'Custom', value: 'CUSTOM' },
  ];

  const handleSelectPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'CUSTOM' && preset !== 'ALL') {
      const range = getDateRangeForPreset(preset);
      setCustomStartDate(range.startDate || '');
      setCustomEndDate(range.endDate || '');
    } else if (preset === 'ALL') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handleApply = () => {
    const newFilters: ExpenseFilters = {
      search: filters.search,
    };

    if (customStartDate) newFilters.startDate = customStartDate;
    if (customEndDate) newFilters.endDate = customEndDate;
    if (paymentMethod !== 'ALL') newFilters.paymentMethod = paymentMethod;
    if (selectedCategoryId !== 'ALL') newFilters.categoryId = selectedCategoryId;

    const parsedMin = parseFloat(minAmountStr);
    if (!isNaN(parsedMin) && parsedMin > 0) {
      newFilters.minAmount = toPaise(parsedMin);
    }

    const parsedMax = parseFloat(maxAmountStr);
    if (!isNaN(parsedMax) && parsedMax > 0) {
      newFilters.maxAmount = toPaise(parsedMax);
    }

    onApply(newFilters);
    onClose();
  };

  const handleReset = () => {
    setDatePreset('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setPaymentMethod('ALL');
    setSelectedCategoryId('ALL');
    setMinAmountStr('');
    setMaxAmountStr('');
    onClear();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.sheet, { backgroundColor: colors.background }]}>
          {/* Sheet Header */}
          <View
            style={[
              styles.header,
              {
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                backgroundColor: colors.card,
              },
            ]}
          >
            <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
              Filter Expenses
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
            {/* 1. Date Range Presets */}
            <View style={styles.section}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                Date Range
              </Text>
              <View style={[styles.chipGroup, { gap: spacing.xs }]}>
                {datePresets.map((p) => {
                  const isSelected = datePreset === p.value;
                  return (
                    <TouchableOpacity
                      key={p.value}
                      onPress={() => handleSelectPreset(p.value)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.cardBorder,
                          borderRadius: borderRadius.full,
                          paddingHorizontal: spacing.md,
                          paddingVertical: 6,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.caption,
                          {
                            color: isSelected ? colors.primaryText : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Date Inputs */}
              {(datePreset === 'CUSTOM' || customStartDate || customEndDate) && (
                <View style={[styles.customDateRow, { marginTop: spacing.sm, gap: spacing.sm }]}>
                  <View
                    style={[
                      styles.dateInputWrapper,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        borderRadius: borderRadius.md,
                        paddingHorizontal: spacing.sm,
                      },
                    ]}
                  >
                    <Calendar size={14} color={colors.textMuted} />
                    <TextInput
                      value={customStartDate}
                      onChangeText={(t) => {
                        setCustomStartDate(t);
                        setDatePreset('CUSTOM');
                      }}
                      placeholder="Start YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.dateInput, typography.caption, { color: colors.textPrimary }]}
                    />
                  </View>

                  <View
                    style={[
                      styles.dateInputWrapper,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        borderRadius: borderRadius.md,
                        paddingHorizontal: spacing.sm,
                      },
                    ]}
                  >
                    <Calendar size={14} color={colors.textMuted} />
                    <TextInput
                      value={customEndDate}
                      onChangeText={(t) => {
                        setCustomEndDate(t);
                        setDatePreset('CUSTOM');
                      }}
                      placeholder="End YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.dateInput, typography.caption, { color: colors.textPrimary }]}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* 2. Payment Method */}
            <View style={[styles.section, { marginTop: spacing.xl }]}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                Payment Method
              </Text>
              <View style={[styles.methodRow, { gap: spacing.sm }]}>
                <TouchableOpacity
                  onPress={() => setPaymentMethod('ALL')}
                  style={[
                    styles.methodBtn,
                    {
                      backgroundColor: paymentMethod === 'ALL' ? colors.primary : colors.card,
                      borderColor: paymentMethod === 'ALL' ? colors.primary : colors.cardBorder,
                      borderRadius: borderRadius.md,
                      paddingVertical: 10,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.bodyMedium,
                      {
                        color: paymentMethod === 'ALL' ? colors.primaryText : colors.textSecondary,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    All Methods
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentMethod('UPI')}
                  style={[
                    styles.methodBtn,
                    {
                      backgroundColor: paymentMethod === 'UPI' ? `${colors.upi}20` : colors.card,
                      borderColor: paymentMethod === 'UPI' ? colors.upi : colors.cardBorder,
                      borderRadius: borderRadius.md,
                      paddingVertical: 10,
                    },
                  ]}
                >
                  <QrCode size={16} color={paymentMethod === 'UPI' ? colors.upi : colors.textSecondary} />
                  <Text
                    style={[
                      typography.bodyMedium,
                      {
                        color: paymentMethod === 'UPI' ? colors.upi : colors.textSecondary,
                        fontWeight: '600',
                        marginLeft: 6,
                      },
                    ]}
                  >
                    UPI
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentMethod('CASH')}
                  style={[
                    styles.methodBtn,
                    {
                      backgroundColor: paymentMethod === 'CASH' ? `${colors.cash}20` : colors.card,
                      borderColor: paymentMethod === 'CASH' ? colors.cash : colors.cardBorder,
                      borderRadius: borderRadius.md,
                      paddingVertical: 10,
                    },
                  ]}
                >
                  <Wallet size={16} color={paymentMethod === 'CASH' ? colors.cash : colors.textSecondary} />
                  <Text
                    style={[
                      typography.bodyMedium,
                      {
                        color: paymentMethod === 'CASH' ? colors.cash : colors.textSecondary,
                        fontWeight: '600',
                        marginLeft: 6,
                      },
                    ]}
                  >
                    Cash
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Category Filter */}
            <View style={[styles.section, { marginTop: spacing.xl }]}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                Category
              </Text>
              <View style={[styles.categoryGrid, { gap: spacing.xs }]}>
                <TouchableOpacity
                  onPress={() => setSelectedCategoryId('ALL')}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategoryId === 'ALL' ? colors.primary : colors.card,
                      borderColor: selectedCategoryId === 'ALL' ? colors.primary : colors.cardBorder,
                      borderRadius: borderRadius.full,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 6,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: selectedCategoryId === 'ALL' ? colors.primaryText : colors.textSecondary,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    All Categories
                  </Text>
                </TouchableOpacity>

                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategoryId(cat.id)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? `${cat.color}20` : colors.card,
                          borderColor: isSelected ? cat.color : colors.cardBorder,
                          borderRadius: borderRadius.full,
                          paddingHorizontal: spacing.md,
                          paddingVertical: 6,
                        },
                      ]}
                    >
                      <CategoryIcon
                        icon={cat.icon}
                        color={cat.color}
                        size={12}
                        containerSize={20}
                        backgroundColor="transparent"
                      />
                      <Text
                        style={[
                          typography.caption,
                          {
                            color: isSelected ? cat.color : colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                            marginLeft: 4,
                          },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Amount Range */}
            <View style={[styles.section, { marginTop: spacing.xl }]}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                Amount Range (₹)
              </Text>
              <View style={[styles.amountRangeRow, { gap: spacing.md }]}>
                <View
                  style={[
                    styles.amountInputWrapper,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                      borderRadius: borderRadius.md,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                >
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Min: ₹</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={minAmountStr}
                    onChangeText={setMinAmountStr}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.amountInput, typography.bodyMedium, { color: colors.textPrimary }]}
                  />
                </View>

                <View
                  style={[
                    styles.amountInputWrapper,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                      borderRadius: borderRadius.md,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                >
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Max: ₹</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={maxAmountStr}
                    onChangeText={setMaxAmountStr}
                    placeholder="No limit"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.amountInput, typography.bodyMedium, { color: colors.textPrimary }]}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={[
              styles.footer,
              {
                borderTopColor: colors.border,
                borderTopWidth: 1,
                padding: spacing.lg,
                backgroundColor: colors.card,
                gap: spacing.md,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleReset}
              style={[
                styles.resetBtn,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                  paddingVertical: 12,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <RotateCcw size={16} color={colors.textSecondary} />
              <Text style={[typography.button, { color: colors.textSecondary, marginLeft: 6 }]}>
                Clear All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              style={[
                styles.applyBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                  paddingVertical: 12,
                },
              ]}
            >
              <Text style={[typography.button, { color: colors.primaryText }]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    width: '100%',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
  },
  customDateRow: {
    flexDirection: 'row',
  },
  dateInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 40,
  },
  dateInput: {
    flex: 1,
    marginLeft: 6,
    padding: 0,
  },
  methodRow: {
    flexDirection: 'row',
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  amountRangeRow: {
    flexDirection: 'row',
  },
  amountInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
  },
  amountInput: {
    flex: 1,
    marginLeft: 4,
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  applyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
