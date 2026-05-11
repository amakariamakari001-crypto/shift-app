'use client';

import { useMemo } from 'react';
import * as holiday_jp from '@holiday-jp/holiday_jp';
import type { DateColumn } from '@/lib/types';

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useDateRange(yearMonth: string): DateColumn[] {
  return useMemo(() => {
    const [year, month] = yearMonth.split('-').map(Number);

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear  = month === 12 ? year + 1 : year;

    const start = new Date(year, month - 1, 16);
    const end   = new Date(nextYear, nextMonth - 1, 15);

    const holidays = holiday_jp.between(start, end);
    const holidayMap = new Map<string, string>();
    for (const h of holidays) {
      holidayMap.set(toDateKey(h.date), h.name);
    }

    const columns: DateColumn[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const dateKey = toDateKey(cursor);
      columns.push({
        date: new Date(cursor),
        dateKey,
        dayOfWeek: cursor.getDay(),
        isHoliday: holidayMap.has(dateKey),
        holidayName: holidayMap.get(dateKey) ?? null,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return columns;
  }, [yearMonth]);
}

export function isWeekday(col: DateColumn): boolean {
  return col.dayOfWeek >= 1 && col.dayOfWeek <= 5 && !col.isHoliday;
}

export function getCellBgColor(col: DateColumn): string {
  if (col.isHoliday)       return '#fef2f2';
  if (col.dayOfWeek === 0) return '#f0fdf4';
  if (col.dayOfWeek === 6) return '#fefce8';
  return '';
}
