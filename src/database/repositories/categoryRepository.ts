import { getDatabase } from '../database';
import { Category } from '../../shared/types/models';

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: number;
  created_at: string;
  updated_at: string;
}

function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CategoryRepository {
  async getAll(): Promise<Category[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<CategoryRow>(
      'SELECT * FROM categories ORDER BY name ASC;'
    );
    return rows.map(mapRowToCategory);
  }

  async getById(id: string): Promise<Category | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<CategoryRow>(
      'SELECT * FROM categories WHERE id = ?;',
      [id]
    );
    return row ? mapRowToCategory(row) : null;
  }

  async create(category: Omit<Category, 'createdAt' | 'updatedAt'>): Promise<Category> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO categories (id, name, icon, color, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        category.id,
        category.name,
        category.icon,
        category.color,
        category.isDefault ? 1 : 0,
        now,
        now,
      ]
    );

    return {
      ...category,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(category: Partial<Category> & { id: string }): Promise<Category> {
    const db = await getDatabase();
    const existing = await this.getById(category.id);
    if (!existing) {
      throw new Error(`Category with ID ${category.id} not found`);
    }

    const updated: Category = {
      ...existing,
      ...category,
      updatedAt: new Date().toISOString(),
    };

    await db.runAsync(
      `UPDATE categories
       SET name = ?, icon = ?, color = ?, updated_at = ?
       WHERE id = ?;`,
      [updated.name, updated.icon, updated.color, updated.updatedAt, updated.id]
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();

    // PRD Section 7 rule: Do not allow deletion if transactions depend on it
    const expenseCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM expenses WHERE category_id = ?;',
      [id]
    );

    if (expenseCount && expenseCount.count > 0) {
      throw new Error(
        `Cannot delete category. There are ${expenseCount.count} expense(s) linked to it.`
      );
    }

    await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
  }
}

export const categoryRepository = new CategoryRepository();
