

import { NS, Server } from "@ns";

const reservedHomeRam = 8;

export default class XServer {

  ns: NS;
  id: string;
  parent: string;
  server: Server;
  hackChance: number;

  constructor(_ns: NS, id: string, parent = '') {
    this.ns = _ns;
    this.id = id;
    this.parent = parent
    this.server = this.ns.getServer(id);
    this.hackChance = Math.floor(this.ns.hackAnalyzeChance(this.id) * 100);
  }

  get ram() {
    return {
      used: this.server.ramUsed,
      max: this.server.maxRam - (this.server.hostname === "home" ? reservedHomeRam : 0),
      free: Math.max(0, this.server.maxRam - this.server.ramUsed - (this.server.hostname === "home" ? reservedHomeRam : 0)),
      trueMax: this.server.maxRam
    }
  }

  threadCount(scriptRam: number) {
    let threads = 0;
    threads = this.ram.free / scriptRam
    return Math.floor(threads)
  }
}
