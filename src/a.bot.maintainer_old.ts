import { NS } from '@ns';
import { deployProto, deployProtoAct, range } from 'lib/utils';
import { SERVER_PREFIX } from 'lib/constants';

/**
 * Auto - Bots Maintainer - buys and upgrades servers
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  const HOME_SERVER = 'home';
  const SLEEP_TIME = 10000;

  let purchaseRamSize = 8;
  const maxRam = ns.getPurchasedServerMaxRam();
  const maxServers = ns.getPurchasedServerLimit();

  function canPurchaseServer() {
    const moneyAvailable = ns.getServerMoneyAvailable(HOME_SERVER);
    const ramCost = ns.getPurchasedServerCost(purchaseRamSize);
    ns.print('moneyAvailable ', ns.formatNumber(moneyAvailable));
    ns.print('ramCost ', ns.formatNumber(ramCost), ' ', purchaseRamSize);
    return moneyAvailable > ramCost;
  }

  function shutdownServer(host: string) {
    ns.killall(host);
    ns.deleteServer(host);
  }

  async function upgradeServer(host: string) {
    const sRam = ns.getServerMaxRam(host);
    if (sRam < purchaseRamSize) {
      while (!canPurchaseServer()) {
        await ns.sleep(SLEEP_TIME);
      }
      shutdownServer(host);
      ns.purchaseServer(host, purchaseRamSize);
    }
  }

  function serverExist(host: string) {
    return ns.serverExists(host);
  }

  function updateScripts() {
    const hosts = range(0, 25)
      .map((m) => SERVER_PREFIX + m)
      .filter((f) => serverExist(f));
  }

  async function autoUpgradeServers() {
    let serverCount = 0;
    while (serverCount < maxServers) {
      const serverName = SERVER_PREFIX + serverCount;
      ns.print('----------');
      ns.print('Server focus: ' + serverName);
      if (serverExist(serverName)) {
        ns.print('Upgrading server: ' + serverName + ' to: ' + purchaseRamSize + ' GB');
        await upgradeServer(serverName);
        ++serverCount;
      } else if (canPurchaseServer()) {
        ns.print('Purchasing server: ' + serverName + ' at: ' + purchaseRamSize + ' GB');
        ns.purchaseServer(serverName, purchaseRamSize);

        ++serverCount;
      }
      await ns.sleep(SLEEP_TIME);
    }
  }

  /**
   * Main loop
   */
  while (true) {
    updateScripts();
    await autoUpgradeServers();

    if (purchaseRamSize === maxRam) {
      break;
    }

    const newRam = purchaseRamSize * 2;
    if (newRam > maxRam) {
      purchaseRamSize = maxRam;
    } else {
      purchaseRamSize = newRam;
    }
  }
}
