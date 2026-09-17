import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  SectionList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, X, SlidersHorizontal, ArrowDownUp, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useExpenseStore } from '@/features/expenses/store/expenseStore';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { ExpenseItem } from '@/features/expenses/components/ExpenseItem';
import { FilterModal } from '@/features/expenses/components/FilterModal';
import { Expense, ExpenseFilters, SortOption } from '@/shared/types/models';
import { formatINR } from '@/shared/utils/currency';

export default function TransactionsScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const router = useRouter();

  const expenses = useExpenseStore((s) => s.expenses);
  const loadExpenses = useExpenseStore((s) => s.loadExpenses);
  const isLoading = useExpenseStore((s) => s.isLoading);
  const categories = useCategoryStore((s) => s.categories);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('DATE_DESC');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.paymentMethod) count++;
    if (filters.categoryId) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) count++;
    return count;
  }, [filters]);

  // Filter and sort transactions
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) => {
        const descMatch = e.description?.toLowerCase().includes(q);
        const cat = categories.find((c) => c.id === e.categoryId);
        const catMatch = cat?.name.toLowerCase().includes(q);
        return descMatch || catMatch;
      });
    }

    // Payment method
    if (filters.paymentMethod) {
      result = result.filter((e) => e.paymentMethod === filters.paymentMethod);
    }

    // Category
    if (filters.categoryId) {
      result = result.filter((e) => e.categoryId === filters.categoryId);
    }

    // Date range
    if (filters.startDate) {
      result = result.filter((e) => e.date >= filters.startDate!);
    }
    if (filters.endDate) {
      result = result.filter((e) => e.date <= filters.endDate!);
    }

    // Amount range
    if (filters.minAmount !== undefined) {
      result = result.filter((e) => e.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      result = result.filter((e) => e.amount <= filters.maxAmount!);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'DATE_ASC':
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.createdAt.localeCompare(b.createdAt);
        case 'AMOUNT_DESC':
          return b.amount - a.amount;
        case 'AMOUNT_ASC':
          return a.amount - b.amount;
        case 'DATE_DESC':
        default:
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return result;
  }, [expenses, search, filters, sortBy, categories]);

  // Group by date for SectionList
  const sections = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const formatDateHeading = (dateStr: string) => {
      if (dateStr === today) return 'Today';
      if (dateStr === yesterday) return 'Yesterday';
      try {
        const parts = dateStr.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-IN', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      } catch {
        return dateStr;
      }
    };

    const grouped: { [key: string]: Expense[] } = {};
    for (const exp of filteredExpenses) {
      if (!grouped[exp.date]) {
        grouped[exp.date] = [];
      }
      grouped[exp.date].push(exp);
    }

    return Object.keys(grouped).map((dateKey) => ({
      title: formatDateHeading(dateKey),
      data: grouped[dateKey],
    }));
  }, [filteredExpenses]);

  const toggleSort = () => {
    setSortBy((prev) => {
      if (prev === 'DATE_DESC') return 'AMOUNT_DESC';
      if (prev === 'AMOUNT_DESC') return 'AMOUNT_ASC';
      if (prev === 'AMOUNT_ASC') return 'DATE_ASC';
      return 'DATE_DESC';
    });
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'AMOUNT_DESC':
        return 'Highest amount';
      case 'AMOUNT_ASC':
        return 'Lowest amount';
      case 'DATE_ASC':
        return 'Oldest first';
      case 'DATE_DESC':
      default:
        return 'Newest first';
    }
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearch('');
  };

  const selectedCategoryName = categories.find((c) => c.id === filters.categoryId)?.name;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { paddingHorizontal: spacing.lg }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: spacing.md }]}>
          <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
            Transactions
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {filteredExpenses.length} record{filteredExpenses.length === 1 ? '' : 's'}
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <Search size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search by note or category..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[
              styles.input,
              typography.bodyMedium,
              { color: colors.textPrimary, marginLeft: spacing.sm },
            ]}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter / Sort Bar */}
        <View style={[styles.filterBar, { marginTop: spacing.md, gap: spacing.sm }]}>
          {/* Filters Button with Badge */}
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={[
              styles.filterButton,
              {
                backgroundColor: activeFilterCount > 0 ? `${colors.primary}18` : colors.card,
                borderColor: activeFilterCount > 0 ? colors.primary : colors.cardBorder,
                borderRadius: borderRadius.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: 7,
              },
            ]}
          >
            <SlidersHorizontal
              size={14}
              color={activeFilterCount > 0 ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: activeFilterCount > 0 ? colors.primary : colors.textSecondary,
                  fontWeight: activeFilterCount > 0 ? '700' : '500',
                  marginLeft: 6,
                },
              ]}
            >
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity
            onPress={toggleSort}
            style={[
              styles.sortButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderRadius: borderRadius.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: 7,
              },
            ]}
          >
            <ArrowDownUp size={14} color={colors.textSecondary} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 6 }]}>
              {getSortLabel()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips (PRD Section 18) */}
        {(activeFilterCount > 0 || search) && (
          <View style={[styles.activeChipsRow, { gap: spacing.xs, marginTop: spacing.sm }]}>
            {filters.paymentMethod && (
              <View
                style={[
                  styles.activeChip,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, borderRadius: borderRadius.full },
                ]}
              >
                <Text style={[typography.caption, { color: colors.textPrimary }]}>
                  {filters.paymentMethod}
                </Text>
                <TouchableOpacity onPress={() => setFilters((f) => ({ ...f, paymentMethod: undefined }))}>
                  <X size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}

            {selectedCategoryName && (
              <View
                style={[
                  styles.activeChip,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, borderRadius: borderRadius.full },
                ]}
              >
                <Text style={[typography.caption, { color: colors.textPrimary }]}>
                  {selectedCategoryName}
                </Text>
                <TouchableOpacity onPress={() => setFilters((f) => ({ ...f, categoryId: undefined }))}>
                  <X size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}

            {(filters.startDate || filters.endDate) && (
              <View
                style={[
                  styles.activeChip,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, borderRadius: borderRadius.full },
                ]}
              >
                <Text style={[typography.caption, { color: colors.textPrimary }]}>
                  {filters.startDate || '...'} → {filters.endDate || '...'}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters((f) => ({ ...f, startDate: undefined, endDate: undefined }))}
                >
                  <X size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}

            {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
              <View
                style={[
                  styles.activeChip,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder, borderRadius: borderRadius.full },
                ]}
              >
                <Text style={[typography.caption, { color: colors.textPrimary }]}>
                  {filters.minAmount ? formatINR(filters.minAmount) : '₹0'} -{' '}
                  {filters.maxAmount ? formatINR(filters.maxAmount) : '∞'}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters((f) => ({ ...f, minAmount: undefined, maxAmount: undefined }))}
                >
                  <X size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllBtn}>
              <Text style={[typography.caption, { color: colors.danger, fontWeight: '700' }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Date Grouped Section List */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => loadExpenses()}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[styles.listContent, { paddingVertical: spacing.md }]}
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textSecondary,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              onPress={(exp) => router.push(`/expense/${exp.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
                {activeFilterCount > 0 || search
                  ? 'No expenses match your filters'
                  : 'No transactions found'}
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
                ]}
              >
                {activeFilterCount > 0 || search
                  ? 'Try broadening your search or clearing active filters.'
                  : 'Start tracking your spending by adding your first expense.'}
              </Text>

              {activeFilterCount > 0 || search ? (
                <TouchableOpacity
                  onPress={clearAllFilters}
                  style={[
                    styles.clearFiltersBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: borderRadius.md,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      marginTop: spacing.lg,
                    },
                  ]}
                >
                  <RotateCcw size={16} color={colors.primaryText} />
                  <Text style={[typography.button, { color: colors.primaryText, marginLeft: 8 }]}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />

        {/* Filter Modal */}
        <FilterModal
          visible={showFilterModal}
          filters={filters}
          onClose={() => setShowFilterModal(false)}
          onApply={(newFilters) => setFilters(newFilters)}
          onClear={() => setFilters({})}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  activeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
