import { NS } from '@ns';
import { assign2ColoringGraph } from 'lib/lib.contracts';

export async function main(ns: NS): Promise<void> {
  ns.tprint('Hello Remote API!');

  const result = assign2ColoringGraph([
    10,
    [
      [2, 3],
      [6, 8],
      [0, 7],
      [1, 5],
      [1, 9],
      [2, 7],
      [7, 8],
      [4, 6],
      [4, 7],
      [1, 6],
    ],
  ]);

  ns.tprint('result: ' + result);
}
