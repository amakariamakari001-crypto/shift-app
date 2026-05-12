'use client';

import { memo, useCallback } from 'react';
import ShiftCell from './ShiftCell';
import type { CellValue, DateColumn, StaffAggregation } from '@/lib/types';

interface Props {
  rowId: string | 'free';
  index?: number;
  name: string;
  cells: Record<string, CellValue>;
  dateColumns: DateColumn[];
  aggregation?: StaffAggregation;
  isFreeRow?: boolean;
  hideAggColumns?: boolean;
  isReadOnly?: boolean;
  hoveredDateKey?: string | null;
  rowBg?: string;
  onOpenModal: (rowId: string | 'free', dateKey: string, dateColumn: DateColumn, currentValue: CellValue) => void;
  onNameChange: (name: string) => void;
  onDelete?: () => void;
  onClear?: () => void;
  onDragStart?: (index: number) => void;
  onDrop?: (index: number) => void;
  onDragEnter?: (index: number) => void;
}

function StaffRow({
  rowId, index, name, cells, dateColumns, aggregation, isFreeRow, hideAggColumns, isReadOnly, hoveredDateKey, rowBg,
  onOpenModal, onNameChange, onDelete, onClear, onDragStart, onDrop, onDragEnter,
}: Props) {
  const handleCellClick = useCallback(
    (dateKey: string, dateColumn: DateColumn, currentValue: CellValue) => {
      onOpenModal(rowId, dateKey, dateColumn, currentValue);
    },
    [rowId, onOpenModal]
  );

  const isDraggable = onDragStart != null && onDrop != null && index != null;

  return (
    <tr
      className={isFreeRow ? 'bg-gray-50 group' : 'group'}
      style={{ height: 36 }}
      draggable={isDraggable}
      onDragStart={isDraggable ? e => { e.stopPropagation(); onDragStart!(index!); } : undefined}
      onDragOver={isDraggable ? e => { e.preventDefault(); onDragEnter?.(index!); } : undefined}
      onDrop={isDraggable ? e => { e.preventDefault(); e.stopPropagation(); onDrop!(index!); } : undefined}
      onDragEnd={isDraggable ? () => onDrop!(-1) : undefined}
    >
      {/* ── スタッフ名セル（左固定） ── */}
      <td
        className="sticky left-0 z-10 border border-gray-200 overflow-hidden"
        style={{ minWidth: 156, maxWidth: 156, width: 156, height: 36, padding: 0, backgroundColor: rowBg ?? '#ffffff' }}
      >
        <div className="relative h-full flex items-center">
          {/* ドラッグハンドル（スタッフ行のみ） */}
          {isDraggable && (
            <span
              className="flex-shrink-0 w-4 h-full flex items-center justify-center text-gray-300 group-hover:text-gray-400 cursor-grab select-none text-[10px]"
              title="ドラッグして並べ替え"
            >
              ⠿
            </span>
          )}

          {/* 左：× 削除ボタン */}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
              className="flex-shrink-0 w-5 h-5 ml-0.5 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all rounded leading-none"
              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
              tabIndex={-1}
              title="この行を削除"
            >
              ✕
            </button>
          )}

          {/* 名前入力 */}
          <input
            type="text"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            draggable={false}
            readOnly={isReadOnly}
            className="flex-1 min-w-0 h-full text-xs bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-300 px-1"
            placeholder={isFreeRow ? '自由記述' : 'スタッフ名'}
          />

          {/* 右：C クリアボタン */}
          {onClear && (
            <button
              onClick={e => { e.stopPropagation(); onClear(); }}
              className="flex-shrink-0 w-5 h-5 mr-0.5 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all rounded leading-none"
              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
              tabIndex={-1}
              title="シフトをクリア"
            >
              C
            </button>
          )}
        </div>
      </td>

      {/* ── シフトセル群 ── */}
      {dateColumns.map(col => (
        <ShiftCell
          key={col.dateKey}
          value={cells[col.dateKey] ?? ''}
          dateColumn={col}
          bgOverride={rowBg}
          isReadOnly={isReadOnly}
          isDateHovered={hoveredDateKey === col.dateKey}
          onClick={() => handleCellClick(col.dateKey, col, cells[col.dateKey] ?? '')}
        />
      ))}

      {/* ── 集計セル ── */}
      {!hideAggColumns && (
        isFreeRow ? (
          <>
            <td className="border border-gray-200 bg-gray-50" style={{ width: 36, minWidth: 36 }} />
            <td className="border border-gray-200 bg-gray-50" style={{ width: 48, minWidth: 48 }} />
          </>
        ) : (
          <>
            <td
              className="border border-gray-200 text-center text-xs text-red-600 font-medium"
              style={{ width: 36, minWidth: 36, backgroundColor: '#fff5f5' }}
            >
              {aggregation?.kyuCount || ''}
            </td>
            <td
              className="border border-gray-200 text-center text-xs text-gray-700 font-medium"
              style={{ width: 48, minWidth: 48, backgroundColor: '#f9fafb' }}
            >
              {aggregation != null && aggregation.special !== 0 ? aggregation.special : ''}
            </td>
          </>
        )
      )}
    </tr>
  );
}

export default memo(StaffRow);
