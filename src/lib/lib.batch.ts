import { FilenameOrPID, NS, Server } from '@ns';
import { ProtoBatchCommands, ThreadSequence } from './types';

/**
 * Proto Batch Lib
 * see https://bitburner.readthedocs.io/en/latest/advancedgameplay/hackingalgorithms.html#batch-algorithms-hgw-hwgw-or-cycles
 */

/**
 * For every Growths adds 0.004 multiplier to security
 */
export const GROWTH_ADD_SECURITY_MULTIPLIER = 0.004; // 0.002 for each w2Thread
export const HALF_GROWTH_ADD_SECURITY_MULTIPLIER = 0.002; // 0.002 for each w2Thread
export const HACK_PERCENTAGE = 0.05; // 0.1 | 0.05 | 0.001
export const HACK_SCRIPT_RAM = 1.7;
export const WEAKEN_SCRIPT_RAM = 1.75;
export const GROW_SCRIPT_RAM = 1.75;

/**
 *
 * Proto Batch Delay calculation
 *
 * Start                    End
 *  |                         |
 *  |                         |
 *  |               [Hack-]   | <- h delay
 *  | [------Weaken--------]  | <- w delay
 *  |      [-----Grow-------] | <- g delay
 *  |   [------Weaken--------]|
 * @param ns
 * @param sequence ['h', 'w', 'g'] | ['h', 'w', 'g', 'w']
 * @param targetHost
 * @returns same length array with delays
 */
export function getDelays(ns: NS, sequence: string[], targetHost: string): number[] {
  const ATTACK_DELAY_MS = 50;

  const timings = {
    h: ns.getHackTime(targetHost),
    w: ns.getWeakenTime(targetHost),
    g: ns.getGrowTime(targetHost),
  };

  const baseTimes = sequence.map((_, i) => i + ATTACK_DELAY_MS * i);

  const actionStart = sequence.map((action, i) => {
    const actionKey = action as keyof typeof timings;
    const execTime = timings[actionKey];
    return baseTimes[i] - execTime;
  });

  const execStart = Math.min(...actionStart);
  const delays = sequence.map((_, i) => {
    return Math.abs(execStart - actionStart[i]);
  });

  return delays;
}

export function isTargetReadyForAttack(ns: NS, target: string): boolean {
  const maxMoney = ns.getServerMaxMoney(target);
  const greed = maxMoney * HACK_PERCENTAGE;
  return Math.ceil(ns.hackAnalyzeThreads(target, greed)) >= 1;
}

/**
 * Calculates h,w,g,w2 threads for a target
 *
 * Hack adds a 0.002 multiplier to security
 * weak1 removes 0.002 multiplier to security
 * grow adds 0.004 multiplier to security
 * weak2 removes 0.004 multiplier to security
 *
 * @param ns
 * @param target
 * @returns
 */
export function getThreadSequence(ns: NS, target: string): ThreadSequence {
  const hackAnalyzed = ns.hackAnalyze(target);
  const weakenAnalyzed = ns.weakenAnalyze(1);
  const maxMoney = ns.getServerMaxMoney(target);
  const greed = maxMoney * HACK_PERCENTAGE;

  /**
   * Calculate the number of threads needed to hack the server for amount of money (greed)
   * Lowest thread count is 1;
   * Hence total script cost will be 48.95 GB
   * hackThreads * 1.7 + weaken1Threads * 1.75 + growThreads * 1.75 + weaken2Threads * 1.75 = 48.95
   */
  const hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, greed));

  /**
   * ??
   */
  const hackAmount = maxMoney * hackAnalyzed * hackThreads;

  const weaken1Threads = Math.ceil((hackThreads * HALF_GROWTH_ADD_SECURITY_MULTIPLIER) / weakenAnalyzed);
  const growThreads = Math.ceil(ns.growthAnalyze(target, 1 / (1 - hackAnalyzed * hackThreads)) * 1.01);
  const weaken2Threads = Math.ceil((growThreads * GROWTH_ADD_SECURITY_MULTIPLIER) / weakenAnalyzed);

  return {
    hackThreads,
    hackAmount,
    weaken1Threads,
    growThreads,
    weaken2Threads,
    totalThreads: hackThreads + weaken1Threads + growThreads + weaken2Threads,
  };
}

export function getProtoBatch(
  ns: NS,
  targerServer: string,
  sequence: string[] = ['h', 'w', 'g', 'w'],
  useSimpleThreads: boolean = false,
): ProtoBatchCommands[] {
  const { hackThreads, weaken1Threads, growThreads, weaken2Threads } = useSimpleThreads
    ? { hackThreads: 1, weaken1Threads: 1, growThreads: 2, weaken2Threads: 2 }
    : getThreadSequence(ns, targerServer);

  const [h_delay, w_delay, g_delay, w2_delay] = getDelays(ns, sequence, targerServer);

  return [
    {
      command: 'hack',
      ramOverride: HACK_SCRIPT_RAM,
      threads: hackThreads,
      info: 'hack',
      delay: h_delay,
    },
    {
      command: 'weaken',
      ramOverride: WEAKEN_SCRIPT_RAM,
      threads: weaken1Threads,
      info: 'weaken',
      delay: w_delay,
    },
    {
      command: 'grow',
      ramOverride: GROW_SCRIPT_RAM,
      threads: growThreads,
      info: 'grow',
      delay: g_delay,
    },
    {
      command: 'weaken',
      ramOverride: WEAKEN_SCRIPT_RAM,
      threads: weaken2Threads,
      info: 'weaken 2',
      delay: w2_delay,
    },
  ];
}

export function getPreppingBatch(
  ns: NS,
  targerServer: string,
  growthBaseThreads = 10,
  weakenBaseThreads = 1,
): ProtoBatchCommands[] {
  const sequence = ['w', 'g', 'w'];
  const [w_delay, g_delay, w2_delay] = getDelays(ns, sequence, targerServer);

  return [
    {
      command: 'weaken',
      ramOverride: WEAKEN_SCRIPT_RAM,
      threads: weakenBaseThreads,
      info: 'weaken',
      delay: w_delay,
    },
    {
      command: 'grow',
      ramOverride: GROW_SCRIPT_RAM,
      threads: growthBaseThreads,
      info: 'grow',
      delay: g_delay,
    },
    {
      command: 'weaken',
      ramOverride: WEAKEN_SCRIPT_RAM,
      threads: weakenBaseThreads,
      info: 'weaken 2',
      delay: w2_delay,
    },
  ];
}

export function executeCommands(
  ns: NS,
  commands: ProtoBatchCommands[],
  fromBot: string,
  target: string,
): FilenameOrPID[] {
  const pids: FilenameOrPID[] = [];
  for (const cmd of commands) {
    const { command, ramOverride, threads, info, delay } = cmd;
    const pid = ns.exec(
      'remote-action.js',
      fromBot,
      { ramOverride, temporary: true, threads },
      info,
      command,
      target,
      delay,
      fromBot,
    );
    pids.push(pid);
  }
  return pids;
}

export function maxCommandRamCost(ns: NS, commands: ProtoBatchCommands[]): number {
  return commands.reduce((acc, cur) => Math.max(acc, cur.ramOverride * cur.threads), 0);
}

export function totalCommandRamCost(ns: NS, commands: ProtoBatchCommands[]): number {
  return commands.reduce((acc, cur) => acc + cur.ramOverride * cur.threads, 0);
}

export function maxCommandDelay(ns: NS, commands: ProtoBatchCommands[]): number {
  return commands.reduce((acc, cur) => Math.max(acc, cur.delay), 0);
}

/**
 * Get the weight of a server
 * @param ns
 * @param host
 * @returns
 */
export function getServerWeight(ns: NS, serverToWeight: Server): number {
  // Get the player information
  const server: Server = { ...serverToWeight };

  // Set security to minimum on the server object (for Formula.exe functions)
  server.hackDifficulty = server.minDifficulty;
  const moneyMax = server.moneyMax ?? 0;

  // Default pre-Formulas.exe weight. minDifficulty directly affects times, so it substitutes for min security times
  let weight = moneyMax / (server.minDifficulty ?? 0);

  // If we have formulas, we can refine the weight calculation
  if (ns.fileExists('Formulas.exe')) {
    const player = ns.getPlayer();

    // We use weakenTime instead of minDifficulty since we got access to it,
    // and we add hackChance to the mix (pre-formulas.exe hack chance formula is based on current security, which is useless)
    weight =
      (moneyMax / ns.formulas.hacking.weakenTime(server, player)) * ns.formulas.hacking.hackChance(server, player);
  }
  return weight;
}
