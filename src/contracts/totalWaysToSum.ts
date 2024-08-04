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
