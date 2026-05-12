'use client';

import { memo } from 'react';
import { getCellBgColor } from '@/hooks/useDateRange';
import { DAY_OF_WEEK_LABELS } from '@/lib/constants';
import { computeDailyCount } from '@/lib/aggregation';
import type { DateColumn, StaffRowData } from '@/lib/types';

interface Props {
  dateColumns: DateColumn[];
  staffRows: StaffRowData[];
  onClearDate: (dateKey: string) => void;
  isReadOnly?: boolean;
  hoveredDateKey?: string | null;
  onDateHover?: (dateKey: string | null) => void;
}

function HeaderRow({ dateColumns, staffRows, onClearDate, isReadOnly, hoveredDateKey, onDateHover }: Props) {
  return (
    <thead className="select-none">
      {/* 行1: 日別出勤人数（sticky） */}
      <tr>
        <td
          className="sticky left-0 z-30 bg-blue-50 border border-gray-300 text-xs font-semibold text-blue-700 px-2 whitespace-nowrap"
          style={{ minWidth: 156, maxWidth: 156, width: 156, height: 28, top: 0, position: 'sticky' }}
        >
          日別出勤人数
        </td>
        {dateColumns.map(col => {
          const count = computeDailyCount(staffRows, col.dateKey);
          const isHovered = hoveredDateKey === col.dateKey;
          return (
            <td
              key={col.dateKey}
              className="sticky z-20 border border-gray-300 text-center text-xs font-semibold cursor-default"
              style={{
                backgroundColor: isHovered ? '#bfdbfe' : '#eff6ff',
                width: 44,
                minWidth: 44,
                color: count === 0 ? '#9ca3af' : '#1d4ed8',
                transition: 'background-color 0.1s',
                top: 0,
                position: 'sticky',
              }}
              onMouseEnter={() => onDateHover?.(col.dateKey)}
              onMouseLeave={() => onDateHover?.(null)}
            >
              {count === 0 ? '' : count % 1 === 0 ? count : count.toFixed(1)}
            </td>
          );
        })}
        <td
          className="sticky top-0 z-20 border border-gray-300 bg-blue-50"
          colSpan={2}
        />
      </tr>

      {/* 行2: 日付・曜日 */}
      <tr>
        <th
          className="sticky left-0 z-30 bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-600 whitespace-nowrap px-2 text-left"
          style={{ minWidth: 156, maxWidth: 156, width: 156, height: 44, top: 28, position: 'sticky' }}
        >
          スタッフ名
        </th>
        {dateColumns.map(col => {
          const bg = getCellBgColor(col);
          const dayLabel = DAY_OF_WEEK_LABELS[col.dayOfWeek];
          return (
            <th
              key={col.dateKey}
              className="sticky z-20 border border-gray-300 p-0 group/col"
              style={{
                backgroundColor: bg || '#f3f4f6',
                width: 44,
                minWidth: 44,
                maxWidth: 44,
                top: 28,
              }}
            >
              <div className="relative flex flex-col items-center leading-tight py-0.5">
                <span className="text-[10px] font-bold text-gray-700">
                  {Number(col.dateKey.slice(8))}
                </span>
                <span
                  className="text-[10px] font-semibold"
                  style={{
                    color: col.isHoliday
                      ? '#dc2626'
                      : col.dayOfWeek === 0
                      ? '#16a34a'
                      : col.dayOfWeek === 6
                      ? '#ca8a04'
                      : '#6b7280',
                  }}
                >
                  {dayLabel}
                </span>
                {col.isHoliday && (
                  <span className="text-[8px] text-red-500 leading-tight" title={col.holidayName ?? ''}>
                    祝
                  </span>
                )}
                {!isReadOnly && (
                  <button
                    onClick={() => onClearDate(col.dateKey)}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-4 flex items-center justify-center text-[9px] font-bold opacity-0 group-hover/col:opacity-100 transition-all rounded leading-none"
                    style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                    title={`${col.dateKey.slice(5).replace('-','/')} の全データをクリア`}
                  >
                    C
                  </button>
                )}
              </div>
            </th>
          );
        })}
        <th
          className="sticky z-20 bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-600 px-1 text-center"
          style={{ minWidth: 36, width: 36, height: 44, top: 28, position: 'sticky' }}
        >
          休
        </th>
        <th
          className="sticky z-20 bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-600 px-1 text-center leading-tight"
          style={{ minWidth: 48, width: 48, top: 28, position: 'sticky' }}
        >
          〇－<br />有給
        </th>
      </tr>
    </thead>
  );
}

export default memo(HeaderRow);
