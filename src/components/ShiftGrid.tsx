'use client';

import { memo, useRef, useCallback, useMemo, useState, Fragment } from 'react';
import HeaderRow from './HeaderRow';
import StaffRow from './StaffRow';
import AggregationRows from './AggregationRows';
import { computeStaffAggregation, computeMaruCount } from '@/lib/aggregation';
import { dragBridge } from '@/lib/dragBridge';
import type { CellValue, DateColumn, FreeTextRowData, StaffRowData } from '@/lib/types';

interface Props {
  storageKey: string;
  dateColumns: DateColumn[];
  freeRowName: string;
  freeRowIndex?: number;
  countRowName?: string;
  freeTextRow: FreeTextRowData;
  staffRows: StaffRowData[];
  staffRowOnly?: boolean;
  isReadOnly?: boolean;
  onOpenModal: (rowId: string | 'free', dateKey: string, dateColumn: DateColumn, currentValue: CellValue) => void;
  onFreeRowNameChange: (name: string) => void;
  onDeleteFreeRow?: () => void;
  onClearFreeRow?: () => void;
  onCountRowNameChange?: (name: string) => void;
  onNameChange: (staffId: string, name: string) => void;
  onDeleteStaff: (staffId: string) => void;
  onClearStaff: (staffId: string) => void;
  onClearDate: (dateKey: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

type RowItem =
  | { kind: 'free'; uIdx: number }
  | { kind: 'staff'; row: StaffRowData; uIdx: number };

function ShiftGrid({
  storageKey, dateColumns, freeRowName, freeRowIndex, countRowName, freeTextRow,
  staffRows, staffRowOnly, isReadOnly,
  onOpenModal, onFreeRowNameChange, onDeleteFreeRow, onClearFreeRow, onCountRowNameChange, onNameChange,
  onDeleteStaff, onClearStaff, onClearDate, onReorder,
}: Props) {
  const dragSrcIdx = useRef<number>(-1);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [hoveredDateKey, setHoveredDateKey] = useState<string | null>(null);

  const handleDragStart = useCallback((srcIndex: number, rowData: StaffRowData | null) => {
    dragSrcIdx.current = srcIndex;
    if (rowData) dragBridge.startDrag(storageKey, rowData);
  }, [storageKey]);

  const handleDrop = useCallback((targetIndex: number) => {
    setDragOverIdx(null);
    if (targetIndex === -1) {
      dragBridge.endDrag();
      dragSrcIdx.current = -1;
      return;
    }
    // クロステーブル転送を優先
    if (dragBridge.tryTransfer(storageKey, targetIndex)) {
      dragSrcIdx.current = -1;
      return;
    }
    // 同テーブル並べ替え
    if (dragSrcIdx.current !== -1 && dragSrcIdx.current !== targetIndex) {
      onReorder(dragSrcIdx.current, targetIndex);
    }
    dragSrcIdx.current = -1;
  }, [onReorder, storageKey]);

  // tbody フォールバック（行の間や末尾へのドロップ）
  const handleTbodyDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragBridge.tryTransfer(storageKey, staffRows.length)) {
      dragSrcIdx.current = -1;
    }
  }, [storageKey, staffRows.length]);

  const displayRows = useMemo((): RowItem[] => {
    if (staffRowOnly) {
      return staffRows.map((row, i) => ({ kind: 'staff', row, uIdx: i }));
    }
    const freeIdx = Math.min(freeRowIndex ?? 0, staffRows.length);
    const items: RowItem[] = [];
    staffRows.slice(0, freeIdx).forEach((row, i) => items.push({ kind: 'staff', row, uIdx: i }));
    items.push({ kind: 'free', uIdx: freeIdx });
    staffRows.slice(freeIdx).forEach((row, i) => items.push({ kind: 'staff', row, uIdx: freeIdx + 1 + i }));
    return items;
  }, [staffRows, freeRowIndex, staffRowOnly]);

  return (
    <div
      id={staffRowOnly ? 'shift-grid-2' : 'shift-grid'}
      className="shift-grid-scroll overflow-auto border border-gray-300 rounded-lg shadow-sm"
      style={{ maxHeight: staffRowOnly ? undefined : 'calc(100vh - 112px)' }}
      onDragLeave={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverIdx(null);
      }}
    >
      <table className="border-collapse" style={{ borderSpacing: 0, tableLayout: 'fixed' }}>
        {!staffRowOnly && (
          <HeaderRow dateColumns={dateColumns} staffRows={staffRows} onClearDate={onClearDate} isReadOnly={isReadOnly} hoveredDateKey={hoveredDateKey} onDateHover={setHoveredDateKey} />
        )}

        {staffRowOnly && (
          <thead>
            <tr>
              <th
                className="sticky left-0 top-0 z-30 border border-gray-300 overflow-hidden"
                style={{ minWidth: 156, maxWidth: 156, width: 156, height: 36, padding: 0, backgroundColor: '#bbf7d0' }}
              >
                <input
                  type="text"
                  value={countRowName ?? '〇カウント'}
                  onChange={e => onCountRowNameChange?.(e.target.value)}
                  readOnly={isReadOnly}
                  className="w-full h-full text-xs font-semibold text-green-800 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-green-400 px-2"
                  placeholder="〇カウント"
                />
              </th>
              {dateColumns.map(col => {
                const count = computeMaruCount(staffRows, col.dateKey);
                return (
                  <th
                    key={col.dateKey}
                    className="sticky top-0 z-20 border border-gray-300 text-center text-xs font-semibold"
                    style={{
                      backgroundColor: '#bbf7d0',
                      width: 44, minWidth: 44,
                      color: count === 0 ? '#6b7280' : '#15803d',
                    }}
                  >
                    {count === 0 ? '' : count}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}

        <tbody
          onDragOver={e => e.preventDefault()}
          onDrop={handleTbodyDrop}
        >
          {displayRows.map(item => {
            const markerRow = dragOverIdx === item.uIdx ? (
              <tr key={`marker-${item.uIdx}`} style={{ height: 0, pointerEvents: 'none' }}>
                <td colSpan={999} style={{ height: 3, backgroundColor: '#3b82f6', padding: 0, border: 'none' }} />
              </tr>
            ) : null;

            if (item.kind === 'free') {
              return (
                <Fragment key="free-group">
                  {markerRow}
                  <StaffRow
                    rowId="free"
                    index={item.uIdx}
                    name={freeRowName}
                    cells={freeTextRow.cells}
                    dateColumns={dateColumns}
                    isFreeRow
                    isReadOnly={isReadOnly}
                    hoveredDateKey={hoveredDateKey}
                    onOpenModal={onOpenModal}
                    onNameChange={onFreeRowNameChange}
                    onDelete={onDeleteFreeRow}
                    onClear={onClearFreeRow}
                    onDragStart={isReadOnly ? undefined : (idx) => handleDragStart(idx, null)}
                    onDrop={isReadOnly ? undefined : handleDrop}
                    onDragEnter={isReadOnly ? undefined : setDragOverIdx}
                  />
                </Fragment>
              );
            }

            const agg = computeStaffAggregation(item.row);
            return (
              <Fragment key={item.row.id}>
                {markerRow}
                <StaffRow
                  rowId={item.row.id}
                  index={item.uIdx}
                  name={item.row.name}
                  cells={item.row.cells}
                  dateColumns={dateColumns}
                  aggregation={agg}
                  hideAggColumns={staffRowOnly}
                  isReadOnly={isReadOnly}
                  hoveredDateKey={hoveredDateKey}
                  onOpenModal={onOpenModal}
                  onNameChange={name => onNameChange(item.row.id, name)}
                  onDelete={isReadOnly ? undefined : () => onDeleteStaff(item.row.id)}
                  onClear={isReadOnly ? undefined : () => onClearStaff(item.row.id)}
                  onDragStart={isReadOnly ? undefined : (idx) => handleDragStart(idx, item.row)}
                  onDrop={isReadOnly ? undefined : handleDrop}
                  onDragEnter={isReadOnly ? undefined : setDragOverIdx}
                />
              </Fragment>
            );
          })}
        </tbody>

        {!staffRowOnly && (
          <AggregationRows dateColumns={dateColumns} staffRows={staffRows} />
        )}
      </table>
    </div>
  );
}

export default memo(ShiftGrid);
