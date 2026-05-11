'use client';

import { useRef, useEffect, useState } from 'react';
import { PRESET_VALUES, MAX_FREE_TEXT_LENGTH, VALUE_COLORS } from '@/lib/constants';
import { isWeekday } from '@/hooks/useDateRange';
import type { CellValue, ModalState } from '@/lib/types';

interface Props {
  modal: ModalState;
  onSelect: (value: CellValue) => void;
  onClose: () => void;
  maruOnly?: boolean;
  noWeekdayRestriction?: boolean;
}

export default function InputModal({ modal, onSelect, onClose, maruOnly, noWeekdayRestriction }: Props) {
  const [freeText, setFreeText] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modal.isOpen) setFreeText('');
  }, [modal.isOpen, modal.dateKey, modal.rowId]);

  if (!modal.isOpen || !modal.dateColumn) return null;

  const weekday = isWeekday(modal.dateColumn);

  function handlePreset(v: CellValue) {
    if (v === modal.currentValue) {
      onSelect('');
    } else {
      onSelect(v);
    }
  }

  function handleFreeTextSubmit() {
    const trimmed = freeText.trim().slice(0, MAX_FREE_TEXT_LENGTH);
    if (trimmed) onSelect(trimmed);
    else onClose();
  }

  const presetStyles: Record<string, React.CSSProperties> = Object.fromEntries(
    Object.entries(VALUE_COLORS).map(([k, v]) => [
      k, { background: v.bg, color: v.text, borderColor: v.border },
    ])
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72 max-w-[90vw]">
        <div className="text-xs text-gray-500 mb-3 font-medium">
          {modal.dateColumn.dateKey.slice(5).replace('-', '/')}
          {modal.dateColumn.isHoliday && (
            <span className="ml-1 text-red-500">({modal.dateColumn.holidayName})</span>
          )}
          {modal.rowId !== 'free' && <span className="ml-2">入力選択</span>}
        </div>

        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {(maruOnly ? (['〇'] as const) : PRESET_VALUES).map(v => {
            const isSelected = modal.currentValue === v;
            const disabled = v === '〇' && weekday && !noWeekdayRestriction;
            return (
              <button
                key={v}
                disabled={disabled}
                onClick={() => handlePreset(v)}
                className={[
                  'border rounded-lg py-1.5 text-sm font-bold transition-all',
                  disabled ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80',
                  isSelected ? 'ring-2 ring-offset-1 ring-blue-500 scale-105' : '',
                ].join(' ')}
                style={disabled
                  ? { background: '#f9fafb', color: '#9ca3af', borderColor: '#e5e7eb' }
                  : presetStyles[v] ?? { background: '#f9fafb', borderColor: '#e5e7eb' }
                }
              >
                {v}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={freeText}
            onChange={e => setFreeText(e.target.value.slice(0, MAX_FREE_TEXT_LENGTH))}
            onKeyDown={e => { if (e.key === 'Enter') handleFreeTextSubmit(); }}
            placeholder="自由入力（最大4文字）"
            className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleFreeTextSubmit}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            入力
          </button>
        </div>

        {modal.currentValue && (
          <button
            onClick={() => onSelect('')}
            className="mt-2 w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
          >
            クリア
          </button>
        )}
      </div>
    </div>
  );
}
