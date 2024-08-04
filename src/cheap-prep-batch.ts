import { FilenameOrPID, NS } from '@ns';
import XServer from 'lib/class.xserver';
import { executeCommands, getPreppingBatch, getProtoBatch, totalCommandRamCost } from 'lib/lib.batch';

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const botServer = ns.getHostname();

  ns.disableLog('ALL');
  ns.printRaw(['Target: ', target]);

  let i = 0;

  let state = 'PREPPING';
  ns.print(`Starting prepping...`);

  function moneyAvailablePercent(moneyAvailable: number, moneyMax: number): number {
    return ((moneyAvailable ?? 0) / (moneyMax ?? 0)) * 100;
  }

  while (true) {
    const maxRam = ns.getServerMaxRam(botServer);
    const freeRam = maxRam - ns.getServerUsedRam(botServer);

    const listCommands =
      state === 'PREPPING' ? getPreppingBatch(ns, target, 1, 1) : getProtoBatch(ns, target, ['h', 'w', 'g', 'w'], true);
    const totalRamCost = totalCommandRamCost(ns, listCommands);
    const pids: FilenameOrPID[] = [];

    if (!ns.hasRootAccess(target)) {
      ns.print(`No admin rights on target - Waiting a little bit`);
      await ns.sleep(5000);
      continue;
    }

    const money = ns.getServerMoneyAvailable(target);
    const moneyMax = ns.getServerMaxMoney(target);
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const securityLevel = ns.getServerSecurityLevel(target);

    if (state === 'PREPPING') {
      if (money === moneyMax && minSecurity === securityLevel) {
        state = 'ATTACKING';
        ns.print(`Prepping completed - switching to attacking`);
        continue;
      }
    }
    if (state === 'ATTACKING') {
      if (moneyAvailablePercent(money, moneyMax) < 5) {
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
      await ns.sleep(40);
      pids.push(...cmdPids);
    }

    await ns.sleep(40);

    i++;
  }
}
