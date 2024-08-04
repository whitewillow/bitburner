import { NS } from '@ns';
import { getStateField, updateStateField } from './state';

/**
 * State management for which targets should be ignored
 */

export const STATE_IGNORE_TARGETS = 'IgnoreTargets';

export const DEFAULT_IGNORE_TARGETS: string[] = ['n00dles', 'foodnstuff', 'joesguns'];

export function getStateIgnoreTargets(ns: NS): string[] {
  const state = getStateField(ns, STATE_IGNORE_TARGETS);
  if (!state) {
    setStateIgnoreTargets(ns, DEFAULT_IGNORE_TARGETS);
    return DEFAULT_IGNORE_TARGETS;
  }
  return state;
}

export function setStateIgnoreTargets(ns: NS, value: string[]): void {
  return updateStateField(ns, STATE_IGNORE_TARGETS, value);
}

export function addStateIgnoreTargets(ns: NS, value: string): void {
  const ignoreTargets = getStateIgnoreTargets(ns).filter((v) => v !== value);
  setStateIgnoreTargets(ns, [...ignoreTargets, value]);
}

export function removeStateIgnoreTargets(ns: NS, value: string): void {
  setStateIgnoreTargets(
    ns,
    getStateIgnoreTargets(ns).filter((v) => v !== value),
  );
}
