import { algorithmicStockTraderI, algorithmicStockTraderII } from '/contracts/algorithmicStockTrader';
import { arrayJumpingGame, arrayJumpingGame2 } from '/contracts/arrayJumpingGame';
import { compressionIIILZCompression } from '/contracts/compression';
import { encryption1CaesarCipher, encryption2VigenereCipher } from '/contracts/encryption';
import { findLargestPrimeFactor } from '/contracts/findLargestPrimeFactor';
import { generateIpAddresses } from '/contracts/generateIpAddresses';
import { hammingCodesIntegerToEncodedBinary } from '/contracts/hammingCodesIntegerToEncodedBinary';
import { mergeOverlappingIntervals } from '/contracts/mergeOverlappingIntervals';
import { minimumPathSumInTriangle } from '/contracts/minimumPathSumInTriangle';
import { proper2ColoringOfAGraph } from '/contracts/proper2ColoringOfAGraph';
import { sanitizeParenthesesInExpression } from '/contracts/sanitizeParenthesesInExpression';
import { subarrayWithMaximumSum } from '/contracts/subarrayWithMaximumSum';
import { totalWaysToSum } from '/contracts/totalWaysToSum';
import { uniquePathsInGridI } from '/contracts/uniquePathsInGrid';

export const solvableContracts = {
  'Algorithmic Stock Trader I': algorithmicStockTraderI,
  'Algorithmic Stock Trader II': algorithmicStockTraderII,
  'Subarray with Maximum Sum': subarrayWithMaximumSum,
  'Generate IP Addresses': generateIpAddresses,
  'Merge Overlapping Intervals': mergeOverlappingIntervals,
  'Total Ways to Sum': totalWaysToSum,
  'Encryption I: Caesar Cipher': encryption1CaesarCipher,
  'Encryption II: Vigenère Cipher': encryption2VigenereCipher,
  'Array Jumping Game': arrayJumpingGame,
  'Array Jumping Game II': arrayJumpingGame2,
  'Proper 2-Coloring of a Graph': proper2ColoringOfAGraph,
  'HammingCodes: Integer to Encoded Binary': hammingCodesIntegerToEncodedBinary,
  'Minimum Path Sum in a Triangle': minimumPathSumInTriangle,
  'Unique Paths in a Grid I': uniquePathsInGridI,
  'Sanitize Parentheses in Expression': sanitizeParenthesesInExpression,
  'Compression III: LZ Compression': compressionIIILZCompression,
  'Find Largest Prime Factor': findLargestPrimeFactor,
};

export function solveContract(contractType: string, inputRaw: any): any {
  if ((solvableContracts as any)[contractType]) {
    return (solvableContracts as any)[contractType](inputRaw);
  }

  return undefined;
}

export function isContractSolvable(contractType: string): boolean {
  return (solvableContracts as any)[contractType] !== undefined;
}

/**
 * Shortest Path in a Grid
 * You are attempting to solve a Coding Contract.
 * You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are located in the top-left corner of the following grid:
 *
 *   [[0,0,0,0,0,0,1,0,1,0],
 *    [0,0,1,1,1,1,1,0,0,1],
 *    [0,0,0,0,0,0,0,1,0,0],
 *    [1,0,0,1,1,0,0,1,0,0],
 *    [0,0,0,0,1,0,0,0,1,0],
 *    [1,1,0,0,0,0,0,0,0,0]]
 *
 * Answar: 'RDDRRRRRDDDRRR'
 *
 * You are trying to find the shortest path to the bottom-right corner of the grid,
 * but there are obstacles on the grid that you cannot move onto. These obstacles
 * are denoted by '1', while empty spaces are denoted by 0.
 *
 * Determine the shortest path from start to finish, if one exists.
 * The answer should be given as a string of UDLR characters,
 * indicating the moves along the path
 *
 * NOTE: If there are multiple equally short paths, any of them is accepted as answer.
 * If there is no path, the answer should be an empty string.
 *
 * NOTE: The data returned for this contract is an 2D array of numbers
 * representing the grid.
 *
 * Examples:
 *
 *     [[0,1,0,0,0],
 *      [0,0,0,1,0]]
 *
 * Answer: 'DRRURRD'
 *
 *     [[0,1],
 *      [1,0]]
 *
 * Answer: ''
 *
 *
 * If your solution is an empty string, you must leave the text box empty.
 * Do not use "", '', or ``.
 *  */
export function shortestPathInAGrid(grid: number[][]): string {
  const WALL = 1;
  const PATH = 0;
  const directions = ['U', 'D', 'L', 'R'];
  const start = [0, 0];
  const end = [grid.length - 1, grid[0].length - 1];
  const rows = grid.length;
  const cols = grid[0].length;

  // for(let row = 0; row < rows; row++) {
  //   for(let col = 0; col < cols; col++) {
  //     if(grid[row][col] === WALL) {
  //       grid[row][col] = -1;
  //     }

  //   }
  // }
  return '';
}
