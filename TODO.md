# TODO - 29 Juli 2024


# Naming


/lib
- lib.server.ts
- etc

/services:
- queue.service.ts                // port queue servier
- bot-maintainer.service.ts       // maintains bots
- hnet-maintainer.service.ts      // maintains hnets
- penetrator.service.ts           // auto hacks target servers
- contract.service.ts             // auto solves contracts
- proto.service.ts                // Auto fleet manager (x.auto)

/utils
- number-utils.ts

/*
- controller.ts                    // starts all scripts for fully automation
- fixed-prep-batch.ts              // preps and hwgw single target using current server (home)
- prep.ts                          // preps single target using current server (home)
- prep-controller.ts               // wgw using all bots/targets/home {target, botstart, botend}
- batch.ts                         // hwgw single target using current server (home)
- batch-controller.ts              // hwgw using all bots/targets/home {target, botstart, botend}
- remote-worker.ts                 // should be deployed, will either H,W or G

- find.ts                          // find server or files
- route.ts                         // gives route to target host
- kill-all.ts                      // kill all apps
- bot-info.ts                      // shows Bots info             
- contract-info.ts                 // shows contract info and locations
- target-info.ts                   // shows Targes info in a tree 



## Optimize/Refak

- Thread sequencer. could be better
- prep auth delay before next bot. - maybe fixed amount of batches?
- bot maintainer better logs
- penetrator should log/toast/port amount hacked

## Play with Stocks

## Contracts

## Able to stop batch running



## WORKERS ????
instead of remote-worker, make worker
listens for new commands from controller, instead of controller just starting work



## Controller

Should auto start scripts and show status

run auto nuker
run fixed hack on n00dles
run fixed hack on foodnstuff
run botnet maintainer
run auto hacker (ignore n00dles & foodnstuff)

Looks in state for what scripts to pause 

### Controller selector

Toggle scripts
 #1 Auto Penetrator     Running
 #2 Botnet Maintainer   Paused
 #3 HNet Maintainer     Paused
 #4 Contractor Solver   Running  
 Toggle App Number > 4;


### States


```js
// Auto attack states

currentlyAttacking: string[];
currentlyPrepping: string[];
ignoreTargets: string[];

contracts: {solved:string[], failed: string[], total: string[]};
bots: {bots:XServer[]};
```

### VIEW:

Controller 0.1
_____________________________

✓    Penetrator
✓    Fixed Hacker n00dles
✓    Fixed Hacker foodnstuff
✓    Auto Batcher
-    Bot Maintainer (paused)
-    HNet Maintainer (paused)
-    Contract Solver (paused)

_____________________________

Attacking:  [CSEC, joesguns, n00dles]
Prepping:   [phantasy, neo-net]
_____________________________

Bots:       25 (1GB - 4GB)
Hacknet:    30
Contracts:  11
Contracts solved: 3
_____________________________
























## TODO

- Finish hacknet maintainer add ram and coresmake libs for functions
- Finis bot maintainer - make it like hacknet and add cores - make libs for functions



####### loop targets prep -> hack








- finish hacknet maintainer
- init script for starting new roundtrip
  - start auto.hack
  - prep n00dles
  - hack n00dles
  - start hacknet maintainer - up til level 10, then pause
  - start bot maintainer - up til 64 GB, then pause
  - .
  - when server 64gb
  - .
    - start prep next
    - when prep done start hack next
    - repeat
  - start hackent and bot maintainer


- Watcher
  - monitor whats beeing prepped
  - monitor whats beeing hacked
  - monitor bot maintainer
  - monitor hack maintainer
  - monitor hacknet maintainer

-------------------------
Hacking:    max-hardware
Prepping:   silver-helix    96% done
-------------------------

Latest successfully penetrated
---------
    Host    Hacked Chance
    darkweb true   0.00% 
    darkweb true   0.00% 
---------

Bot maintainer
-------------------------
Status: UPGRADING
Upgrading server: pserv-21 to: 8192 GB

Hacknet maintainer
-------------------------
Status: UPGRADING
Upgrading server: pserv-21 to: 8192 GB




### Proto Batcher - x.proto.hack

### My Server bots - show info like totalram, ramfree, ramused, ip and runnings scripts/threads

### Server hacker and prep with scripts - Istedet for at hacker gør det

### Hacknet maintainer

### refak Server bot maintainer

### Mail reader

## later
- Stockmarked
- meget mere
- OS ?
- Watcher af en art




Localstorage:

prepping: {
    host: 'host'
}
prepped: [hosts]
whatToHack: [hosts]

nodeHacker: {
    status: 'HACKING',
    targets: 'NO_TARGETS_FOUND',
    latestPenetrated: [hosts],
    penetrated: [hosts],
}
botMaintainer: {
    status: 'UPGRADING',
    serverOwned: 25
    latestLog: [],
    logs: []
}
hacknetMaintainer: {
    status: 'UPGRADING',
    serverOwned: 25
    latestLog: [],
    logs: []
}