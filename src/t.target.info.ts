/**
 * TOOL - List Target Server Info
 */

import { NS } from '@ns';
import XServer from 'lib/class.xserver';

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  const filename = `reports/${target}-report.txt`;

  const targerServer = new XServer(ns, target);

  const json = JSON.stringify(targerServer, null, 2);
  
  ns.alert(json);

  async function writeNodesToFile(json: string) {
    ns.write(filename, json, 'w');
    ns.toast('Targets written to: ' + filename, 'info', 3000);
  }

  await writeNodesToFile(json);
}
