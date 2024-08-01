import { NS } from '@ns';
import { getStateField, updateStateField } from './state';
import { ControllerScript } from 'lib/types';

export const STATE_CONTROLLER_SCRIPTS = 'controllerscripts';

export const DEFAULT_CONTROLLER_SCRIPTS: ControllerScript[] = [
  { id: 'queue', script: 'services/queue.service.js', name: 'Queue Service', state: 'START' },
  { id: 'penetrator', script: 'services/penetrator.service.js', name: 'Penetrator Service', state: 'START' },
  { id: 'bot', script: 'services/bot-maintainer.service.js', name: 'Bot Maintainer Service', state: 'START' },
  { id: 'hnet', script: 'services/hnet-maintainer.service.js', name: 'HNet Maintainer Service', state: 'WAITING_FOR_RAM' },
  { id: 'proto', script: 'services/proto.service.js', name: 'Proto Service', state: 'START' },
  { id: 'pb_n00dles', script: 'fixed-prep-batch.js', args: ['n00dles'], name: 'Prep & Batch - n00dles', state: 'PAUSED' },
  { id: 'pb_foodnstuff', script: 'fixed-prep-batch.js', args: ['foodnstuff'], name: 'Prep & Batch - foodnstuff', state: 'PAUSED' },
];

export function isControllerScriptArray(value: any): value is ControllerScript[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'object');
}

export function getStateControllerScripts(ns: NS): ControllerScript[] {
  const state = getStateField(ns, STATE_CONTROLLER_SCRIPTS);
 
  if (!isControllerScriptArray(state)) {
    setStateControllerScripts(ns, DEFAULT_CONTROLLER_SCRIPTS);
    return DEFAULT_CONTROLLER_SCRIPTS;
  }
  return state;
}

export function setStateControllerScripts(ns: NS, value: ControllerScript[]): void {
  updateStateField(ns, STATE_CONTROLLER_SCRIPTS, value);
}

export function updateStateControllerScript(ns: NS, id: string, script: Partial<ControllerScript>): void {
  const scripts = getStateControllerScripts(ns);
  const index = scripts.findIndex((s) => s.id === id);
  if (index === -1) {
    return;
  }
  scripts[index] = { ...scripts[index], ...script };
  setStateControllerScripts(ns, scripts);
}

export function changeStateControllerScriptState(ns: NS, id: string, state: ControllerScript['state']): void {
  const scripts = getStateControllerScripts(ns);
  const script = scripts.find((s) => s.id === id);
  if (!script) {
    return;
  }
  script.state = state;
  setStateControllerScripts(ns, scripts);
}