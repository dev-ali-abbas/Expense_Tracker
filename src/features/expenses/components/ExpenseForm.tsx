import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { QrCode, Wallet, Calendar, Check, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { useSettingsStore } from '@/shared/store/settingsStore';
import { CategoryIcon } from '@/shared/components/CategoryIcon';
import { PaymentMethod, Expense } from '@/shared/types/models';
import { toPaise, toRupees } from '@/shared/utils/currency';

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSubmit: (data: {
    amountPaise: number;
    paymentMethod: PaymentMethod;
    categoryId: string;
    date: string;
    description?: string;
  }) => Promise<void>;
  submitButtonText?: string;
  isLoading?: boolean;
}

export function ExpenseForm({
  initialExpense,
  onSubmit,
  submitButtonText = 'Add Expense',
  isLoading = false,
}: ExpenseFormProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const categories = useCategoryStore((s) => s.categories);
  const defaultPaymentMethod = useSettingsStore((s) => s.defaultPaymentMethod);
  const setDefaultPaymentMethod = useSettingsStore((s) => s.setDefaultPaymentMethod);

  // Initial state values
  const [amountStr, setAmountStr] = useState<string>(
    initialExpense ? toRupees(initialExpense.amount).toString() : ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialExpense ? initialExpense.paymentMethod : defaultPaymentMethod
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialExpense ? initialExpense.categoryId : categories[0]?.id || ''
  );

  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const getYesterdayISO = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState<string>(
    initialExpense ? initialExpense.date : getTodayISO()
  );
  const [description, setDescription] = useState<string>(
    initialExpense?.description || ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    // Persist as last-used payment method
    setDefaultPaymentMethod(method);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    const parsedAmount = parseFloat(amountStr.trim());

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0');
      return;
    }

    if (!selectedCategoryId) {
      setErrorMessage('Please select a category');
      return;
    }

    if (!date) {
      setErrorMessage('Please select a valid date');
      return;
    }

    const amountPaise = toPaise(parsedAmount);

    try {
      await onSubmit({
        amountPaise,
        paymentMethod,
        categoryId: selectedCategoryId,
        date,
        description: description.trim() || undefined,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { padding: spacing.lg }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Error Banner */}
      {errorMessage && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: `${colors.danger}15`,
              borderColor: `${colors.danger}40`,
              borderRadius: borderRadius.md,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AlertCircle size={18} color={colors.danger} />
          <Text style={[typography.caption, { color: colors.danger, marginLeft: 8, flex: 1 }]}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Large Amount Input */}
      <View
        style={[
          styles.amountCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
          ]}
        >
          Amount
        </Text>
        <View style={styles.amountInputRow}>
          <Text style={[styles.currencySymbol, { color: colors.primary }]}>₹</Text>
          <TextInput
            autoFocus={!initialExpense}
            keyboardType="decimal-pad"
            accessibilityLabel="Expense Amount in Rupees"
            accessibilityRole="none"
            value={amountStr}
            onChangeText={(text) => {
              // Allow numbers and at most one decimal point
              const sanitized = text.replace(/[^0-9.]/g, '');
              const parts = sanitized.split('.');
              if (parts.length <= 2) {
                setAmountStr(sanitized);
              }
            }}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.amountInput,
              { color: colors.textPrimary },
            ]}
          />
        </View>
      </View>

      {/* Payment Method Selector (Cash / UPI) */}
      <View style={[styles.section, { marginTop: spacing.lg }]}>
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          Payment Method
        </Text>
        <View style={[styles.paymentMethodRow, { gap: spacing.md }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Pay via UPI"
            accessibilityState={{ selected: paymentMethod === 'UPI' }}
            onPress={() => handleSelectPaymentMethod('UPI')}
            style={[
              styles.paymentButton,
              {
                backgroundColor: paymentMethod === 'UPI' ? `${colors.upi}18` : colors.card,
                borderColor: paymentMethod === 'UPI' ? colors.upi : colors.cardBorder,
                borderRadius: borderRadius.md,
                padding: spacing.md,
              },
            ]}
          >
            <QrCode size={20} color={paymentMethod === 'UPI' ? colors.upi : colors.textSecondary} />
            <Text
              style={[
                typography.button,
                {
                  color: paymentMethod === 'UPI' ? colors.upi : colors.textSecondary,
                  marginLeft: 8,
                },
              ]}
            >
              UPI
            </Text>
            {paymentMethod === 'UPI' && (
              <View style={[styles.checkCircle, { backgroundColor: colors.upi }]}>
                <Check size={12} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Pay via Cash"
            accessibilityState={{ selected: paymentMethod === 'CASH' }}
            onPress={() => handleSelectPaymentMethod('CASH')}
            style={[
              styles.paymentButton,
              {
                backgroundColor: paymentMethod === 'CASH' ? `${colors.cash}18` : colors.card,
                borderColor: paymentMethod === 'CASH' ? colors.cash : colors.cardBorder,
                borderRadius: borderRadius.md,
                padding: spacing.md,
              },
            ]}
          >
            <Wallet size={20} color={paymentMethod === 'CASH' ? colors.cash : colors.textSecondary} />
            <Text
              style={[
                typography.button,
                {
                  color: paymentMethod === 'CASH' ? colors.cash : colors.textSecondary,
                  marginLeft: 8,
                },
              ]}
            >
              Cash
            </Text>
            {paymentMethod === 'CASH' && (
              <View style={[styles.checkCircle, { backgroundColor: colors.cash }]}>
                <Check size={12} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Grid */}
      <View style={[styles.section, { marginTop: spacing.lg }]}>
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          Category
        </Text>
        <View style={[styles.categoryGrid, { gap: spacing.sm }]}>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Category ${cat.name}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected ? `${cat.color}20` : colors.card,
                    borderColor: isSelected ? cat.color : colors.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                  },
                ]}
              >
                <CategoryIcon
                  icon={cat.icon}
                  color={cat.color}
                  size={20}
                  containerSize={36}
                  backgroundColor={isSelected ? `${cat.color}30` : undefined}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    typography.caption,
                    {
                      color: isSelected ? cat.color : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                      marginTop: 4,
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

      {/* Date Selector */}
      <View style={[styles.section, { marginTop: spacing.lg }]}>
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          Date
        </Text>
        <View style={[styles.dateRow, { gap: spacing.sm }]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Select Today"
            accessibilityState={{ selected: date === getTodayISO() }}
            onPress={() => setDate(getTodayISO())}
            style={[
              styles.datePill,
              {
                backgroundColor: date === getTodayISO() ? colors.primary : colors.card,
                borderColor: date === getTodayISO() ? colors.primary : colors.cardBorder,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: date === getTodayISO() ? colors.primaryText : colors.textSecondary,
                  fontWeight: '600',
                },
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Select Yesterday"
            accessibilityState={{ selected: date === getYesterdayISO() }}
            onPress={() => setDate(getYesterdayISO())}
            style={[
              styles.datePill,
              {
                backgroundColor: date === getYesterdayISO() ? colors.primary : colors.card,
                borderColor: date === getYesterdayISO() ? colors.primary : colors.cardBorder,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: date === getYesterdayISO() ? colors.primaryText : colors.textSecondary,
                  fontWeight: '600',
                },
              ]}
            >
              Yesterday
            </Text>
          </TouchableOpacity>

          {/* Date TextInput for custom YYYY-MM-DD */}
          <View
            style={[
              styles.customDateInputContainer,
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
              accessibilityLabel="Custom Date in YYYY-MM-DD format"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.customDateInput,
                typography.caption,
                { color: colors.textPrimary, marginLeft: 6 },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Note / Description */}
      <View style={[styles.section, { marginTop: spacing.lg }]}>
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          Note (Optional)
        </Text>
        <TextInput
          accessibilityLabel="Expense Note"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Lunch with team, Groceries from DMart"
          placeholderTextColor={colors.textMuted}
          maxLength={100}
          style={[
            styles.descriptionInput,
            typography.bodyMedium,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.md,
              color: colors.textPrimary,
              padding: spacing.md,
            },
          ]}
        />
      </View>

      {/* Prominent Submit Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={submitButtonText}
        disabled={isLoading}
        onPress={handleSubmit}
        style={[
          styles.submitButton,
          {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.lg,
            paddingVertical: spacing.lg,
            marginTop: spacing.xxl,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primaryText} />
        ) : (
          <Text style={[typography.button, { color: colors.primaryText, fontSize: 16 }]}>
            {submitButtonText}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  amountCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  currencySymbol: {
    fontSize: 34,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    minWidth: 100,
    textAlign: 'center',
    padding: 0,
  },
  section: {
    width: '100%',
  },
  paymentMethodRow: {
    flexDirection: 'row',
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  checkCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePill: {
    borderWidth: 1,
  },
  customDateInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 36,
  },
  customDateInput: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
  descriptionInput: {
    borderWidth: 1,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
});
