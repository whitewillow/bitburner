import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import { PrintRows, PrintTable } from 'lib/lib.printcheap';
import { getTargetNodesDetailed } from 'lib/lib.node';
import { brutePenetrate, deployProto, deployProtoAct } from 'lib/utils';

/**
 * Auto - Node Hacker - Looks for new servers to penetrate
 * Should be run in background when having enough memory
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.tail();
  ns.printRaw('Starting Node Hacker');

  const WAIT_TIME = 10000;
  let state = 'INIT'; // INIT | NO_TARGET | TARGET_FOUND

  function deployTools(targetIds: string[]) {
    deployProtoAct(ns, targetIds);
    deployProto(ns, targetIds);
    ns.printRaw('Deployed tools');
  }

  while (true) {
    const playerHackLvl = ns.getHackingLevel();
    const possibleTargets = getTargetNodesDetailed(ns, 'hackChance');
    const targetsNotAdmin = possibleTargets.filter(
      (t) =>
        !t.server.hasAdminRights && t.server.requiredHackingSkill && t.server.requiredHackingSkill <= playerHackLvl,
    );

    deployTools(possibleTargets.map((m) => m.id));

    if (targetsNotAdmin.length === 0) {
      if (state !== 'NO_TARGET') {
        ns.printRaw('No Targets found');
        state = 'NO_TARGET';
      }
      await ns.sleep(WAIT_TIME);
      continue;
    }

    const success: XServer[] = [];

    for (const target of targetsNotAdmin) {
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
