import { create } from 'zustand';
import { Category } from '../../../shared/types/models';
import { categoryRepository } from '../../../database/repositories/categoryRepository';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  loadCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (category: Partial<Category> & { id: string }) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryRepository.getAll();
      set({ categories, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load categories',
        isLoading: false,
      });
    }
  },

  addCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoryRepository.create(categoryData);
      set((state) => ({
        categories: [...state.categories, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));
      return newCategory;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add category',
        isLoading: false,
      });
      throw err;
    }
  },

  updateCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await categoryRepository.update(categoryData);
      set((state) => ({
        categories: state.categories
          .map((c) => (c.id === updated.id ? updated : c))
          .sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update category',
        isLoading: false,
      });
      throw err;
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await categoryRepository.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete category',
        isLoading: false,
      });
      throw err;
    }
  },

  getCategoryById: (id: string) => {
    return get().categories.find((c) => c.id === id);
  },
}));
