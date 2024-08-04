import { NS, ProcessInfo, ScriptArg } from '@ns';
import XServer from 'lib/class.xserver';
import { PrintTable, printLogHeader } from 'lib/lib.print';
import { getBotServers, getTargetServers } from 'lib/lib.server';
import { ControllerContracts, ControllerHacknet, ControllerScript, ControllerTargets, PrintRows } from 'lib/types';
import { getStateIgnoreTargets } from 'state/state.controller-ignore';
import { getStateCurrentlyPrepping } from 'state/state.prep';
import { getThemeColor } from './lib/lib.dom';
import { getStateCurrentlyAttacking } from './state/state.attack';
import { getStateControllerScripts, updateStateControllerScript } from './state/state.controller-scripts';

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
  let controllerContracts: string[] = [];
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

    controllerScripts = [];
    controllerStateBots = getBotServers(ns);

    hacknet.nodes = ns.hacknet.numNodes();
    controllerContracts = findContracts();
  }

  function printRunningScripts() {
    const rows: PrintRows[] = controllerScripts.map((script) => ({
      color: script.state === 'RUNNING' ? getThemeColor(ns, 'success') : getThemeColor(ns, 'error'),
      columns: [
        {
          value: script.name,
        },
      ],
    }));

    PrintTable(ns, null, rows, { fancy: true, noRowHeader: true });
  }

  function printPrepBatchTargets() {
    const rows: PrintRows[] = [
      {
        color:
          controllerStateTargets.attacking.length >= 0 ? getThemeColor(ns, 'success') : getThemeColor(ns, 'warning'),
        columns: [
          {
            value: 'Attacking',
          },
          {
            value: `${controllerStateTargets.attacking.length}`,
          },
        ],
      },
      {
        color:
          controllerStateTargets.prepping.length >= 0 ? getThemeColor(ns, 'success') : getThemeColor(ns, 'warning'),
        columns: [
          {
            value: 'Prepping',
          },
          {
            value: `${controllerStateTargets.prepping.length}`,
          },
        ],
      },
      {
        color: controllerStateTargets.ignore.length >= 0 ? getThemeColor(ns, 'info') : getThemeColor(ns, 'secondary'),
        columns: [
          {
            value: 'Ignoring',
          },
          {
            value: `${controllerStateTargets.ignore.length}`,
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
        color: controllerStateBots.length >= 25 ? getThemeColor(ns, 'success') : getThemeColor(ns, 'info'),
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
        color: controllerContracts.length > 0 ? getThemeColor(ns, 'infolight') : getThemeColor(ns, 'secondary'),
        columns: [
          {
            value: `Contracts`,
          },
          {
            value: `${controllerContracts.length}`,
          },
        ],
      },
    ];
    PrintTable(ns, null, rows, { fancy: true, noRowHeader: true });
  }

  function printStatus() {
    ns.clearLog();
    printLogHeader(ns, 'Scripts');
    printRunningScripts();
    printLogHeader(ns, 'Proto');
    printPrepBatchTargets();
    printLogHeader(ns, 'Other');
    printOther();
  }

  function findContracts() {
    return controllerStateTargets.servers.map((server) => ns.ls(server.id).filter((f) => f.endsWith('.cct'))).flat();
  }

  function findRunningServices(): ProcessInfo[] {
    return ns.ps('home').filter((f) => f.filename.startsWith('services/'));
  }
  function findRunningFixedPrepsBatch(): ProcessInfo[] {
    return ns.ps('home').filter((f) => f.filename.startsWith('fixed-prep-batch'));
  }

  /**
   * Starts or stops scripts based on their expected state
   */
  function checkScriptRunningStatus(script: ControllerScript, expectedToBeRunning: boolean) {
    const runningScript = ns.getRunningScript(script.script, 'home', ...(script.args ?? []));

    if (runningScript && !expectedToBeRunning) {
      const success = ns.kill(runningScript?.pid ?? 0);
      const newState = success ? 'PAUSED' : 'RUNNING';
      script.state = newState;

      updateStateControllerScript(ns, script.id, script);
    }
    if (!runningScript && expectedToBeRunning) {
      const pid = ns.run(script.script, script.threadOrOptions, ...(script.args ?? []));
      script.pid = pid;
      script.state = 'RUNNING';
      updateStateControllerScript(ns, script.id, script);
    }
  }

  /**
   * Starts or stops scripts based on their expected state
   */
  function initializeScripts() {
    const initializeScriptsToRun = getStateControllerScripts(ns);
    initializeScriptsToRun.forEach((script) => {
      checkScriptRunningStatus(script, ['RUNNING', 'START', 'SYSTEM'].includes(script.state));
    });
  }

  function toPascalCase(str: string) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  function formatFileName(filename: string, args?: ScriptArg[]) {
    const fileName = toPascalCase(
      filename.replace('services/', '').replace('.js', '').replace('.', ' ').replace('-', ' '),
    );
    if (!args) {
      return fileName;
    }
    const argsString = args.map((a) => a).join(' ');
    return `${fileName} ${argsString}`;
  }

  function getActualRunningScripts() {
    const expectedScripts = getStateControllerScripts(ns).filter((f) => f.warnIfNotRunning);
    controllerScripts = [...findRunningServices(), ...findRunningFixedPrepsBatch()].map((runningScript) => ({
      id: runningScript.pid.toString(),
      script: runningScript.filename,
      args: runningScript.args,
      name: formatFileName(runningScript.filename, runningScript.args),
      state: 'RUNNING',
      pid: runningScript.pid,
    }));

    expectedScripts.forEach((script) => {
      const runningScript = controllerScripts.find((f) => f.script === script.script);
      if (!runningScript) {
        controllerScripts.push({
          id: script.id,
          script: script.script,
          name: formatFileName(script.script),
          state: 'PAUSED',
        });
      }
    });
  }

  /**
   * Initializes the script with one time calls
   */
  function initialize() {
    updateStates();
    initializeScripts();
  }

  initialize();

  while (true) {
    await ns.sleep(1000);
    updateStates();
    getActualRunningScripts();
    printStatus();
    i++;
  }
}
