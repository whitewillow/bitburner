import { NS } from '@ns';
import { deployVirusScripts, brutePenetrate, canHack } from 'lib/utils';
import { getServerNodesDetailed, getTargetNodesDetailed } from 'lib/lib.node';

export async function main(ns: NS): Promise<void> {
  const CHOICE: string = ns.args[0]?.toString() ?? 'normal'; // normal | maxcash

  ns.disableLog('ALL');

  const waitTime = 2000;

  function executeScript(
    script: string,
    serverHost: string,
    available_threads: number,
    targetHost: string,
  ) {
    if (available_threads >= 1) {
      ns.exec(script, serverHost, available_threads, targetHost);
    }
  }

  ns.tprint('Starting Intermediate Hack - Focus: ' + CHOICE.toUpperCase());

  while (true) {
    const botServers = getServerNodesDetailed(ns, 'hackChance').filter((s) => s.id !== 'home');
    const targets = getTargetNodesDetailed(ns, 'hackChance').filter(
      (s) => s.server.moneyAvailable ?? 0 > 5000,
    );

    deployVirusScripts(
      ns,
      botServers.map((m) => m.id),
    );

    for (const bot of botServers) {
      for (const target of targets) {
        const hasAdminRights = bot.server.hasAdminRights && target.server.hasAdminRights;
        const hasMoney = target.server.moneyAvailable ?? 0 > 5000;

        if (hasAdminRights && hasMoney && canHack(ns, target.id)) {
          const shouldWeaken =
            target.server.hackDifficulty ?? 0 > (target.server.requiredHackingSkill ?? 0) + 5;
          const shouldGrow =
            CHOICE !== 'maxcash' &&
            (target.server.moneyAvailable ?? 0) < (target.server.moneyMax ?? 0 * 0.7);

          if (shouldWeaken) {
            executeScript('virus/v.weak.js', bot.id, bot.threadCount(1.75), target.id);
            continue;
          }

          if (shouldGrow) {
            executeScript('virus/v.grow.js', bot.id, bot.threadCount(1.75), target.id);
            continue;
          }

          // HACK
          executeScript('virus/v.hack.js', bot.id, bot.threadCount(1.7), target.id);
        } else {
          // ns.print('Penatrate', bot.id);
          brutePenetrate(ns, bot.id);
        }
      }
    }
    await ns.sleep(waitTime);
  }
}
