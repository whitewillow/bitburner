import { NS } from '@ns';
import { deployProtoAct, range } from 'lib/utils';
import { SERVER_PREFIX } from 'lib/constants';
import { getBotServers } from 'lib/lib.server';

/**
 * Auto - Bots Maintainer - buys and upgrades servers
 * Bot can only be bought through scripts
 * Bots are extra Servers that can be used to run scripts
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
    await ns.sleep(SLEEP_TIME);

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

      const bots = getBotServers(ns);
      const minRam = Math.min(...bots.map((m) => m.server.maxRam));

      if (minRam === maxRam) {
        if (status !== 'MAINTAINING') {
          ns.printRaw('All servers are upgraded, - Maintaining');
        }
        status = 'MAINTAINING';

        break;
        // All servers are upgraded
      }

      getBotServers(ns)
        .filter((f) => f.server.maxRam === minRam)
        .forEach((bot) => {
          const ramSize = minRam * 2;
          if (canPurchaseRam(ramSize)) {
            shutdownServer(bot.id);
            ns.purchaseServer(bot.id, ramSize);
            ns.printRaw('Upgrading server: ' + bot.id + ' to: ' + ns.formatRam(ramSize) + ' GB');
          }
        });
    }
  }
}
