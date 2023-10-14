import { NS, Player, Server } from "@ns";

export default class XPlayer {

  ns: NS;
  player: Player;

  constructor(ns: NS) {
    this.ns = ns;
    this.player = ns.getPlayer();
    console.log('Player', this.player);
  }

}
