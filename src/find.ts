import { NS } from '@ns';
import { getTargetServersSorted } from 'lib/lib.server';
import XServer from 'lib/class.xserver';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  const searchString = ns.args[0]?.toString() ?? '';

  const servers = getTargetServersSorted(ns, 'hackChance');

  const ServersFound: { server: XServer; files: string[] }[] = servers
    .filter((m) => m.server.hostname.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()))
    .map((m) => ({ server: m, files: [] }));

  servers.forEach((server) => {
    const files = ns.ls(server.id).filter((f) => f.toLowerCase().includes(searchString.toLowerCase()));

    if (files.length > 0) {
      const serverFound = ServersFound.find((m) => m.server.id === server.id);
      if (serverFound) {
        serverFound.files = files;
      } else {
        ServersFound.push({ server, files });
      }
    }
  });

  function printInfo(server: XServer, index: number) {
    ns.tprintRaw(index + '# Server: ' + server.id);
    ns.tprintRaw('    - Root: ' + ns.hasRootAccess(server.id));
    ns.tprintRaw('    - Backdor: ' + server.server.backdoorInstalled);
  }

  function printFiles(files: string[]) {
    if (files.length === 0) {
      return;
    }
    ns.tprintRaw('    - Files: ');
    files.forEach((f) => {
      ns.tprintRaw(`      ${f}`);
    });
  }

  ns.tprintRaw('');
  ns.tprintRaw('---------------------');
  ns.tprintRaw('Searching for: ' + searchString);
  ns.tprintRaw(`Servers found: ${ServersFound.length}`);
  ns.tprintRaw(`Files found: ${ServersFound.map((m) => m.files.length).reduce((a, b) => a + b, 0)}`);
  ns.tprintRaw('---------------------');
  ServersFound.forEach((c, i) => {
    printInfo(c.server, i);
    printFiles(c.files);
  });
}
