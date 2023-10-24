import { FilenameOrPID, NS } from '@ns';

const homeServer = 'home';

export function range(start: number, end: number) {
  return Array(end - start)
    .fill(0)
    .map((_, idx) => start + idx);
}

export function atLeastOne(val?: number) {
  return !val || val === 0 ? 1 : val;
}

export function calculatePercent(val?: number, total?: number) {
  return (atLeastOne(val) / atLeastOne(total)) * 100;
}

export function getCrackScripts(ns: NS): Record<string, (host: string) => void> {
  return {
    'BruteSSH.exe': ns.brutessh,
    'FTPCrack.exe': ns.ftpcrack,
    'relaySMTP.exe': ns.relaysmtp,
    'HTTPWorm.exe': ns.httpworm,
    'SQLInject.exe': ns.sqlinject,
  };
}

export function getNumberOfPenetrationScripts(ns: NS) {
  const cracks = getCrackScripts(ns);
  return Object.keys(cracks).filter((file) => ns.fileExists(file, homeServer)).length;
}

export function canHack(ns: NS, hostname: string) {
  const playerHackLvl = ns.getHackingLevel();
  const serverHackLvl = ns.getServerRequiredHackingLevel(hostname);
  return playerHackLvl >= serverHackLvl;
}

export function hasServerRamToRunScript(ns: NS, hostname: string, scriptRam: number) {
  const ramAvail = ns.getServerMaxRam(hostname);
  return ramAvail > scriptRam;
}

export function canPenetrate(ns: NS, hostname: string) {
  const numCracks = getNumberOfPenetrationScripts(ns);
  const reqPorts = ns.getServerNumPortsRequired(hostname);
  return numCracks >= reqPorts;
}

export function killScript(ns: NS, hostname: string, script: string) {
  if (ns.scriptRunning(script, hostname)) {
    ns.scriptKill(script, hostname);
  }
}

export function getTotalScriptRam(ns: NS, scripts = []) {
  return scripts.reduce((sum, script) => {
    sum += ns.getScriptRam(script);
    return sum;
  }, 0);
}

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

export function deployVirusScripts(ns: NS, hostnames: string[]) {
  for (const server of hostnames) {
    ns.scp(['virus/v.weak.js', 'virus/v.grow.js', 'virus/v.hack.js'], server, 'home');
  }
}

export function deployProtoAct(ns: NS, hostnames: string[]) {
  // console.log('deployProtoAct');
  for (const server of hostnames) {
    ns.scp('x.proto.act.js', server, 'home');
  }
}

export function deployProto(ns: NS, hostnames: string[]) {
  for (const server of hostnames) {
    ns.scp(['x.proto.prep.auto.js', 'x.proto.batch.auto.js'], server, 'home');
  }
}

export function sortField(byField: string) {
  return (a: any, b: any) => {
    if (a[byField] > b[byField]) {
      return -1;
    } else if (a[byField] < b[byField]) {
      return 1;
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

export function getMathMaxIndex(numbers: number[]): number {
  return numbers.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0);
}

export function getMathMinIndex(numbers: number[]): number {
  return numbers.reduce((iMin, x, i, arr) => (x < arr[iMin] ? i : iMin), 0);
}
