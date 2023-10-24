import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  const level = ns.args[0] ?? 'A';

  ns.tprint('Booting up...');
  await ns.sleep(500);
  ns.tprint('Level: ' + level);

  if (level === 'A') {
    ns.run('a.node.hack.js');
    ns.tprint('- Starting: a.node.hack.js');
    await ns.sleep(500);
    ns.run('a.bot.maintainer.js');
    ns.tprint('- Starting: a.bot.maintainer.js');
    await ns.sleep(500);
    ns.run('a.hnet.maintainer.js');
    ns.tprint('- Starting: a.hnet.maintainer.js');
    await ns.sleep(500);
    const PID = ns.run('x.auto.js');
    ns.tprint('- Starting: x.auto.js');
    await ns.sleep(500);
    ns.tail(PID);
  }

  ns.tprint('Done!');
}
