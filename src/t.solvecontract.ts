import { NS } from '@ns';
import {
  assign2ColoringGraph,
  maxProfit,
  maxSubArray,
  totalWaysToSum,
  generateIpAddresses,
  mergeOverlappingIntervals,
} from 'lib/lib.contracts';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  const contract = await ns.prompt('Select Contract', {
    type: 'select',
    choices: [
      'Assign 2 Coloring Graph',
      'Max Profit',
      'Subarray with Maximum Sum',
      'Generate IP Addresses',
      'Merge Overlapping Intervals',
      'Total Ways to Sum',
    ],
  });

  const input = await ns.prompt('Add input', {
    type: 'text',
  });

  ns.tprint(contract);
  ns.tprint('---------------------');
  if (contract === 'Assign 2 Coloring Graph') {
    const result = assign2ColoringGraph(JSON.parse(input.toString()));

    ns.tprint('result: ' + result);
  }

  if (contract === 'Max Profit') {
    const result = maxProfit(JSON.parse(input.toString()));
    ns.tprint('result: ' + result);
  }

  if (contract === 'Subarray with Maximum Sum') {
    const result = maxSubArray(JSON.parse(input.toString()));
    ns.tprint('result: ' + result);
  }

  if (contract === 'Generate IP Addresses') {
    const result = generateIpAddresses(input.toString());
    ns.tprint('result: ' + result);
  }

  if (contract === 'Merge Overlapping Intervals') {
    const result = mergeOverlappingIntervals(JSON.parse(input.toString()));
    ns.tprint('result: ' + result);
  }

  if (contract === 'Total Ways to Sum') {
    const result = totalWaysToSum(JSON.parse(input.toString()));
    ns.tprint('result: ' + result);
  }

  // ns.tprint('result: ' + result);

  // ns.tprint(`maxProfit SANATI = ${maxProfit([9, 151, 169, 35, 194, 68, 19, 148, 29, 97, 12, 29])} === 533`);

  // ns.tprint(`maxProfit = ${maxProfit([69, 97, 51, 191, 31, 33, 74, 111, 145, 75, 192, 119, 82, 24])}`);

  // ns.tprint(`8 = ${hammingCode(8)}`);
  // ns.tprint(`21 = ${hammingCode(21)}`);
  // ns.tprint(`6220614038587 = ${hammingCode(6220614038587)}`);
}

// [10,[[5,7],[2,6],[3,4],[1,7],[1,3],[4,9],[6,7],[0,7],[0,5],[7,8],[8,9],[3,8],[0,6],[2,8],[0,4]]]

// Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
// Output: [0, 0, 1, 1]

// Input: [3, [[0, 1], [0, 2], [1, 2]]]
// Output: []
