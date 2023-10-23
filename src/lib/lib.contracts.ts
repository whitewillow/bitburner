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
  const [firstVFrom, firstVTo] = sortedEdges[0];

  teamColor.push({ vertice: firstVFrom, team: BLUE });
  teamColor.push({ vertice: firstVTo, team: RED });
  sortedEdges.splice(0, 1);

  for (let i = 0; i < numNodes - 1; i++) {
    for (const team of teamColor) {
      const foundIndex = sortedEdges.findIndex((f) => f.includes(team.vertice));

      if (foundIndex === -1) {
        continue;
      }
      
      const item = sortedEdges[foundIndex];
      const vertice = item.find((f) => f !== team.vertice);

      if (vertice && !teamColor.find((f) => f.vertice === vertice)) {
        teamColor.push({ vertice, team: team.team === BLUE ? RED : BLUE });
      }

      sortedEdges.splice(foundIndex, 1);
    }
  }

  return teamColor.sort((a, b) => a.vertice - b.vertice).map((m) => m.team);
}
