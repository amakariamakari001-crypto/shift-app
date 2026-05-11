import type { StaffRowData } from './types';

interface DragState {
  sourceKey: string;
  rowData: StaffRowData;
}

let _state: DragState | null = null;

const _handlers = new Map<string, {
  removeStaff: (id: string) => void;
  insertStaff: (row: StaffRowData, index: number) => void;
}>();

export const dragBridge = {
  startDrag(sourceKey: string, rowData: StaffRowData) {
    _state = { sourceKey, rowData };
  },
  endDrag() {
    _state = null;
  },
  register(
    key: string,
    removeStaff: (id: string) => void,
    insertStaff: (row: StaffRowData, index: number) => void,
  ) {
    _handlers.set(key, { removeStaff, insertStaff });
  },
  /** 別テーブルへの移動を試みる。成功したら true を返す */
  tryTransfer(targetKey: string, targetIndex: number): boolean {
    if (!_state || _state.sourceKey === targetKey) return false;
    const src = _handlers.get(_state.sourceKey);
    const tgt = _handlers.get(targetKey);
    if (!src || !tgt) return false;
    const row = _state.rowData;
    src.removeStaff(row.id);
    tgt.insertStaff(row, targetIndex);
    _state = null;
    return true;
  },
};
