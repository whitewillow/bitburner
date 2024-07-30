import { NS } from '@ns';
import { getTargetServersSorted } from 'lib/lib.server';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  const filname = ns.args[0]?.toString() ?? '';

  const servers = getTargetServersSorted(ns, 'hackChance');
  const possibleFileServer = servers
    .map((c) => {
      const files = ns.ls(c.id).filter((f) => f.toLowerCase().includes(filname.toLowerCase()));

      return { ...c, files };
    })
    .filter((c) => c.files.length > 0);

  ns.tprintRaw(`Files found: ${possibleFileServer.length}`);
  ns.tprintRaw('---------------------');
  possibleFileServer.forEach((c) => {
    ns.tprintRaw(`${c.server.hostname}`);
    c.files.forEach((cc) => {
      ns.tprintRaw(` - ${cc}`);
    });
  });
}
