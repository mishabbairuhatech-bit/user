import { Injectable } from '@nestjs/common';

/**
 * CSV export utility — converts arrays of objects to CSV strings.
 * Used by the reports controller for data export.
 */
@Injectable()
export class ExportService {
  /**
   * Convert an array of flat objects to a CSV string.
   * Automatically detects headers from the first object's keys.
   */
  toCSV(data: Record<string, any>[], columns?: { key: string; header: string }[]): string {
    if (!data || data.length === 0) return '';

    const cols = columns || Object.keys(data[0]).map((key) => ({ key, header: this.formatHeader(key) }));
    const headers = cols.map((c) => `"${c.header}"`).join(',');

    const rows = data.map((row) =>
      cols
        .map((c) => {
          const val = row[c.key];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(','),
    );

    return [headers, ...rows].join('\n');
  }

  private formatHeader(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }

  /**
   * Flatten nested objects for CSV export.
   * E.g., { party: { name: 'X' } } → { 'party_name': 'X' }
   */
  flatten(data: Record<string, any>[], nestedKeys: Record<string, string[]>): Record<string, any>[] {
    return data.map((row) => {
      const flat = { ...row };
      for (const [parentKey, childKeys] of Object.entries(nestedKeys)) {
        const nested = row[parentKey];
        if (nested && typeof nested === 'object') {
          for (const ck of childKeys) {
            flat[`${parentKey}_${ck}`] = nested[ck];
          }
        }
        delete flat[parentKey];
      }
      return flat;
    });
  }
}
