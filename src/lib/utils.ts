import { NS } from "@ns";

const homeServer = 'home';

export function getCrackScripts(ns: NS): Record<string, (host:string)=>void> {
  return {
    'BruteSSH.exe': ns.brutessh,
    'FTPCrack.exe': ns.ftpcrack,
    'relaySMTP.exe': ns.relaysmtp,
    'HTTPWorm.exe': ns.httpworm,
    'SQLInject.exe': ns.sqlinject
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

export function penetrateServer(ns: NS, hostname: string) {
  const cracks = getCrackScripts(ns);
  ns.print('Penetrating: ' + hostname);
  for (const file of Object.keys(cracks)) {
    if (ns.fileExists(file, homeServer)) {
      const runScript = cracks[file];
      ns.print('Cracking:' + hostname + ' with: ' + file);
      runScript(hostname);
    }
  }
}

export function getTotalScriptRam(ns: NS, scripts = []) {
  return scripts.reduce((sum, script) => {
    sum += ns.getScriptRam(script);
    return sum;
  }, 0);
}

export function brutePenetrate(ns: NS, hostname: string) {
  try {
    ns.brutessh(hostname)
    ns.ftpcrack(hostname)
    ns.relaysmtp(hostname)
    ns.httpworm(hostname)
    ns.sqlinject(hostname)
  } catch { }

  try {
    ns.nuke(hostname)
  } catch { }
}

export function deployVirusScripts(ns: NS, hostnames: string[]) {
  for (const server of hostnames) {
    ns.scp(['virus/v.weak.js', 'virus/v.grow.js', 'virus/v.hack.js'], server, 'home');
  }
}

export function sortField(byField: string) {
  return (a: any, b: any) => {
    if (a[byField] > b[byField]) {
      return -1;
    } else if (a[byField] < b[byField]) {
      return 1
    } else {
      return 0;
    }
  }
}