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
