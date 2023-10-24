import { range } from 'lib/utils';

/**
 * Subarray with Maximum Sum
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * Given the following integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.
 * -2,-4,-5,10,9,3,7,8,-7
 * @param nums
 * @returns
 */
export function maxSubArray(nums: number[]): number {
  let max = nums[0];
  let current = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    max = Math.max(max, current);
  }
  return max;
}

/**
 * Proper 2-Coloring of a Graph
 * [10,[[2,3],[6,8],[0,7],[1,5],[1,9],[2,7],[7,8],[4,6],[4,7],[1,6]]]
 *
 * Team Blue: 0, 2, 4, 8, 1
 * Team Red: 7, 3, 6, 5, 9
 *
 * Giving result 0,0,0,1,0,1,1,1,0,1
 *
 */
export function assign2ColoringGraph(input: [number, number[][]]): number[] {
  const [numNodes, edges] = input;
  const BLUE = 0;
  const RED = 1;

  let sortedEdges = edges.sort((a, b) => a[0] - b[0]);
  const teamColor: { vertice: number; team: number }[] = [];

  const [firstVFrom, firstVTo] = sortedEdges.splice(0, 1)[0];

  teamColor.push({ vertice: firstVFrom, team: BLUE });
  teamColor.push({ vertice: firstVTo, team: RED });

  /**
   * Loop through teamcolor for x nodes - and
   * find connections to other nodes
   */
  for (let i = 0; i < numNodes - 1; i++) {
    for (const team of teamColor) {
      // Has connection ?
      const foundIndex = sortedEdges.findIndex((f) => f.includes(team.vertice));

      if (foundIndex === -1) {
        // No connection
        continue;
      }

      const item = sortedEdges[foundIndex];
      const vertice = item.find((f) => f !== team.vertice);

      if (vertice && !teamColor.find((f) => f.vertice === vertice)) {
        teamColor.push({ vertice, team: team.team === BLUE ? RED : BLUE });
      }
      // Remove from sortedEdges
      sortedEdges.splice(foundIndex, 1);
    }
  }

  /**
   * Alle edges must have a connection to another edge - AKA must match the number
   * of nodes in the graph, else return empty array
   */
  const result = teamColor.sort((a, b) => a.vertice - b.vertice).map((m) => m.team);
  return result.length === numNodes ? result : [];
}

/**
 * HammingCodes: Integer to Encoded Binary
 * You are given the following decimal Value:
 * 6220614038587
 * Convert it to a binary representation and encode it as an 'extended Hamming code'. Eg:
 * Value 8 is expressed in binary as '1000', which will be encoded with the pattern 'pppdpddd', where p is a parity bit and d a data bit. The encoding of
 * 8 is 11110000. As another example, '10101' (Value 21) will result into (pppdpdddpd) '1001101011'.
 * The answer should be given as a string containing only 1s and 0s.
 * NOTE: the endianness of the data bits is reversed in relation to the endianness of the parity bits.
 * NOTE: The bit at index zero is the overall parity bit, this should be set last.
 * NOTE 2: You should watch the Hamming Code video from 3Blue1Brown, which explains the 'rule' of encoding, including the first index parity bit mentioned in the previous note.
 *
 * Extra rule for encoding:
 * There should be no leading zeros in the 'data bit' section
 *
 * https://en.wikipedia.org/wiki/Hamming_code
 * https://www.youtube.com/watch?v=X8jsijhllIA
 *
 */
export function hammingCode(input: number): string {
  // TODO: Implement
  return '';
}

/**
 * Algorithmic Stock Trader II
 * You are attempting to solve a Coding Contract. You have 9 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
 *
 * 69,97,51,191,31,33,74,111,145,75,192,119,82,24
 *
 * Determine the maximum possible profit you can earn using as many transactions as you'd like.
 * A transaction is defined as buying and then selling one share of the stock.
 * Note that you cannot engage in multiple transactions at once.
 * In other words, you must sell the stock before you buy it again.
 *
 * If no profit can be made, then the answer should be 0
 * 
 * -------------
 * 97 - 69    = 28    
 * 51 - 97    = -46
 * 191 - 51   = 140
 * 31 - 191   = -160
 * 33 - 31    = 2
 * 74 - 33    = 41
 * 111 - 74   = 37
 * 145 - 111  = 34
 * 75 - 145   = -70
 * 192 - 75   = 117
 * 119 - 192  = -73
 * 82 - 119   = -37
 * 24 - 82    = -58
 * 
 * diff>0 = 28 + 140 + 2 + 41 + 37 + 34 + 117 = 399
 * 
 * RESULT: 399
 *
 */
export function maxProfit(stockPrices: number[]): number {
  let maxProfit = 0;
  for (let i = 0; i < stockPrices.length - 1; i++) {
    const diff = stockPrices[i + 1] - stockPrices[i];
    if (diff > 0) {
      maxProfit += diff;
    }
  }
  return maxProfit;
}
