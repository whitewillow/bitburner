import { NS } from '@ns';
import { PenetratorState } from 'lib/types';
import { getStateField, updateStateField } from './state';

export const STATE_PENETRATOR = 'penetrator';

export const DEFAULT_PENETRATOR: PenetratorState = {
  knownServers: [],
  serversWithRoot: [],
  potentialTargets: [],
  serversCantHack: [],
  recentlyHacked: [],
};

export function isPenetrator(value: any): value is PenetratorState {
  return typeof value === 'object';
}

export function getStatePenetrator(ns: NS): PenetratorState {
  const state = getStateField(ns, STATE_PENETRATOR);

  if (!isPenetrator(state)) {
    setStatePenetrator(ns, DEFAULT_PENETRATOR);
    return DEFAULT_PENETRATOR;
  }
  return state;
}

export function setStatePenetrator(ns: NS, value: PenetratorState): void {
  updateStateField(ns, STATE_PENETRATOR, value);
}

export function updateKnownServers(ns: NS, value: string[]): void {
  const state = getStatePenetrator(ns);
  state.knownServers = [...state.knownServers, ...value];
  setStatePenetrator(ns, state);
}

export function updateServersWithRoot(ns: NS, value: string[]): void {
  const state = getStatePenetrator(ns);
  state.serversWithRoot = value;
  setStatePenetrator(ns, state);
}

export function updatePotentialTargets(ns: NS, value: string[]): void {
  const state = getStatePenetrator(ns);
  state.potentialTargets = value;
  setStatePenetrator(ns, state);
}

export function updateServersCantHack(ns: NS, value: string[]): void {
  const state = getStatePenetrator(ns);
  state.serversCantHack = value;
  setStatePenetrator(ns, state);
}

export function updateRecentlyHacked(ns: NS, value: string[]): void {
  const state = getStatePenetrator(ns);
  state.recentlyHacked = value;
  setStatePenetrator(ns, state);
}
