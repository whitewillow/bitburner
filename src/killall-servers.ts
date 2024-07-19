import { NS } from '@ns';
import { range } from 'lib/utils';
import { SERVER_PREFIX } from 'lib/constants';
import { getServerNodesDetailed } from './lib/lib.node';

export async function main(ns: NS): Promise<void> {
  ns.killall();
  range(0, 25)
    .map((m) => SERVER_PREFIX + m)
    .forEach((host) => {
      try {
        ns.killall(host);
      } catch (e) {
        ns.print(`Error killing ${host}`);
      }
    });

  const servers = getServerNodesDetailed(ns, 'hackChance');
  servers.forEach((s) => {
    ns.killall(s.id);
    try {
      ns.killall(s.id);
    } catch (e) {
      ns.print(`Error killing ${s.id}`);
    }
  });
}
