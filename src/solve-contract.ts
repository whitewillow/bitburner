import { NS } from '@ns';
import { solvableContracts } from 'lib/lib.contracts';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  const choices = Object.keys(solvableContracts);

  const contract = await ns.prompt('Select Contract', {
    type: 'select',
    choices,
  });

  const input = await ns.prompt('Add input', {
    type: 'text',
  });

  function getParams(fn: Function) {
    const fnStr = fn.toString();
    const params = fnStr
      .substring(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
      .split(',')
      .map((m) => m.trim());
    return params;
  }

  if (typeof contract === 'string') {
    const fn = solvableContracts[contract as keyof typeof solvableContracts];
    const parseAsString = getParams(fn)[0] === 'inputString';

    const parsedInput = parseAsString ? input.toString() : JSON.parse(input.toString());

    const result = (solvableContracts[contract as keyof typeof solvableContracts] as any)(parsedInput);

    ns.tprint(contract);
    ns.tprint('---------------------');
    ns.tprint('result: ' + result);
  }
}
