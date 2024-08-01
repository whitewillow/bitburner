import { FilenameOrPID, NS, Player } from '@ns';
import XServer from 'lib/class.xserver';
import { getBotServers, getTargetServers, getThreatAssesment } from 'lib/lib.server';
import { PrintTable } from 'lib/lib.printcheap';
import { generatePrepRow } from 'lib/lib.print.prep';
import { sortField } from 'lib/utils';
import { getStateCurrentlyPrepping, setStateCurrentlyPrepping } from 'state/state.prep';
import { addStateCurrentlyAttacking, removeStateCurrentlyAttacking, setStateCurrentlyAttacking } from 'state/state.attack';

interface Attack {
  host: string;
  pid: FilenameOrPID;
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();

  const MAX_PREPS = Number(ns.args[0] ?? 3);
  const MAX_ATTACKS = Number(ns.args[1] ?? 8);
  const ATTACK_HACKCHANCE_HIGHER_THAN = 80;
  const PREPPING_HACKCHANCE_HIGHER_THAN = 50;
  let i = 0;

  let targetServers: XServer[] = [];
  let availableBots: XServer[] = [];
  let currentlyPrepping: string[] = [];
  let currentlyAttacking: Array<Attack> = [];
  let player = ns.getPlayer();
  let possibleOutOfSync: string[] = [];
  let outOfSyncServers: { host: string; counter: number }[] = [];

  function printStatus() {
    const nodes = getPotentialTargets().map((m) => getThreatAssesment(ns, m));
    const underAttack = currentlyAttacking.map((m) => m.host);
    const rows = generatePrepRow(nodes, false, underAttack, currentlyPrepping);
    ns.clearLog();
    ns.printRaw('Max Prepping: ' + MAX_PREPS);
    ns.printRaw('Max Attacks: ' + MAX_ATTACKS);
    ns.printRaw('Prepping: ' + currentlyPrepping.length);
    ns.printRaw('Attacking: ' + currentlyAttacking.length);
    ns.printRaw('Bots: ' + availableBots.length);
    ns.printRaw('Possible OutOfSync: ' + possibleOutOfSync.length);
    ns.printRaw('OutOfSyncServers: ' + JSON.stringify(outOfSyncServers));
    ns.printRaw('Runs: ' + i);
    PrintTable(ns, 'Targets', rows, { fancy: true });
  }

  function getPrepBotStart() {
    return 0;
  }

  function getPrepBotEnd() {
    // // No attack active - use all bots
    // if (currentlyAttacking.length === 0) {
    //   return 25;
    // }

    // Not many bots available - dont use bots for prepping
    if (availableBots.length < 12) {
      return 0;
    }
    return 7;
  }

  function getAttackBotStart() {
    // Not many bots available - use all bots for attack
    if (availableBots.length < 12) {
      return 0;
    }
    return 7;
  }

  function getPotentialTargets() {
    // const potentialTargets = targetServers.filter(
    //   (f) => (f.server.moneyMax ?? 0) > 0 && f.hackChance >= fromHackChance,
    // );
    const potentialTargets = targetServers.filter(
      (f) =>
        (f.server.moneyMax ?? 0) > 0 &&
        f.server.hasAdminRights &&
        f.server.requiredHackingSkill &&
        f.server.requiredHackingSkill <= player.skills.hacking,
    );
    return potentialTargets;
  }

  /**
   * Get potential targets that are not currently being attacked or prepped - Sorted by moneyPerSecond desc
   * @param fromHackChance
   */
  function getPotentialTargetsFiltered(fromHackChance: number = ATTACK_HACKCHANCE_HIGHER_THAN) {
    const currentlyAttackingIds = currentlyAttacking.map((m) => m.host);
    const potentialTargets = getPotentialTargets()
      .filter((f) => f.hackChance >= fromHackChance)
      .filter((f) => !currentlyAttackingIds.includes(f.id) && !currentlyPrepping.includes(f.id))
      .sort(sortField('moneyPerSecond', 'desc'));
    return potentialTargets;
  }

  function getAttackTargets() {
    return getPotentialTargetsFiltered(ATTACK_HACKCHANCE_HIGHER_THAN).filter(
      (f) => f.isMoneyAvailableMaxed && f.isServerWeakendToMinimum,
    );
  }

  function getPreppingTargets(fromHackChance: number = PREPPING_HACKCHANCE_HIGHER_THAN) {
    return getPotentialTargetsFiltered(fromHackChance)
      .filter((f) => !f.isMoneyAvailableMaxed || !f.isServerWeakendToMinimum)
      .sort(sortField('hackChance', 'desc'));
  }

  /**
   * Starts a new attack on the first available target
   */
  function startNewAttack() {
    const potentialTargets = getAttackTargets();

    if (potentialTargets.length === 0) {
      return;
    }

    const [target] = potentialTargets;
    const pid = ns.run('batch-controller.js', 1, target.id, getAttackBotStart());
    currentlyAttacking.push({ host: target.id, pid });
    addStateCurrentlyAttacking(ns, target.id);
  }

  /**
   * Removes an attack from the currentlyAttacking list and stops the script
   * @param targetId
   */
  function killAndRemoveAttack(targetId: string) {
    const pid = currentlyAttacking.find((m) => m.host === targetId)?.pid;
    if (pid) {
      ns.kill(Number(pid));
    }
    removeStateCurrentlyAttacking(ns, targetId);
    currentlyAttacking = currentlyAttacking.filter((f) => f.host !== targetId);
    possibleOutOfSync = possibleOutOfSync.filter((f) => f !== targetId);
  }

  function addCounterToOutOfSync(host: string) {
    const server = outOfSyncServers.find((m) => m.host === host);
    if (server) {
      server.counter++;
    } else {
      outOfSyncServers.push({ host, counter: 1 });
    }
  }

  /**
   * Check if any of the currently attacking nodes are out of sync
   * Temporary method - should be replaced with a better method
   * @returns
   */
  function checkIfOutOfSync() {
    if (currentlyAttacking.length === 0) {
      return;
    }
    const currentlyUnderAttack = currentlyAttacking.map((m) => new XServer(ns, m.host));
    currentlyUnderAttack.forEach((f) => {
      if (f.moneyAvailablePercent < 5) {
        possibleOutOfSync.push(f.id);
      }
      if (possibleOutOfSync.filter((m) => m === f.id).length > 3) {
        addCounterToOutOfSync(f.id);
        killAndRemoveAttack(f.id);
      }
    });
  }

  /**
   * Check if there are better targets available with higher moneyPerSecond
   */
  function checkForBetterTargets() {
    const potentialTargets = getAttackTargets();

    if (currentlyAttacking.length === 0 || potentialTargets.length === 0) {
      return;
    }

    const currentlyUnderAttack = currentlyAttacking
      .map((m) => new XServer(ns, m.host))
      .sort(sortField('moneyPerSecond', 'desc'));

    const [newTarget] = potentialTargets;
    const [currentTarget] = currentlyUnderAttack;

    if (newTarget.moneyPerSecond > currentTarget.moneyPerSecond) {
      killAndRemoveAttack(currentTarget.id);
    }
  }

  function startNewPrepping() {
    const potentialTargets = getPreppingTargets();
    const potentialTargetsLow = getPreppingTargets(0);

    const [target] = potentialTargets.length > 0 ? potentialTargets : potentialTargetsLow;
    if (!target) {
      return;
    }
    ns.run('prep-controller.js', 1, target.id, getPrepBotStart(), getPrepBotEnd());
  }

  function getState() {
    currentlyPrepping = getStateCurrentlyPrepping(ns);
  }

  setStateCurrentlyPrepping(ns, []);
  setStateCurrentlyAttacking(ns, []);

  while (true) {
    await ns.sleep(1000);
    getState();

    player = ns.getPlayer();
    availableBots = getBotServers(ns);
    targetServers = getTargetServers(ns);

    //TODO: Able to focus on a single target

    checkIfOutOfSync();
    checkForBetterTargets();

    if (currentlyAttacking.length < MAX_ATTACKS) {
      startNewAttack();
    }

    if (currentlyPrepping.length < MAX_PREPS) {
      startNewPrepping();
      // TODO: Prep other targets if all other targets are prepped
    }

    /**
     * Update available nodes
     *
     * Hold state of available nodes
     * Hold state for currentlyPrepping
     * Hold state for currentlyAttacking
     *
     * Is any nodes ready for attack?
     * Is any nodes ready for prepping?
     */

    printStatus();

    i++;
  }
}
