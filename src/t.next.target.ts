/**
 * Next Targets
 * Calculates the next targets for hacking
 *
 * Filters by Hackchance 100% & can hack
 * Order by baseDifficulty asc
 *
 *
 */

import { NS } from '@ns';
import { printTerminalTable, PrintTable } from 'lib/lib.print';
import { getHackableNodes, getThreatAssesment } from 'lib/lib.node';
import { generatePrepRow } from 'lib/lib.print.prep';

export async function main(ns: NS): Promise<void> {
  const fromHackChance = Number(ns.args[0] ?? 80);
  const watch = Boolean(ns.args[1]); 
  ns.disableLog('ALL');


  while (true) {
    ns.clearLog();
    const hackable = getHackableNodes(ns, fromHackChance);
    const externalBotServersRows = generatePrepRow(hackable.map((m) => getThreatAssesment(ns, m)));
    if(!watch) {
      printTerminalTable(ns, 'Targets', externalBotServersRows, { fancy: true });
      break;
    }
    ns.tail;
    PrintTable(ns, 'Targets', externalBotServersRows, { fancy: true });
    await ns.sleep(500);
  }

  
}
