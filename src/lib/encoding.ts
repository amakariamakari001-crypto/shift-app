import LZString from 'lz-string';
import type { ShiftData } from './types';

export function encodeToUrl(data: ShiftData): string {
  const json = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeFromUrl(param: string): ShiftData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(param);
    if (!json) return null;
    return JSON.parse(json) as ShiftData;
  } catch {
    return null;
  }
}
