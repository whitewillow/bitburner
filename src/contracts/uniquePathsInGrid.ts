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
export function uniquePathsInGridI(grid: number[]): number {
  const [rows, cols] = grid;
  const dp = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1));

  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      dp[row][col] = dp[row - 1][col] + dp[row][col - 1];
    }
  }

  return dp[rows - 1][cols - 1];
}
