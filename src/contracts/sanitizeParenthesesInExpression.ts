/**
 *
 * Sanitize Parentheses in Expression
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * Given the following string:
 *
 * (a)))(a((a(aa()(
 *
 * remove the minimum number of invalid parentheses in order to validate the string.
 * If there are multiple minimal ways to validate the string, provide all of the possible results.
 * The answer should be provided as an array of strings.
 * If it is impossible to validate the string the result should be an array with only an empty string.
 *
 * IMPORTANT: The string may contain letters, not just parentheses. Examples:
 * "()())()" -> ["()()()", "(())()"]
 * "(a)())()" -> ["(a)()()", "(a())()"]
 * ")(" -> [""]
 * 
 * (a)))(a((a(aa()( -> ["(a)aaaa()", "(a)))(a((a(aa()"]
 
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */
export function sanitizeParenthesesInExpression(inputString: string): string[] {
  function generateVariants(str: string, char: string) {
    const variants = new Set<string>();
    const matchStr = new RegExp(`\\${char}`, `g`);
    const matches = [...str.matchAll(matchStr)];
    for (let match of matches) {
      variants.add(`${str.slice(0, match.index)}${str.slice((match.index as number) + 1)}`);
    }
    return variants;
  }

  const input = inputString.replace(/^\)+/, ``).replace(/\(+$/, ``);

  // Fix Closes
  let opens = 0;
  const heads = [];

  const firstChar = input.charAt(0);
  if (firstChar === '(') opens++;
  heads.push(firstChar);

  for (let i = 1; i < input.length; i++) {
    const char = input.charAt(i);

    if (char === `)` && opens <= 0) {
      const newHeads = new Set<string>();
      for (let head of heads) {
        generateVariants(`${head}${char}`, char).forEach((v) => newHeads.add(v));
      }
      heads.splice(0, heads.length, ...newHeads);
      continue;
    }

    if (char === `)`) opens--;
    if (char === `(`) opens++;

    heads.splice(0, heads.length, ...heads.map((h) => `${h}${char}`));
  }

  const answers = [];

  // Fix Opens
  for (let head of heads) {
    let closes = 0;
    const tails = [];

    const lastChar = head.charAt(head.length - 1);
    if (lastChar === ')') closes++;
    tails.push(lastChar);

    for (let i = head.length - 2; i >= 0; i--) {
      const char = head.charAt(i);

      if (char === `(` && closes <= 0) {
        const newTails = new Set<string>();
        for (let tail of tails) {
          generateVariants(`${char}${tail}`, char).forEach((v) => newTails.add(v));
        }
        tails.splice(0, tails.length, ...newTails);
        continue;
      }

      if (char === `(`) closes--;
      if (char === `)`) closes++;

      tails.splice(0, tails.length, ...tails.map((t) => `${char}${t}`));
    }

    answers.push(...tails);
  }

  return answers;
}
