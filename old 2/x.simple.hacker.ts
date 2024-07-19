import { NS } from '@ns';
import { executeCommands, getSimpleProtoBatch } from 'lib/lib.batch';
import { getServerNodesDetailed, getTargetNodesDetailed } from 'lib/lib.node';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  const target = ns.args[0]?.toString() ?? 'n00dles';
  ns.print('Target: ', target);

  const listCommands = getSimpleProtoBatch(ns, target);

  const totalScriptCost = listCommands.reduce((acc, cur) => acc + cur.ramOverride * cur.threads, 0);
  ns.print('Total script cost: ', totalScriptCost);

  while (true) {
    const botServers = getServerNodesDetailed(ns, 'hackChance').filter((s) => s.id !== 'home');

    for (const bot of botServers) {
      const isAdmin = bot.server.hasAdminRights;
      const freeRam = bot.ram.free;
      if (isAdmin && freeRam > totalScriptCost) {
        executeCommands(ns, listCommands, bot.id, target);
      }
      await ns.sleep(200);
    }

    await ns.sleep(1000);
  }
}
