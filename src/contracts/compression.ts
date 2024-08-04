/**
 * Compression III: LZ Compression
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 *
 *
 * Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:
 *
 * 1. Exactly L characters, which are to be copied directly into the uncompressed data.
 * 2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the character X places before it in the uncompressed data.
 *
 * For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final chunk may be of either type.
 *
 * You are given the following input string:
 *     m553B6l6l5wGvAwGvAwGvAE8GvAwGvdFPLALALALALLLLLLLLLLLLNLLLLLNLLNLLNLL7fZCtbNL6Jm7HHjd1D6L61T
 * Encode it using Lempel-Ziv encoding with the minimum possible output length.
 *
 * Examples (some have other possible encodings of minimal length):
 *     abracadabra     ->  7abracad47
 *     mississippi     ->  4miss433ppi
 *     aAAaAAaAaAA     ->  3aAA53035
 *     2718281828      ->  627182844
 *     abcdefghijk     ->  9abcdefghi02jk
 *     aaaaaaaaaaaa    ->  3aaa91
 *     aaaaaaaaaaaaa   ->  1a91031
 *     aaaaaaaaaaaaaa  ->  1a91041
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */
export function compressionIIILZCompression(inputString: string) {
  const text = inputString;
  const bst_fw = Array(text.length);
  const len_fw = Array(text.length).fill(Infinity);

  const bst_bw = Array(text.length);
  const off_bw = Array(text.length);
  const len_bw = Array(text.length).fill(Infinity);

  // set up initial forward
  for (let i = 0; i !== Math.min(9, text.length); ++i) {
    bst_fw[i] = i + 1;
    len_fw[i] = i + 2;
  }

  for (let i = 1; i !== text.length; ++i) {
    // handle 0 length lookback
    if (len_fw[i - 1] + 1 < len_bw[i - 1]) {
      bst_bw[i - 1] = 0;
      len_bw[i - 1] = len_fw[i - 1] + 1;
    }
    // handle 0 length forward
    if (len_bw[i - 1] + 1 < len_fw[i - 1]) {
      bst_fw[i - 1] = 0;
      len_fw[i - 1] = len_bw[i - 1] + 1;
    }
    // handle nonzero lookbacks
    for (let length = 1; length !== Math.min(9, text.length - i) + 1; ++length) {
      const slice = text.slice(i, i + length);
      for (let offset = 1; offset !== Math.min(9, i) + 1; ++offset) {
        const offset_slice = text.slice(i - offset, i + length - offset);
        if (slice === offset_slice && len_fw[i - 1] + 2 < len_bw[i - 1 + length]) {
          bst_bw[i - 1 + length] = length;
          len_bw[i - 1 + length] = len_fw[i - 1] + 2;
          off_bw[i - 1 + length] = offset;
        }
      }
    }
    // handle nonzero forward
    for (let j = 0; j !== Math.min(9, text.length - i); ++j) {
      if (len_bw[i - 1] + j + 2 < len_fw[i + j]) {
        bst_fw[i + j] = j + 1;
        len_fw[i + j] = len_bw[i - 1] + j + 2;
      }
    }
  }

  // reconstruct compressed
  let i = text.length - 1;
  let forward = len_fw[i] < len_bw[i];
  let compressed = '';
  while (i !== -1) {
    if (forward) {
      compressed = `${bst_fw[i]}${text.slice(i + 1 - bst_fw[i], i + 1)}` + compressed;
      i -= bst_fw[i];
    } else {
      compressed = `${bst_bw[i]}${bst_bw[i] === 0 ? '' : off_bw[i]}` + compressed;
      i -= bst_bw[i];
    }
    forward = !forward;
  }

  return compressed;
}
