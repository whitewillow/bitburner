/**
 * TOOL - Bots info
 */

import { NS } from '@ns';
import { printTerminalTable } from 'lib/lib.print';
import { getBotServers } from 'lib/lib.server';
import XServer from './lib/class.xserver';
import { PrintRows } from './lib/types';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  function generateRow(servers: XServer[]) {
    const rows: PrintRows[] = [];

    for (const bot of servers) {
      const columns = [
        {
          title: 'Host',
          value: bot.id,
        },
        {
          title: 'CPU Cores',
          value: bot.server.cpuCores,
        },
        {
          title: 'Ram',
          value: ns.formatRam(bot.ram.trueMax),
        },
        {
          title: 'Ram used',
          value: ns.formatRam(bot.ram.used),
        },
        {
          title: 'Ram free',
          value: ns.formatRam(bot.ram.free),
        },
        {
          title: 'ip',
          value: bot.server.ip,
        },
      ];
      rows.push({ columns });
    }
    return rows;
  }

  const botServers = getBotServers(ns);
  const botServersRows = generateRow(botServers);

  printTerminalTable(ns, 'Bots', botServersRows);
}
