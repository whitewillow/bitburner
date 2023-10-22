import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const flags = ns.flags([
    ['refreshrate', 200],
    ['help', false],
])
if (flags.help) {
    ns.tprint("This script helps visualize the money and security of a server.");
    ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} n00dles`)
    return;
}
ns.tail();
ns.disableLog('ALL');
while (true) {
    const server: string = ns.args[0]?.toString();
    let money = ns.getServerMoneyAvailable(server);
    if (money === 0) money = 1;
    const maxMoney = ns.getServerMaxMoney(server);
    const minSec = ns.getServerMinSecurityLevel(server);
    const sec = ns.getServerSecurityLevel(server);
    ns.clearLog();
    ns.print(`${server}:`);
    ns.print(` $_______: ${ns.formatNumber(money)} / ${ns.formatNumber(maxMoney)} (${(money / maxMoney * 100).toFixed(2)}%)`);
    ns.print(` security: +${(sec - minSec).toFixed(2)}`);
    ns.print(` hack____: ${ns.tFormat(ns.getHackTime(server))} (t=${Math.ceil(ns.hackAnalyzeThreads(server, money))})`);
    ns.print(` grow____: ${ns.tFormat(ns.getGrowTime(server))} (t=${Math.ceil(ns.growthAnalyze(server, maxMoney / money))})`);
    ns.print(` weaken__: ${ns.tFormat(ns.getWeakenTime(server))} (t=${Math.ceil((sec - minSec) * 20)})`);
    ns.print(`mx gr: ${Math.ceil(ns.growthAnalyze(server,2))}`);
    ns.print(`mn gr: ${Math.ceil(ns.growthAnalyze(server,1))}`);
    await ns.sleep(Number(flags.refreshrate ?? 200));
}
}

// export function autocomplete(data, args) {
//   return data.servers;
// }
