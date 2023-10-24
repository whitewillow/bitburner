import { NS } from '@ns';
import { assign2ColoringGraph, maxProfit } from 'lib/lib.contracts';

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

  ns.tprint(`maxProfit SANATI = ${maxProfit([9, 151, 169, 35, 194, 68, 19, 148, 29, 97, 12, 29])} === 533`);

  ns.tprint(`maxProfit = ${maxProfit([69, 97, 51, 191, 31, 33, 74, 111, 145, 75, 192, 119, 82, 24])}`);

  // ns.tprint(`8 = ${hammingCode(8)}`);
  // ns.tprint(`21 = ${hammingCode(21)}`);
  // ns.tprint(`6220614038587 = ${hammingCode(6220614038587)}`);
}
