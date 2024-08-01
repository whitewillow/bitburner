import { NS } from '@ns';
import { getEvent, writeToInputPort } from 'lib/lib.port';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  ns.print('Starting test script');

  writeToInputPort(ns, 'STATE', 1, 'Tester');

  while (true) {
    const event = getEvent(ns, 'STATE');
    if (event) {
      ns.tprint(event);
    }
    await ns.sleep(1000);
  }

}
