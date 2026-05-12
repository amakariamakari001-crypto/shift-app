'use client';

import { Link, Printer, FileImage, Plus } from 'lucide-react';
import type { ShiftData } from '@/lib/types';
import { encodeToUrl } from '@/lib/encoding';
import { exportToPdf } from '@/lib/exportPdf';

interface Props {
  yearMonth: string;
  onYearMonthChange?: (ym: string) => void;
  shiftData: ShiftData;
  onAddStaff?: () => void;
  isReadOnly?: boolean;
}

export default function Toolbar({ yearMonth, onYearMonthChange, shiftData, onAddStaff, isReadOnly }: Props) {
  function handleShareUrl() {
    const encoded = encodeToUrl(shiftData);
    const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('共有URLをクリップボードにコピーしました');
    });
  }

  function handlePrint() {
    window.print();
  }

  async function handleExportPdf() {
    await exportToPdf('shift-grid');
  }

  return (
    <div className="no-print flex items-center gap-2 flex-wrap px-3 py-2 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">シフト表</span>
        <div className="flex items-center gap-1">
          <select
            value={yearMonth.split('-')[0]}
            onChange={e => onYearMonthChange?.(`${e.target.value}-${yearMonth.split('-')[1]}`)}
            disabled={isReadOnly}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Array.from({ length: 21 }, (_, i) => 2020 + i).map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            value={yearMonth.split('-')[1]}
            onChange={e => onYearMonthChange?.(`${yearMonth.split('-')[0]}-${e.target.value}`)}
            disabled={isReadOnly}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
              <option key={m} value={m}>{Number(m)}月</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400">（当月16日〜翌月15日）</span>
      </div>

      <div className="flex items-center gap-1 ml-auto flex-wrap">
        {!isReadOnly && (
          <button
            onClick={onAddStaff}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
            title="スタッフ追加"
          >
            <Plus size={13} />
            スタッフ追加
          </button>
        )}


        <button
          onClick={handleShareUrl}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          title="URL共有"
        >
          <Link size={13} />
          共有
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          title="印刷"
        >
          <Printer size={13} />
          印刷
        </button>

        <button
          onClick={handleExportPdf}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          title="PDF出力"
        >
          <FileImage size={13} />
          PDF
        </button>
      </div>
    </div>
  );
}
