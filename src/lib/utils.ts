import { FilenameOrPID, NS } from '@ns';
import { HOME_SERVER } from 'lib/constants';

export function brutePenetrate(ns: NS, hostname: string): boolean {
  let success = false;
  try {
    ns.brutessh(hostname);
    ns.ftpcrack(hostname);
    ns.relaysmtp(hostname);
    ns.httpworm(hostname);
    ns.sqlinject(hostname);
  } catch {}

  try {
    ns.nuke(hostname);
    success = true;
  } catch {
    success = false;
  }
  return success;
}

export function atLeastOne(val?: number) {
  return !val || val === 0 ? 1 : val;
}

export function canHack(ns: NS, hostname: string) {
  const playerHackLvl = ns.getHackingLevel();
  const serverHackLvl = ns.getServerRequiredHackingLevel(hostname);
  return playerHackLvl >= serverHackLvl;
}

export function range(start: number, end: number) {
  return Array(end - start)
    .fill(0)
    .map((_, idx) => start + idx);
}

export function sortField(field: string, order: 'asc' | 'desc' = 'asc') {
  return (a: any, b: any) => {
    if (a[field] > b[field]) {
      return order === 'asc' ? 1 : -1;
    } else if (a[field] < b[field]) {
      return order === 'asc' ? -1 : 1;
    } else {
      return 0;
    }
  };
}

/**
 * Sleeps/wait for pids (running script ids) to finish running
 * @param ns
 * @param pids
 * @param host
 * @returns
 */
export async function waitForPIDs(ns: NS, pids: FilenameOrPID[], host?: string): Promise<boolean> {
  while (pids.some((pid) => ns.isRunning(pid, host))) await ns.sleep(5);
  return ns.sleep(5);
}

export function deployFiles(ns: NS, files: string[], hostnames: string[]) {
  for (const server of hostnames) {
    for (const file of files) {
      ns.scp(file, server, HOME_SERVER);
    }
  }
}

export function deployProtoAct(ns: NS, hostnames: string[]) {
  deployFiles(ns, ['remote-action.js'], hostnames);
}

export function deployProto(ns: NS, hostnames: string[]) {
  deployFiles(ns, ['prep-controller.js', 'batch-controller.js'], hostnames);
}

export function calculatePercent(val?: number, total?: number) {
  return (atLeastOne(val) / atLeastOne(total)) * 100;
}
