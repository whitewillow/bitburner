
const reservedHomeRam = 8;

export default class XServer {

  /** @param {NS} ns */
  constructor(ns, id, parent = '') {
    this.ns = ns;
    this._id = id;
    this.parent = parent
    this.server = ns.getServer(id);
    this.hackChance = Math.floor(this.ns.hackAnalyzeChance(this._id) * 100);
  }
  get id() { return this._id };

  get ram() {
    return {
      used: this.server.ramUsed,
      max: this.server.maxRam - (this.server.hostname === "home" ? reservedHomeRam : 0),
      free: Math.max(0, this.server.maxRam - this.server.ramUsed - (this.server.hostname === "home" ? reservedHomeRam : 0)),
      trueMax: this.server.maxRam
    }
  }

  threadCount(scriptRam) {
    let threads = 0;
    threads = this.ram.free / scriptRam
    return Math.floor(threads)
  }
}
