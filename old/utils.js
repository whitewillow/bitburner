

const homeServer = 'home';

/** @param {NS} ns */
export function getCrackScripts(ns) {
  return {
    'BruteSSH.exe': ns.brutessh,
    'FTPCrack.exe': ns.ftpcrack,
    'relaySMTP.exe': ns.relaysmtp,
    'HTTPWorm.exe': ns.httpworm,
    'SQLInject.exe': ns.sqlinject
  };
}

/** @param {NS} ns */
export function getNumberOfPenetrationScripts(ns) {
  const cracks = getCrackScripts(ns);
  return Object.keys(cracks).filter((file) => ns.fileExists(file, homeServer)).length;
}

/** @param {NS} ns */
export function canHack(ns, server) {
  const playerHackLvl = ns.getHackingLevel();
  const serverHackLvl = ns.getServerRequiredHackingLevel(server);
  return playerHackLvl >= serverHackLvl;
}

/** @param {NS} ns */
export function hasServerRamToRunScript(ns, server, scriptRam) {
  const ramAvail = ns.getServerMaxRam(server);
  return ramAvail > scriptRam;
}

/** @param {NS} ns */
export function canPenetrate(ns, server) {
  const numCracks = getNumberOfPenetrationScripts(ns);
  const reqPorts = ns.getServerNumPortsRequired(server);
  return numCracks >= reqPorts;
}

/** @param {NS} ns */
export function killScript(ns, server, script) {
  if (ns.scriptRunning(script, server)) {
    ns.scriptKill(script, server);
  }
}

/** @param {NS} ns */
export function penetrateServer(ns, server) {
  const cracks = getCrackScripts(ns);
  ns.print('Penetrating: ' + server);
  for (const file of Object.keys(cracks)) {
    if (ns.fileExists(file, homeServer)) {
      const runScript = cracks[file];
      ns.print('Cracking:' + server + ' with: ' + file);
      runScript(server);
    }
  }
}

/** @param {NS} ns */
export function getTotalScriptRam(ns, scripts = []) {
  return scripts.reduce((sum, script) => {
    sum += ns.getScriptRam(script);
    return sum;
  }, 0);
}

/** @param {NS} ns */
export function brutePenetrate(ns, server) {
  try {
    ns.brutessh(server)
    ns.ftpcrack(server)
    ns.relaysmtp(server)
    ns.httpworm(server)
    ns.sqlinject(server)
  } catch { }

  try {
    ns.nuke(server)
  } catch { }
}

/** @param {NS} ns */
export function deployVirusScripts(ns, servers) {
  for (let server of servers) {
    ns.scp(['v.weak.js', 'v.grow.js', 'v.hack.js'], server, 'home');
  }
}

export function sortField(byField) {
  return (a, b) => {
    if (a[byField] > b[byField]) {
      return -1;
    } else if (a[byField] < b[byField]) {
      return 1
    } else {
      return 0;
    }
  }
}