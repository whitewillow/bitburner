import { NS } from '@ns';
import { deployProto, deployProtoAct, range } from 'lib/utils';
import { SERVER_PREFIX } from 'lib/constants';
import { getBotNodesDetailed } from 'lib/lib.node';

/**
 * Auto - Bots Maintainer - buys and upgrades servers
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  const HOME_SERVER = 'home';
  const SLEEP_TIME = 10000;
  const START_RAM = 8;

  const maxRam = ns.getPurchasedServerMaxRam();
  const maxServers = ns.getPurchasedServerLimit();

  function canPurchaseRam(purchaseRamSize: number) {
    const moneyAvailable = ns.getServerMoneyAvailable(HOME_SERVER);
    const ramCost = ns.getPurchasedServerCost(purchaseRamSize);
    return moneyAvailable > ramCost;
  }

  function shutdownServer(host: string) {
    ns.killall(host);
    ns.deleteServer(host);
  }

  function serverExist(host: string) {
    return ns.serverExists(host);
  }

  function getPossibleBotNodesHosts() {
    return range(0, 25).map((m) => SERVER_PREFIX + m);
  }

  function updateScripts(hosts: string[]) {
    deployProtoAct(
      ns,
      hosts.filter((f) => serverExist(f)),
    );
  }

  function purchaseServer(host: string, purchaseRamSize: number) {
    ns.purchaseServer(host, purchaseRamSize);
  }

  /**
   * Main loop
   */
  let status = 'PURCHASING'; // 'PURCHASING' | 'UPGRADING' | 'MAINTAINING'
  while (true) {
    const hosts = getPossibleBotNodesHosts();

    updateScripts(hosts);

    ns.printRaw('----------');
    ns.printRaw('Status: ' + status);

    let foundServersCount = 0;

    /**
     * Purchase all possible servers first
     */
    for (const host of hosts) {
      if (!serverExist(host)) {
        // Purchase server
        purchaseServer(host, START_RAM);
        continue;
      } else {
        foundServersCount++;
      }
    }

    if (status === 'PURCHASING') {
      ns.printRaw('Currently have ' + foundServersCount + ' servers' + ' of ' + maxServers);
    }

    /**
     * Upgrade servers to maxRam
     */
    if (foundServersCount === maxServers) {
      status = 'UPGRADING';

      const bots = getBotNodesDetailed(ns);
      const minRam = Math.min(...bots.map((m) => m.server.maxRam));

      if (minRam === maxRam) {
        status = 'MAINTAINING';
        continue;
      }

      getBotNodesDetailed(ns)
        .filter((f) => f.server.maxRam === minRam)
        .forEach((bot) => {
          const ramSize = minRam * 2;
          if (canPurchaseRam(ramSize)) {
            shutdownServer(bot.id);
            ns.purchaseServer(bot.id, ramSize);
            ns.printRaw('Upgrading server: ' + bot.id + ' to: ' + ramSize + ' GB');
          }
        });
    }

    await ns.sleep(SLEEP_TIME);
  }
}
