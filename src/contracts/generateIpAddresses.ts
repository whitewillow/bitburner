/**
 * Generate IP Addresses
 * You are attempting to solve a Coding Contract. You have 10 tries remaining,
 * after which the contract will self-destruct.
 *
 * Given the following string containing only digits, return an array with all
 * possible valid IP address combinations that can be created from the string:
 *
 * 2470123
 *
 * Note that an octet cannot begin with a '0' unless the number itself is actually 0.
 * For example, '192.168.010.1' is not a valid IP.
 *
 * Examples:
 *
 * 25525511135 -> ["255.255.11.135", "255.255.111.35"]
 * 1938718066 -> ["193.87.180.66"]
 *
 */

export function generateIpAddresses(inputString: string): string {
  const OCTET_MAX = 255;
  const OCTET_MIN = 0;
  const OCTET_LENGTH = 3;
  const result: string[] = [];
  const possibleIpOctetInput = inputString.toString();
  const considerLastGroupLength = possibleIpOctetInput.length - 3;

  for (let a = 0; a < OCTET_LENGTH && a < considerLastGroupLength; a++) {
    for (let b = 0; b < OCTET_LENGTH && b < considerLastGroupLength - a; b++) {
      for (let c = 0; c < OCTET_LENGTH && c < considerLastGroupLength - a - b; c++) {
        const octet: string[] = [];
        octet[0] = possibleIpOctetInput.substring(0, a + 1);
        octet[1] = possibleIpOctetInput.substring(a + 1, a + b + 2);
        octet[2] = possibleIpOctetInput.substring(a + b + 2, a + b + c + 3);
        octet[3] = possibleIpOctetInput.substring(a + b + c + 3);
        if (octet.some((s) => s.length > 1 && s.startsWith('0'))) {
          continue;
        }
        if (octet.every((e) => parseInt(e) <= OCTET_MAX)) {
          result.push(octet.join('.'));
        }
      }
    }
  }

  return JSON.stringify(result);
}
