import { FilenameOrPID, NS } from '@ns';
import XServer from 'lib/class.xserver';
import { getBotServers, getPotentialTargets } from 'lib/lib.server';
import { sortField } from 'lib/utils';
import {
  addStateCurrentlyAttacking,
  getStateCurrentlyAttacking,
  removeStateCurrentlyAttacking,
  setStateCurrentlyAttacking,
} from 'state/state.attack';
import { getStateCurrentlyPrepping, setStateCurrentlyPrepping } from 'state/state.prep';
import { getStateIgnoreTargets } from '/state/state.controller-ignore';

interface Attack {
  host: string;
  pid: FilenameOrPID;
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  ns.print('Starting Proto Service');
  ns.print('use monitor-targets.js to monitor the service');

  const MAX_PREPS = Number(ns.args[0] ?? 4);
  const MAX_ATTACKS = Number(ns.args[1] ?? 20);
  const ATTACK_HACKCHANCE_HIGHER_THAN = 80;
  const PREPPING_HACKCHANCE_HIGHER_THAN = 50;
  let i = 0;

  let availableBots: XServer[] = [];
  let currentlyPrepping: string[] = [];
  let currentlyAttacking: Array<Attack> = [];
  let player = ns.getPlayer();
  let possibleOutOfSync: string[] = [];
  let outOfSyncServers: { host: string; counter: number }[] = [];
  let ignoreTargets: string[] = [];

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

  function sortByDifficultyAndMoneyPerSecond(a: XServer, b: XServer) {
    if (a.hackDifficulty === b.hackDifficulty) {
      return a.moneyPerSecond - b.moneyPerSecond;
    }
    return a.hackDifficulty - b.hackDifficulty;
  }

  /**
   * Get potential targets that are not currently being attacked or prepped - Sorted by moneyPerSecond desc
   * @param fromHackChance
   */
  function getPotentialTargetsFiltered(fromHackChance: number = ATTACK_HACKCHANCE_HIGHER_THAN) {
    const currentlyAttackingIds = currentlyAttacking.map((m) => m.host);
    const potentialTargets = getPotentialTargets(ns, player.skills.hacking)
      .filter((f) => !ignoreTargets.includes(f.id) && f.hackChance >= fromHackChance)
      .filter((f) => !currentlyAttackingIds.includes(f.id) && !currentlyPrepping.includes(f.id))
      .sort(sortByDifficultyAndMoneyPerSecond);

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
    const stateCurrentlyAttacking = getStateCurrentlyAttacking(ns);
    currentlyAttacking = currentlyAttacking.filter((f) => stateCurrentlyAttacking.includes(f.host));
    ignoreTargets = getStateIgnoreTargets(ns);
  }

  setStateCurrentlyPrepping(ns, []);
  setStateCurrentlyAttacking(ns, []);

  while (true) {
    getState();

    player = ns.getPlayer();
    availableBots = getBotServers(ns);

    checkIfOutOfSync();
    checkForBetterTargets();

    if (currentlyAttacking.length < MAX_ATTACKS) {
      startNewAttack();
    }

    if (currentlyPrepping.length < MAX_PREPS) {
      startNewPrepping();
    }

    i++;
    await ns.sleep(2000);
  }
}
