import { NS } from '@ns';
import { PrintRows, printTerminalTable } from './lib/lib.print';
import { ControllerScript } from './lib/types';
import { loadState, saveState } from './state/state';
import { changeStateControllerScriptState, getStateControllerScripts } from './state/state.controller-scripts';
import { writeToInputPort } from './lib/lib.port';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  const group = ns.args[0]?.toString() ?? 'info'; // 'info' | 'scripts'

  if (group === 'clearstate') {
    saveState(ns, {}, true);
    return;
  }

  if (group === 'info') {
    const state = loadState(ns);
    ns.tprint(JSON.stringify(state, null, 2));
  }

  if (group === 'scripts') {
    const scriptId = ns.args[1]?.toString() ?? 'list';
    const scriptState = ns.args[2]?.toString() as ControllerScript['state'];
    if (scriptId !== 'list' && !scriptState) {
      ns.tprint('Missing scriptId or scriptState');
      return;
    }

    const controllerScriptState = getStateControllerScripts(ns);

    if (scriptId === 'list') {
      const rows: PrintRows[] = controllerScriptState.map((s) => ({
        columns: [
          { value: s.id, title: 'ID' },
          { value: s.name, title: 'Name' },
          { value: s.state, title: 'State' },
          { value: s.pid ?? '', title: 'PID' },
        ],
      }));

      ns.tprintRaw('');
      ns.tprintRaw('Current scripts');
      ns.tprintRaw('================');
      ns.tprintRaw('');
      printTerminalTable(ns, null, rows, { fancy: false });
      ns.tprintRaw('');
      ns.tprintRaw('cmd> settings scripts <scriptId> <state: START | PAUSE >');
      return;
    }

    const script = controllerScriptState.find((s) => s.id === scriptId);
    if (!script) {
      ns.tprint(`Script ${scriptId} not found`);
      return;
    }
    changeStateControllerScriptState(ns, scriptId, scriptState);
    writeToInputPort(ns, 'SETTING_SCRIPTS', 1, scriptId);
  }
}
