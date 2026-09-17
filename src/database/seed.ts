import { Category } from '../shared/types/models';

export const DEFAULT_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  { id: 'cat-food', name: 'Food', icon: 'Utensils', color: '#F97316', isDefault: true },
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#10B981', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', isDefault: true },
  { id: 'cat-transport', name: 'Transport', icon: 'Car', color: '#3B82F6', isDefault: true },
  { id: 'cat-fuel', name: 'Fuel', icon: 'Fuel', color: '#EF4444', isDefault: true },
  { id: 'cat-bills', name: 'Bills', icon: 'Receipt', color: '#8B5CF6', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#A855F7', isDefault: true },
  { id: 'cat-health', name: 'Health', icon: 'HeartPulse', color: '#14B8A6', isDefault: true },
  { id: 'cat-education', name: 'Education', icon: 'GraduationCap', color: '#F59E0B', isDefault: true },
  { id: 'cat-travel', name: 'Travel', icon: 'Plane', color: '#06B6D4', isDefault: true },
  { id: 'cat-rent', name: 'Rent', icon: 'Home', color: '#6366F1', isDefault: true },
  { id: 'cat-recharge', name: 'Recharge', icon: 'Smartphone', color: '#0EA5E9', isDefault: true },
  { id: 'cat-personal', name: 'Personal', icon: 'User', color: '#D946EF', isDefault: true },
  { id: 'cat-other', name: 'Other', icon: 'MoreHorizontal', color: '#64748B', isDefault: true },
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  currency: 'INR',
  default_payment_method: 'UPI',
  theme: 'system',
};
