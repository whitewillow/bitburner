import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import { PrintRows, PrintTable } from 'lib/lib.print';
import { getTargetNodesDetailed } from 'lib/lib.node';
import { brutePenetrate, deployProto, deployProtoAct } from 'lib/utils';

/**
 * Auto - Node Hacker - Looks for new servers to penetrate
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  ns.printRaw('Starting Node Hacker');

  const WAIT_TIME = 10000;
  let state = 'INIT'; // INIT | NO_TARGET | TARGET_FOUND

  while (true) {
    const playerHackLvl = ns.getHackingLevel();
    const targets = getTargetNodesDetailed(ns, 'hackChance').filter(
      (t) =>
        !t.server.hasAdminRights &&
        t.server.requiredHackingSkill &&
        t.server.requiredHackingSkill <= playerHackLvl,
    );

    if (targets.length === 0) {
      if (state !== 'NO_TARGET') {
        ns.printRaw('No Targets found');
        state = 'NO_TARGET';
      }
      await ns.sleep(WAIT_TIME);
      continue;
    }

    const success: XServer[] = [];

    deployProtoAct(
      ns,
      targets.map((t) => t.id),
    );
    deployProto(
      ns,
      targets.map((t) => t.id),
    );

    for (const target of targets) {
      if (brutePenetrate(ns, target.id)) {
        success.push(target);
      }
    }

    if (success.length === 0) {
      if (state !== 'TARGET_FOUND') {
        ns.printRaw('Found targets but failed to penetrate');
        state = 'TARGET_FOUND';
      }
      await ns.sleep(WAIT_TIME);
      continue;
    }

    const rows: PrintRows[] = [];

    for (const server of success) {
      const columns = [
        {
          title: 'Host',
          value: server.id,
        },
        {
          title: 'Hacked',
          value: true,
        },
        {
          title: 'Chance',
          value: ns.formatPercent(server.hackChance),
        },
      ];
      rows.push({ columns });
    }

    PrintTable(ns, 'Successfully penetrated', rows);
    state = 'TARGET_FOUND';
    await ns.sleep(WAIT_TIME);
  }
}
