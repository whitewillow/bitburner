import XServer from "./class.xserver";

export interface ThreadSequence {
    hackThreads: number;
    hackAmount: number;
    weaken1Threads: number;
    growThreads: number;
    weaken2Threads: number;
    totalThreads: number;
  }
  
  export interface PrepThreadSequence {
    weaken1Threads: number;
    growThreads: number;
    weaken2Threads: number;
    totalThreads: number;
  }
  
  export interface ProtoBatchCommands {
    command: string;
    ramOverride: number;
    threads: number;
    info: string;
    delay: number;
  }
  
  export interface ThreatAssesment {
    target: XServer;
    hackChance: number;
    moneyAvailable: number;
    moneyMax: number;
    minSecurityLevel: number;
    moneyString: string;
    moneyPercentAvailable: number;
    moneyPerSecond: number;
    hackTime: number;
    hackThread: number;
    growTime: number;
    growThread: number;
    weakenTime: number;
    weakenThread: number;
    isPrepped?: boolean;
  }