import { NS } from '@ns';
import { executeCommands, getPreppingBatch, getProtoBatch } from 'lib/lib.batch';
import XServer from 'lib/class.xserver';
import { getHackableNodes, getThreatAssesment } from 'lib/lib.node';
import { PrintRows, PrintTable } from 'lib/lib.print';
import { generatePrepRow } from 'lib/lib.print.prep';

export async function main(ns: NS): Promise<void> {
  const fromHackChance = Number(ns.args[0] ?? 50);
  const MAX_PREPS = Number(ns.args[1] ?? 3);
  let i = 0;

  ns.disableLog('ALL');
  ns.clearLog();
  const alreadyPreppedIds: string[] = [];
  let waitForTargetsToFinishPrepping: string[] = [];

  function startNewPrepping(hackable: XServer[]) {
    const [target] = hackable;
    waitForTargetsToFinishPrepping.push(target.id);
    ns.print(`Starting Prepping Target: ${target.id}`);
    ns.run('x.proto.prep.auto.js', 1, target.id);
  }

  function getWaitingTargets() {
    return waitForTargetsToFinishPrepping
      .map((m) => new XServer(ns, m));
  }

  async function waitForTargets() {
    while (true) {
      const serverDonePrepping = getWaitingTargets()
        .filter((f) => f.isMoneyAvailableMaxed && f.isServerWeakendToMinimum);
      if (serverDonePrepping.length > 0) {
        serverDonePrepping.forEach((f) => {
          alreadyPreppedIds.push(f.id);
          waitForTargetsToFinishPrepping = waitForTargetsToFinishPrepping.filter((m) => m !== f.id);
        });
        ns.print(`Prepping completed for: ${serverDonePrepping.map((m) => m.id).join(', ')}`);
        break;
      }
      printWaitForTargetsToFinishPrepping();
      await ns.sleep(1000);
    }
  }

  function printWaitForTargetsToFinishPrepping() {
    const rows = generatePrepRow(getWaitingTargets().map((m) => getThreatAssesment(ns, m)));
    ns.clearLog();
    PrintTable(ns, 'Targets', rows);
  }

  while (true) {
    const hackable = getHackableNodes(ns, fromHackChance).filter(
      (f) => !alreadyPreppedIds.includes(f.id) && !waitForTargetsToFinishPrepping.includes(f.id),
    );

    if (hackable.length === 0) {
      ns.print(`No more targets to prep`);
      break;
    }

    if (waitForTargetsToFinishPrepping.length === MAX_PREPS) {
      ns.print(`Waiting for targets to finish prepping`);
      await waitForTargets();
      continue;
    }

    if (waitForTargetsToFinishPrepping.length <= MAX_PREPS) {
      startNewPrepping(hackable);
    }

    i++;
    ns.print(`PrepBatch ${i} completed`);
    await ns.sleep(1000);
  }
}
