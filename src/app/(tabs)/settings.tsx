import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {
  Moon,
  Sun,
  Monitor,
  QrCode,
  Wallet,
  ShieldCheck,
  Tag,
  Download,
  IndianRupee,
  ChevronRight,
  Target,
  CheckCircle,
  Edit2,
  X,
} from 'lucide-react-native';
import { useTheme, ThemeMode } from '@/shared/theme/ThemeContext';
import { useSettingsStore } from '@/shared/store/settingsStore';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { useExpenseStore } from '@/features/expenses/store/expenseStore';
import { useBudgetStore } from '@/features/budget/store/budgetStore';
import { CategoryIcon } from '@/shared/components/CategoryIcon';
import { CategoryManagerModal } from '@/features/categories/components/CategoryManagerModal';
import { generateExpensesCsv, downloadCsv } from '@/shared/utils/exportCsv';
import { formatINR, toRupees, toPaise } from '@/shared/utils/currency';

export default function SettingsScreen() {
  const { colors, typography, spacing, borderRadius, mode, setThemeMode } = useTheme();
  const defaultPaymentMethod = useSettingsStore((s) => s.defaultPaymentMethod);
  const setDefaultPaymentMethod = useSettingsStore((s) => s.setDefaultPaymentMethod);
  const categories = useCategoryStore((s) => s.categories);
  const expenses = useExpenseStore((s) => s.expenses);
  const monthlyBudgetPaise = useBudgetStore((s) => s.monthlyBudgetPaise);
  const saveBudget = useBudgetStore((s) => s.saveBudget);
  const clearBudget = useBudgetStore((s) => s.clearBudget);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState(
    monthlyBudgetPaise ? toRupees(monthlyBudgetPaise).toString() : ''
  );
  const [exportSuccess, setExportSuccess] = useState(false);

  const themeOptions: { label: string; value: ThemeMode; icon: typeof Sun }[] = [
    { label: 'System', value: 'system', icon: Monitor },
    { label: 'Light', value: 'light', icon: Sun },
    { label: 'Dark', value: 'dark', icon: Moon },
  ];

  const handleExport = () => {
    if (expenses.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('No expenses recorded yet to export.');
      } else {
        Alert.alert('No Expenses', 'Add some expenses before exporting data.');
      }
      return;
    }

    const csvContent = generateExpensesCsv(expenses, categories);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `expense_tracker_export_${dateStr}.csv`;
    downloadCsv(filename, csvContent);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3500);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <Text style={[typography.titleLarge, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
          Settings
        </Text>

        {/* 1. Appearance Setting (PRD Section 32 & 46) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
            Appearance
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Choose your preferred theme mode
          </Text>

          <View style={[styles.buttonRow, { marginTop: spacing.md, gap: spacing.sm }]}>
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = mode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${opt.label} theme`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setThemeMode(opt.value)}
                  style={[
                    styles.selectableButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <Icon
                    size={18}
                    color={isSelected ? colors.primaryText : colors.textSecondary}
                  />
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isSelected ? colors.primaryText : colors.textSecondary,
                        marginTop: 4,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Default Payment Method (PRD Section 8 & 32) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
            Default Payment Method
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Preselected method when opening the Add Expense screen
          </Text>

          <View style={[styles.buttonRow, { marginTop: spacing.md, gap: spacing.sm }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Default Payment Method UPI"
              accessibilityState={{ selected: defaultPaymentMethod === 'UPI' }}
              onPress={() => setDefaultPaymentMethod('UPI')}
              style={[
                styles.selectableButton,
                {
                  backgroundColor:
                    defaultPaymentMethod === 'UPI' ? `${colors.upi}20` : colors.surfaceSubtle,
                  borderColor: defaultPaymentMethod === 'UPI' ? colors.upi : colors.border,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                },
              ]}
            >
              <QrCode
                size={20}
                color={defaultPaymentMethod === 'UPI' ? colors.upi : colors.textSecondary}
              />
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: defaultPaymentMethod === 'UPI' ? colors.upi : colors.textSecondary,
                    marginTop: 4,
                    fontWeight: defaultPaymentMethod === 'UPI' ? '700' : '500',
                  },
                ]}
              >
                UPI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Default Payment Method Cash"
              accessibilityState={{ selected: defaultPaymentMethod === 'CASH' }}
              onPress={() => setDefaultPaymentMethod('CASH')}
              style={[
                styles.selectableButton,
                {
                  backgroundColor:
                    defaultPaymentMethod === 'CASH' ? `${colors.cash}20` : colors.surfaceSubtle,
                  borderColor: defaultPaymentMethod === 'CASH' ? colors.cash : colors.border,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                },
              ]}
            >
              <Wallet
                size={20}
                color={defaultPaymentMethod === 'CASH' ? colors.cash : colors.textSecondary}
              />
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: defaultPaymentMethod === 'CASH' ? colors.cash : colors.textSecondary,
                    marginTop: 4,
                    fontWeight: defaultPaymentMethod === 'CASH' ? '700' : '500',
                  },
                ]}
              >
                Cash
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Manage Categories (PRD Section 7 & 32) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
                Categories
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {categories.length} categories configured
              </Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Manage Categories"
              onPress={() => setShowCategoryModal(true)}
              style={[
                styles.manageBtn,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                },
              ]}
            >
              <Tag size={14} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700', marginLeft: 4 }]}>
                Manage
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.categoryPreviewGrid, { marginTop: spacing.md, gap: spacing.xs }]}>
            {categories.slice(0, 6).map((cat) => (
              <View
                key={cat.id}
                style={[
                  styles.categoryPreviewChip,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  },
                ]}
              >
                <CategoryIcon icon={cat.icon} color={cat.color} size={12} containerSize={20} backgroundColor="transparent" />
                <Text style={[typography.caption, { color: colors.textPrimary, marginLeft: 4 }]}>
                  {cat.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. Monthly Budget Status (PRD Section 27 & 32) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.labelWithIcon}>
              <Target size={20} color={colors.primary} />
              <View style={{ marginLeft: spacing.sm }}>
                <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
                  Monthly Budget
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {monthlyBudgetPaise ? formatINR(monthlyBudgetPaise) : 'Not configured'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Configure Monthly Budget"
              onPress={() => {
                setBudgetInput(monthlyBudgetPaise ? toRupees(monthlyBudgetPaise).toString() : '');
                setShowBudgetModal(true);
              }}
              style={[
                styles.manageBtn,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                },
              ]}
            >
              <Edit2 size={14} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700', marginLeft: 4 }]}>
                {monthlyBudgetPaise ? 'Edit' : 'Set'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Data Export (PRD Section 33) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.labelWithIcon}>
              <Download size={20} color={colors.primary} />
              <View style={{ marginLeft: spacing.sm }}>
                <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
                  Export Transactions (CSV)
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Download full transaction history as a CSV spreadsheet
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Export ${expenses.length} Records to CSV`}
            onPress={handleExport}
            style={[
              styles.exportBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.md,
                paddingVertical: 12,
                marginTop: spacing.md,
              },
            ]}
          >
            <Download size={18} color={colors.primaryText} />
            <Text style={[typography.button, { color: colors.primaryText, marginLeft: 8 }]}>
              Export {expenses.length} Records to CSV
            </Text>
          </TouchableOpacity>

          {exportSuccess && (
            <View style={[styles.successRow, { marginTop: spacing.sm }]}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={[typography.caption, { color: colors.success, fontWeight: '600', marginLeft: 6 }]}>
                CSV exported successfully!
              </Text>
            </View>
          )}
        </View>

        {/* 6. General: Currency Indicator (PRD Section 26) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.labelWithIcon}>
              <IndianRupee size={20} color={colors.primary} />
              <View style={{ marginLeft: spacing.sm }}>
                <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
                  Currency
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Indian Rupee (₹ INR) — Lakhs and Crores formatting
                </Text>
              </View>
            </View>
            <Text style={[typography.button, { color: colors.primary }]}>₹ INR</Text>
          </View>
        </View>

        {/* 7. Security & 100% Offline Privacy Notice (PRD Section 54) */}
        <View
          style={[
            styles.privacyCard,
            {
              backgroundColor: `${colors.success}10`,
              borderColor: `${colors.success}30`,
              borderRadius: borderRadius.md,
              padding: spacing.md,
            },
          ]}
        >
          <ShieldCheck size={20} color={colors.success} />
          <Text
            style={[
              typography.caption,
              { color: colors.textPrimary, marginLeft: spacing.sm, flex: 1 },
            ]}
          >
            100% Offline & Private: Financial data is securely kept in SQLite on this device. No remote tracking.
          </Text>
        </View>
      </ScrollView>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* Monthly Budget Modal */}
      <Modal visible={showBudgetModal} transparent animationType="fade" onRequestClose={() => setShowBudgetModal(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.lg,
                borderColor: colors.cardBorder,
                padding: spacing.xl,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
                Set Monthly Budget
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close Budget Modal"
                onPress={() => setShowBudgetModal(false)}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Enter your monthly spending limit in Rupees:
            </Text>

            <View
              style={[
                styles.budgetInputRow,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.background,
                  borderRadius: borderRadius.md,
                  marginTop: spacing.md,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: colors.primary }]}>₹</Text>
              <TextInput
                accessibilityLabel="Monthly Budget in Rupees"
                value={budgetInput}
                onChangeText={(t) => setBudgetInput(t.replace(/[^0-9.]/g, ''))}
                placeholder="25000"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                autoFocus
                style={[styles.budgetInput, { color: colors.textPrimary }]}
              />
            </View>

            <View style={[styles.modalActions, { marginTop: spacing.lg, gap: spacing.sm }]}>
              {monthlyBudgetPaise ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Clear Budget"
                  onPress={async () => {
                    const now = new Date();
                    await clearBudget(now.getFullYear(), now.getMonth() + 1);
                    setShowBudgetModal(false);
                  }}
                  style={[
                    styles.clearBtn,
                    {
                      borderColor: colors.danger,
                      borderRadius: borderRadius.md,
                      paddingVertical: spacing.md,
                    },
                  ]}
                >
                  <Text style={[typography.button, { color: colors.danger }]}>Clear</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Save Budget"
                onPress={async () => {
                  const now = new Date();
                  const val = parseFloat(budgetInput);
                  if (!isNaN(val) && val > 0) {
                    await saveBudget(toPaise(val), now.getFullYear(), now.getMonth() + 1);
                  } else {
                    await clearBudget(now.getFullYear(), now.getMonth() + 1);
                  }
                  setShowBudgetModal(false);
                }}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.md,
                    paddingVertical: spacing.md,
                  },
                ]}
              >
                <Text style={[typography.button, { color: colors.primaryText }]}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  selectableButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryPreviewChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 52,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    height: '100%',
  },
  modalActions: {
    flexDirection: 'row',
  },
  clearBtn: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
