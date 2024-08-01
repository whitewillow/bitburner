import { NS } from '@ns';

export interface PrintRows {
  title?: string;
  color?: string;
  icon?: string;
  iconColor?: string;
  columns: PrintColumns[];
}
export interface PrintColumns {
  title?: string;
  value: string | number | boolean;
  rightAlligned?: boolean;
}
export interface PrintTableSettings {
  padding?: number;
  fancy?: boolean;
  noRowHeader?: boolean;
}

export const addSpaces = (spaces: number) => ' '.repeat(spaces);

export const fillSpaces = (str: string, max: number, rightAlligned = false) => {
  if (rightAlligned) {
    return addSpaces(max - str.length) + str;
  }
  return str + addSpaces(max - str.length);
};

export function defaultSettings(settings: PrintTableSettings = {}) {
  return { padding: 2, ...settings };
}

export function maxColumnLengths(rows: PrintRows[]) {
  const columnsMaxLength: number[] = [];

  for (const row of rows) {
    row.columns.forEach((col, index) => {
      if (!columnsMaxLength[index]) {
        columnsMaxLength[index] = col.title?.length ?? 0;
      }
      columnsMaxLength[index] = Math.max(col.value.toString().length, columnsMaxLength[index]);
    });
  }
  return columnsMaxLength;
}

export function generateRow(row: PrintRows, columnsMaxLength: number[], settings: PrintTableSettings) {
  const _settings = defaultSettings(settings);

  const columns = row.columns.map((col, i) => fillSpaces(col.value.toString(), columnsMaxLength[i], col.rightAlligned));
  return [...columns].join(addSpaces(_settings.padding));
}

export function generateRowHeader(row: PrintRows, columnsMaxLength: number[], settings: PrintTableSettings) {
  const _settings = defaultSettings(settings);
  if (_settings.noRowHeader) {
    return '';
  }
  const columns = row.columns.map((col, i) => fillSpaces(col.title ?? '', columnsMaxLength[i], col.rightAlligned));
  return [...columns].join(addSpaces(_settings.padding));
}

export function generateRowStrings(ns: NS, rows: PrintRows[], settings: PrintTableSettings) {
  const _settings = defaultSettings(settings);
  const columnsMaxLength = maxColumnLengths(rows);
  const lines: string[] = [];

  const headers = rows[0].columns.map((col, i) => fillSpaces(col.title ?? '', columnsMaxLength[i], col.rightAlligned));

  for (const row of rows) {
    const columns = row.columns.map((col, i) =>
      fillSpaces(col.value.toString(), columnsMaxLength[i], col.rightAlligned),
    );
    lines.push([addSpaces(_settings.padding), ...columns].join('  '));
  }

  return {
    header: [addSpaces(_settings.padding), ...headers].join('  '),
    lines,
  };
}

export function printTableRowCheap(ns: NS, rows: PrintRows[], settings: PrintTableSettings) {
  const columnsMaxLength = maxColumnLengths(rows);
  const header = generateRowHeader(rows[0], columnsMaxLength, settings);

  ns.printRaw(header);

  rows.forEach((row) => {
    ns.printRaw(generateRow(row, columnsMaxLength, settings));
  });
}

export function printTableRow(ns: NS, rows: PrintRows[], settings: PrintTableSettings) {
  const _settings = defaultSettings(settings);
  const columnsMaxLength = maxColumnLengths(rows);
  const header = generateRowHeader(rows[0], columnsMaxLength, settings);
  const iconSpace = rows.some((s) => s.icon) ? 3 : 0;

  ns.printRaw(_settings.fancy ? addSpaces(iconSpace) + header : header);

  rows.forEach((row) => {
    const content = generateRow(row, columnsMaxLength, settings);
    const icon = row.icon ? ` ${row.icon} ` : addSpaces(iconSpace) + '';
    ns.printRaw([icon, _settings.fancy ? content : content]);
  });
}

export function PrintTable(ns: NS, header: string | null, rows: PrintRows[], settings?: PrintTableSettings) {
  const _settings = defaultSettings(settings);
  ns.printRaw('\n');
  if (header) {
    ns.printRaw(addSpaces(_settings.padding) + header);
  }
  printTableRow(ns, rows, _settings);
}
