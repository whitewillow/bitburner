import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import { HOME_SERVER, SERVER_PREFIX } from 'lib/constants';
import { atLeastOne, canHack, range, sortField } from 'lib/utils';
import { ThreatAssesment } from './types';

/**
 *
 * Library for Server related functions
 *
 * Target Servers - are servers that are not player owned servers
 * Bot Servers - are player owned servers
 *
 */

/**
 * Find all servers in the game
 * @param ns
 * @param fromParentNode - default is 'home'
 * @param scanNodes
 * @returns
 */
export function getAllServerRecursive(
  ns: NS,
  fromParentNode = HOME_SERVER,
  scanNodes: Array<{ parent: string; node: string }> = [],
) {
  const connectedNodes = ns.scan(fromParentNode).map((m) => ({ parent: fromParentNode, node: m }));
  const knownNodes = scanNodes.map((m) => m.node);
  const nextNodes = connectedNodes.filter((f) => !knownNodes.includes(f.node));

  nextNodes.forEach((f) => {
    scanNodes.push(f);
    return getAllServerRecursive(ns, f.node, scanNodes);
  });

  return scanNodes.reduce(
    (unique, item) => (unique.some((s) => s.node === item.node) ? unique : [...unique, item]),
    [] as Array<{ parent: string; node: string }>,
  );
}

/**
 * Gets all servers in the game including the home server and the player servers
 * @param ns
 * @param sortByField
 * @param sortOrder
 * @returns
 */
export function getAllServers(ns: NS, sortByField: string, sortOrder = 'asc'): XServer[] {
  const filteredNotes = getAllServerRecursive(ns);
  return filteredNotes.map((m) => new XServer(ns, m.node, m.parent)).sort(sortField(sortByField));
}

/**
 * Gets all servers in the game excluding the home server and the player servers
 * @param ns
 * @returns
 */
export function getTargetServers(ns: NS): XServer[] {
  const filteredNotes = getAllServerRecursive(ns).filter(
    (f) => f.node !== HOME_SERVER && !f.node.includes(SERVER_PREFIX),
  );
  return filteredNotes.map((m) => new XServer(ns, m.node, m.parent));
}

/**
 * Gets all servers in the game excluding the home server and the player servers
 * And sorts them by the given field
 * @param ns
 * @param sortByField
 * @param sortOrder
 * @returns
 */
export function getTargetServersSorted(ns: NS, sortByField: string, sortOrder = 'asc'): XServer[] {
  return getTargetServers(ns).sort(sortField(sortByField));
}

/**
 * Gets all hackable target servers in the game
 * @param ns
 * @param hackChanceAtLeast - default is 100 percent
 * @param sortByField
 * @returns
 */
export function getHackableTargetServers(
  ns: NS,
  hackChanceAtLeast = 100,
  sortByField: 'baseDifficulty' = 'baseDifficulty',
) {
  const targetServers = getTargetServers(ns);
  const hackable = targetServers.filter(
    (f) => f.hackChance >= hackChanceAtLeast && (f.server.moneyMax ?? 0) > 0 && canHack(ns, f.id),
  );
  return hackable.sort((a, b) => (a.server[sortByField] ?? 0) - (b.server[sortByField] ?? 0));
}

export function getPotentialTargets(ns: NS, playerHackingSkill: number) {
  const potentialTargets = getTargetServers(ns).filter(
    (f) =>
      (f.server.moneyMax ?? 0) > 0 &&
      f.server.hasAdminRights &&
      f.server.requiredHackingSkill &&
      f.server.requiredHackingSkill <= playerHackingSkill,
  );
  return potentialTargets;
}

/**
 * Finds all bot servers (Player owned servers) in the game
 * @param ns
 * @returns
 */
export function getBotServers(ns: NS): XServer[] {
  return range(0, 25)
    .filter((f) => ns.serverExists(SERVER_PREFIX + f))
    .map((i) => new XServer(ns, SERVER_PREFIX + i));
}

/**
 * Has maxed out amount of bot servers
 * @param ns
 * @returns
 */
export function hasAllBotServers(ns: NS): boolean {
  return range(0, 25).filter((f) => ns.serverExists(SERVER_PREFIX + f)).length === 25;
}

/**
 * Gets a range of bot servers
 * @param ns
 * @param from
 * @param to
 * @returns
 */
export function getBotServersRange(ns: NS, from: number, to: number): XServer[] {
  return getBotServers(ns).slice(from, to);
}

// TODO: move to utils/printhelper

/**
 * Gets the threat assesment of a target
 * @param ns
 * @param target
 * @returns
 */
export function getThreatAssesment(ns: NS, target: XServer): ThreatAssesment {
  const moneyAvailable = atLeastOne(target.server.moneyAvailable);
  const moneyMax = atLeastOne(target.server.moneyMax);
  const minSecurityLevel = target.server.minDifficulty ?? 0;
  const securityLevel = target.server.hackDifficulty ?? 0;
  const moneyString = `${ns.formatNumber(moneyAvailable)} / ${moneyMax.toLocaleString('en-US')}`;
  const moneyPercentAvailable = (moneyAvailable / moneyMax) * 100;
  const moneyPerSecond = moneyMax / minSecurityLevel;
  const hackTime = ns.getHackTime(target.id);
  const hackThread = Math.ceil(ns.hackAnalyzeThreads(target.id, moneyAvailable));
  const growTime = ns.getGrowTime(target.id);
  const growThread = ns.growthAnalyze(target.id, moneyMax / moneyAvailable);
  const weakenTime = ns.getWeakenTime(target.id);
  const weakenThread = Math.ceil((securityLevel - minSecurityLevel) * 20);
  const isPrepped = growThread + weakenThread + (moneyMax - moneyAvailable) === 0;
  return {
    target,
    hackChance: target.hackChance,
    moneyAvailable,
    moneyPerSecond,
    moneyMax,
    minSecurityLevel,
    moneyString,
    moneyPercentAvailable,
    hackTime,
    hackThread,
    growTime,
    growThread,
    weakenTime,
    weakenThread,
    isPrepped,
  };
}
