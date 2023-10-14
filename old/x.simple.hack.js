import XServer from './class.xserver';
import { deployVirusScripts, brutePenetrate, canHack } from './utils';
import { getAllNodes } from './lib.node';

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');

  function deploy(script, serverHost, available_threads, targetHost) {
    if (available_threads >= 1) {
      ns.exec(script, serverHost, available_threads, targetHost)
    }
  }

  while (true) {

    const nodes = getAllNodes(ns);

    /** @type [{server:Server}] */
    const servers = nodes.filter(f => f !== 'home').map(node => new XServer(ns, node));

    deployVirusScripts(ns, nodes);

    const targets = servers.filter(s => s.id !== 'home' && !s.id.startsWith('pserv-') && s.server.moneyAvailable > 5000);

    for (const server of servers) {

      for (const target of targets) {

        const hasAdminRights = server.server.hasAdminRights && target.server.hasAdminRights;
        const hasMoney = target.server.moneyAvailable > 5000;


        if (hasAdminRights && hasMoney && canHack(ns, target.id)) {


          const shouldWeaken = target.server.hackDifficulty > target.server.requiredHackingSkill + 5;
          const shouldGrow = false; // target.server.moneyAvailable < (target.server.moneyMax * 0.70);

          if (shouldWeaken) {
            deploy('v.weak.js', server.id, server.threadCount(1.75), target.id);
            continue;
          }

          if (shouldGrow) {
            deploy('v.grow.js', server.id, server.threadCount(1.75), target.id);
            continue;
          }

          // HACK
          deploy('v.hack.js', server.id, server.threadCount(1.7), target.id);


        } else {
          ns.print('Penatrate', server.id);
          brutePenetrate(ns, server.id);
        }
      }
    }
    await ns.sleep(500);
  }

}