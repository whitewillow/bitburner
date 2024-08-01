import { FilenameOrPID, RunOptions, ScriptArg } from '@ns';
import XServer from './class.xserver';

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

export interface ControllerScript {
  id: string;
  script: string;
  name: string;
  threadOrOptions?: number | RunOptions | undefined;
  args?: ScriptArg[];
  minRam?: number;
  state: 'RUNNING' | 'PAUSED' | 'WAITING_FOR_RAM' | 'START';
  pid?: FilenameOrPID;
}

export interface ControllerTargets {
  servers: XServer[];
  attacking: string[];
  prepping: string[];
  ignore: string[];
}

export interface ControllerContracts {
  solved: string[];
  failed: string[];
  total: string[];
}

export interface ControllerHacknet {
  nodes: number;
}

export type EventType = 'STATE' | 'GLOBAL_STATE' | 'CONTROLLER_STATE' | 'SETTING_SCRIPTS';
