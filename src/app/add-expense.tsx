import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import { useExpenseStore } from '@/features/expenses/store/expenseStore';

export default function AddExpenseModal() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const addExpense = useExpenseStore((s) => s.addExpense);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    amountPaise: number;
    paymentMethod: 'CASH' | 'UPI';
    categoryId: string;
    date: string;
    description?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await addExpense({
        amount: data.amountPaise,
        paymentMethod: data.paymentMethod,
        categoryId: data.categoryId,
        date: data.date,
        description: data.description,
      });

      // Navigate back to previous screen or dashboard immediately
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Modal Header */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
          Add Expense
        </Text>
        <TouchableOpacity
          accessibilityLabel="Close"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.closeButton, { backgroundColor: colors.surfaceSubtle }]}
        >
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Expense Form */}
      <ExpenseForm
        onSubmit={handleSubmit}
        submitButtonText="+ Add Expense"
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
});
