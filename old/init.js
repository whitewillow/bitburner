import XPlayer from './class.xplayer'

/** 
 * @param {NS} ns 
 * 
*/
export async function main(ns) {

  /**
   * @type {{player:Player}}
   */
  const xplayer = new XPlayer(ns);
  console.log('xplayer.player.skills.hacking', xplayer.player.skills.hacking)


  // Start programs based on skills

  // simple-hack - max cash

  // autotarget hacking

  // auto purchase servers

  // auto hacknets

  // advanced batcher hack ?

  if(xplayer.player.skills.hacking<50) {
    // maxcash
  }

}

