import { NS } from '@ns';

/**
 * 
 * @param ns 
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  /**
   * ns.args
   * @param flag - 
   * @param act - hack|weaken|grow
   * @param target - target server
   * @param ms - delay in ms
   * @param host - host server (could have been ns.getHostname() - but that cost ram
   */
  const [flag, act, target, ms = 0, host=''] = ns.args;
  const nsKey = act as keyof typeof ns
  const response: number = await (ns as any)[nsKey](target, { additionalMsec: ms });
  
  /**
   * Growth
   * returns The total effective multiplier that was applied to the server's money 
   * (after both additive and multiplicative growth).
   */

  /**
   * Weaken
   * A promise that resolves to the value by which security was reduced.
   */

  /**
   * Hack
   * A promise that resolves to the amount of money stolen (which is zero if the hack is unsuccessful).
   */
  if(act === 'hack') {
    // Append amount to file
    // so watch can read it
    ns.write( `reports/pbhr_${host}_${target}.txt`, `${response.toString()}|`, 'a' );
  }
}
