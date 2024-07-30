import { FilenameOrPID, NS } from '@ns';
import XServer from 'lib/class.xserver';
import { getBotServers, getTargetServers, getHackableTargetServers, getThreatAssesment } from 'lib/lib.server';
import { PrintTable } from 'lib/lib.print';
import { generatePrepRow } from 'lib/lib.print.prep';

interface Attack {
  host: string;
  pid: FilenameOrPID;
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  ns.tail();

  const fromHackChance = Number(ns.args[0] ?? 50);
  const MAX_PREPS = Number(ns.args[1] ?? 3);
  const MAX_ATTACKS = Number(ns.args[1] ?? 3);
  const ATTACK_HACKCHANCE_HIGHER_THAN = 90;
  let i = 0;

  let readyForAttack: string[] = [];
  let currentlyPrepping: string[] = [];
  let currentlyAttacking: Array<Attack> = [];
  let availableBots: XServer[] = [];
  let availableNodes: XServer[] = [];
  let potentialTargets: XServer[] = [];

  function getPrepBotStart() {
    return 0;
  }

  function getPrepBotEnd() {
    // No attack active - use all bots
    if (currentlyAttacking.length === 0) {
      return 25;
    }

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

  function startNewPrepping(hackable: XServer[]) {
    const [target] = hackable;
    currentlyPrepping.push(target.id);
    ns.run('x.proto.prep.auto.js', 1, target.id, getPrepBotStart(), getPrepBotEnd());
  }

  function getWaitingTargets() {
    return currentlyPrepping.map((m) => new XServer(ns, m));
  }

  function checkPreppingStatus() {
    const serverDonePrepping = getWaitingTargets().filter((f) => f.isMoneyAvailableMaxed && f.isServerWeakendToMinimum);
    const otherReady = getHackableTargetServers(ns, fromHackChance).filter(
      (f) =>
        f.isMoneyAvailableMaxed &&
        f.isServerWeakendToMinimum &&
        !currentlyPrepping.includes(f.id) &&
        !currentlyAttacking.map((m) => m.host).includes(f.id),
    );
    const readyNodes = [...serverDonePrepping, ...otherReady];
    if (readyNodes.length > 0) {
      readyNodes.forEach((item) => {
        currentlyPrepping = currentlyPrepping.filter((m) => m !== item.id);
        readyForAttack = [...readyForAttack.filter(f=>f !== item.id), item.id];
      });
    }
  }

  function printStatus() {
    const targerServers = getTargetServers(ns);
    const nodes = getHackableTargetServers(ns, fromHackChance).map((m) => getThreatAssesment(ns, m));
    const underAttack = currentlyAttacking.map((m) => m.host);
    const rows = generatePrepRow(nodes, false, underAttack, currentlyPrepping);
    ns.clearLog();
    ns.printRaw('Max Prepping: ' + MAX_PREPS);
    ns.printRaw('Max Attacks: ' + MAX_ATTACKS);
    ns.printRaw('Ready for Attack: ' + readyForAttack.length);
    ns.printRaw('Currently Attack: ' + currentlyAttacking.length);
    ns.printRaw(`Hackable Targets: ${nodes.length}/${targerServers.length}`);
    ns.printRaw('Runs: ' + i);
    PrintTable(ns, 'Targets', rows, { fancy: true });
  }

  function sortDescByMoneyAvailable(a: XServer, b: XServer) {
    return (b.server.moneyMax ?? 0) - (a.server.moneyMax ?? 0);
  }

  /**
   * Hackchance above 90
   * Sorted by most money
   * @returns
   */
  function getPotentialTargets() {
    const underAttack = currentlyAttacking.map((m) => m.host);
    const potentialTargets = readyForAttack.filter((f) => !underAttack.includes(f)).map((m) => new XServer(ns, m));

    return potentialTargets.filter((f) => f.hackChance >= ATTACK_HACKCHANCE_HIGHER_THAN).sort(sortDescByMoneyAvailable);
  }

  function startNewAttack() {
    const potentialTargets = getPotentialTargets();

    if (potentialTargets.length === 0) {
      return;
    }


    const [target] = potentialTargets;
    const pid = ns.run('x.proto.batch.auto.js', 1, target.id, getAttackBotStart());
    currentlyAttacking.push({ host: target.id, pid });
  }

  function killAndRemoveAttack(targetId: string) {
    const pid = currentlyAttacking.find((m) => m.host === targetId)?.pid;
    if (pid) {
      ns.kill(Number(pid));
    }
    currentlyAttacking = currentlyAttacking.filter((f) => f.host !== targetId);
    readyForAttack = readyForAttack.filter((f) => f !== targetId);
  }

  /**
   * Potential a better target
   */
  function CheckBetterTargets() {
    const potentialTargets = getPotentialTargets();
    if (potentialTargets.length > 0) {
      const [target] = potentialTargets;

      /**
       * Just kill the those under max money
       * New attack will be generated next loop
       */
      // currentlyAttacking
      //   .map((m) => new XServer(ns, m.host))
      //   .filter((f) => (f.server.moneyMax ?? 0) < (target.server.moneyMax ?? 0))
      //   .forEach((f) => killAndRemoveAttack(f.id));
    }
  }

  function checkAttackStatus() {
    const underAttack = currentlyAttacking.map((m) => new XServer(ns, m.host));
    if (underAttack.length === 0) {
      return;
    }

    /**
     * Out of sync
     */

    const outOfSync = underAttack.filter((f) => f.moneyAvailablePercent < 5);
    if (outOfSync.length > 0) {
      outOfSync.forEach((f) => killAndRemoveAttack(f.id));
    }

    CheckBetterTargets();
  }

  while (true) {
    await ns.sleep(1000);

    availableBots = getBotServers(ns);
    availableNodes = getTargetServers(ns);
    /**
     * Attack
     */

    // Check if attack is out of sync
    checkAttackStatus();

    // Ready for attack
    if (readyForAttack.length > 0 && currentlyAttacking.length < MAX_ATTACKS) {
      startNewAttack();
    }

    /**
     * Prepping
     */
    checkPreppingStatus();

    const readyForPrepping = getHackableTargetServers(ns, fromHackChance).filter(
      (f) => !readyForAttack.includes(f.id) && !currentlyPrepping.includes(f.id),
    );
    // console.log('readyForPrepping', readyForPrepping);

    if (readyForPrepping.length > 0 && currentlyPrepping.length < MAX_PREPS) {
      startNewPrepping(readyForPrepping);
    }

    printStatus();

    i++;
  }
}
