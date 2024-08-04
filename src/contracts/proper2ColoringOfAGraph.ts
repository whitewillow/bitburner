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
export function proper2ColoringOfAGraph(inputArray: [number, number[][]]): number[] {
  const [numNodes, edges] = inputArray;
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
