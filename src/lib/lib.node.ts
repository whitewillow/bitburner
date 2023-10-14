import { NS, Server } from "@ns";
import { canHack, sortField } from 'lib/utils';
import XServer from 'lib/class.xserver';

export interface SimpleNode {
  node: string;
  maxMoney: number;
  moneyAvailable: number;
  hackChance: number;
  reqHackLevel: number;
  isHackable: boolean;
  parent: string;
}

export function getSimpleNodeInfo(ns: NS, node: string, parent = 'home'): SimpleNode {
  const maxMoney = ns.getServerMaxMoney(node)
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
    parent
  }
}

export function getNodesWithParent(ns: NS, current = 'home', scanNodes:Array<{ parent: string; node: string; }> = []) {
  let nodes = ns.scan(current);
  let nodesObj = nodes.map(m => ({ parent: current, node: m }));
  const knownNodes = scanNodes.map(m => m.node);
  let nextNodes = nodesObj.filter(f => !knownNodes.includes(f.node));
  nextNodes.forEach(f => {
    scanNodes.push(f);
    return getNodesWithParent(ns, f.node, scanNodes);
  });
  return scanNodes;
}

export function getAllNodes(ns: NS, current = 'home', set = new Set()) {
  let nodes = ns.scan(current);
  let nextNodes = nodes.filter(f => !set.has(f));
  nextNodes.forEach(f => {
    set.add(f);
    return getAllNodes(ns, f, set);
  });
  return Array.from(set.keys());
}

export function getTargetNodesSimple(ns: NS, sortByField: string, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns).filter(f => f.node !== 'home' && !f.node.includes('pserv-'));
  return filteredNotes.map(m => getSimpleNodeInfo(ns, m.node, m.parent)).sort(sortField(sortByField));
}

export function getServerNodesDetailed(ns: NS, sortByField: string, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns);
  return filteredNotes.map(m => new XServer(ns, m.node, m.parent)).sort(sortField(sortByField));
}

export function getTargetNodesDetailed(ns: NS, sortByField: string, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns).filter(f => f.node !== 'home' && !f.node.includes('pserv-'));
  return filteredNotes.map(m => new XServer(ns, m.node, m.parent)).sort(sortField(sortByField));
}