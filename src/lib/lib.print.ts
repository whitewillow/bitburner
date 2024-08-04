import { NS } from '@ns';
import { PrintRows, PrintTableSettings } from './types';
import { asSpan, asSpanBold, domHeader, getThemeColor } from './lib.dom';

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
  const columns = row.columns.map((col, i) =>
    fillSpaces(col.title?.toString() ?? '', columnsMaxLength[i], col.rightAlligned),
  );
  return [...columns].join(addSpaces(_settings.padding));
}

export function printTerminalRow(ns: NS, rows: PrintRows[], settings: PrintTableSettings) {
  if (rows.length === 0) {
    return;
  }
  const _settings = defaultSettings(settings);
  const columnsMaxLength = maxColumnLengths(rows);
  const header = generateRowHeader(rows[0], columnsMaxLength, settings);

  ns.tprintRaw(_settings.fancy ? asSpanBold(header, getThemeColor(ns)) : header);

  rows.forEach((row) => {
    const content = generateRow(row, columnsMaxLength, settings);
    if (row.columns.some((c) => c.color)) {
      // TODO: add color to each column, react node style
    }
    if (settings.spaceBetweenRows) {
      ns.tprintRaw('');
    }
    ns.tprintRaw(_settings.fancy ? asSpan(content, row.color) : content);
  });
}

export function printTerminalTable(ns: NS, header: string | null, rows: PrintRows[], settings?: PrintTableSettings) {
  const _settings = defaultSettings(settings);
  if (header && header.length > 0) {
    if (header) {
      ns.tprintRaw('\n');
      ns.tprintRaw(addSpaces(_settings.padding) + header);
      ns.tprintRaw(addSpaces(_settings.padding) + '---------');
    }
  }

  printTerminalRow(ns, rows, _settings);

  if (header && header.length > 0) {
    ns.tprintRaw(addSpaces(_settings.padding) + '---------');
  }
}

export function printTableRow(ns: NS, rows: PrintRows[], settings: PrintTableSettings) {
  if (rows.length === 0) {
    return;
  }
  const _settings = defaultSettings(settings);
  const columnsMaxLength = maxColumnLengths(rows);
  const header = generateRowHeader(rows[0], columnsMaxLength, settings);
  const iconSpace = rows.some((s) => s.icon) ? 4 : 0;

  ns.printRaw(_settings.fancy ? asSpanBold(addSpaces(iconSpace) + header, getThemeColor(ns)) : header);

  rows.forEach((row) => {
    const content = generateRow(row, columnsMaxLength, settings);
    const icon = row.icon ? asSpan(` ${row.icon} `, row.iconColor) : addSpaces(iconSpace) + '';
    ns.printRaw([icon, _settings.fancy ? asSpan(content, row.color) : content]);
    if (settings.spaceBetweenRows) {
      ns.printRaw('');
    }
  });
}

export function printTableRowCheap(ns: NS, rows: PrintRows[], settings: PrintTableSettings) {
  const columnsMaxLength = maxColumnLengths(rows);
  const header = generateRowHeader(rows[0], columnsMaxLength, settings);

  ns.printRaw(header);

  rows.forEach((row) => {
    ns.printRaw(generateRow(row, columnsMaxLength, settings));
  });
} 

export function generateRecordRows(list: { title: string; value: string | number; rowColor?: string }[]) {
  const rows: PrintRows[] = list.map((item) => {
    return {
      color: item.rowColor,
      columns: [
        {
          value: item.title,
        },
        {
          value: item.value,
        },
      ],
    };
  });
  return rows;
}

export function PrintTable(ns: NS, header: string | null, rows: PrintRows[], settings?: PrintTableSettings) {
  const _settings = defaultSettings(settings);
  if (header) {
    printLogHeader(ns, addSpaces(_settings.padding) + header);
    // ns.printRaw(addSpaces(_settings.padding) + header);
  }
  printTableRow(ns, rows, _settings);
  ns.printRaw('\n');
}

export function printLogHeader(ns: NS, header: string) {
  ns.printRaw(domHeader(ns, 'h4', header));
}
