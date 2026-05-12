'use client';

import { useCallback, useEffect, useState } from 'react';
import { useShiftData } from '@/hooks/useShiftData';
import { useDateRange } from '@/hooks/useDateRange';
import ShiftGrid from './ShiftGrid';
import Toolbar from './Toolbar';
import InputModal from './InputModal';
import { dragBridge } from '@/lib/dragBridge';
import { EDIT_KEY } from '@/lib/constants';
import type { CellValue, DateColumn, ModalState } from '@/lib/types';

const CLOSED_MODAL: ModalState = {
  isOpen: false,
  rowId: 'free',
  dateKey: '',
  dateColumn: null,
  currentValue: '',
  anchorRect: null,
};

function ShiftSection({
  storageKey,
  staffRowOnly,
  maruOnly,
  noWeekdayRestriction,
  isReadOnly,
}: {
  storageKey: string;
  staffRowOnly?: boolean;
  maruOnly?: boolean;
  noWeekdayRestriction?: boolean;
  isReadOnly?: boolean;
}) {
  const {
    shiftData, setYearMonth, setCellValue,
    setStaffName, setFreeRowName, clearFreeRow, clearFreeRowCells, setCountRowName,
    addStaffRow, removeStaffRow,
    clearStaffCells, clearDateColumn, insertStaffRowAt, reorderAll, reorderStaffRows, loadData,
  } = useShiftData(storageKey);

  useEffect(() => {
    dragBridge.register(storageKey, removeStaffRow, insertStaffRowAt);
  }, [storageKey, removeStaffRow, insertStaffRowAt]);

  const dateColumns = useDateRange(shiftData.yearMonth);
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);

  const openModal = useCallback(
    (rowId: string | 'free', dateKey: string, dateColumn: DateColumn, currentValue: CellValue) => {
      if (isReadOnly) return;
      setModal({ isOpen: true, rowId, dateKey, dateColumn, currentValue, anchorRect: null });
    },
    [isReadOnly]
  );

  const handleModalSelect = useCallback(
    (value: CellValue) => {
      setCellValue(modal.rowId, modal.dateKey, value);
      setModal(CLOSED_MODAL);
    },
    [modal.rowId, modal.dateKey, setCellValue]
  );

  const closeModal = useCallback(() => setModal(CLOSED_MODAL), []);

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {!staffRowOnly && (
        <Toolbar
          yearMonth={shiftData.yearMonth}
          onYearMonthChange={isReadOnly ? undefined : setYearMonth}
          shiftData={shiftData}
          onAddStaff={isReadOnly ? undefined : addStaffRow}
          isReadOnly={isReadOnly}
        />
      )}

      <div className="overflow-hidden p-2">
        <ShiftGrid
          storageKey={storageKey}
          dateColumns={dateColumns}
          freeRowName={shiftData.freeRowName ?? '自由記述'}
          freeRowIndex={shiftData.freeRowIndex ?? 0}
          countRowName={shiftData.countRowName ?? '〇カウント'}
          freeTextRow={shiftData.freeTextRow}
          staffRows={shiftData.staffRows}
          staffRowOnly={staffRowOnly}
          isReadOnly={isReadOnly}
          onOpenModal={openModal}
          onFreeRowNameChange={isReadOnly ? () => {} : setFreeRowName}
          onDeleteFreeRow={isReadOnly || staffRowOnly ? undefined : clearFreeRow}
          onClearFreeRow={isReadOnly || staffRowOnly ? undefined : clearFreeRowCells}
          onCountRowNameChange={isReadOnly ? undefined : setCountRowName}
          onNameChange={isReadOnly ? () => {} : setStaffName}
          onDeleteStaff={isReadOnly ? () => {} : removeStaffRow}
          onClearStaff={isReadOnly ? () => {} : clearStaffCells}
          onClearDate={isReadOnly ? () => {} : clearDateColumn}
          onReorder={isReadOnly ? () => {} : (staffRowOnly ? reorderStaffRows : reorderAll)}
        />
      </div>

      <InputModal
        modal={modal}
        onSelect={handleModalSelect}
        onClose={closeModal}
        maruOnly={maruOnly}
        noWeekdayRestriction={noWeekdayRestriction}
      />
    </div>
  );
}

export default function ShiftApp() {
  const [isReadOnly, setIsReadOnly] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    setIsReadOnly(key !== EDIT_KEY);
  }, []);

  useEffect(() => {
    const beforePrint = () => {
      const grid = document.getElementById('shift-grid');
      if (!grid) return;
      const savedMaxHeight = grid.style.maxHeight;
      const savedOverflow = grid.style.overflow;
      grid.style.maxHeight = 'none';
      grid.style.overflow = 'visible';
      const w = grid.scrollWidth;
      grid.style.maxHeight = savedMaxHeight;
      grid.style.overflow = savedOverflow;
      const printWidthPx = (297 - 20) * (96 / 25.4);
      const scale = Math.min(1, printWidthPx / w);
      let el = document.getElementById('__print_scale__') as HTMLStyleElement | null;
      if (!el) { el = document.createElement('style'); el.id = '__print_scale__'; document.head.appendChild(el); }
      el.textContent = scale < 1 ? `@media print { html { zoom: ${scale.toFixed(4)}; } }` : '';
    };
    const afterPrint = () => { document.getElementById('__print_scale__')?.remove(); };
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => { window.removeEventListener('beforeprint', beforePrint); window.removeEventListener('afterprint', afterPrint); };
  }, []);

  return (
    <div className="bg-gray-50 overflow-auto min-h-screen">
      {isReadOnly && (
        <div className="no-print fixed top-2 right-2 z-50 bg-gray-700 text-white text-xs px-3 py-1 rounded-full opacity-70">
          閲覧モード
        </div>
      )}
      <div className="border-b-4 border-gray-300">
        <ShiftSection storageKey="shift-app-v1" isReadOnly={isReadOnly} />
      </div>
      <div>
        <ShiftSection storageKey="shift-app-v2" staffRowOnly maruOnly noWeekdayRestriction isReadOnly={isReadOnly} />
      </div>
    </div>
  );
}
