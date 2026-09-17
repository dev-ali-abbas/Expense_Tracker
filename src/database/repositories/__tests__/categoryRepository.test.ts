import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { CategoryRepository } from '../categoryRepository';
import * as databaseModule from '../../database';

jest.mock('../../database');

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let mockDb: any;

  beforeEach(() => {
    repository = new CategoryRepository();
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
    };
    (databaseModule.getDatabase as any).mockResolvedValue(mockDb);
  });

  test('getAll maps database rows to Category models', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      {
        id: 'cat-food',
        name: 'Food',
        icon: 'Utensils',
        color: '#F97316',
        is_default: 1,
        created_at: '2026-09-17T10:00:00.000Z',
        updated_at: '2026-09-17T10:00:00.000Z',
      },
    ]);

    const categories = await repository.getAll();
    expect(categories).toHaveLength(1);
    expect(categories[0]).toEqual({
      id: 'cat-food',
      name: 'Food',
      icon: 'Utensils',
      color: '#F97316',
      isDefault: true,
      createdAt: '2026-09-17T10:00:00.000Z',
      updatedAt: '2026-09-17T10:00:00.000Z',
    });
  });

  test('PRD Section 7: prevents deletion of category if transactions depend on it', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 3 });

    await expect(repository.delete('cat-food')).rejects.toThrow(
      'Cannot delete category. There are 3 expense(s) linked to it.'
    );
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  test('allows deletion of category if no transactions depend on it', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 0 });
    mockDb.runAsync.mockResolvedValue({});

    await repository.delete('cat-custom');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM categories WHERE id = ?;',
      ['cat-custom']
    );
  });
});
