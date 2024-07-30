import { NS } from '@ns';
import { getStateField, updateStateField } from 'lib/state';

export const STATE_CURRENTLY_PREPPING = 'currentlyPrepping';

export function getStateCurrentlyPrepping(ns: NS): string[] {
  return getStateField(ns, STATE_CURRENTLY_PREPPING) ?? [];
}

export function setStateCurrentlyPrepping(ns: NS, value: string[]): void {
  updateStateField(ns, STATE_CURRENTLY_PREPPING, value);
}

export function addStateCurrentlyPrepping(ns: NS, value: string): void {
  const currentlyPrepping = getStateCurrentlyPrepping(ns).filter((v) => v !== value);
  setStateCurrentlyPrepping(ns, [...currentlyPrepping, value]);
}

export function removeStateCurrentlyPrepping(ns: NS, value: string): void {
  setStateCurrentlyPrepping(ns, getStateCurrentlyPrepping(ns).filter((v) => v !== value));
}