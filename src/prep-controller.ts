import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import {
  executeCommands,
  getPreppingBatch,
  getSimplePreppingBatch,
  maxCommandRamCost
} from 'lib/lib.batch';
import { getBotServersRange, getTargetServers } from 'lib/lib.server';
import { addStateCurrentlyPrepping, removeStateCurrentlyPrepping } from './state/state.prep';

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
  addStateCurrentlyPrepping(ns, target);

  // Mainly for bots with 32 or more threads
  const listCommandsAdvanced = getPreppingBatch(ns, target);
  const listCommandsSimple = getSimplePreppingBatch(ns, target);

  const ramRequiredForSimple = maxCommandRamCost(ns, listCommandsSimple);
  const ramRequiredForAdvanced = maxCommandRamCost(ns, listCommandsAdvanced);

  function commandsToUse(bot: XServer) {
    return bot.ram.max >= ramRequiredForAdvanced ? listCommandsAdvanced : listCommandsSimple;
  }

  function ramRequired(bot: XServer) {
    return bot.ram.max >= ramRequiredForAdvanced ? ramRequiredForAdvanced : ramRequiredForSimple;
  }

  function getAvailableNodes(): XServer[] {
    const availableNodes = getTargetServers(ns).filter((f) => f.ram.used === 0);
    return availableNodes;
  }

  let i = 0;
  while (true) {
    await ns.sleep(20);

    const targetServer = new XServer(ns, target);

    if (targetServer.isMoneyAvailableMaxed && targetServer.isServerWeakendToMinimum) {
      ns.print(`Prepping completed!`);
      removeStateCurrentlyPrepping(ns, target);
      break;
    }

    const homeServer = new XServer(ns, 'home');
    const botServers = toServer === 0 ? [] : getBotServersRange(ns, fromServer, toServer);
    const availableNodes = getAvailableNodes();
    for (const bot of [...botServers, ...availableNodes, homeServer]) {
      const ramFree = bot.id === 'home' ? Math.floor(bot.ram.free / 4) : bot.ram.free;
      if (ramFree < ramRequired(bot)) {
        // No more free ram - skip to next bot
        continue;
      }
      const commands = commandsToUse(bot);

      executeCommands(ns, commands, bot.id, target);

      // Must delay between commands
      // so batch can catch up - This should be a dealy between commands
      await ns.sleep(40);
    }
    i++;
    ns.print(`PrepBatch ${i} completed`);
  }
}
