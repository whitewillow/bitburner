import { NS } from '@ns';
import { getTargetNodesDetailed } from 'lib/lib.node';


export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();

  const servers = getTargetNodesDetailed(ns, 'hackChance');
  const possibleBackdoor = servers.filter((c) => c.server.moneyMax === 0);

  ns.tprintRaw(`Possible Backdoors found: ${possibleBackdoor.length}`);
  ns.tprintRaw('---------------------');
  possibleBackdoor.forEach((c) => {
    ns.tprintRaw(`${c.server.hostname}`);
    ns.tprintRaw(`Backdoor: ${!!c.server.backdoorInstalled}`);
   
  });
}
