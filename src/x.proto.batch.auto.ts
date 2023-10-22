import { NS } from '@ns';
import { executeCommands, getProtoBatch, isTargetReadyForAttack } from 'lib/lib.batch';
import { getBotNodesRange } from 'lib/lib.node';

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const fromServer: number = ns.args[1] as number ?? 7;
  const toServer: number = ns.args[2] as number ?? 25;

  ns.disableLog('ALL');
  ns.clearLog();

  if(!isTargetReadyForAttack(ns, target)) {
    ns.tprintRaw(['Target is not ready for attack: ', target]);
    ns.printRaw(['Target is not ready for attack: ', target]);
    ns.printRaw('- please prep before attacking');
    ns.printRaw('Exiting...');
    ns.exit();
  }

  const listCommands = getProtoBatch(ns, target);
  const totalScriptCost = listCommands.reduce((acc, cur) => acc + cur.ramOverride * cur.threads, 0);

  ns.tprintRaw(['Starting AUTO Attack on: ', target]);
  ns.tprintRaw(['Total script cost: ', totalScriptCost]);

  // TODO: if grow or security is not 0 then break - we are out of sync

  let i = 0;
  while (true) {
    const botServers = getBotNodesRange(ns, fromServer, toServer);
    for (const bot of botServers) {
      if (bot.ram.free < totalScriptCost) {
        continue;
      }
      executeCommands(ns, listCommands, bot.id, target);
      await ns.sleep(200);
    }
    i++;
    ns.print(`Batch ${i} completed`);
    await ns.sleep(200);
  }
}
