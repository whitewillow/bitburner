import { canHack, sortField } from './utils';
import XServer from './class.xserver';

/** @param {NS} ns */
export function getSimpleNodeInfo(ns, node, parent = 'home') {
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

/** @param {NS} ns */
export function getNodesWithParent(ns, current = 'home', scanNodes = []) {
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

/** @param {NS} ns */
export function getAllNodes(ns, current = 'home', set = new Set()) {
  let nodes = ns.scan(current);
  let nextNodes = nodes.filter(f => !set.has(f));
  nextNodes.forEach(f => {
    set.add(f);
    return getAllNodes(ns, f, set);
  });
  return Array.from(set.keys());
}

/** @param {NS} ns */
export function getTargetNodesSimple(ns, sortByField, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns).filter(f => f.node !== 'home' && !f.node.includes('pserv-'));
  return filteredNotes.map(m => getSimpleNodeInfo(ns, m.node, m.parent)).sort(sortField(sortByField));
}

export function getServerNodesDetailed(ns, sortByField, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns);
  return filteredNotes.map(m => new XServer(ns, m.node, m.parent)).sort(sortField(sortByField));
}

export function getTargetNodesDetailed(ns, sortByField, sortOrder = 'asc') {
  const filteredNotes = getNodesWithParent(ns).filter(f => f.node !== 'home' && !f.node.includes('pserv-'));
  return filteredNotes.map(m => new XServer(ns, m.node, m.parent)).sort(sortField(sortByField));
}