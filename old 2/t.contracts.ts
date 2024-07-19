import { NS } from "@ns";

function scan(ns: NS, parent: string, server: string, list: string[]) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        list.push(child);
        
        scan(ns, server, child, list);
    }
}

export function list_servers(ns: NS) {
    const list: string[] = [];
    scan(ns, '', 'home', list);
    return list;
}

export async function main(ns: NS): Promise<void> {
   
    
    const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script helps you find an unsolved coding contract.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    let servers = list_servers(ns);
    const boughtServers = ns.getPurchasedServers();
    servers = servers.filter(s => !boughtServers.includes(s));
    const hostnames = servers.filter(s => ns.ls(s).find(f => f.endsWith(".cct")))
    if(!hostnames.length) {
        ns.tprint("No coding contract found.");
        return;
    }

    ns.tprint(`Found coding contract on \n- ${hostnames.join('\n- ')}'.`)

}
