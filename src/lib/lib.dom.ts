// import React from 'lib/react';

import { NS, UserInterfaceTheme } from "@ns";

const rCreateElement = eval('React.createElement');

// https://react.dev/reference/react/createElement#creating-an-element-without-jsx

export function asSpan(text: string, colorString: string = 'white') {
  if (!colorString) return rCreateElement('span', { style: { color: 'green' } }, text);

  return rCreateElement('span', { style: { color: colorString } }, text);
}

export function asSpanBold(text: string, color: string = 'white') {
  return rCreateElement('span', { style: { color, fontWeight: 600 } }, text);
}

export function domHeader(ns:NS, head: 'h1' | 'h2' | 'h3' | 'h4', text: string) {
  return rCreateElement(head, { style: { color: getThemeColor(ns), fontWeight: 600, borderBottom:'1px solid', marginBottom: 0, fontFamily:'Fira Mono' } }, text);
}

export function getThemeColor(ns:NS, name:keyof UserInterfaceTheme = 'primarylight') {
  return ns.ui.getTheme()[name] ?? 'primarylight';
}
