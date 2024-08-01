import { NS } from '@ns';
import { getTargetServersSorted } from 'lib/lib.server';

interface Contract {
  filename: string;
  type: string;
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  const args = ns.flags([['help', false]]);
  if (args.help) {
    ns.tprint('This script helps you find an unsolved coding contract.');
    ns.tprint(`Usage: run ${ns.getScriptName()}`);
    ns.tprint('Example:');
    ns.tprint(`> run ${ns.getScriptName()}`);
    return;
  }

  const servers = getTargetServersSorted(ns, 'hackChance');
  const possibleContracts = servers
    .map((c) => {
      const contracts: Contract[] = [];
      const files = ns.ls(c.id).filter((f) => f.endsWith('.cct'));
      files.forEach((f) => {
        const type = ns.codingcontract.getContractType(f, c.id);
        contracts.push({
          filename: f,
          type,
        });
      });
      return { ...c, contracts };
    })
    .filter((c) => c.contracts.length > 0);

  ns.tprintRaw(`Contracts found: ${possibleContracts.length}`);
  ns.tprintRaw('---------------------');
  possibleContracts.forEach((c) => {
    ns.tprintRaw(`${c.server.hostname}`);
    c.contracts.forEach((cc) => {
      ns.tprintRaw(` - ${cc.filename} - ${cc.type}`);
    });
  });
}
