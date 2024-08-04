import { FilenameOrPID, NS } from '@ns';
import XServer from 'lib/class.xserver';
import { executeCommands, getPreppingBatch, getProtoBatch, totalCommandRamCost } from 'lib/lib.batch';
import { MAX_COMMANDS } from './lib/constants';

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const botServer = ns.getHostname();

  ns.disableLog('ALL');
  ns.printRaw(['Target: ', target]);

  let i = 0;

  let state = 'PREPPING';
  ns.print(`Starting prepping...`);

  let commandsUsed = 0;
  while (true) {
    /**
     * If we have used more than the max commands
     * Then we wait a little bit to prevent black screen
     */
    if (commandsUsed > MAX_COMMANDS) {
      ns.print(`Max commands reached: ${commandsUsed} - Waiting a little bit`);
      console.log('Fixed Max commands reached', commandsUsed);
      await ns.sleep(30000);
      ns.print(`Starting again...`);
      commandsUsed = 0;
      break;
    }

    const maxRam = ns.getServerMaxRam(botServer);
    const freeRam = maxRam - ns.getServerUsedRam(botServer);

    const listCommands =
      state === 'PREPPING' ? getPreppingBatch(ns, target, 1, 1) : getProtoBatch(ns, target, ['h', 'w', 'g', 'w'], true);
    const totalRamCost = totalCommandRamCost(ns, listCommands);
    const pids: FilenameOrPID[] = [];
    const targetServer = new XServer(ns, target);

    if (!targetServer.server.hasAdminRights) {
      ns.print(`No admin rights on target - Waiting a little bit`);
      await ns.sleep(5000);
      continue;
    }

    if (state === 'PREPPING') {
      if (targetServer.isMoneyAvailableMaxed && targetServer.isServerWeakendToMinimum) {
        state = 'ATTACKING';
        ns.print(`Prepping completed - switching to attacking`);
        continue;
      }
    }
    if (state === 'ATTACKING') {
      if (targetServer.moneyAvailablePercent < 5) {
        state = 'PREPPING';
        ns.print(`Attack out of sync - switching to prepping`);
        continue;
      }
    }

    const canRunTimes = Math.floor(freeRam / totalRamCost);
    const runTimes = Math.min(canRunTimes, 100);

    if (runTimes === 0) {
      await ns.sleep(1000);
      continue;
    }

    for (let i = runTimes; i > 0; i--) {
      const cmdPids = executeCommands(ns, listCommands, botServer, target);
      commandsUsed += listCommands.length;
      await ns.sleep(40);
      pids.push(...cmdPids);
    }

    await ns.sleep(40);

    i++;
  }
}
