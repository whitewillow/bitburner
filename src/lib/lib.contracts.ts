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
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are given the following decimal value:
 * 5809209738033454
 *
 * Convert it to a binary representation and encode it as an 'extended Hamming code'.
 * The number should be converted to a string of '0' and '1' with no leading zeroes.
 * Parity bits are inserted at positions 0 and 2^N.
 * Parity bits are used to make the total number of '1' bits in a given set of data even.
 * The parity bit at position 0 considers all bits including parity bits.
 * Each parity bit at position 2^N alternately considers N bits then ignores N bits, starting at position 2^N.
 * The endianness of the parity bits is reversed compared to the endianness of the data bits:
 * Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.
 * The parity bit at position 0 is set last.
 *
 * Examples:
 * 8 in binary is 1000, and encodes to 11110000 (pppdpddd - where p is a parity bit and d is a data bit)
 * 21 in binary is 10101, and encodes to 1001101011 (pppdpdddpd)
 *
 * For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code) or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 *
 * https://en.wikipedia.org/wiki/Hamming_code
 * https://www.youtube.com/watch?v=X8jsijhllIA
 *
 */
export function hammingCodesIntegerToEncodedBinary(input: number): string {
  const data = input
    .toString(2)
    .split(``)
    .map((b) => Number.parseInt(b));

  let numParityBits = 0;
  while (Math.pow(2, numParityBits) < numParityBits + data.length + 1) {
    numParityBits++;
  }

  const encoding = Array<number>(numParityBits + data.length + 1).fill(0);
  const parityBits: number[] = [];
  // TODO: populate parityBits with 2^x for x in range 0 to (numParityBits - 1), then
  //       the below calcualtion go away in favor of `if (i in parityBits) continue;
  for (let i = 1; i < encoding.length; i++) {
    const pow = Math.log2(i);
    if (pow - Math.floor(pow) === 0) {
      parityBits.push(i);
      continue;
    }

    encoding[i] = data.shift() as number;
  }

  const parity = encoding.reduce((total, bit, index) => (total ^= bit > 0 ? index : 0), 0);
  const parityVals = parity
    .toString(2)
    .split(``)
    .map((b) => Number.parseInt(b))
    .reverse();
  while (parityVals.length < parityBits.length) {
    parityVals.push(0);
  }

  for (let i = 0; i < parityBits.length; i++) {
    encoding[parityBits[i]] = parityVals[i];
  }

  const globalParity = (encoding.toString().split(`1`).length - 1) % 2 === 0 ? 0 : 1;
  encoding[0] = globalParity;

  const answer = encoding.reduce((total, bit) => (total += bit), ``);
  return answer;
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
  function countWays(n: number, m: number): number {
    if (n === 0) {
      return 1;
    }
    if (n < 0) {
      return 0;
    }
    if (m <= 0 && n >= 1) {
      return 0;
    }
    return countWays(n, m - 1) + countWays(n - m, m);
  }

  return countWays(inputNumber, inputNumber - 1);
}

/**
 * Minimum Path Sum in a Triangle
 * You are attempting to solve a Coding Contract. You have 10 tries remaining,
 * after which the contract will self-destruct.
 *
 *
 * Given a triangle, find the minimum path sum from top to bottom.
 * In each step of the path, you may only move to adjacent numbers in the row below.
 * The triangle is represented as a 2D array of numbers:
 *
 * [
 *       [6],
 *      [9,8],
 *     [2,8,9],
 *    [3,1,7,5],
 *   [4,3,8,2,4]
 * ]
 *
 * Example: If you are given the following triangle:
 *
 * [
 *      [2],
 *     [3,4],
 *    [6,5,7],
 *   [4,1,8,3]
 * ]
 *
 *
 * The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
 *
 */
export function minimumPathSumInTriangle(triangle: number[][]): number {
  function traverse(tmpTriangle: number[][], iteration: number, column: number) {
    if (iteration === tmpTriangle.length) {
      return 0;
    }
    // Current row
    const current: number = tmpTriangle[iteration][column];
    // Next row and adjacent column
    const min: number =
      current + Math.min(traverse(tmpTriangle, iteration + 1, column), traverse(triangle, iteration + 1, column + 1));
    return min;
  }

  return traverse(triangle, 0, 0);
}

/**
 * Sanitize Parentheses in Expression
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * Given the following string:
 *
 * (a)))()a((())(aa
 *
 * remove the minimum number of invalid parentheses in order to validate the string.
 * If there are multiple minimal ways to validate the string, provide all of the possible results.
 * The answer should be provided as an array of strings.
 * If it is impossible to validate the string the result should be an array with only an empty string.
 *
 * IMPORTANT: The string may contain letters, not just parentheses. Examples:
 * "()())()" -> ["()()()", "(())()"]
 * "(a)())()" -> ["(a)()()", "(a())()"]
 * ")(" -> [""]
 */
export function sanitizeParantheses(input: string): string[] {
  return [];
}

// (a)))()a((())(aa

// ["(a)()a(())aa", "(((a)))()a((()))(aa)", "(((a)))()a((())(aa))"]

/**
 * Array Jumping Game II
 * You are attempting to solve a Coding Contract.
 * You have 3 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are given the following array of integers:
 *
 * 3,0,5,1,1,5,4,3,0,0,2,3 = 4
 *
 * Each element in the array represents your MAXIMUM jump length at that position.
 * This means that if you are at position i and your maximum jump length is n, you can
 * jump to any position from i to i+n.
 *
 * Assuming you are initially positioned at the start of the array, determine the
 * minimum number of jumps to reach the end of the array.
 *
 * If it's impossible to reach the end, then the answer should be 0.
 *
 *
 * If your solution is an empty string, you must leave the text box empty.
 * Do not use "", '', or ``.
 */

export function arrayJumpingGame2() {
  // TODO: Implement

  return 0;
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

/**
 * Encryption I: Caesar Cipher
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * Caesar cipher is one of the simplest encryption technique. It is a type of substitution cipher in which each letter in the plaintext is replaced by a letter some fixed number of positions down the alphabet. For example, with a left shift of 3, D would be replaced by A, E would become B, and A would become X (because of rotation).
 *
 * You are given an array with two elements:
 *   ["MEDIA LOGIC ARRAY PRINT TRASH", 14]
 *
 *   Result: YQPUM XASUO MDDMK BDUZF FDMET
 * The first element is the plaintext, the second element is the left shift value.
 *
 * Return the ciphertext as uppercase string. Spaces remains the same.
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */
export function encryption1CaesarCipher(input: [string, number]): string {
  const [plaintext, shift] = input;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  function getCipher(char: string, shift: number): string {
    const index = alphabet.indexOf(char.toUpperCase());
    const newIndex = index - shift;
    if (newIndex < 0) {
      return alphabet[alphabet.length + newIndex];
    }
    return alphabet[newIndex];
  }

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    if (char === ' ') {
      result += ' ';
      continue;
    }

    result += getCipher(char, shift);
  }
  return result;
}


/**
 * Unique Paths in a Grid I
 * You are attempting to solve a Coding Contract. You have 9 tries remaining, after which the contract will self-destruct.
 * 
 * 
 * You are in a grid with 2 rows and 4 columns, and you are positioned in the top-left corner of that grid. You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step. Determine how many unique paths there are from start to finish.
 * 
 * NOTE: The data returned for this contract is an array with the number of rows and columns:
 * 
 * [2, 4]
 * 
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */
export function uniquePathsInGrid1(grid: number[]): number {
  const [rows, cols] = grid;
  const dp = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1));

  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      dp[row][col] = dp[row - 1][col] + dp[row][col - 1];
    }
  }

  return dp[rows - 1][cols - 1];
}