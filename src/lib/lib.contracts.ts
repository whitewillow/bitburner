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
 * Generate IP Addresses
 * You are attempting to solve a Coding Contract. You have 10 tries remaining,
 * after which the contract will self-destruct.
 *
 * Given the following string containing only digits, return an array with all
 * possible valid IP address combinations that can be created from the string:
 *
 * 2470123
 *
 * Note that an octet cannot begin with a '0' unless the number itself is actually 0.
 * For example, '192.168.010.1' is not a valid IP.
 *
 * Examples:
 *
 * 25525511135 -> ["255.255.11.135", "255.255.111.35"]
 * 1938718066 -> ["193.87.180.66"]
 *
 */

export function generateIpAddresses(input: string): string {
  const OCTET_MAX = 255;
  const OCTET_MIN = 0;
  const OCTET_LENGTH = 3;
  const result: string[] = [];
  const possibleIpOctetInput = input;
  const considerLastGroupLength = possibleIpOctetInput.length - 3;

  for (let a = 0; a < OCTET_LENGTH && a < considerLastGroupLength; a++) {
    for (let b = 0; b < OCTET_LENGTH && b < considerLastGroupLength - a; b++) {
      for (let c = 0; c < OCTET_LENGTH && c < considerLastGroupLength - a - b; c++) {
        const octet: string[] = [];
        octet[0] = possibleIpOctetInput.substring(0, a + 1);
        octet[1] = possibleIpOctetInput.substring(a + 1, a + b + 2);
        octet[2] = possibleIpOctetInput.substring(a + b + 2, a + b + c + 3);
        octet[3] = possibleIpOctetInput.substring(a + b + c + 3);
        if (octet.some((s) => s.length > 1 && s.startsWith('0'))) {
          continue;
        }
        if (octet.every((e) => parseInt(e) <= OCTET_MAX)) {
          result.push(octet.join('.'));
        }
      }
    }
  }

  return JSON.stringify(result);

  /*

  1 1 1 1 
  1 1 1 2
  1 1 2 2
  1 2 2 2
  2 2 2 2
  2 2 2 3
  2 2 3 3
  3 3 3 3

  25525511135.length = 11 / 4 = 2.75


  -----------------------------

  2 4 70 123

  2470123.length = 7 / 4 = 1.75

  2.4.70.123
  2.47.0.123
  24.7.0.123
  24.70.1.23
  247.0.1.23  
  247.0.12.3  

  2.4.70.123,
  2.47.0.123,
  24.7.0.123,
  24.70.1.23,
  24.70.12.3,
  247.0.1.23,
  247.0.12.3

  */
}

/**
 * Proper 2-Coloring of a Graph
 * You are given the following data, representing a graph:
 * [10,[[2,3],[6,8],[0,7],[1,5],[1,9],[2,7],[7,8],[4,6],[4,7],[1,6]]]
 *
 * Note that "graph", as used here, refers to the field of graph theory, and has no relation to
 * statistics or plotting. The first element of the data represents the number of vertices in the graph.
 * Each vertex is a unique number between 0 and 9.
 * The next element of the data represents the edges of the graph.
 * Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v].
 * Note that an edge [u,v] is the same as an edge [v,u], as order does not matter.
 * You must construct a 2-coloring of the graph, meaning that you have to assign each vertex in the graph a
 * "color", either 0 or 1, such that no two adjacent vertices have the same color.
 * Submit your answer in the form of an array, where element i represents the color of vertex i.
 * If it is impossible to construct a 2-coloring of the given graph, instead submit an empty array.
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
  let teamColor: { vertice: number; team: number }[] = [];

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

      /**
       * Validate that the teamColor is not the same
       */
      const validateTeam = teamColor.filter((f) => item.includes(f.vertice));
      const [vertice1, vertice2] = validateTeam;
      if (vertice1.team === vertice2.team) {
        teamColor = [];
        break;
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
  console.log(result, teamColor);
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


/**
 * 
 * Merge Overlapping Intervals
 * You are attempting to solve a Coding Contract. You have 15 tries remaining, 
 * after which the contract will self-destruct.
 * 
 * 
 * Given the following array of arrays of numbers representing a list of intervals, 
 * merge all overlapping intervals.
 * 
 * [[13,18],[8,18],[3,7],[7,9],[5,13],[9,12],[14,23],[16,19],[20,28],[16,21],[7,9],[9,10],[4,14],[1,4],[5,8],[1,10],[9,17],[1,6]]
 * 
 * Example:
 * 
 * [[1, 3], [8, 10], [2, 6], [10, 16]]
 * 
 * would merge into [[1, 6], [8, 16]].
 * 
 * The intervals must be returned in ASCENDING order. 
 * You can assume that in an interval, the first number will always be smaller than the second.
 * 
 * [[1, 3], [8, 10], [2, 6], [10, 16]]
 * 
 * 1-3 colludes with 2-6 -> 1-6
 * 8-10 colludes with 10-16 -> 8-16
 * 
 */

export function mergeOverlappingIntervals(intervals: number[][]): string {

  const sorted = intervals.sort((a, b) => a[0] - b[0]);
  const result: number[][] = [];

  let previous = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    if (previous[1] >= current[0]) {
      previous[1] = Math.max(previous[1], current[1]);
    } else {
      result.push(previous);
      previous = current;
    }
  }
  result.push(previous);

  return JSON.stringify(result);

}


/**
 * Total Ways to Sum
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, 
 * after which the contract will self-destruct.
 * 
 * 
 * It is possible write four as a sum in exactly four different ways:
 * 
 *     3 + 1
 *     2 + 2
 *     2 + 1 + 1
 *     1 + 1 + 1 + 1
 * 
 * How many different distinct ways can the number 39 be written as a sum of at 
 * least two positive integers?
 */

export function totalWaysToSum(inputNumber: number): number {
  

  return 0;
}