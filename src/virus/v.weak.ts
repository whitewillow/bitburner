import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
	const target: string = ns.args[0].toString();
	const repeat: boolean = !!ns.args[1];
	do {
		await ns.weaken(target)
	} while (repeat)
}
