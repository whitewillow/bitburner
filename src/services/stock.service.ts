import { NS } from '@ns';

export interface Stock {
  sympol: string;
  longShares: number;
  longPrice: number;
  shortShares: number;
  shortPrice: number;
  forecast: number;
  valatility: number;
  askPrice: number;
  bidPrice: number;
  maxShares: number;
  profit: number;
  profitPotential: number;
  cost: number;
}

/**
 * Auto - Stock
 * Should be run in background when having enough memory
 * @param ns
 */
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.printRaw('Starting Stock trader');
  ns.tail();

  const COMMISION_FEES = 100000;
  const TRADING_FEES = 2 * COMMISION_FEES;
  const WAIT_TIME = 5 * 1000; // ~4s offline, ~6s online - (5s compromise)
  const LONG_BUY_THRESHOLD = 0.55;

  let overallProfit = 0;

  function getStocks(ns: NS): Stock[] {
    const stockSymobs = ns.stock.getSymbols();
    const stocks: Stock[] = [];
    for (const sympol of stockSymobs) {
      const position = ns.stock.getPosition(sympol);
      const stock: Partial<Stock> = {
        sympol,
        longShares: position[0],
        longPrice: position[1],
        shortShares: position[2],
        shortPrice: position[3],
        forecast: ns.stock.getForecast(sympol),
        valatility: ns.stock.getVolatility(sympol),
        askPrice: ns.stock.getAskPrice(sympol),
        bidPrice: ns.stock.getBidPrice(sympol),
        maxShares: ns.stock.getMaxShares(sympol),
      };
      const longProfit = stock.longShares! * (stock.bidPrice! - stock.longPrice!) - TRADING_FEES;
      const shortProfit = stock.shortShares! * (stock.shortPrice! - stock.askPrice!) - TRADING_FEES;
      stock.profit = longProfit + shortProfit;

      const longCost = stock.longShares! * stock.longPrice!;
      const shortCost = stock.shortShares! * stock.shortPrice!;
      stock.cost = longCost + shortCost;

      // 0.6 -> 0.1 (10% - LONG)
      // 0.4 -> 0.1 (10% - SHORT)
      const profitChance = Math.abs(stock.forecast! - 0.5);
      stock.profitPotential = stock.valatility! * profitChance;

      stocks.push(stock as Stock);
    }

    return stocks.sort((a, b) => b.profitPotential - a.profitPotential);
  }

  function tradeLong(stock: Stock) {
    if (stock.forecast > 0.5) {
      // HOLD
      const curVal = stock.cost + stock.profit;
      const returnOfInvestment = 100 * (stock.profit / stock.cost);
      overallProfit += curVal;
      ns.printRaw(`Holding ${stock.sympol} for ${returnOfInvestment}%`);
      return;
    }

    // SELL
    const salePrice = ns.stock.sellStock(stock.sympol, stock.longShares);
    const saleTotal = salePrice * stock.longShares;
    const saleCost = stock.longPrice * stock.longShares;
    const saleProfit = saleTotal - saleCost - TRADING_FEES;
    stock.longShares = 0;
    ns.printRaw(`Sold ${stock.sympol} for ${saleProfit}`);
  }

  function tradeStocks(stocks: Stock[]) {
    stocks.forEach((stock) => {
      if (stock.longShares) {
        tradeLong(stock);
      }
      //TODO: Implement short trade BN8
    });
  }

  function buyStocks(stocks: Stock[], maxMoneyToSpend: number = 0) {
    let moneySpent = 0;
    if (maxMoneyToSpend === 0) {
      maxMoneyToSpend = ns.getPlayer().money * 0.2;
    }
    stocks.forEach((stock) => {
      if (stock.forecast > LONG_BUY_THRESHOLD) {
        if (moneySpent >= maxMoneyToSpend) {
          ns.printRaw(`Not enough money to buy ${stock.sympol}`);
          return;
        }
        const moneyLeft = maxMoneyToSpend - moneySpent;
        const sharesCanBuy = Math.floor((moneyLeft - COMMISION_FEES) / stock.askPrice);
        const sharesToBuy = Math.min(stock.maxShares, sharesCanBuy);
        const pricePerShare = ns.stock.buyStock(stock.sympol, sharesToBuy);
        moneySpent += sharesToBuy * pricePerShare;
        if (pricePerShare) {
          ns.printRaw(`Bought ${sharesToBuy} shares of ${stock.sympol} for ${stock.askPrice}`);
        }
      }

      // TODO: Implement short buy BN8
    });
  }

  while (true) {
    // TODO: Pretty print
    // TODO: only invest 20% of money
    const money = ns.getPlayer().money;
    const maxMoneyToSpend = money * 0.1; // only invest 10% of money
    const stocks = getStocks(ns);
    ns.printRaw(`Found stocks ${stocks.length}`);
    ns.printRaw(`MoneyToSpend ${ns.formatNumber(maxMoneyToSpend)}`);
    tradeStocks(stocks);
    buyStocks(stocks, maxMoneyToSpend);
    ns.printRaw(`Overall Profit: ${overallProfit}`);
    ns.printRaw('-------------------');
    overallProfit = 0;
    await ns.sleep(WAIT_TIME);
  }
}
