import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { CREATE_TABLES_SQL } from './schema';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './seed';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await SQLite.openDatabaseAsync('expense_tracker.db');
  dbInstance = db;
  return db;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();

  // Enable WAL and Foreign Keys for safety and performance
  await db.execAsync('PRAGMA foreign_keys = ON;');
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }

  // Execute Table and Index Creation
  await db.execAsync(CREATE_TABLES_SQL);

  // Check and Seed Default Categories if empty
  const categoryCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories;'
  );

  if (!categoryCount || categoryCount.count === 0) {
    const now = new Date().toISOString();
    for (const cat of DEFAULT_CATEGORIES) {
      await db.runAsync(
        `INSERT INTO categories (id, name, icon, color, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [cat.id, cat.name, cat.icon, cat.color, cat.isDefault ? 1 : 0, now, now]
      );
    }
  }

  // Check and Seed Default Settings if empty
  const settingsCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM settings;'
  );

  if (!settingsCount || settingsCount.count === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);`,
        [key, value]
      );
    }
  }
}
