import { FilenameOrPID, NS } from '@ns';
import { executeCommands, getPreppingBatch, getProtoBatch } from 'lib/lib.batch';
import XServer from 'lib/class.xserver';
import { getHackableNodes, getThreatAssesment } from 'lib/lib.node';
import { PrintRows, PrintTable } from 'lib/lib.print';
import { generatePrepRow } from 'lib/lib.print.prep';

interface Attack {
  host: string;
  pid: FilenameOrPID;
}

export async function main(ns: NS): Promise<void> {
  const fromHackChance = Number(ns.args[0] ?? 50);
  const MAX_PREPS = Number(ns.args[1] ?? 3);
  const MAX_ATTACKS = Number(ns.args[1] ?? 3);
  let i = 0;

  ns.disableLog('ALL');
  ns.clearLog();

  let readyForAttack: string[] = [];
  let currentlyPrepping: string[] = [];
  let currentlyAttacking: Array<Attack> = [];

  function startNewPrepping(hackable: XServer[]) {
    const [target] = hackable;
    currentlyPrepping.push(target.id);
    ns.run('x.proto.prep.auto.js', 1, target.id);
  }

  function getWaitingTargets() {
    return currentlyPrepping.map((m) => new XServer(ns, m));
  }

  function checkPreppingStatus() {
    const serverDonePrepping = getWaitingTargets().filter((f) => f.isMoneyAvailableMaxed && f.isServerWeakendToMinimum);
    if (serverDonePrepping.length > 0) {
      serverDonePrepping.forEach((f) => {
        currentlyPrepping = currentlyPrepping.filter((m) => m !== f.id);
        readyForAttack.push(f.id);
      });
    }
  }

  function printStatus() {
    const nodes = getHackableNodes(ns, fromHackChance).map((m) => getThreatAssesment(ns, m));
    const underAttack = currentlyAttacking.map((m) => m.host);
    const rows = generatePrepRow(nodes, false, underAttack, currentlyPrepping);
    ns.clearLog();
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
    return potentialTargets.filter((f) => f.hackChance > 90).sort(sortDescByMoneyAvailable);
  }

  function startNewAttack() {
    const potentialTargets = getPotentialTargets();

    if (potentialTargets.length === 0) {
      return;
    }

    const [target] = potentialTargets;
    const pid = ns.run('x.proto.batch.auto.js', 1, target.id);
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
      currentlyAttacking
        .map((m) => new XServer(ns, m.host))
        .filter((f) => (f.server.moneyMax ?? 0) < (target.server.moneyMax ?? 0))
        .forEach((f) => killAndRemoveAttack(f.id));
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

    const outOfSync = underAttack.filter((f) => f.moneyAvailablePercent < 30);
    if (outOfSync.length > 0) {
      outOfSync.forEach((f) => killAndRemoveAttack(f.id));
    }

    CheckBetterTargets();
  }

  while (true) {
    await ns.sleep(1000);

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

    const readyForPrepping = getHackableNodes(ns, fromHackChance).filter(
      (f) => !readyForAttack.includes(f.id) && !currentlyPrepping.includes(f.id),
    );

    if (readyForPrepping.length > 0 && currentlyPrepping.length < MAX_PREPS) {
      startNewPrepping(readyForPrepping);
    }

    checkPreppingStatus();

    printStatus();

    i++;
  }
}
