'use client';

import { memo } from 'react';
import type { DateColumn, StaffRowData } from '@/lib/types';

interface Props {
  dateColumns: DateColumn[];
  staffRows: StaffRowData[];
}

function AggregationRows(_props: Props) {
  return null;
}

export default memo(AggregationRows);
