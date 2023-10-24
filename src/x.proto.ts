import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]?.toString() ?? 'n00dles';
  ns.print('Target: ', target);

  const HACK_COST = 1.7;
  const GROW_COST = 1.75;
  const WEAKEN_COST = 1.75;

  const [h, g, w] = [1, 10, 1] // HWGW
  const ht = ns.getHackTime(target)
  const wt = ns.getWeakenTime(target)
  const gt = ns.getGrowTime(target)
  const h_delay = 3 * ht // wt - ht, 4-1
  const g_delay = 0.8 * ht // wt - gt, 4-3.2

  // Are the times for H/G/W always a 1 : 3.2 : 4 ratio? 
  // Looks right from my spot-checking, didn't know if that was safe enough to plan around.


  const freeRam =  ns.getServerMaxRam('home') - ns.getServerUsedRam('home');

  // Ram cost
  // (Hack script cost 1.70) * (threads we want to assign eg. 2)    = 1.75*1  = 1.75
  // (Grow script cost 1.75) * (threads we want to assign eg. 10)   = 1.75*10 = 17.5
  // (Weaken script cost 1.75) * (threads we want to assign eg. 2)  = 1.75*2  = 3.5
  // Total cost = 3.5 + 17.5 + 1.75 = 22.75 => 23

  const can_run_times = Math.floor(freeRam / Math.ceil((1.75*1)+(1.75*2)+(1.70*10)));

  for (let i = can_run_times; i > 0; i--) {
      // ---- Batch
      ns.run("x.proto.act.js", { ramOverride: 1.70, temporary: true, threads: h }, "  /", "hack", target, h_delay)
      ns.run("x.proto.act.js", { ramOverride: 1.75, temporary: true, threads: g }, " / ", "grow", target, g_delay)
      ns.run("x.proto.act.js", { ramOverride: 1.75, temporary: true, threads: w }, "/  ", "weaken", target)
      // ---- Batch End
  }
}


// ---- PREP

/**
 * Grow indtil max money
 * weaken indtil 0 i sikkerhed
 * 
 * 
 */


// TODO: How to iterate

/**
 * x.proto.act.js should be deployed to bot
 * execute above BATCH on bot
 * Wait for all scripts to END
 * Repeat
 * 
 */


/**
 * 
 * 
 * 
  Make a list of all potential targets and sort them by desirability
  Prepare the best target
  Send a batch out against that target
  While you wait for that batch to finish, start prepping the next best target
  Once your preparations are done, send a batch against that server and start prepping the next one
  Continue this pattern, sending out new batches against prepped targets whenever they finish while using leftover ram to prep new targets until
 */

  // async function SleepPids(ns, pids) {
  //   while(pids.some(pid => ns.isRunning(pid)))
  //     await ns.sleep(5);
  // }