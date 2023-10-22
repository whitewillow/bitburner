import { NS } from "@ns";

function recursiveScan(ns: NS, parent: string, server: string, target: string, route: string[]) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        if (child == target) {
            route.unshift(child);
            route.unshift(server);
            return true;
        }

        if (recursiveScan(ns, server, child, target, route)) {
            route.unshift(server);
            return true;
        }
    }
    return false;
}

export async function main(ns: NS): Promise<void> {
    const args = ns.flags([["help", false]]);
    let route: string[] = [];
    const server: string = ns.args[0]?.toString();
    if (!server || args.help) {
        ns.tprint("This script helps you find a server on the network and shows you the path to get to it.");
        ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles`);
        return;
    }
    recursiveScan(ns, '', 'home', server, route);
    ns.tprint("connect ", route.join("; connect "), "; backdoor")
}

// export function autocomplete(data, args) {
//     return data.servers;
// }