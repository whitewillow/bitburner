import { NS } from '@ns';
import { STATE_FILENAME } from 'lib/constants';

export function saveStateRaw(ns: NS, state: Record<string, any>): void {
  ns.write(STATE_FILENAME, JSON.stringify(state), 'w');
}

export function saveState(ns: NS, newState: Record<string, any>): void {
  const state = loadState(ns);
  saveStateRaw(ns, { ...state, ...newState });
}

export function loadState(ns: NS): Record<string, any> {
  return JSON.parse(ns.read(STATE_FILENAME) || '{}');
}

export function updateStateField(ns: NS, field: string, value: any): void {
  const state = loadState(ns);
  state[field] = value;
  saveStateRaw(ns, state);
}

export function getStateField(ns: NS, field: string): any {
  return loadState(ns)[field];
}

// TODO: Add que for adding state
// Possible solution: create new file for each state update,
// update state file with new state and delete old state file
