import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import { getBotNodesDetailed } from 'lib/lib.node';
import { brutePenetrate } from 'lib/utils';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  let level = ns.args[0] ?? 'A';

  ns.tprint('Booting up...');
  await ns.sleep(500);
  ns.tprint('Level: ' + level);

  async function prepAndWait(host: string) {
    ns.run('x.proto.prep.js', 1, host);
    await ns.sleep(500);
    ns.tprint('- Starting: prepping ' + host);
    while (true) {
      const firstAttack = new XServer(ns, host);
      if (firstAttack.isMoneyAvailableMaxed && firstAttack.isServerWeakendToMinimum) {
        break;
      }
      await ns.sleep(500);
    }
  }

  async function cheapPrepAndWait(host: string) {
    ns.run('x.proto.prep.js', 1, host);
    await ns.sleep(500);
    ns.tprint('- Starting: cheap prepping ' + host);
    while (true) {
      const monyMaxed = ns.getServerMoneyAvailable(host) === ns.getServerMaxMoney(host);
      const weakend = ns.getServerSecurityLevel(host) ===  ns.getServerMinSecurityLevel(host);
      if (monyMaxed && weakend) {
        break;
      }
      await ns.sleep(500);
    }
  }

  async function waitForServersToGrow() {
    ns.tprint('- Waiting for servers to grow...');
    while (true) {
      const bots = getBotNodesDetailed(ns);
      const currentMinRam = bots.reduce((acc, cur) => Math.min(acc, cur.ram.trueMax), 999999);
      const currentMaxRam = bots.reduce((acc, cur) => Math.max(acc, cur.ram.trueMax), 0);
      if (bots.length >= 25 && bots.every((e) => e.ram.trueMax >= 64)) {
        ns.tprint(`- All servers are at 64GB`);
        break;
      }
      ns.tprint(`- Current min/max ram: ${currentMinRam}/${currentMaxRam} for ${bots.length} servers`);
      await ns.sleep(10000);
    }
  }

  const FIRST_HOST = 'n00dles';
  const SECOND_HOST = 'foodnstuff';

  if (level === 'BITNODE') {

    ns.tprint('- Nuking: ' + FIRST_HOST);
    brutePenetrate(ns, FIRST_HOST)
    await ns.sleep(500);
    ns.tprint('- Prepping: ' + FIRST_HOST);
    await cheapPrepAndWait(FIRST_HOST);
    ns.tprint('- Hacking: ' + FIRST_HOST);
    const start_hack = ns.run('x.proto.batch.js', 2, FIRST_HOST);
    await ns.sleep(500);
    ns.tprint('- Upgrade servers to 64GB');
  }

  if (level === 'START') {
    const start_nodehack = ns.run('a.node.hack.js');
    ns.tprint('- Starting: a.node.hack.js');
    await ns.sleep(500);

    await prepAndWait(FIRST_HOST);
    await prepAndWait(SECOND_HOST);

    const start_bot = ns.run('a.bot.maintainer.js');
    ns.tprint('- Starting: a.bot.maintainer.js');
    await ns.sleep(500);

    const start_hack = ns.run('x.proto.batch.js', 2, FIRST_HOST);
    ns.tprint('- Starting: hacking ' + FIRST_HOST);
    const start_hack2 = ns.run('x.proto.batch.js', 2, SECOND_HOST);
    ns.tprint('- Starting: hacking ' + SECOND_HOST);

    await waitForServersToGrow();
    ns.tprint('Killing scripts... \n');

    ns.kill(start_nodehack);
    ns.kill(start_bot);
    ns.kill(start_hack);
    ns.kill(start_hack2);

    await ns.sleep(500);

    level = 'A';
    ns.tprint('Booting up...');
    await ns.sleep(500);
    ns.tprint('Level: ' + level);
  }

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
