import { NS } from '@ns';
import { range } from 'lib/utils';
import { MAX_INPUT_PORT, MIN_INPUT_PORT, OUTPUT_PORT } from 'lib/constants';
import { writeToOutputPort } from 'lib/lib.port';

/**
 * Queue data from input ports and dump to output port
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  /**
   * Temporary queue to hold data
   */
  const QUEUE: any[] = [];
  const TICK = 500;

  /**
   * Max items a port can hold, game will crash if more than this is written
   */
  const MAX_PORT_SIZE = 50;

  let totalCollected = 0;
  let dumped = 0;

  const outputHandle = ns.getPortHandle(OUTPUT_PORT);

  function readDataFromInputPort(): void {
    const inputPortRange = range(MIN_INPUT_PORT, MAX_INPUT_PORT + 1);

    inputPortRange.forEach((port) => {
      const handle = ns.getPortHandle(port);
      let currentlyCollected = 0;

      while (!handle.empty() && currentlyCollected < MAX_PORT_SIZE) {
        const payload = JSON.parse(handle.read());
        QUEUE.push(payload);

        currentlyCollected += 1;
        totalCollected += 1;
      }
    });
  }

  function dumpDataToOutputPort(): void {
    while (QUEUE.length > 0) {
      const [nextItem] = QUEUE;
      if (writeToOutputPort(ns, nextItem)) {
        QUEUE.shift();
        dumped += 1;
      } else {
        break;
      }
    }
  }

  if (!outputHandle.empty()) {
    ns.tprint('Output port is not empty - clearing');
    outputHandle.clear();
  }

  ns.atExit(() => {
    outputHandle.clear();
  });

  let i = 0;

  while (true) {
    readDataFromInputPort();
    dumpDataToOutputPort();

    ns.clearLog();
    ns.print(`Total collected: ${totalCollected}`);
    ns.print(`Dumped: ${dumped}`);
    ns.print(`Queue size: ${QUEUE.length}`);
    ns.print(`Runs: ${i}`);
    i += 1;
    await ns.sleep(TICK);
  }
}
