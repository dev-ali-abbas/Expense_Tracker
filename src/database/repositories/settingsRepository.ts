import { getDatabase } from '../database';

interface SettingRow {
  key: string;
  value: string;
}

export class SettingsRepository {
  async get(key: string, defaultValue = ''): Promise<string> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SettingRow>(
      'SELECT value FROM settings WHERE key = ?;',
      [key]
    );
    return row ? row.value : defaultValue;
  }

  async set(key: string, value: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
      [key, value]
    );
  }

  async getAll(): Promise<Record<string, string>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SettingRow>('SELECT * FROM settings;');
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }
}

export const settingsRepository = new SettingsRepository();
