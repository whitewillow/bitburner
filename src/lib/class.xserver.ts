import { NS, Server } from '@ns';

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
    this.parent = parent;
    this.server = this.ns.getServer(id);
    this.hackChance = Math.floor(this.ns.hackAnalyzeChance(this.id) * 100);
  }

  /**
   * Returns true if the server is maxed out on money
   * aka - growth is maxed
   */
  get isMoneyAvailableMaxed() {
    if (!this.server.moneyAvailable || !this.server.moneyMax) return false;
    return this.server.moneyAvailable === this.server.moneyMax;
  }

  get moneyAvailablePercent() {
    return ((this.server.moneyAvailable ?? 0) / (this.server.moneyMax ?? 0)) * 100;
  }

  /**
   * Simple weight of a server - Money per second
   * Use formula.exe for more precise calculations
   */
  get moneyPerSecond(): number {
    return (this.server.moneyMax ?? 0) / (this.server.minDifficulty ?? 0);
  }

  /**
   * Returns true if the server is weakened to the max
   * aka - security is weakened to the absolute minimum
   */
  get isServerWeakendToMinimum() {
    if (!this.server.minDifficulty || !this.server.hackDifficulty) return false;
    return this.server.minDifficulty === this.server.hackDifficulty;
  }

  get ram() {
    return {
      used: this.server.ramUsed,
      max: this.server.maxRam - (this.server.hostname === 'home' ? reservedHomeRam : 0),
      free: Math.max(
        0,
        this.server.maxRam - this.server.ramUsed - (this.server.hostname === 'home' ? reservedHomeRam : 0),
      ),
      trueMax: this.server.maxRam,
    };
  }

  threadCount(scriptRam: number) {
    let threads = 0;
    threads = this.ram.free / scriptRam;
    return Math.floor(threads);
  }
}
