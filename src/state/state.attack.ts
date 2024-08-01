import { NS } from '@ns';
import { getStateField, updateStateField } from './state';

/**
 * State management for currently attacking servers
 * Stores a list of ids/hosts that are currently being attacked
 */

export const STATE_CURRENTLY_ATTACKING = 'currentlyAttacking';

export function getStateCurrentlyAttacking(ns: NS): string[] {
  return getStateField(ns, STATE_CURRENTLY_ATTACKING) ?? [];
}

export function setStateCurrentlyAttacking(ns: NS, value: string[]): void {
  updateStateField(ns, STATE_CURRENTLY_ATTACKING, value);
}

export function addStateCurrentlyAttacking(ns: NS, value: string): void {
  const currentlyAttacking = getStateCurrentlyAttacking(ns).filter((v) => v !== value);
  setStateCurrentlyAttacking(ns, [...currentlyAttacking, value]);
}

export function removeStateCurrentlyAttacking(ns: NS, value: string): void {
  setStateCurrentlyAttacking(ns, getStateCurrentlyAttacking(ns).filter((v) => v !== value));
}