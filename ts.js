/**
 * Find Target Server
 */

import { getTargetNodesSimple } from './lib.node';

/** @param {NS} ns */
export async function main(ns) {

  const [compareField] = ns.args.length ? ns.args : ['hackChance']; // maxMoney | hackChance

  ns.tprint(compareField);

  const filename = 'network-report.txt';


  async function writeNodesToFile(nodes) {

    const lines = [];
    for (const node of nodes) {
      for (const field of Object.keys(node)) {
        const value = (field.toLocaleLowerCase().includes('money')) ? ns.formatNumber(node[field]) : node[field];
        lines.push(field + ': ' + value)
      }
      lines.push('');
    }

    const fileContent = lines.join('\n');
    await ns.write(filename, fileContent, 'w');
    ns.alert(fileContent);
    ns.toast('Targets written to: ' + filename, 'info', 3000);
  }

  const targetNodes = getTargetNodesSimple(ns, compareField, 'asc');

  await writeNodesToFile(targetNodes);
}
