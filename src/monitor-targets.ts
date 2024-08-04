import { NS } from '@ns';
import { PrintTable, generateRecordRows } from './lib/lib.print';
import { generateTargetRows } from './lib/lib.print.prep';
import { getBotServers, getPotentialTargets, getThreatAssesment } from './lib/lib.server';
import { getStateCurrentlyAttacking } from './state/state.attack';
import { getStateIgnoreTargets } from './state/state.controller-ignore';
import { getStateCurrentlyPrepping } from './state/state.prep';
import { ICON_ATTACK, ICON_BOT, ICON_CLEAR, ICON_TARGET, ICON_WAIT } from './lib/constants';
import { PrintRows } from './lib/types';

export async function main(ns: NS): Promise<void> {
  let currentlyPrepping: string[] = [];
  let currentlyAttacking: string[] = [];
  let ignoreTargets: string[] = [];
  let availableBots: string[] = [];
  ns.disableLog('ALL');

  ns.tail();
  ns.resizeTail(1200, 500);

  function getState() {
    currentlyPrepping = getStateCurrentlyPrepping(ns);
    ignoreTargets = getStateIgnoreTargets(ns);
    currentlyAttacking = getStateCurrentlyAttacking(ns);
    availableBots = getBotServers(ns).map((m) => m.id);
  }

  function printStatus() {
    ns.clearLog();
    const columns = [
      { title: 'Attack', value: `${currentlyAttacking.length} ${ICON_TARGET}` },
      { title: 'Prepping', value: `${currentlyPrepping.length} ${ICON_CLEAR}` },
      { title: 'Ignore', value: `${ignoreTargets.length} ${ICON_WAIT}` },
      { title: 'Bots', value: `${availableBots.length} ${ICON_BOT}` },
    ];

    const recordRows: PrintRows[] = [{ columns }];

    PrintTable(ns, null, recordRows, { fancy: true });

    const nodes = getPotentialTargets(ns, ns.getPlayer().skills.hacking).map((m) => getThreatAssesment(ns, m));
    const rows = generateTargetRows(ns, nodes, false, currentlyAttacking, currentlyPrepping, ignoreTargets);
    PrintTable(ns, 'Targets', rows, { fancy: true });
  }

  while (true) {
    getState();
    printStatus();
    await ns.sleep(2000);
  }
}
