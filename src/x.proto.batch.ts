import { NS } from '@ns';
import { executeCommands, getProtoBatch } from 'lib/lib.batch';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const botServer = 'home';
  ns.print('Target: ', target);

  ns.print('Starting batch attack on: ', target, ' from: ', botServer);

  const listCommands = getProtoBatch(ns, target);

  const totalScriptCost = listCommands.reduce((acc, cur) => acc + cur.ramOverride * cur.threads, 0);
  ns.print('Total script cost: ', totalScriptCost);

  while (true) {
    const freeRam = ns.getServerMaxRam(botServer) - ns.getServerUsedRam(botServer);

    if (freeRam > totalScriptCost) {
      executeCommands(ns, listCommands, botServer, target);
    }
    await ns.sleep(1000);
  }
}
