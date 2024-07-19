/**
 * TOOL - List Target Server Info
 */

import { NS } from '@ns';
import { SimpleNode, getTargetNodesSimple } from 'lib/lib.node';

export async function main(ns: NS): Promise<void> {
  const compareField = ns.args.length > 0 ? ns.args[0].toString() : 'hackChance'; // maxMoney | hackChance
  const filename = 'network-report.txt';

  async function writeNodesToFile(nodes: SimpleNode[]) {
    const lines = [];
    for (const node of nodes) {
      for (const field of Object.keys(node)) {
        const key = field as keyof typeof node;
        const value = field.toLocaleLowerCase().includes('money')
          ? ns.formatNumber(Number(node[key]))
          : node[key];
        lines.push(field + ': ' + value);
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
