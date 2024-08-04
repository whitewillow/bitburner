/**
 * Find Largest Prime Factor
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * A prime factor is a factor that is a prime number. What is the largest prime factor of 800868646?
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */
export function findLargestPrimeFactor(inputNumber: number): number {
  let factor = 2;
  while (factor < inputNumber) {
    if (inputNumber % factor === 0) {
      inputNumber /= factor;
    } else {
      factor++;
    }
  }
  return inputNumber;
}
