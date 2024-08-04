/**
 * Algorithmic Stock Trader I
 * You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
 *
 * [115,32,65,76,118,121,9,157,67,19,12,180,65,139,131,192,160,11,114,32,59,5]
 *
 * Determine the maximum possible profit you can earn using at most one transaction (i.e. you can only buy and sell the stock once).
 * If no profit can be made then the answer should be 0. Note that you have to buy the stock before you can sell it.
 *
 *
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */
export function algorithmicStockTraderI(inputNumberArray: number[]): number {
  let maxProfit = 0;
  let minPrice = inputNumberArray[0];
  for (let i = 1; i < inputNumberArray.length; i++) {
    const price = inputNumberArray[i];
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  return maxProfit;
}

/**
 * Algorithmic Stock Trader II
 * You are attempting to solve a Coding Contract. You have 9 tries remaining, after which the contract will self-destruct.
 *
 *
 * You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
 *
 * 69,97,51,191,31,33,74,111,145,75,192,119,82,24
 *
 * Determine the maximum possible profit you can earn using as many transactions as you'd like.
 * A transaction is defined as buying and then selling one share of the stock.
 * Note that you cannot engage in multiple transactions at once.
 * In other words, you must sell the stock before you buy it again.
 *
 * If no profit can be made, then the answer should be 0
 *
 * -------------
 * 97 - 69    = 28
 * 51 - 97    = -46
 * 191 - 51   = 140
 * 31 - 191   = -160
 * 33 - 31    = 2
 * 74 - 33    = 41
 * 111 - 74   = 37
 * 145 - 111  = 34
 * 75 - 145   = -70
 * 192 - 75   = 117
 * 119 - 192  = -73
 * 82 - 119   = -37
 * 24 - 82    = -58
 *
 * diff>0 = 28 + 140 + 2 + 41 + 37 + 34 + 117 = 399
 *
 * RESULT: 399
 *
 */
export function algorithmicStockTraderII(stockPricesArray: number[]): number {
  let maxProfit = 0;
  for (let i = 0; i < stockPricesArray.length - 1; i++) {
    const diff = stockPricesArray[i + 1] - stockPricesArray[i];
    if (diff > 0) {
      maxProfit += diff;
    }
  }
  return maxProfit;
}
