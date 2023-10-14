/**
 * Auto Purchase Servers
 */

/** @param {NS} ns */
export async function main(ns) {

    const homeServer = 'home';
    let pRam = 8;
    const serverPrefix = 'pserv-';
  
    const maxRam = ns.getPurchasedServerMaxRam();
    const maxServers = ns.getPurchasedServerLimit();
  
  
    function canPurchaseServer() {
      return ns.getServerMoneyAvailable(homeServer) > ns.getPurchasedServerCost(pRam);
    }
  
    function shutdownServer(server) {
      ns.killall(server);
      ns.deleteServer(server);
    }
  
    async function upgradeServer(server) {
      const sRam = ns.getServerMaxRam(server);
      if (sRam < pRam) {
        while (!canPurchaseServer()) {
          await ns.sleep(10000);
        }
        shutdownServer(server);
        ns.purchaseServer(server, pRam);
      }
    }
  
    async function autoUpgradeServers() {
      let i = 0;
      while (i < maxServers) {
        const server = serverPrefix + i;
        if (ns.serverExists(server)) {
          ns.print('Upgrading server: ' + server + ' to: ' + pRam + ' GB');
          await upgradeServer(server);
          ++i;
        } else if (canPurchaseServer()) {
          ns.print('Purchasing server: ' + server + ' at: ' + pRam + ' GB');
          ns.purchaseServer(server, pRam);
          ++i;
        }
        await ns.sleep(10000);
      }
    }
  
    /**
     * Main loop
     */
    while (true) {
      await autoUpgradeServers();
  
      if (pRam === maxRam) {
        break;
      }
  
      const newRam = pRam * 2;
      if (newRam > maxRam) {
        pRam = maxRam;
      } else {
        pRam = newRam;
      }
    }
  }