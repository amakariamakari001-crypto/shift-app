import { EXCLUDED_FROM_DAILY } from './constants';
import type { StaffRowData, StaffAggregation } from './types';

export function computeMaruCount(staffRows: StaffRowData[], dateKey: string): number {
  return staffRows.reduce((sum, row) => {
    return row.cells[dateKey] === '〇' ? sum + 1 : sum;
  }, 0);
}

export function computeDailyCount(staffRows: StaffRowData[], dateKey: string): number {
  return staffRows.reduce((sum, row) => {
    const val = row.cells[dateKey] ?? '';
    if (EXCLUDED_FROM_DAILY.has(val)) return sum;
    return sum + 1;
  }, 0);
}

export function computeStaffAggregation(row: StaffRowData): StaffAggregation {
  const values = Object.values(row.cells);
  const kyuCount  = values.filter(v => v === '休' || v === '振休' || v === '有給').length;
  const maruCount = values.filter(v => v === '〇').length;
  const furiCount = values.filter(v => v === '振休').length;
  return {
    staffId: row.id,
    kyuCount,
    special: maruCount - furiCount,
  };
}

export function formatCount(n: number): string {
  if (n === 0) return '';
  return n % 1 === 0 ? String(n) : String(n);
}
