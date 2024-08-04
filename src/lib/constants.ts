
/**
 * 400k instances, stay below that and you should be good
 * Black screen can happen if you exceed the 4 gigs ram of electron
 * We can set af limit for max commands to prevent this
 */
export const MAX_COMMANDS = 10000;

/**
 * Player owned server prefix
 */
export const SERVER_PREFIX = 'pserv-';

/**
 * Home server host name
 */
export const HOME_SERVER = 'home';

/**
 * State file name
 */
export const STATE_FILENAME = 'state.txt';

/**
 * Temporary state file name
 */
export const STATE_TEMPORARY_FILENAME = 'state.tmp{0}.txt';

export const MIN_INPUT_PORT = 1;
export const MAX_INPUT_PORT = 19;
export const OUTPUT_PORT = 20;

export const ICON_SUCCESS = '✓';
export const ICON_FAIL = '✗';
export const ICON_ATTACK = '☠';
export const ICON_PREP = '🛠';
export const ICON_BOT = '🤖';
export const ICON_IGNORE = '🚫';
export const ICON_TARGET = '🎯';
export const ICON_CLEAR = '🧹';
export const ICON_WAIT = '⏳';
export const ICON_LOCKED = '🔒';
export const ICON_READY = '✅';
export const ICON_DEATH = '💀'
