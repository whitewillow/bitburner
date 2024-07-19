import { NS } from '@ns';
import { executeCommands, getPreppingBatch, getSimplePreppingBatch, maxCommandRamCost } from 'lib/lib.batch';
import XServer from 'lib/class.xserver';
import { getAvailableNodes, getBotNodesRange } from 'lib/lib.node';

/**
 * Prepper script
 * Calls bot servers to prep a target
 * @param ns
 */

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const fromServer: number = (ns.args[1] as number) ?? 0;
  const toServer: number = (ns.args[2] as number) ?? 6;

  ns.disableLog('ALL');
  ns.printRaw(['Starting Prepping Target: ', target]);

  // Mainly for bots with 32 or more threads
  const listCommandsAdvanced = getPreppingBatch(ns, target);
  const listCommandsSimple = getSimplePreppingBatch(ns, target);

  const ramRequiredForSimple = maxCommandRamCost(ns, listCommandsSimple);
  const ramRequiredForAdvanced = maxCommandRamCost(ns, listCommandsAdvanced);

  function commandsToUse(bot: XServer) {
    return bot.ram.max >= 32 ? listCommandsAdvanced : listCommandsSimple;
  }
  function ramRequired(bot: XServer) {
    return bot.ram.max >= 32 ? ramRequiredForAdvanced : ramRequiredForSimple;
  }

  let i = 0;
  while (true) {
    await ns.sleep(200);

    const targetServer = new XServer(ns, target);

    if (targetServer.isMoneyAvailableMaxed && targetServer.isServerWeakendToMinimum) {
      ns.print(`Prepping completed!`);
      break;
    }

    const botServers = getBotNodesRange(ns, fromServer, toServer);
    const availableNodes = getAvailableNodes(ns);
    for (const bot of [...botServers, ...availableNodes]) {
      if (bot.ram.free < ramRequired(bot)) {
        // No more free ram - we wait
        await ns.sleep(1000);
        continue;
      }
      executeCommands(ns, commandsToUse(bot), bot.id, target);
    }
    i++;
    ns.print(`PrepBatch ${i} completed`);
  }
}
