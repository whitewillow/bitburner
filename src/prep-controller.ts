import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import { executeCommands, getPreppingBatch, maxCommandRamCost } from 'lib/lib.batch';
import { getBotServersRange, getTargetServers } from 'lib/lib.server';
import { addStateCurrentlyPrepping, removeStateCurrentlyPrepping } from './state/state.prep';
import { MAX_COMMANDS } from './lib/constants';

/**
 * Prepper script
 * Calls bot servers to prep a target
 * @param ns
 */

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const fromServer: number = (ns.args[1] as number) ?? 0;
  const toServer: number = (ns.args[2] as number) ?? 6;
  const serversToUse = ns.args[3]?.toString() ?? 'bots,home,nodes';

  ns.disableLog('ALL');
  ns.printRaw(['Starting Prepping Target: ', target]);
  addStateCurrentlyPrepping(ns, target);

  // Mainly for bots with 32 or more threads
  const listCommandsAdvanced = getPreppingBatch(ns, target);
  const listCommandsSimple = getPreppingBatch(ns, target, 1, 1);

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

  function getAttackServers(): XServer[] {
    const homeServer = new XServer(ns, 'home');
    const botServers = toServer === 0 ? [] : getBotServersRange(ns, fromServer, toServer);
    const availableNodes = getAvailableNodes();
    const useServer: XServer[] = [];

    if (serversToUse.includes('bots')) {
      useServer.push(...botServers);
    }

    if (serversToUse.includes('nodes')) {
      useServer.push(...availableNodes);
    }

    if (serversToUse.includes('home')) {
      useServer.push(homeServer);
    }

    return useServer;
  }

  let i = 0;
  let commandsUsed = 0;
  while (true) {
    await ns.sleep(20);

    /**
     * If we have used more than the max commands
     * then we should stop the script
     * to prevent black screen
     */
    if (commandsUsed > MAX_COMMANDS) {
      ns.print(`Max commands reached: ${commandsUsed}`);
      console.log('PREP - Max commands reached', commandsUsed);
      removeStateCurrentlyPrepping(ns, target);
      break;
    }

    const targetServer = new XServer(ns, target);

    if (targetServer.isMoneyAvailableMaxed && targetServer.isServerWeakendToMinimum) {
      ns.print(`Prepping completed!`);
      removeStateCurrentlyPrepping(ns, target);
      break;
    }

    const attackServers = getAttackServers();

    for (const bot of attackServers) {
      const ramFree = bot.id === 'home' ? Math.floor(bot.ram.trueMax / 4) - bot.server.ramUsed : bot.ram.free;
      if (ramFree < ramRequired(bot)) {
        // No more free ram - skip to next bot
        continue;
      }

      const commands = commandsToUse(bot);
      executeCommands(ns, commands, bot.id, target);
      commandsUsed += commands.length;

      // Must delay between commands
      // so batch can catch up - This should be a dealy between commands
      await ns.sleep(40);
    }
    i++;
    ns.print(`PrepBatch ${i} completed`);
  }
}
