/**
 * HammingCodes: Integer to Encoded Binary
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are given the following decimal value:
 * 5809209738033454
 *
 * Convert it to a binary representation and encode it as an 'extended Hamming code'.
 * The number should be converted to a string of '0' and '1' with no leading zeroes.
 * Parity bits are inserted at positions 0 and 2^N.
 * Parity bits are used to make the total number of '1' bits in a given set of data even.
 * The parity bit at position 0 considers all bits including parity bits.
 * Each parity bit at position 2^N alternately considers N bits then ignores N bits, starting at position 2^N.
 * The endianness of the parity bits is reversed compared to the endianness of the data bits:
 * Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.
 * The parity bit at position 0 is set last.
 *
 * Examples:
 * 8 in binary is 1000, and encodes to 11110000 (pppdpddd - where p is a parity bit and d is a data bit)
 * 21 in binary is 10101, and encodes to 1001101011 (pppdpdddpd)
 *
 * For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code) or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 *
 * https://en.wikipedia.org/wiki/Hamming_code
 * https://www.youtube.com/watch?v=X8jsijhllIA
 *
 */
export function hammingCodesIntegerToEncodedBinary(inputNumber: number): string {
  const data = inputNumber
    .toString(2)
    .split(``)
    .map((b) => Number.parseInt(b));

  let numParityBits = 0;
  while (Math.pow(2, numParityBits) < numParityBits + data.length + 1) {
    numParityBits++;
  }

  const encoding = Array<number>(numParityBits + data.length + 1).fill(0);
  const parityBits: number[] = [];
  // TODO: populate parityBits with 2^x for x in range 0 to (numParityBits - 1), then
  //       the below calcualtion go away in favor of `if (i in parityBits) continue;
  for (let i = 1; i < encoding.length; i++) {
    const pow = Math.log2(i);
    if (pow - Math.floor(pow) === 0) {
      parityBits.push(i);
      continue;
    }

    encoding[i] = data.shift() as number;
  }

  const parity = encoding.reduce((total, bit, index) => (total ^= bit > 0 ? index : 0), 0);
  const parityVals = parity
    .toString(2)
    .split(``)
    .map((b) => Number.parseInt(b))
    .reverse();
  while (parityVals.length < parityBits.length) {
    parityVals.push(0);
  }

  for (let i = 0; i < parityBits.length; i++) {
    encoding[parityBits[i]] = parityVals[i];
  }

  const globalParity = (encoding.toString().split(`1`).length - 1) % 2 === 0 ? 0 : 1;
  encoding[0] = globalParity;

  const answer = encoding.reduce((total, bit) => (total += bit), ``);
  return answer;
}
