import { NS } from '@ns';
import { executeCommands, getSimpleProtoBatch, maxCommandRamCost } from 'lib/lib.batch';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const botServer = 'home';
  ns.print('Target: ', target);

  ns.print('Starting batch attack on: ', target, ' from: ', botServer);

  const listCommands = getSimpleProtoBatch(ns, target);

  const maxCRamCost = maxCommandRamCost(ns, listCommands);
  ns.print('Total script cost: ', maxCommandRamCost);
  console.log('commands', listCommands);

  // while (true) {
  //   const freeRam = ns.getServerMaxRam(botServer) - ns.getServerUsedRam(botServer);

  //   if (freeRam > maxCRamCost) {
  //     executeCommands(ns, listCommands, botServer, target);
  //   } 
  //   await ns.sleep(1000);
  // }
}
