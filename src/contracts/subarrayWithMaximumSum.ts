/**
 * Subarray with Maximum Sum
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * Given the following integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.
 * -2,-4,-5,10,9,3,7,8,-7
 * @param nums
 * @returns
 */
export function subarrayWithMaximumSum(numberArray: number[]): number {
  let max = numberArray[0];
  let current = numberArray[0];
  for (let i = 1; i < numberArray.length; i++) {
    current = Math.max(numberArray[i], current + numberArray[i]);
    max = Math.max(max, current);
  }
  return max;
}
