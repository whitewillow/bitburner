import { NS } from '@ns';
import { executeCommands, getPreppingBatch, getProtoBatch } from 'lib/lib.batch';
import XServer from 'lib/class.xserver';
import { getBotNodesRange } from 'lib/lib.node';

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const fromServer: number = ns.args[1] as number ?? 0;
  const toServer: number = ns.args[2] as number ?? 6;

  ns.disableLog('ALL');
  ns.printRaw(['Starting Prepping Target: ', target]);

  const listCommands = getPreppingBatch(ns, target);
  const totalScriptCost = listCommands.reduce((acc, cur) => acc + cur.ramOverride * cur.threads, 0);

  let i = 0;
  while (true) {
    const targetServer = new XServer(ns, target);

    if (targetServer.isMoneyAvailableMaxed && targetServer.isServerWeakendToMinimum) {
      ns.print(`Prepping completed!`);
      break;
    }

    const botServers = getBotNodesRange(ns, fromServer, toServer);
    for (const bot of botServers) {
      if (bot.ram.free < totalScriptCost) {
        await ns.sleep(1000);
        continue;
      }
      executeCommands(ns, listCommands, bot.id, target);
    }
    await ns.sleep(200);
    i++;
    ns.print(`PrepBatch ${i} completed`);
  }
}
