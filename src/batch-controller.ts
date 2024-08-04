import { NS } from '@ns';
import { executeCommands, getProtoBatch, isTargetReadyForAttack, maxCommandRamCost } from 'lib/lib.batch';
import { getBotServersRange, getTargetServers } from 'lib/lib.server';
import XServer from './lib/class.xserver';
import { removeStateCurrentlyAttacking } from './state/state.attack';
import { MAX_COMMANDS } from './lib/constants';

/**
 * Hacker script
 * Calls bot servers to attack a target
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const fromServer: number = (ns.args[1] as number) ?? 7; // 7
  const toServer: number = (ns.args[2] as number) ?? 25; // 25
  const serversToUse = ns.args[3]?.toString() ?? 'bots';

  // TODO - Benytter andre servere,

  if (!isTargetReadyForAttack(ns, target)) {
    ns.printRaw(['Target is not ready for attack: ', target]);
    ns.printRaw('- please prep before attacking');
    ns.printRaw('Exiting...');
    ns.exit();
  }

  // Mainly for bots with 32 or more threads
  const listCommandsAdvanced = getProtoBatch(ns, target);
  const listCommandsSimple = getProtoBatch(ns, target, ['h', 'w', 'g', 'w'], true);

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

  ns.printRaw(['Starting AUTO Attack on: ', target]);
  ns.printRaw(['Max Ram cost [simple, advanced]: ', ramRequiredForSimple, ramRequiredForAdvanced]);

  // TODO: if grow or security is not 0 then break - we are out of sync
  let i = 0;
  let commandsUsed = 0;

  while (true) {
    await ns.sleep(10);

    /**
     * If we have used more than the max commands
     * then we should stop the script
     * to prevent black screen
     */
    if (commandsUsed > MAX_COMMANDS) {
      ns.print(`Max commands reached: ${commandsUsed}`);
      console.log('BATCH - Max commands reached', commandsUsed);
      removeStateCurrentlyAttacking(ns, target);
      break;
    }

    const attackServers = getAttackServers();
    for (const bot of attackServers) {
      if (bot.ram.free < ramRequired(bot)) {
        continue;
      }
      const commands = commandsToUse(bot);
      executeCommands(ns, commands, bot.id, target);
      commandsUsed += commands.length;
      // Must delay between commands
      // so batch can catch up
      await ns.sleep(40);
    }

    i++;
    ns.print(`Batch ${i} completed`);
  }
}
