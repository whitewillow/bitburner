import { FilenameOrPID, NS } from '@ns';
import { executeCommands, getPreppingBatch, getProtoBatch } from 'lib/lib.batch';
import { waitForPIDs } from './lib/utils';
import XServer from 'lib/class.xserver';

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const botServer = ns.getHostname();

  ns.disableLog('ALL');
  ns.printRaw(['Target: ', target]);
  ns.printRaw(['Starting batch attack on: ', target, ' from: ', botServer]);

  const freeRam = ns.getServerMaxRam(botServer) - ns.getServerUsedRam(botServer);
  const listCommands = getPreppingBatch(ns, target);
  const totalScriptCost = listCommands.reduce((acc, cur) => acc + cur.ramOverride * cur.threads, 0);

  ns.print('Total script cost: ', totalScriptCost);
  let i = 0;
  
  while (true) {
    const pids: FilenameOrPID[] = [];
    const targetServer = new XServer(ns, target);
    if (targetServer.isMoneyAvailableMaxed && targetServer.isServerWeakendToMinimum) {
      break;
    }

    const canRunTimes = Math.floor(freeRam / Math.ceil(totalScriptCost));

    for (let i = canRunTimes; i > 0; i--) {
      const cmdPids = executeCommands(ns, listCommands, botServer, target);
      pids.push(...cmdPids);
    }

    await waitForPIDs(ns, pids);
    i++;
    ns.print(`Batch ${i} completed`);
  }
}
