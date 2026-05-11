'use client';

import { memo } from 'react';
import type { DateColumn, StaffRowData } from '@/lib/types';

interface Props {
  dateColumns: DateColumn[];
  staffRows: StaffRowData[];
}

function AggregationRows(_props: Props) { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

export default memo(AggregationRows);
