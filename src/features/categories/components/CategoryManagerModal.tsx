import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { X, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useCategoryStore } from '../store/categoryStore';
import { CategoryIcon } from '@/shared/components/CategoryIcon';
import { Category } from '@/shared/types/models';

interface CategoryManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

const AVAILABLE_COLORS = [
  '#F97316', '#10B981', '#EC4899', '#3B82F6',
  '#EF4444', '#8B5CF6', '#A855F7', '#14B8A6',
  '#F59E0B', '#06B6D4', '#6366F1', '#0EA5E9',
  '#D946EF', '#64748B',
];

const AVAILABLE_ICONS = [
  'Utensils', 'ShoppingCart', 'ShoppingBag', 'Car',
  'Fuel', 'Receipt', 'Film', 'HeartPulse',
  'GraduationCap', 'Plane', 'Home', 'Smartphone',
  'User', 'MoreHorizontal',
];

export function CategoryManagerModal({ visible, onClose }: CategoryManagerModalProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const categories = useCategoryStore((s) => s.categories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartCreate = () => {
    setEditingCategory(null);
    setNameInput('');
    setSelectedColor(AVAILABLE_COLORS[0]);
    setSelectedIcon(AVAILABLE_ICONS[0]);
    setErrorMessage(null);
    setIsCreating(true);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setSelectedColor(cat.color);
    setSelectedIcon(cat.icon);
    setErrorMessage(null);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!nameInput.trim()) {
      setErrorMessage('Category name cannot be empty');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          name: nameInput.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      } else {
        const id = `cat-${Date.now()}`;
        await addCategory({
          id,
          name: nameInput.trim(),
          color: selectedColor,
          icon: selectedIcon,
          isDefault: false,
        });
      }
      setIsCreating(false);
      setEditingCategory(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteCategory(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cannot delete category';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Cannot Delete Category', msg);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
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
              Manage Categories
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: `${colors.danger}15`,
                  borderColor: `${colors.danger}30`,
                  padding: spacing.md,
                  margin: spacing.md,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <AlertCircle size={18} color={colors.danger} />
              <Text style={[typography.caption, { color: colors.danger, marginLeft: 8, flex: 1 }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {isCreating ? (
            /* Add / Edit Form */
            <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </Text>

              {/* Name Input */}
              <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 4 }]}>
                Name
              </Text>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Category Name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
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

              {/* Icon Picker */}
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: 6 }]}>
                Select Icon
              </Text>
              <View style={[styles.pickerGrid, { gap: spacing.sm }]}>
                {AVAILABLE_ICONS.map((iconName) => {
                  const isSelected = selectedIcon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      onPress={() => setSelectedIcon(iconName)}
                      style={[
                        styles.pickerItem,
                        {
                          borderColor: isSelected ? selectedColor : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                          borderRadius: borderRadius.md,
                          padding: 6,
                          backgroundColor: colors.card,
                        },
                      ]}
                    >
                      <CategoryIcon
                        icon={iconName}
                        color={isSelected ? selectedColor : colors.textMuted}
                        size={20}
                        containerSize={36}
                        backgroundColor="transparent"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Color Picker */}
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: 6 }]}>
                Select Color
              </Text>
              <View style={[styles.pickerGrid, { gap: spacing.sm }]}>
                {AVAILABLE_COLORS.map((hex) => {
                  const isSelected = selectedColor === hex;
                  return (
                    <TouchableOpacity
                      key={hex}
                      onPress={() => setSelectedColor(hex)}
                      style={[
                        styles.colorItem,
                        {
                          backgroundColor: hex,
                          borderWidth: isSelected ? 3 : 0,
                          borderColor: colors.textPrimary,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Form Buttons */}
              <View style={[styles.formActionRow, { marginTop: spacing.xl, gap: spacing.md }]}>
                <TouchableOpacity
                  onPress={() => setIsCreating(false)}
                  style={[
                    styles.formBtn,
                    { backgroundColor: colors.surfaceSubtle, borderRadius: borderRadius.md },
                  ]}
                >
                  <Text style={[typography.button, { color: colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={[
                    styles.formBtn,
                    { backgroundColor: colors.primary, borderRadius: borderRadius.md, flex: 1 },
                  ]}
                >
                  <Text style={[typography.button, { color: colors.primaryText }]}>Save Category</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            /* Categories List */
            <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
              <TouchableOpacity
                onPress={handleStartCreate}
                style={[
                  styles.addBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                <Plus size={18} color={colors.primaryText} />
                <Text style={[typography.button, { color: colors.primaryText, marginLeft: 8 }]}>
                  Add New Category
                </Text>
              </TouchableOpacity>

              <View style={{ gap: spacing.xs }}>
                {categories.map((cat) => (
                  <View
                    key={cat.id}
                    style={[
                      styles.catRow,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                      },
                    ]}
                  >
                    <CategoryIcon icon={cat.icon} color={cat.color} size={18} containerSize={36} />
                    <Text
                      numberOfLines={1}
                      style={[
                        typography.bodyMedium,
                        { color: colors.textPrimary, fontWeight: '600', marginLeft: spacing.md, flex: 1 },
                      ]}
                    >
                      {cat.name}
                    </Text>

                    <View style={styles.catActions}>
                      <TouchableOpacity
                        onPress={() => handleStartEdit(cat)}
                        style={[styles.actionIconBtn, { backgroundColor: colors.surfaceSubtle, marginRight: 6 }]}
                      >
                        <Edit2 size={16} color={colors.textSecondary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(cat.id, cat.name)}
                        style={[styles.actionIconBtn, { backgroundColor: `${colors.danger}15` }]}
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerItem: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  formActionRow: {
    flexDirection: 'row',
  },
  formBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  catActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
