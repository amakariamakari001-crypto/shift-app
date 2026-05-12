import type { PresetValue } from './types';

export const STAFF_ROW_COUNT = 22;
export const EDIT_KEY = 'shift2025';
export const MAX_FREE_TEXT_LENGTH = 4;
export const LOCAL_STORAGE_KEY = 'shift-app-v1';

export const PRESET_VALUES: PresetValue[] = ['〇', '休', '振休', '有給', '半休', '回', 'ビニール'];

export const RED_TEXT_VALUES = new Set<string>(['休', '振休', '有給', '半休']);

export const VALUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '〇':    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  '休':    { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  '振休':  { bg: '#fff1f2', text: '#e11d48', border: '#fda4af' },
  '有給':  { bg: '#fce7f3', text: '#be185d', border: '#f9a8d4' },
  '半休':  { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' },
  '回':    { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  'ビニール': { bg: '#f5f3ff', text: '#7c3aed', border: '#c4b5fd' },
};

export const EXCLUDED_FROM_DAILY = new Set<string>(['休', '振休', '有給', '半休']);

export const DAY_COLORS = {
  saturday: '#fefce8',
  sunday:   '#f0fdf4',
  holiday:  '#fef2f2',
} as const;

export const DAY_OF_WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
