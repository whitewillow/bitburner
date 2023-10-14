import { deployVirusScripts, brutePenetrate, canHack } from './utils';
import { getServerNodesDetailed, getTargetNodesDetailed } from './lib.node';

/** @param {NS} ns */
export async function main(ns) {
  const [CHOICE] = ns.args.length > 0 ? ns.args : ['normal'];

  ns.disableLog('ALL');

  const waitTime = 2000;

  function executeScript(script, serverHost, available_threads, targetHost) {
    if (available_threads >= 1) {
      ns.exec(script, serverHost, available_threads, targetHost)
    }
  }

  ns.tprint('Starting Intermediate Hack - Focus: ' + CHOICE.toUpperCase());

  while (true) {

    /** @type [{server:Server}] */
    const botServers = getServerNodesDetailed(ns, 'hackChance').filter(s => s.id !== 'home');
    /** @type [{server:Server}] */
    const targets = getTargetNodesDetailed(ns, 'hackChance').filter(s => s.server.moneyAvailable > 5000);

    deployVirusScripts(ns, botServers.map(m => m.id));


    for (const bot of botServers) {

      for (const target of targets) {

        const hasAdminRights = bot.server.hasAdminRights && target.server.hasAdminRights;
        const hasMoney = target.server.moneyAvailable > 5000;


        if (hasAdminRights && hasMoney && canHack(ns, target.id)) {


          const shouldWeaken = target.server.hackDifficulty > target.server.requiredHackingSkill + 5;
          const shouldGrow = CHOICE !== 'maxcash' && target.server.moneyAvailable < (target.server.moneyMax * 0.70);

          if (shouldWeaken) {
            executeScript('v.weak.js', bot.id, bot.threadCount(1.75), target.id);
            continue;
          }

          if (shouldGrow) {
            executeScript('v.grow.js', bot.id, bot.threadCount(1.75), target.id);
            continue;
          }

          // HACK
          executeScript('v.hack.js', bot.id, bot.threadCount(1.7), target.id);


        } else {
          // ns.print('Penatrate', bot.id);
          brutePenetrate(ns, bot.id);
        }
      }
    }
    await ns.sleep(waitTime);
  }

}
