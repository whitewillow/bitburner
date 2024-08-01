import { NS } from '@ns';
import {
  executeCommands,
  getProtoBatch,
  getSimpleProtoBatch,
  isTargetReadyForAttack,
  maxCommandRamCost
} from 'lib/lib.batch';
import { getBotServersRange } from 'lib/lib.server';
import XServer from './lib/class.xserver';

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

  // TODO - Benytter andre servere,

  if (!isTargetReadyForAttack(ns, target)) {
    ns.printRaw(['Target is not ready for attack: ', target]);
    ns.printRaw('- please prep before attacking');
    ns.printRaw('Exiting...');
    ns.exit();
  }

  // Mainly for bots with 32 or more threads
  const listCommandsAdvanced = getProtoBatch(ns, target);
  const listCommandsSimple = getSimpleProtoBatch(ns, target);

  const ramRequiredForSimple = maxCommandRamCost(ns, listCommandsSimple);
  const ramRequiredForAdvanced = maxCommandRamCost(ns, listCommandsAdvanced);

  function commandsToUse(bot: XServer) {
    return bot.ram.max >= ramRequiredForAdvanced ? listCommandsAdvanced : listCommandsSimple;
  }
  function ramRequired(bot: XServer) {
    return bot.ram.max >= ramRequiredForAdvanced ? ramRequiredForAdvanced : ramRequiredForSimple;
  }

  ns.printRaw(['Starting AUTO Attack on: ', target]);
  ns.printRaw(['Max Ram cost [simple, advanced]: ', ramRequiredForSimple, ramRequiredForAdvanced]);

  // TODO: if grow or security is not 0 then break - we are out of sync
  let i = 0;
  while (true) {
    await ns.sleep(10);

    const botServers = getBotServersRange(ns, fromServer, toServer);
    for (const bot of botServers) {
      if (bot.ram.free < ramRequired(bot)) {
        // console.log('Not enough ram for bot:', bot.id);
        // No more free ram - we wait
        continue;
      }
      const commands = commandsToUse(bot);
      executeCommands(ns, commands, bot.id, target);
      // Must delay between commands
      // so batch can catch up
      await ns.sleep(40);
    }

    i++;
    ns.print(`Batch ${i} completed`);
  }
}
