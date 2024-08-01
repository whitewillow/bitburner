import { NS } from '@ns';
import XServer from 'lib/class.xserver';
import { PrintTable } from 'lib/lib.printcheap';
import { getBotServers, getTargetServers } from 'lib/lib.server';
import { ControllerContracts, ControllerHacknet, ControllerScript, ControllerTargets } from 'lib/types';
import { getStateIgnoreTargets } from 'state/state.controller-ignore';
import { getStateCurrentlyPrepping } from 'state/state.prep';
import { PrintRows } from './lib/lib.printcheap';
import { getStateCurrentlyAttacking } from './state/state.attack';
import {
  changeStateControllerScriptState,
  getStateControllerScripts,
  updateStateControllerScript,
} from './state/state.controller-scripts';
import { getEvent } from './lib/lib.port';
import { range } from './lib/utils';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.clearLog();
  ns.tail();
  let i = 0;
  const controllerStateTargets: ControllerTargets = {
    servers: [],
    attacking: [],
    prepping: [],
    ignore: [],
  };
  let controllerScripts: ControllerScript[] = [];
  const controllerContracts: ControllerContracts = {
    total: [],
    failed: [],
    solved: [],
  };
  let controllerStateBots: XServer[] = [];

  const hacknet: ControllerHacknet = {
    nodes: 0,
  };

  /**
   * Get controller state
   */
  function updateStates() {
    controllerStateTargets.attacking = getStateCurrentlyAttacking(ns);
    controllerStateTargets.prepping = getStateCurrentlyPrepping(ns);
    controllerStateTargets.servers = getTargetServers(ns);
    controllerStateTargets.ignore = getStateIgnoreTargets(ns);

    controllerScripts = getStateControllerScripts(ns);
    controllerStateBots = getBotServers(ns);

    hacknet.nodes = ns.hacknet.numNodes();
    // range(hacknet.nodes).forEach((node) => {
    //   const hacknetNode = ns.hacknet.getNodeStats(node);
    //   if (hacknetNode.production) {
    //     hacknet.nodes++;
    //   }
    // }
  }

  function printRunningScripts() {
    const rows: PrintRows[] = controllerScripts.map((script) => ({
      columns: [
        {
          value: script.name,
        },
        {
          value: script.state,
        },
      ],
    }));

    PrintTable(ns, null, rows, { fancy: true, noRowHeader: true });
  }

  function printPrepBatchTargets() {
    const rows: PrintRows[] = [
      {
        columns: [
          {
            value: 'Attacking',
          },
          {
            value: `${controllerStateTargets.attacking.length} - ${controllerStateTargets.attacking.join(', ')}`,
          },
        ],
      },
      {
        columns: [
          {
            value: 'Prepping',
          },
          {
            value: `${controllerStateTargets.prepping.length} - ${controllerStateTargets.prepping.join(', ')}`,
          },
        ],
      },
    ];
    PrintTable(ns, null, rows, { fancy: true, noRowHeader: true });
  }

  function printOther() {
    const botsMinRam = Math.min(...controllerStateBots.map((bot) => bot.ram.max));
    const botsMaxRam = Math.max(...controllerStateBots.map((bot) => bot.ram.max));
    const rows: PrintRows[] = [
      {
        columns: [
          {
            value: `Bots`,
          },
          {
            value: `${controllerStateBots.length} (${ns.formatRam(botsMinRam)} - ${ns.formatRam(botsMaxRam)})`,
          },
        ],
      },
      {
        columns: [
          {
            value: `Hacknet`,
          },
          {
            value: `${hacknet.nodes}`,
          },
        ],
      },
      {
        columns: [
          {
            value: `Contracts`,
          },
          {
            value: `${controllerContracts.solved.length} / ${controllerContracts.total.length}`,
          },
        ],
      },
    ];
    PrintTable(ns, null, rows, { fancy: true, noRowHeader: true });
  }

  function printStatus() {
    ns.clearLog();
    ns.printRaw('Controller 0.1');
    ns.printRaw('_____________________________');
    printRunningScripts();
    ns.printRaw('_____________________________');
    printPrepBatchTargets();
    ns.printRaw('_____________________________');
    printOther();
  }

  /**
   * Starts or stops scripts based on their expected state
   */
  function checkScriptRunningStatus(script: ControllerScript, expectedToBeRunning: boolean) {
    const running = ns.isRunning(script.script, 'home', ...(script.args ?? []));

    console.log('running', running, script.name, expectedToBeRunning);
    if (running && !expectedToBeRunning) {
      const success = ns.kill(Number(script.pid));
      const newState = success ? 'PAUSED' : 'RUNNING';
      script.state = newState;
      updateStateControllerScript(ns, script.id, script);
    }
    if (!running && expectedToBeRunning) {
      const pid = ns.run(script.script, script.threadOrOptions, ...(script.args ?? []));
      script.pid = pid;
      script.state = 'RUNNING';
      updateStateControllerScript(ns, script.id, script);
    }
  }

  /**
   * Starts or stops scripts based on their expected state
   */
  function checkAllScripts() {
    controllerScripts.forEach((script) => {
      checkScriptRunningStatus(script, ['RUNNING', 'START'].includes(script.state));
    });
  }

  /**
   * Initializes the script with one time calls
   */
  function initialize() {
    updateStates();
    checkAllScripts();
  }

  initialize();

  while (true) {
    await ns.sleep(1000);

    updateStates();

    const scriptsChanged = getEvent(ns, 'SETTING_SCRIPTS');
    if (scriptsChanged) {
      checkAllScripts();
    }

    printStatus();
    i++;
  }
}
