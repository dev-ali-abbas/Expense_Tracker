import { describe, test, expect } from '@jest/globals';
import { getDateRangeForPreset } from '../dateFilters';

describe('Date Filter Presets (PRD Section 18)', () => {
  // Use a fixed reference date: September 17, 2026 (Thursday)
  const fixedDate = new Date(2026, 8, 17); // Month index 8 = September

  test('TODAY returns September 17, 2026', () => {
    const range = getDateRangeForPreset('TODAY', fixedDate);
    expect(range.startDate).toBe('2026-09-17');
    expect(range.endDate).toBe('2026-09-17');
  });

  test('YESTERDAY returns September 16, 2026', () => {
    const range = getDateRangeForPreset('YESTERDAY', fixedDate);
    expect(range.startDate).toBe('2026-09-16');
    expect(range.endDate).toBe('2026-09-16');
  });

  test('THIS_WEEK returns Monday (Sep 14) to today (Sep 17)', () => {
    const range = getDateRangeForPreset('THIS_WEEK', fixedDate);
    expect(range.startDate).toBe('2026-09-14');
    expect(range.endDate).toBe('2026-09-17');
  });

  test('THIS_MONTH returns Sep 01 to Sep 30, 2026', () => {
    const range = getDateRangeForPreset('THIS_MONTH', fixedDate);
    expect(range.startDate).toBe('2026-09-01');
    expect(range.endDate).toBe('2026-09-30');
  });

  test('LAST_MONTH returns Aug 01 to Aug 31, 2026', () => {
    const range = getDateRangeForPreset('LAST_MONTH', fixedDate);
    expect(range.startDate).toBe('2026-08-01');
    expect(range.endDate).toBe('2026-08-31');
  });

  test('ALL returns empty range', () => {
    const range = getDateRangeForPreset('ALL', fixedDate);
    expect(range.startDate).toBeUndefined();
    expect(range.endDate).toBeUndefined();
  });
});
