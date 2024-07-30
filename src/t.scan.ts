import { NS } from '@ns';
import { getTargetServers, getTargetServersSorted } from 'lib/lib.server';
import XServer from 'lib/class.xserver';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  const searchString = ns.args[0]?.toString() ?? '';

  function printTree(servers: XServer[], parent: string, level = 0) {
    const children = servers.filter((m) => m.parent === parent);
    for (const child of children) {
      ns.tprintRaw('  '.repeat(level) + child.id);
      ns.tprintRaw('  '.repeat(level + 1) + '- Root: ' + ns.hasRootAccess(child.id));
      ns.tprintRaw('  '.repeat(level + 1) + '- Backdor: ' + child.server.backdoorInstalled);
      printTree(servers, child.id, level + 1);
    }
  }

  function printInfo(server: XServer) {
    ns.tprintRaw('Server: ' + server.id);
    ns.tprintRaw('  - Root: ' + ns.hasRootAccess(server.id));
    ns.tprintRaw('  - Backdor: ' + server.server.backdoorInstalled);
    ns.tprintRaw('_______________');
  }

  function printList(servers: XServer[]) {
    for (const server of servers) {
      printInfo(server);
    }
  }

  const servers = getTargetServers(ns);
  const filteredServers = servers.filter((m) =>
    m.server.hostname.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()),
  );
  // printTree(servers, 'home');
  ns.tprintRaw('');
  ns.tprintRaw('---------------------');
  ns.tprintRaw('Searching for: ' + searchString);

  ns.tprintRaw('Found: ' + filteredServers.length + ' out of ' + servers.length);
  ns.tprintRaw('---------------------');
  ns.tprintRaw('');
  ns.tprintRaw('');
  printList(filteredServers);
}
