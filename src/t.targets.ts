/**
 * TOOL - Bots info
 */

import { NS } from '@ns';
import { printTerminalTable } from 'lib/lib.print';
import { getExternalBotNodesDetailed } from 'lib/lib.node';
import XServer from 'lib/class.xserver';
import { atLeastOne } from 'lib/utils';

export async function main(ns: NS): Promise<void> {
  const from = Number(ns.args[0] ?? 0);
  const to = Number(ns.args[1] ?? 25);
  ns.tprint(`from: ${from} to: ${to}`);
  ns.disableLog('ALL');

  function getTargetData(target: XServer) {
    const moneyAvailable = atLeastOne(target.server.moneyAvailable);
    const moneyMax = atLeastOne(target.server.moneyMax);
    const minSecurityLevel = target.server.minDifficulty ?? 0;
    const securityLevel = target.server.hackDifficulty ?? 0;
    const moneyString = `${ns.formatNumber(moneyAvailable)} / ${moneyMax.toLocaleString('en-US')}`;
    const moneyPercentAvailable = `${((moneyAvailable / moneyMax) * 100).toFixed(2)}%`;
    const securityString = `${(securityLevel - minSecurityLevel).toFixed(2)}`;
    const hackTime = `${ns.tFormat(ns.getHackTime(target.id))}`;
    const hackThread = `${Math.ceil(ns.hackAnalyzeThreads(target.id, moneyAvailable))}`;
    const growTime = `${ns.tFormat(ns.getGrowTime(target.id))}`;
    const growThread = `${Math.ceil(ns.growthAnalyze(target.id, moneyMax / moneyAvailable))}`;
    const weakenTime = `${ns.tFormat(ns.getWeakenTime(target.id))}`;
    const weakenThread = `${Math.ceil((securityLevel - minSecurityLevel) * 20)}`;
    return {
      hackChance: target.hackChance,
      moneyAvailable,
      moneyMax,
      minSecurityLevel,
      moneyString,
      moneyPercentAvailable,
      securityString,
      hackTime,
      hackThread,
      growTime,
      growThread,
      weakenTime,
      weakenThread,
    };
  }

  function generateRow(servers: XServer[]) {
    for (const bot of servers) {
      ns.tprintRaw('\n');
      ns.tprintRaw('------------------');
      ns.tprintRaw(`Bot: ${bot.id}`);
      ns.tprintRaw('------------------');
      const data = getTargetData(bot);

      const dataRows = [
        {
          columns: [
            {
              title: '',
              value: 'Hack Chance',
            },
            {
              title: '        ',
              value: `${data.hackChance}%`,
            },
            {
              title: '',
              value: '',
            },
          ],
        },
        {
          columns: [
            {
              title: '',
              value: 'Security   ',
            },
            {
              title: '        ',
              value: data.securityString,
            },
            {
              title: '',
              value: '',
            },
          ],
        },
        {
          columns: [
            {
              title: '',
              value: 'Money',
            },
            {
              title: '',
              value: data.moneyPercentAvailable,
            },
            {
              title: '',
              value: data.moneyString,
            },
          ],
        },

        {
          columns: [
            {
              title: '',
              value: 'Hack',
            },
            {
              title: '',
              value: `T: ${data.hackThread}`,
            },
            {
              title: '',
              value: data.hackTime,
            },
          ],
        },
        {
          columns: [
            {
              title: '',
              value: 'Grow',
            },
            {
              title: '',
              value: `T: ${data.growThread}`,
            },
            {
              title: '',
              value: data.growTime,
            },
          ],
        },
        {
          columns: [
            {
              title: '',
              value: 'Weaken',
            },
            {
              title: '',
              value: `T: ${data.weakenThread}`,
            },
            {
              title: '',
              value: data.weakenTime,
            },
          ],
        },
      ];

      printTerminalTable(ns, ``, dataRows);
    }
  }

  // TODO sort by canhack (eg red and green)
  // TODO sort by best chance to hack

  const externalBotServers = getExternalBotNodesDetailed(ns);

  generateRow(externalBotServers.sort((a, b) => b.hackChance - a.hackChance).slice(from, to));
}
