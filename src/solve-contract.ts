import { NS } from '@ns';
import {
  assign2ColoringGraph,
  maxProfit,
  maxSubArray,
  totalWaysToSum,
  generateIpAddresses,
  mergeOverlappingIntervals,
  minimumPathSumInTriangle,
  encryption1CaesarCipher,
  hammingCodesIntegerToEncodedBinary,
  uniquePathsInGrid1,
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
      'Minimum Path Sum in Triangle',
      'Encryption 1 Caesar Cipher',
      'Hamming Codes Integer to Encoded Binary',
      'Unique Paths in Grid 1',
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
    const result = maxProfit(input.toString().split(',').map(Number));
    ns.tprint('result: ' + result);
  }

  if (contract === 'Subarray with Maximum Sum') {
    console.log('parse: ', input.toString().split(',').map(Number));

    const result = maxSubArray(input.toString().split(',').map(Number));
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
  if (contract === 'Minimum Path Sum in Triangle') {
    const result = minimumPathSumInTriangle(JSON.parse(input.toString()));
    ns.tprint('result: ' + result);
  }
  if (contract === 'Encryption 1 Caesar Cipher') {
    const result = encryption1CaesarCipher(JSON.parse(input.toString()));
    ns.tprint('result: ' + result);
  }
  if (contract === 'Hamming Codes Integer to Encoded Binary') {
    const result = hammingCodesIntegerToEncodedBinary(Number(input.toString()));
    ns.tprint('result: ' + result);
  }
  if (contract === 'Unique Paths in Grid 1') {
    const result = uniquePathsInGrid1(JSON.parse(input.toString()));
    ns.tprint('result: ' + result);
  }
}
