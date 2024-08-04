import { NS } from '@ns';
import { getTargetServersSorted } from 'lib/lib.server';
import { isContractSolvable, solveContract } from 'lib/lib.contracts';
import { ICON_SUCCESS } from './lib/constants';
import { PrintRows } from './lib/types';
import { printTerminalTable } from './lib/lib.print';
import { getThemeColor } from './lib/lib.dom';

interface Contract {
  filename: string;
  type: string;
  host: string;
}

interface ContractSolve {
  answer: any | undefined;
  attempt: string | undefined;
}

export async function main(ns: NS): Promise<void> {
  function attemptContract(answer: string | number | any[], filename: string, host?: string) {
    return ns.codingcontract.attempt(answer, filename, host);
  }

  function solveContractFor(filename: string, host: string): ContractSolve {
    const data = ns.codingcontract.getData(filename, host);
    const type = ns.codingcontract.getContractType(filename, host);
    const answer = solveContract(type, data);
    if (answer === undefined) {
      return { answer: undefined, attempt: undefined };
    }
    return { answer, attempt: attemptContract(answer, filename, host) };
  }

  function generateSolveRow(contract: Contract, contractSolveResponse: ContractSolve, index: number = 0): PrintRows[] {
    const attempt = contractSolveResponse.attempt?.split(': ');
    const answerSuccesColor =
      contractSolveResponse.answer === undefined ? getThemeColor(ns, 'error') : getThemeColor(ns, 'success');
    const rows: PrintRows[] = [
      {
        color: answerSuccesColor,
        columns: [
          { title: '', value: `#${index}` },
          { title: 'Contract', value: contract.type },
          { title: 'Answer/Attempt', value: contractSolveResponse.answer ?? 'N/A' },
        ],
      },
      {
        color: answerSuccesColor,
        columns: [
          { title: '', value: `` },
          { title: 'Contract', value: `${contract.filename} (${contract.host})` },
          { title: 'Answer/Attempt', value: attempt?.[0] ?? 'N/A' },
        ],
      },
    ];
    if (attempt?.length ?? 0 > 1) {
      rows.push({
        color: answerSuccesColor,
        columns: [
          { title: '', value: `` },
          { title: 'Contract', value: `` },
          { title: 'Answer/Attempt', value: attempt?.slice(1).join('') ?? '-' },
        ],
      });
    }
    return rows;
  }

  function generateRow(contract: Contract, index: number = 0): PrintRows {
    return {
      color: getThemeColor(ns, 'info'),
      columns: [
        { title: '', value: `#${index}`, color: getThemeColor(ns, 'success') },
        { title: 'Type', value: contract.type },
        { title: 'File', value: contract.filename },
        { title: 'Host', value: contract.host },
        { title: 'Solvable', value: isContractSolvable(contract.type) ? ICON_SUCCESS : '' },
      ],
    };
  }

  ns.disableLog('ALL');
  ns.clearLog();
  const args = ns.flags([['help', false]]);
  if (args.help) {
    ns.tprintRaw('This script helps you find an unsolved coding contract.');
    ns.tprintRaw(`Usage: run ${ns.getScriptName()}`);
    ns.tprintRaw('Example:');
    ns.tprintRaw(`> run ${ns.getScriptName()}`);
    return;
  }

  const contractFilename = ns.args[0]?.toString() ?? null; // filename | solve
  const contractHost = ns.args[1]?.toString() ?? null;

  if (contractFilename && contractHost && contractFilename.endsWith('.cct')) {
    solveContractFor(contractFilename, contractHost);
    return;
  }

  const servers = getTargetServersSorted(ns, 'hackChance');
  const possibleContractsServers = servers
    .map((c) => {
      const contracts: Contract[] = [];
      const files = ns.ls(c.id).filter((f) => f.endsWith('.cct'));
      files.forEach((f) => {
        const type = ns.codingcontract.getContractType(f, c.id);
        contracts.push({
          filename: f,
          type,
          host: c.id,
        });
      });
      return { ...c, contracts };
    })
    .filter((c) => c.contracts.length > 0);

  const possibleContracts = possibleContractsServers.flatMap((pcs) => pcs.contracts);

  if (contractFilename === 'solve') {
    const solveableContracts = possibleContracts.filter((c) => isContractSolvable(c.type));
    ns.tprintRaw('');
    ns.tprintRaw(`Solvable Contracts found: ${solveableContracts.length}/${possibleContracts.length}`);
    ns.tprintRaw('');
    if (solveableContracts.length === 0) {
      ns.tprintRaw('-- No contracts to solve --');
      return;
    }
    const rows: PrintRows[] = [];
    const contractSolveRows = solveableContracts
      .map((sc, i) => generateSolveRow(sc, solveContractFor(sc.filename, sc.host), i + 1))
      .flat();
    rows.push(...contractSolveRows);
    printTerminalTable(ns, '', rows, { fancy: true, spaceBetweenRows: contractFilename === 'solve' });
    return;
  }

  ns.tprintRaw('');
  ns.tprintRaw(`Contracts found: ${possibleContracts.length}`);
  ns.tprintRaw('---------------------');

  const rows: PrintRows[] = [];
  const contractRows = possibleContracts.map((cc, i) => generateRow(cc, i + 1));
  rows.push(...contractRows);

  printTerminalTable(ns, '', rows, { fancy: true, spaceBetweenRows: contractFilename === 'solve' });
  ns.tprintRaw('');
  ns.tprintRaw('use `run contracts solve` to solve all contracts');
}
