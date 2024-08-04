import { NS } from '@ns';
import { getEvent, writeToInputPort } from 'lib/lib.port';
import { solvableContracts, solveContract } from 'lib/lib.contracts';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');

  ns.print('Starting test script');

  function getParams(fn: Function) {
    const fnStr = fn.toString();
    const params = fnStr
      .substring(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
      .split(',')
      .map((m) => m.trim());
    return params;
  }

  const contractType = 'Array Jumping Game II';
  const contractInput = [-2, -4, -5, 10, 9, 3, 7, 8, -7];

  const fn = (solvableContracts as any)['Sanitize Parentheses in Expression'];
  console.log('fn: ', fn);
  console.log('fn: ', getParams(fn));

  // // const data = ns.codingcontract.getData('contract-197218-FoodNStuff.cct', 'icarus')
  // console.log('data: ', contractInput);
  // console.log(solveContract(contractType, contractInput));
}
