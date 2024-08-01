import { NS } from '@ns';
import { getEvent } from 'lib/lib.port';
import { saveState } from 'state/state';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  ns.print('Starting state queue');

  while (true) {
    const event = getEvent(ns, 'GLOBAL_STATE');
    if (event) {
      saveState(ns, { global: event.data });
    }

    await ns.sleep(1000);
  }
}
