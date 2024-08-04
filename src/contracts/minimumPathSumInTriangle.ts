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
