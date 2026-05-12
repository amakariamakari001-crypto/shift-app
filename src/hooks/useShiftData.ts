'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LOCAL_STORAGE_KEY, STAFF_ROW_COUNT } from '@/lib/constants';
import { decodeFromUrl } from '@/lib/encoding';
import type { ShiftData, CellValue, StaffRowData } from '@/lib/types';

const MAX_HISTORY = 100;

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

  // 履歴管理
  const historyRef = useRef<ShiftData[]>([]);
  const historyIdxRef = useRef<number>(-1);
  const skipHistoryRef = useRef<boolean>(false);

  // 初回データを履歴に積む
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      historyRef.current = [shiftData];
      historyIdxRef.current = 0;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveToStorage(storageKey, shiftData), 300);
    return () => clearTimeout(timer);
  }, [storageKey, shiftData]);

  // 履歴付きsetShiftData
  const update = useCallback((updater: ((prev: ShiftData) => ShiftData) | ShiftData) => {
    setShiftData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!skipHistoryRef.current) {
        const sliced = historyRef.current.slice(0, historyIdxRef.current + 1);
        sliced.push(next);
        if (sliced.length > MAX_HISTORY) sliced.shift();
        historyRef.current = sliced;
        historyIdxRef.current = historyRef.current.length - 1;
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyIdxRef.current > 0) {
      historyIdxRef.current--;
      skipHistoryRef.current = true;
      setShiftData(historyRef.current[historyIdxRef.current]);
      skipHistoryRef.current = false;
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current < historyRef.current.length - 1) {
      historyIdxRef.current++;
      skipHistoryRef.current = true;
      setShiftData(historyRef.current[historyIdxRef.current]);
      skipHistoryRef.current = false;
    }
  }, []);

  const setYearMonth = useCallback((ym: string) => {
    update(prev => ({ ...prev, yearMonth: ym }));
  }, [update]);

  const setFreeRowName = useCallback((name: string) => {
    update(prev => ({ ...prev, freeRowName: name }));
  }, [update]);

  const clearFreeRow = useCallback(() => {
    update(prev => ({ ...prev, freeRowName: '自由記述', freeTextRow: { cells: {} } }));
  }, [update]);

  const clearFreeRowCells = useCallback(() => {
    update(prev => ({ ...prev, freeTextRow: { cells: {} } }));
  }, [update]);

  const setCellValue = useCallback(
    (rowId: string | 'free', dateKey: string, value: CellValue) => {
      update(prev => {
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
    [update]
  );

  const setStaffName = useCallback((staffId: string, name: string) => {
    update(prev => ({
      ...prev,
      staffRows: prev.staffRows.map(row =>
        row.id === staffId ? { ...row, name } : row
      ),
    }));
  }, [update]);

  const addStaffRow = useCallback(() => {
    update(prev => ({
      ...prev,
      staffRows: [
        ...prev.staffRows,
        { id: crypto.randomUUID(), name: `スタッフ${prev.staffRows.length + 1}`, cells: {} },
      ],
    }));
  }, [update]);

  const removeStaffRow = useCallback((staffId: string) => {
    update(prev => ({
      ...prev,
      staffRows: prev.staffRows.filter(r => r.id !== staffId),
    }));
  }, [update]);

  const clearStaffCells = useCallback((staffId: string) => {
    update(prev => ({
      ...prev,
      staffRows: prev.staffRows.map(r =>
        r.id === staffId ? { ...r, cells: {} } : r
      ),
    }));
  }, [update]);

  const clearDateColumn = useCallback((dateKey: string) => {
    update(prev => ({
      ...prev,
      freeTextRow: {
        cells: { ...prev.freeTextRow.cells, [dateKey]: '' },
      },
      staffRows: prev.staffRows.map(r => ({
        ...r,
        cells: { ...r.cells, [dateKey]: '' },
      })),
    }));
  }, [update]);

  const insertStaffRowAt = useCallback((row: StaffRowData, index: number) => {
    update(prev => {
      const rows = [...prev.staffRows];
      rows.splice(Math.min(index, rows.length), 0, { ...row });
      return { ...prev, staffRows: rows };
    });
  }, [update]);

  const setCountRowName = useCallback((name: string) => {
    update(prev => ({ ...prev, countRowName: name }));
  }, [update]);

  const reorderStaffRows = useCallback((fromIndex: number, toIndex: number) => {
    update(prev => {
      const rows = [...prev.staffRows];
      const [moved] = rows.splice(fromIndex, 1);
      const insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex;
      rows.splice(insertAt, 0, moved);
      return { ...prev, staffRows: rows };
    });
  }, [update]);

  const reorderAll = useCallback((fromIndex: number, toIndex: number) => {
    update(prev => {
      const freeIdx = prev.freeRowIndex ?? 0;
      const ids: string[] = [];
      prev.staffRows.slice(0, freeIdx).forEach(r => ids.push(r.id));
      ids.push('free');
      prev.staffRows.slice(freeIdx).forEach(r => ids.push(r.id));
      const [moved] = ids.splice(fromIndex, 1);
      const insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex;
      ids.splice(insertAt, 0, moved);
      const newFreeIdx = ids.indexOf('free');
      const staffMap = new Map(prev.staffRows.map(r => [r.id, r]));
      const newStaffRows = ids.filter(id => id !== 'free').map(id => staffMap.get(id)!);
      return { ...prev, freeRowIndex: newFreeIdx, staffRows: newStaffRows };
    });
  }, [update]);

  const loadData = useCallback((data: ShiftData) => {
    update(data);
  }, [update]);

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
    undo,
    redo,
  };
}
