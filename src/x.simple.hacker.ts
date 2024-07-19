import { NS } from '@ns';
import { executeCommands, getSimpleProtoBatch } from 'lib/lib.batch';
import { getServerNodesDetailed, getTargetNodesDetailed } from 'lib/lib.node';
import { brutePenetrate, deployProtoAct } from './lib/utils';

/**
 * Simple hacker script
 * Use this to start a total new game
 * Add a target to hack
 * @param ns
 */

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  const target = ns.args[0]?.toString() ?? 'n00dles';
  ns.print('Target: ', target);

  const listCommands = getSimpleProtoBatch(ns, target);

  const totalScriptCost = listCommands.reduce((acc, cur) => acc + cur.ramOverride * cur.threads, 0);
  ns.print('Total script cost: ', totalScriptCost);

  const mostExpensive = listCommands.reduce((acc, cur) => Math.max(acc, cur.ramOverride * cur.threads), 0);

  ns.print('Most expensive script cost: ', mostExpensive);
  // Try to brute force the target before starting
  const nodeServers = getTargetNodesDetailed(ns, 'hackChance').filter((s) => s.id !== 'home');
  const botsWithAdmin = [];
  for (const bot of [...nodeServers]) {
    const result = brutePenetrate(ns, bot.id);
    if (result) {
      botsWithAdmin.push(bot);
    }
    deployProtoAct(ns, [bot.id]);
  }
  botsWithAdmin.forEach((b) => ns.print('Bot with admin: ', b.id));
  ns.tail();


  while (true) {
    for (const bot of botsWithAdmin) {
      const isAdmin = bot.server.hasAdminRights;
      const freeRam = bot.ram.free;

      if (isAdmin && freeRam >= mostExpensive) {
        executeCommands(ns, listCommands, bot.id, target);
      } else {
        ns.print('Bot not ready ', bot.id, isAdmin, freeRam);
      }
      await ns.sleep(200);
    }
    await ns.sleep(1000);
  }
}
