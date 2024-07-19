/**
 * Test scripts here
 */

import { NS } from '@ns';
import { getBotNodesDetailed } from './lib/lib.node';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  const myBots = getBotNodesDetailed(ns);
  console.log('Owned bots', myBots.length);
}
