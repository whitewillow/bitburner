/**
 * Encryption I: Caesar Cipher
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * Caesar cipher is one of the simplest encryption technique. It is a type of substitution cipher in which each letter in the plaintext is replaced by a letter some fixed number of positions down the alphabet. For example, with a left shift of 3, D would be replaced by A, E would become B, and A would become X (because of rotation).
 *
 * You are given an array with two elements:
 *   ["MEDIA LOGIC ARRAY PRINT TRASH", 14]
 *
 *   Result: YQPUM XASUO MDDMK BDUZF FDMET
 * The first element is the plaintext, the second element is the left shift value.
 *
 * Return the ciphertext as uppercase string. Spaces remains the same.
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */
export function encryption1CaesarCipher(inputArray: [string, number]): string {
  const [plaintext, shift] = inputArray;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  function getCipher(char: string, shift: number): string {
    const index = alphabet.indexOf(char.toUpperCase());
    const newIndex = index - shift;
    if (newIndex < 0) {
      return alphabet[alphabet.length + newIndex];
    }
    return alphabet[newIndex];
  }

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    if (char === ' ') {
      result += ' ';
      continue;
    }

    result += getCipher(char, shift);
  }
  return result;
}

/**
 * Encryption II: Vigenère Cipher
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * Vigenère cipher is a type of polyalphabetic substitution. It uses the Vigenère square to encrypt and decrypt plaintext with a keyword.
 *
 *   Vigenère square:
 *          A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
 *        +----------------------------------------------------
 *      A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
 *      B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
 *      C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
 *      D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
 *      E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D
 *                 ...
 *      Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X
 *      Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y
 *
 * ["DASHBOARD", "LINUXLINU"]
 * For encryption each letter of the plaintext is paired with the corresponding letter of a repeating keyword. For example, the plaintext DASHBOARD is encrypted with the keyword LINUX:
 *    Plaintext: DASHBOARD
 *    Keyword:   LINUXLINU
 * So, the first letter D is paired with the first letter of the key L. Therefore, row D and column L of the Vigenère square are used to get the first cipher letter O. This must be repeated for the whole ciphertext.
 *
 * You are given an array with two elements:
 *        ["DEBUGFLASHLOGICTRASHQUEUE", "EXABYTE"] = HBBVEYPEPHMMZMGQRBQAUYBUF
 *
 * The first element is the plaintext, the second element is the keyword.
 *
 * Return the ciphertext as uppercase string.
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 * @param input
 */
export function encryption2VigenereCipher(inputArray: [string, string]): string {
  const [plaintext, keyword] = inputArray;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  function getCipher(char: string, keywordChar: string): string {
    const rowIndex = alphabet.indexOf(char.toUpperCase());
    const columnIndex = alphabet.indexOf(keywordChar.toUpperCase());
    const newIndex = rowIndex + columnIndex;
    if (newIndex >= alphabet.length) {
      return alphabet[newIndex - alphabet.length];
    }
    return alphabet[newIndex];
  }

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const keywordChar = keyword[i % keyword.length];
    if (char === ' ') {
      result += ' ';
      continue;
    }

    result += getCipher(char, keywordChar);
  }
  return result;
}
