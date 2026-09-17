export type DatePreset =
  | 'ALL'
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'CUSTOM';

export interface DateRange {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Computes start and end dates (YYYY-MM-DD) for a given DatePreset.
 */
export function getDateRangeForPreset(preset: DatePreset, referenceDate = new Date()): DateRange {
  const ref = new Date(referenceDate);

  switch (preset) {
    case 'TODAY': {
      const todayStr = formatDate(ref);
      return { startDate: todayStr, endDate: todayStr };
    }
    case 'YESTERDAY': {
      const yest = new Date(ref);
      yest.setDate(yest.getDate() - 1);
      const yestStr = formatDate(yest);
      return { startDate: yestStr, endDate: yestStr };
    }
    case 'THIS_WEEK': {
      // Monday as start of week
      const d = new Date(ref);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(d.setDate(diff));
      return { startDate: formatDate(monday), endDate: formatDate(ref) };
    }
    case 'THIS_MONTH': {
      const firstDay = new Date(ref.getFullYear(), ref.getMonth(), 1);
      const lastDay = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
      return { startDate: formatDate(firstDay), endDate: formatDate(lastDay) };
    }
    case 'LAST_MONTH': {
      const firstDay = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
      const lastDay = new Date(ref.getFullYear(), ref.getMonth(), 0);
      return { startDate: formatDate(firstDay), endDate: formatDate(lastDay) };
    }
    case 'ALL':
    case 'CUSTOM':
    default:
      return {};
  }
}
