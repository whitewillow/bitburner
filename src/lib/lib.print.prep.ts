import { PrintRows } from 'lib/lib.print';
import { calculatePercent } from 'lib/utils';
import { ThreatAssesment } from './types';
import { formatToUnit } from './number.helper';

const iconAttack = '☠';
const iconPrep = '🛠';
const iconReady = '✓';

export function generatePrepRow(threatAssessedServers: ThreatAssesment[], light = false, hostUnderAttack: string[] = [], hostPrepping: string[] = []) {
  const rows: PrintRows[] = [];

  let i = 0;
  for (const bot of threatAssessedServers) {
    const { server } = bot.target;
    const securityPercent = calculatePercent(server.minDifficulty, server.hackDifficulty);
    let color = 'white';
    const moneyPercentAvailable = calculatePercent(bot.moneyAvailable, bot.moneyMax);
    if (moneyPercentAvailable >= 80) {
      color = 'green';
    }
    if (moneyPercentAvailable < 80 && moneyPercentAvailable >= 70) {
      color = 'yellow';
    }
    if (moneyPercentAvailable < 70) {
      color = 'orange';
    }
    if (moneyPercentAvailable < 50) {
      color = 'red';
    }
    if (bot.isPrepped) {
      color = 'lime';
    }

    const lightView = ['#', 'Host', 'Security', 'Growth', 'Weaken', '$ Available'];
    let icon = '';
    let iconColor = 'white';
    if(bot.isPrepped) {
      icon = iconReady;
      iconColor = 'lime';
    }
    if(hostUnderAttack.includes(bot.target.id)) {
      icon = iconAttack;
      iconColor = 'red';
    }
    if(hostPrepping.includes(bot.target.id)) {
      icon = iconPrep;
      iconColor = 'blue';
    }

    const columns = [
      {
        title: '#',
        rightAlligned: true,
        value: i,
      },
      {
        title: 'Host',
        value: bot.target.id,
      },

      {
        title: 'Difficulty',
        value: `${server.minDifficulty ?? 0} / ${server.baseDifficulty ?? 0}`,
      },
      {
        title: 'Hackchance',
        rightAlligned: true,
        value: bot.hackChance + '%',
      },
      {
        title: 'Security',
        rightAlligned: true,
        value: securityPercent.toFixed(2) + '%',
      },
      {
        title: 'Growth',
        rightAlligned: true,
        value: bot.growThread.toFixed(2),
      },
      {
        title: 'Weaken',
        rightAlligned: true,
        value: bot.weakenThread.toFixed(2),
      },
      {
        title: '$/s',
        rightAlligned: true,
        value: formatToUnit(bot.moneyPerSecond),
      },
      {
        title: '$ Available',
        rightAlligned: true,
        value: calculatePercent(bot.moneyAvailable, bot.moneyMax).toFixed(2) + '%',
      },
      {
        title: 'Max Money',
        rightAlligned: true,
        value: formatToUnit(server.moneyMax ?? 0),
      },
    ];
    rows.push({ columns, color, icon, iconColor });
    i++;
  }
  return rows;
}