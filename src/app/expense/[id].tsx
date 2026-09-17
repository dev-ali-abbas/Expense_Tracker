import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit3, Trash2, Calendar, Clock, FileText, QrCode, Wallet } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useExpenseStore } from '@/features/expenses/store/expenseStore';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { CategoryIcon } from '@/shared/components/CategoryIcon';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import { DeleteConfirmationModal } from '@/features/expenses/components/DeleteConfirmationModal';
import { formatINR } from '@/shared/utils/currency';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();

  const expense = useExpenseStore((s) => s.getExpenseById(id || ''));
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const category = useCategoryStore((s) => s.getCategoryById(expense?.categoryId || ''));

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!expense) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.center, { padding: spacing.lg }]}>
          <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
            Expense not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.primary, borderRadius: borderRadius.md, marginTop: spacing.md, padding: spacing.md },
            ]}
          >
            <Text style={[typography.button, { color: colors.primaryText }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isUPI = expense.paymentMethod === 'UPI';
  const paymentColor = isUPI ? colors.upi : colors.cash;

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const handleUpdate = async (data: {
    amountPaise: number;
    paymentMethod: 'CASH' | 'UPI';
    categoryId: string;
    date: string;
    description?: string;
  }) => {
    await updateExpense({
      id: expense.id,
      amount: data.amountPaise,
      paymentMethod: data.paymentMethod,
      categoryId: data.categoryId,
      date: data.date,
      description: data.description,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      setShowDeleteModal(false);
      router.back();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
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
        <TouchableOpacity
          accessibilityLabel="Back"
          onPress={() => (isEditing ? setIsEditing(false) : router.back())}
          style={[styles.iconButton, { backgroundColor: colors.surfaceSubtle }]}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
          {isEditing ? 'Edit Expense' : 'Transaction Details'}
        </Text>

        {!isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              accessibilityLabel="Edit"
              onPress={() => setIsEditing(true)}
              style={[styles.iconButton, { backgroundColor: colors.surfaceSubtle, marginRight: 8 }]}
            >
              <Edit3 size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="Delete"
              onPress={() => setShowDeleteModal(true)}
              style={[styles.iconButton, { backgroundColor: `${colors.danger}15` }]}
            >
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {isEditing ? (
        <ExpenseForm
          initialExpense={expense}
          onSubmit={handleUpdate}
          submitButtonText="Save Changes"
        />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
          {/* Main Amount Card */}
          <View
            style={[
              styles.amountCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderRadius: borderRadius.lg,
                padding: spacing.xl,
              },
            ]}
          >
            <CategoryIcon
              icon={category?.icon || 'MoreHorizontal'}
              color={category?.color || '#64748B'}
              size={28}
              containerSize={60}
            />

            <Text
              style={[
                typography.displayLarge,
                { color: colors.textPrimary, marginTop: spacing.md },
              ]}
            >
              {formatINR(expense.amount)}
            </Text>

            <Text
              style={[
                typography.titleMedium,
                { color: colors.textSecondary, marginTop: 4 },
              ]}
            >
              {category?.name || 'Uncategorized'}
            </Text>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: `${paymentColor}15`,
                  borderColor: `${paymentColor}30`,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 4,
                  marginTop: spacing.md,
                },
              ]}
            >
              {isUPI ? (
                <QrCode size={14} color={paymentColor} />
              ) : (
                <Wallet size={14} color={paymentColor} />
              )}
              <Text style={[typography.caption, { color: paymentColor, fontWeight: '700', marginLeft: 6 }]}>
                Paid via {expense.paymentMethod}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                marginTop: spacing.lg,
                gap: spacing.md,
              },
            ]}
          >
            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Calendar size={18} color={colors.textMuted} />
                <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                  Date
                </Text>
              </View>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                {formatDate(expense.date)}
              </Text>
            </View>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Clock size={18} color={colors.textMuted} />
                <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                  Time
                </Text>
              </View>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                {formatTime(expense.createdAt)}
              </Text>
            </View>

            {expense.description ? (
              <>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelRow}>
                    <FileText size={18} color={colors.textMuted} />
                    <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                      Note
                    </Text>
                  </View>
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: colors.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' },
                    ]}
                  >
                    {expense.description}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
      )}

      {/* Delete Confirmation Modal (PRD Section 22) */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  amountCard: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    width: '100%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
