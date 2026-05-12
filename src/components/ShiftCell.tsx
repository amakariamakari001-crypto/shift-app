'use client';

import { memo } from 'react';
import { getCellBgColor } from '@/hooks/useDateRange';
import { VALUE_COLORS, EXCLUDED_FROM_DAILY } from '@/lib/constants';
import type { CellValue, DateColumn } from '@/lib/types';

const ATTENDING_HIGHLIGHT = '#dbeafe'; // blue-100

interface Props {
  value: CellValue;
  dateColumn: DateColumn;
  onClick: () => void;
  bgOverride?: string;
  isReadOnly?: boolean;
  isDateHovered?: boolean;
}

function ShiftCell({ value, dateColumn, onClick, bgOverride, isReadOnly, isDateHovered }: Props) {
  const dayBg      = getCellBgColor(dateColumn);
  const valueStyle = VALUE_COLORS[value as string];
  const hasCellBg  = new Set(['休', '振休', '有給', '半休']).has(value as string);

  // 出勤扱い = 値あり かつ 休系でない
  const isAttending = isDateHovered && value !== '' && !EXCLUDED_FROM_DAILY.has(value as string);
  const bgColor   = isAttending
    ? ATTENDING_HIGHLIGHT
    : (bgOverride ?? (hasCellBg ? valueStyle.bg : (dayBg || '#ffffff')));
  const textColor = valueStyle ? valueStyle.text : '#1f2937';
  const outline   = hasCellBg ? `1px solid ${valueStyle.border}` : undefined;

  return (
    <td
      onClick={isReadOnly ? undefined : onClick}
      className={`border border-gray-200 text-center select-none ${isReadOnly ? 'cursor-default' : 'cursor-pointer transition-opacity hover:opacity-80 active:opacity-60'}`}
      style={{
        backgroundColor: bgColor,
        width: 44,
        minWidth: 44,
        maxWidth: 44,
        height: 36,
        padding: '1px 0',
        outline,
        transition: 'background-color 0.1s',
      }}
    >
      <span
        className="font-bold block w-full break-all text-center"
        style={{ color: textColor, fontSize: '0.8rem', lineHeight: '1.2', wordBreak: 'break-all' }}
      >
        {value}
      </span>
    </td>
  );
}

export default memo(ShiftCell);
