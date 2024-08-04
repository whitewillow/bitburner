import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import { PrintTable, generateRecordRows, printLogHeader } from 'lib/lib.print';
import { getTargetServersSorted } from 'lib/lib.server';
import { brutePenetrate, deployProtoAct } from 'lib/utils';
import { PenetratorState } from '/lib/types';
import { getStatePenetrator, setStatePenetrator } from '/state/state.penetrator';

/**
 * Auto - Node Hacker - Looks for new servers to penetrate
 * Should be run in background when having enough memory
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.printRaw('Penetrator Service Started');

  const WAIT_TIME = 10000;

  function deployTools(targetIds: string[]) {
    deployProtoAct(ns, targetIds);
    // TODO: Maybe deploy other tools ?
  }

  function minutesSinceLastHacked(state: PenetratorState): string {
    if (!state.recentlyHackedTime) {
      return 'N/A';
    }
    return ns.formatNumber((Date.now() - state.recentlyHackedTime) / 60000);
  }

  function printState(state: PenetratorState, iterations: number) {
    ns.clearLog();

    printLogHeader(ns, `Penetrator Service - Iteration: ${iterations}`);
    const recordRows = generateRecordRows([
      { title: 'Known Servers', value: state.knownServers.length },
      { title: 'Servers With Root', value: state.serversWithRoot.length },
      { title: 'Potential Targets', value: state.potentialTargets.length },
      { title: 'Servers Cant Hack', value: state.serversCantHack.length },
      { title: 'Recently Hacked', value: state.recentlyHacked.length },
      { title: 'Recently Hacked Time', value: minutesSinceLastHacked(state) },
    ]);
    PrintTable(ns, null, recordRows, { fancy: false, padding: 2 });
  }

  let iterations = 0;

  while (true) {
    const playerHackLvl = ns.getHackingLevel();
    const possibleTargets = getTargetServersSorted(ns, 'hackChance');
    const targetsAdmin = possibleTargets.filter((t) => t.server.hasAdminRights);
    const potentialTargets = possibleTargets.filter(
      (t) =>
        !t.server.hasAdminRights && t.server.requiredHackingSkill && t.server.requiredHackingSkill <= playerHackLvl,
    );

    deployTools(possibleTargets.map((m) => m.id));
    const penetratorState: PenetratorState = getStatePenetrator(ns);
    penetratorState.knownServers = possibleTargets.map((m) => m.id);
    penetratorState.serversWithRoot = targetsAdmin.map((m) => m.id);
    penetratorState.potentialTargets = potentialTargets.map((m) => m.id);
    penetratorState.serversCantHack = penetratorState.knownServers.filter(
      (ks) => !penetratorState.serversWithRoot.includes(ks) && !penetratorState.potentialTargets.includes(ks),
    );

    if (potentialTargets.length > 0) {
      // Try to penetrate
      const success: XServer[] = possibleTargets.filter((pt) => brutePenetrate(ns, pt.id));
      if (success.length > 0) {
        // Save the recently hacked servers
        penetratorState.recentlyHacked = success.map((m) => m.id);
        penetratorState.recentlyHackedTime = Date.now();
      }
    }

    setStatePenetrator(ns, penetratorState);

    printState(penetratorState, iterations);
    iterations++;

    await ns.sleep(WAIT_TIME);
  }
}
