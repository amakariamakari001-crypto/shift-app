export type PresetValue = '〇' | '休' | '振休' | '有給' | '半休' | '回' | 'ビニール';
export type CellValue = PresetValue | string | '';

export interface DateColumn {
  date: Date;
  dateKey: string;
  dayOfWeek: number;
  isHoliday: boolean;
  holidayName: string | null;
}

export interface StaffRowData {
  id: string;
  name: string;
  cells: Record<string, CellValue>;
}

export interface FreeTextRowData {
  cells: Record<string, CellValue>;
}

export interface ShiftData {
  yearMonth: string;
  freeRowName: string;
  freeRowIndex?: number;
  countRowName?: string;
  freeTextRow: FreeTextRowData;
  staffRows: StaffRowData[];
}

export interface ModalState {
  isOpen: boolean;
  rowId: string | 'free';
  dateKey: string;
  dateColumn: DateColumn | null;
  currentValue: CellValue;
  anchorRect: DOMRect | null;
}

export interface StaffAggregation {
  staffId: string;
  kyuCount: number;
  special: number;
}
