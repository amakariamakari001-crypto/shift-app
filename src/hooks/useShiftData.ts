'use client';

import { useState, useEffect, useCallback } from 'react';
import { LOCAL_STORAGE_KEY, STAFF_ROW_COUNT } from '@/lib/constants';
import { decodeFromUrl } from '@/lib/encoding';
import type { ShiftData, CellValue, StaffRowData } from '@/lib/types';

function makeDefaultState(yearMonth: string): ShiftData {
  return {
    yearMonth,
    freeRowName: '自由記述',
    freeTextRow: { cells: {} },
    staffRows: Array.from({ length: STAFF_ROW_COUNT }, (_, i) => ({
      id: `staff-${i + 1}`,
      name: `スタッフ${i + 1}`,
      cells: {},
    })),
  };
}

function loadFromStorage(key: string): ShiftData | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ShiftData) : null;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, data: ShiftData): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota exceeded — silently fail */
  }
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function useShiftData(storageKey: string = LOCAL_STORAGE_KEY) {
  const [shiftData, setShiftData] = useState<ShiftData>(() => {
    if (typeof window === 'undefined') return makeDefaultState(currentYearMonth());

    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    if (d && storageKey === LOCAL_STORAGE_KEY) {
      const decoded = decodeFromUrl(d);
      if (decoded) return decoded;
    }

    const stored = loadFromStorage(storageKey);
    if (stored) return stored;

    return makeDefaultState(currentYearMonth());
  });

  useEffect(() => {
    const timer = setTimeout(() => saveToStorage(storageKey, shiftData), 300);
    return () => clearTimeout(timer);
  }, [storageKey, shiftData]);

  const setYearMonth = useCallback((ym: string) => {
    setShiftData(prev => ({ ...prev, yearMonth: ym }));
  }, []);

  const setFreeRowName = useCallback((name: string) => {
    setShiftData(prev => ({ ...prev, freeRowName: name }));
  }, []);

  const clearFreeRow = useCallback(() => {
    setShiftData(prev => ({ ...prev, freeRowName: '自由記述', freeTextRow: { cells: {} } }));
  }, []);

  const clearFreeRowCells = useCallback(() => {
    setShiftData(prev => ({ ...prev, freeTextRow: { cells: {} } }));
  }, []);

  const setCellValue = useCallback(
    (rowId: string | 'free', dateKey: string, value: CellValue) => {
      setShiftData(prev => {
        if (rowId === 'free') {
          return {
            ...prev,
            freeTextRow: { cells: { ...prev.freeTextRow.cells, [dateKey]: value } },
          };
        }
        return {
          ...prev,
          staffRows: prev.staffRows.map(row =>
            row.id === rowId ? { ...row, cells: { ...row.cells, [dateKey]: value } } : row
          ),
        };
      });
    },
    []
  );

  const setStaffName = useCallback((staffId: string, name: string) => {
    setShiftData(prev => ({
      ...prev,
      staffRows: prev.staffRows.map(row =>
        row.id === staffId ? { ...row, name } : row
      ),
    }));
  }, []);

  const addStaffRow = useCallback(() => {
    setShiftData(prev => ({
      ...prev,
      staffRows: [
        ...prev.staffRows,
        { id: crypto.randomUUID(), name: `スタッフ${prev.staffRows.length + 1}`, cells: {} },
      ],
    }));
  }, []);

  const removeStaffRow = useCallback((staffId: string) => {
    setShiftData(prev => ({
      ...prev,
      staffRows: prev.staffRows.filter(r => r.id !== staffId),
    }));
  }, []);

  const clearStaffCells = useCallback((staffId: string) => {
    setShiftData(prev => ({
      ...prev,
      staffRows: prev.staffRows.map(r =>
        r.id === staffId ? { ...r, cells: {} } : r
      ),
    }));
  }, []);

  const clearDateColumn = useCallback((dateKey: string) => {
    setShiftData(prev => ({
      ...prev,
      freeTextRow: {
        cells: { ...prev.freeTextRow.cells, [dateKey]: '' },
      },
      staffRows: prev.staffRows.map(r => ({
        ...r,
        cells: { ...r.cells, [dateKey]: '' },
      })),
    }));
  }, []);

  const insertStaffRowAt = useCallback((row: StaffRowData, index: number) => {
    setShiftData(prev => {
      const rows = [...prev.staffRows];
      rows.splice(Math.min(index, rows.length), 0, { ...row });
      return { ...prev, staffRows: rows };
    });
  }, []);

  const setCountRowName = useCallback((name: string) => {
    setShiftData(prev => ({ ...prev, countRowName: name }));
  }, []);

  const reorderStaffRows = useCallback((fromIndex: number, toIndex: number) => {
    setShiftData(prev => {
      const rows = [...prev.staffRows];
      const [moved] = rows.splice(fromIndex, 1);
      const insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex;
      rows.splice(insertAt, 0, moved);
      return { ...prev, staffRows: rows };
    });
  }, []);

  const reorderAll = useCallback((fromIndex: number, toIndex: number) => {
    setShiftData(prev => {
      const freeIdx = prev.freeRowIndex ?? 0;
      // Build unified ID list: [staffIds...with 'free' inserted at freeIdx]
      const ids: string[] = [];
      prev.staffRows.slice(0, freeIdx).forEach(r => ids.push(r.id));
      ids.push('free');
      prev.staffRows.slice(freeIdx).forEach(r => ids.push(r.id));
      // Move item
      const [moved] = ids.splice(fromIndex, 1);
      const insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex;
      ids.splice(insertAt, 0, moved);
      // Derive new freeRowIndex and staffRows order
      const newFreeIdx = ids.indexOf('free');
      const staffMap = new Map(prev.staffRows.map(r => [r.id, r]));
      const newStaffRows = ids.filter(id => id !== 'free').map(id => staffMap.get(id)!);
      return { ...prev, freeRowIndex: newFreeIdx, staffRows: newStaffRows };
    });
  }, []);

  const loadData = useCallback((data: ShiftData) => {
    setShiftData(data);
  }, []);

  return {
    shiftData,
    setYearMonth,
    setFreeRowName,
    setCellValue,
    setStaffName,
    addStaffRow,
    removeStaffRow,
    clearStaffCells,
    clearDateColumn,
    clearFreeRow,
    clearFreeRowCells,
    insertStaffRowAt,
    setCountRowName,
    reorderStaffRows,
    reorderAll,
    loadData,
  };
}
