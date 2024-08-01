import { FilenameOrPID, NS } from '@ns';
import { getPreppingBatch, getProtoBatch } from 'lib/lib.batch';
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

    const can_run_times = Math.floor(freeRam / Math.ceil(totalScriptCost));

    for (let i = can_run_times; i > 0; i--) {
      for (const cmd of listCommands) {
        const { command, ramOverride, threads, info, delay } = cmd;
        const host = botServer;
        const pid = ns.exec(
          'x.proto.act.js',
          botServer,
          { ramOverride, temporary: true, threads },
          info,
          command,
          target,
          delay,
          host,
        );
        pids.push(pid);
      }
    }

    await waitForPIDs(ns, pids);
    i++;
    ns.print(`Batch ${i} completed`);
  }
}