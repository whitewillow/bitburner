export default class XPlayer {

  /** @param {NS} ns */
  constructor(ns, id) {
    this.ns = ns;
    this._id = id;
    this.player = ns.getPlayer();
    console.log('Player', this.player);
  }
  get id() { return this._id };

}
