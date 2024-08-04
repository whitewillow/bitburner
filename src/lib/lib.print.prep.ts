import { NS } from '@ns';
import { calculatePercent } from 'lib/utils';
import { getThemeColor } from './lib.dom';
import { formatToUnit } from './number.helper';
import { PrintRows, ThreatAssesment } from './types';
import { ICON_CLEAR, ICON_LOCKED, ICON_READY, ICON_TARGET, ICON_WAIT } from './constants';

export function generateTargetRows(
  ns: NS,
  threatAssessedServers: ThreatAssesment[],
  light = false,
  hostUnderAttack: string[] = [],
  hostPrepping: string[] = [],
  hostIgnoring: string[] = [],
): PrintRows[] {
  const rows: PrintRows[] = [];

  let i = 0;
  for (const bot of threatAssessedServers) {
    const { server } = bot.target;
    const securityPercent = calculatePercent(server.minDifficulty, server.hackDifficulty);
    let color = getThemeColor(ns, 'secondary');
    const moneyPercentAvailable = calculatePercent(bot.moneyAvailable, bot.moneyMax);
    if (moneyPercentAvailable >= 80) {
      color = getThemeColor(ns, 'success');
    }
    if (moneyPercentAvailable < 80 && moneyPercentAvailable >= 70) {
      color = getThemeColor(ns, 'successdark');
    }
    if (moneyPercentAvailable < 70) {
      color = getThemeColor(ns, 'warning');
    }
    if (moneyPercentAvailable < 50) {
      color = getThemeColor(ns, 'warningdark');
    }

    if (bot.isPrepped) {
      color = 'lime';
    }

    let icon = '  ';
    let iconColor = 'white';
    if (bot.isPrepped) {
      icon = ICON_READY;
    }
    if (hostUnderAttack.includes(bot.target.id)) {
      icon = ICON_TARGET;
    }
    if (hostPrepping.includes(bot.target.id)) {
      icon = ICON_CLEAR;
    }
    if (hostIgnoring.includes(bot.target.id)) {
      icon = ICON_WAIT;
      color = getThemeColor(ns, 'secondary');
    }
    if (server.hasAdminRights === false) {
      icon = ICON_LOCKED;
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
