/**
 * Array Jumping Game
 * You are attempting to solve a Coding Contract. You have 1 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are given the following array of integers:
 *
 * 3,7,9,0,1,10,4,1,0,5,4,8,0,9,4,10,9,0,2,9,0,0,5,6,8
 *
 * Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
 *
 * Assuming you are initially positioned at the start of the array, determine whether you are able to reach the last index.
 *
 * Your answer should be submitted as 1 or 0, representing true and false respectively.
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 * @returns
 */
export function arrayJumpingGame(inputNumberArray: number[]): number {
  let maxReach = 0;
  for (let i = 0; i < inputNumberArray.length; i++) {
    if (i > maxReach) {
      return 0;
    }
    maxReach = Math.max(maxReach, i + inputNumberArray[i]);
  }
  return 1;
}

/**
 * Array Jumping Game II
 * You are attempting to solve a Coding Contract.
 * You have 3 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are given the following array of integers:
 *
 * 3,0,5,1,1,5,4,3,0,0,2,3 = 4
 * 1,3,1,5,6,4,1 = 3
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
export function arrayJumpingGame2(inputNumberArray: number[]) {
  let jumps = 0;
  let currentJumpEnd = 0;
  let farthest = 0;
  for (let i = 0; i < inputNumberArray.length - 1; i++) {
    farthest = Math.max(farthest, i + inputNumberArray[i]);
    if (i === currentJumpEnd) {
      jumps++;
      currentJumpEnd = farthest;
    }
  }
  return jumps;
}
