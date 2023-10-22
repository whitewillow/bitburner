import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import { SERVER_PREFIX } from 'lib/constants';
import { atLeastOne, canHack, range, sortField } from 'lib/utils';

export interface SimpleNode {
  node: string;
  maxMoney: number;
  moneyAvailable: number;
  hackChance: number;
  reqHackLevel: number;
  isHackable: boolean;
  parent: string;
}

export interface ThreatAssesment {
  target: XServer;
  hackChance: number;
  moneyAvailable: number;
  moneyMax: number;
  minSecurityLevel: number;
  moneyString: string;
  moneyPercentAvailable: number;
  hackTime: number;
  hackThread: number;
  growTime: number;
  growThread: number;
  weakenTime: number;
  weakenThread: number;
  isPrepped?: boolean;
}

export function getSimpleNodeInfo(ns: NS, node: string, parent = 'home'): SimpleNode {
  const maxMoney = ns.getServerMaxMoney(node);
  const moneyAvailable = ns.getServerMoneyAvailable(node);
  const hackChance = Math.floor(ns.hackAnalyzeChance(node) * 100);
  const reqHackLevel = ns.getServerRequiredHackingLevel(node);
  const isHackable = canHack(ns, node);
  return {
    node,
    maxMoney,
    moneyAvailable,
    hackChance,
    reqHackLevel,
    isHackable,
    parent,
  };
}

export function getNodesWithParent(
  ns: NS,
  current = 'home',
  scanNodes: Array<{ parent: string; node: string }> = [],
) {
  let connectedNodes = ns.scan(current).map((m) => ({ parent: current, node: m }));

  const knownNodes = scanNodes.map((m) => m.node);

  let nextNodes = connectedNodes.filter((f) => !knownNodes.includes(f.node));
  nextNodes.forEach((f) => {
    scanNodes.push(f);
    return getNodesWithParent(ns, f.node, scanNodes);
  });
  return scanNodes.reduce(
    (unique, item) => (unique.some((s) => s.node === item.node) ? unique : [...unique, item]),
    [] as Array<{ parent: string; node: string }>,
  );
}

export function getAllNodes(ns: NS, current = 'home', set = new Set()) {
  let nodes = ns.scan(current);
  let nextNodes = nodes.filter((f) => !set.has(f));
  nextNodes.forEach((f) => {
    set.add(f);
    return getAllNodes(ns, f, set);
  });
  return Array.from(set.keys());
}

export function getTargetNodesSimple(ns: NS, sortByField: string, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns).filter(
    (f) => f.node !== 'home' && !f.node.includes('pserv-'),
  );
  return filteredNotes
    .map((m) => getSimpleNodeInfo(ns, m.node, m.parent))
    .sort(sortField(sortByField));
}

export function getServerNodesDetailed(ns: NS, sortByField: string, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns);
  return filteredNotes.map((m) => new XServer(ns, m.node, m.parent)).sort(sortField(sortByField));
}

export function getTargetNodesDetailed(ns: NS, sortByField: string, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns).filter(
    (f) => f.node !== 'home' && !f.node.includes('pserv-'),
  );
  return filteredNotes.map((m) => new XServer(ns, m.node, m.parent)).sort(sortField(sortByField));
}

export function getBotNodesDetailed(ns: NS): XServer[] {
  return range(0, 25)
    .filter((f) => ns.serverExists(SERVER_PREFIX + f))
    .map((i) => new XServer(ns, SERVER_PREFIX + i));
}

export function getExternalBotNodesDetailed(ns: NS): XServer[] {
  const filteredNotes = getNodesWithParent(ns).filter(
    (f) => f.node !== 'home' && !f.node.includes('pserv-'),
  );
  return filteredNotes.map((m) => new XServer(ns, m.node, m.parent));
}

export function getBotNodesRange(ns: NS, from: number, to: number) {
  return getBotNodesDetailed(ns).slice(from, to);
}

export function getThreatAssesment(ns: NS, target: XServer): ThreatAssesment {
  const moneyAvailable = atLeastOne(target.server.moneyAvailable);
  const moneyMax = atLeastOne(target.server.moneyMax);
  const minSecurityLevel = target.server.minDifficulty ?? 0;
  const securityLevel = target.server.hackDifficulty ?? 0;
  const moneyString = `${ns.formatNumber(moneyAvailable)} / ${moneyMax.toLocaleString('en-US')}`;
  const moneyPercentAvailable = (moneyAvailable / moneyMax) * 100;
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

export function getHackableNodes(
  ns: NS,
  hackChanceAtLeast = 100,
  sortByField: 'baseDifficulty' = 'baseDifficulty',
) {
  const externalBotServers = getExternalBotNodesDetailed(ns);
  const hackable = externalBotServers.filter(
    (f) => f.hackChance >= hackChanceAtLeast && (f.server.moneyMax ?? 0) > 0 && canHack(ns, f.id),
  );
  return hackable.sort((a, b) => (a.server[sortByField] ?? 0) - (b.server[sortByField] ?? 0));
}
