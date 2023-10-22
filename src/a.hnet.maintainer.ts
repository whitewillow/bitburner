import { NS, NodeStats } from '@ns';
import { range } from './lib/utils';

/**
 * Auto - HackNet Maintainer - buys and upgrades HackNet Nodes
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  ns.tprint('Starting HackNet Maintainer');
  ns.print('Starting HackNet Maintainer - Max nodes:' + ns.hacknet.maxNumNodes());
  ns.print('---------------------------');

  const HOME_SERVER = 'home';
  const SLEEP_TIME = 10000;
  const BATCHES_BUY = 10;
  const BATCH_LEVEL = 10;
  const BATCH_RAM = 4;
  const BATCH_CORES = 4;
  const MAX_LEVEL = 200;
  const MAX_RAM = 64;
  const MAX_CORES = 16;

  function getOwnedNodes() {
    return ns.hacknet.numNodes();
  }

  function getHackNetNodes() {
    const numberOfNodes = getOwnedNodes();
    const myNodes = range(0, numberOfNodes).map((m, i) => ({
      ...ns.hacknet.getNodeStats(m),
      index: i,
    }));
    return myNodes;
  }

  function calculateAim(forNodeProperty: 'level' | 'ram' | 'cores', batchSize: number) {
    const ownedNodes: NodeStats[] = getHackNetNodes();
    const minAmount = Math.min(...ownedNodes.map((m) => m[forNodeProperty]));
    const amountTilBatch = batchSize - (minAmount % batchSize);
    const currentAim = minAmount + (amountTilBatch === 0 ? batchSize : amountTilBatch);
    return currentAim;
  }

  /**
   * Buy nodes
   * in batches of 10
   */
  async function buyNodesBatch() {
    /**
     * Calculate how many nodes to buy
     * owned nodes: 21;
     * nodes to buy 21 % 10 = 9
     * This batch ceil: 21 + 9 = 30
     */
    const nodesToBuy = BATCHES_BUY - (getHackNetNodes().length % BATCHES_BUY);
    const thisBatchCeil = getHackNetNodes().length + (nodesToBuy === 0 ? BATCHES_BUY : nodesToBuy);

    ns.print(`- Buying nodes up til: ${thisBatchCeil}`);

    while (true) {
      const ownedNodes = getOwnedNodes();
      if (ownedNodes >= thisBatchCeil) {
        break;
      }
      const moneyAvailable = ns.getServerMoneyAvailable(HOME_SERVER);
      if (moneyAvailable > ns.hacknet.getPurchaseNodeCost()) {
        ns.hacknet.purchaseNode();
      }
      await ns.sleep(2000);
    }
  }

  function getUpgradeCost(forNodeProperty: 'level' | 'ram' | 'cores', index: number) {
    switch (forNodeProperty) {
      case 'level':
        return ns.hacknet.getLevelUpgradeCost(index);
      case 'ram':
        return ns.hacknet.getRamUpgradeCost(index);
      case 'cores':
        return ns.hacknet.getCoreUpgradeCost(index);
    }
  }

  function buyUpgrade(forNodeProperty: 'level' | 'ram' | 'cores', index: number) {
    switch (forNodeProperty) {
      case 'level':
        return ns.hacknet.upgradeLevel(index);
      case 'ram':
        return ns.hacknet.upgradeRam(index);
      case 'cores':
        return ns.hacknet.upgradeCore(index);
    }
  }

  async function upgrade(
    forNodeProperty: 'level' | 'ram' | 'cores',
    batchSize: number,
    limit: number,
  ) {
    const ownedNodes = getHackNetNodes();

    const allUpgraded = ownedNodes.every((e) => e[forNodeProperty] >= limit);

    if (allUpgraded) {
      ns.print(`All ${forNodeProperty} reached limit`);
      return;
    }

    const newAim = calculateAim(forNodeProperty, batchSize);

    ns.print(`- Upgrading ${forNodeProperty} to ${newAim}`);

    while (true) {
      const myNodes = getHackNetNodes();
      const nodesToUpgrade = myNodes.filter((f) => f[forNodeProperty] <= newAim);
      if (nodesToUpgrade.length === 0) {
        ns.print(`- All ${forNodeProperty} upgraded`);
        break;
      }
      for (const node of nodesToUpgrade) {
        const moneyAvailable = ns.getServerMoneyAvailable(HOME_SERVER);
        const upgradeCost = getUpgradeCost(forNodeProperty, node.index);
        if (moneyAvailable > upgradeCost) {
          buyUpgrade(forNodeProperty, node.index);
        }
      }
      await ns.sleep(2000);
    }
  }

  let i = 1;
  while (true) {
    ns.print(`Iteration: ${i} - Batchsize: ${BATCHES_BUY * i} - Batchlevel: ${BATCH_LEVEL * i}`);
    const ownedNodes = getHackNetNodes();
    const minLevel = Math.min(...ownedNodes.map((m) => m.level));
    const minRam = Math.min(...ownedNodes.map((m) => m.ram));
    const minCores = Math.min(...ownedNodes.map((m) => m.cores));

    if (ownedNodes.length <= BATCHES_BUY * i && ownedNodes.length < ns.hacknet.maxNumNodes()) {
      await buyNodesBatch();
    }
    if (minLevel <= BATCH_LEVEL * i) {
      await upgrade('level', BATCH_LEVEL, MAX_LEVEL);
    }
    if (minRam <= BATCH_RAM * i) {
      await upgrade('ram', BATCH_RAM, MAX_RAM);
    }
    if (minCores <= BATCH_CORES * i) {
      await upgrade('cores', BATCH_CORES, MAX_CORES);
    }

    i++;
    await ns.sleep(SLEEP_TIME);
  }
}
