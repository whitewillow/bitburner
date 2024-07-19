import { NS } from '@ns';
import { PrintRows, PrintTable } from 'lib/lib.print';
import { getSimpleProtoBatch } from 'lib/lib.batch';

export async function main(ns: NS): Promise<void> {
  ns.tprint('Hello Remote API!');
  const rows: PrintRows[] = [];

  localStorage.setItem('test', 'test');

  const test = localStorage.getItem('test');

  console.log(getSimpleProtoBatch(ns, 'n00dles'))

  ns.tprint('test: ' + test);

  // ns.printRaw(
  //   React.createElement('h1', { style: { color: '#ffffff' } }, 'This would be big and white'),
  // );
  // ns.tprintRaw(
  //   React.createElement('h1', { style: { color: '#ffffff' } }, 'This would be big and white'),
  // );

  // function tableMaker(data, columns = 4, tableProps = null, tdProps = null) {
  //   // data is an array of Numbers or Strings
  //   const tableRows = [], // Requires ns.printRaw() or ns.tprintRaw()
  //     defacto = { style: { border: '2px solid green' } },
  //     defacto2 = { style: { border: 'none' } },
  //     tabProps = tableProps ?? defacto,
  //     datProps = tdProps ?? defacto2;
  //   data.reverse();
  //   while (data.length > 0) tableRows.push(createRow());
  //   return React.createElement('table', tabProps, tableRows);

  //   function createRow() {
  //     let content = [],
  //       i = data.length,
  //       j = 0;
  //     while (data.length > 0 && i--) {
  //       if (j >= columns) break;
  //       content.push(React.createElement('td', datProps, data[i]));
  //       data.splice(i, 1);
  //       j++;
  //     }
  //     return React.createElement('tr', null, content);
  //   }

}
