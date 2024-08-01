import { NS } from '@ns';
import { MIN_INPUT_PORT, MAX_INPUT_PORT, OUTPUT_PORT } from 'lib/constants';
import { EventType } from 'lib/types';

function isInputPort(port: number): boolean {
  return port >= MIN_INPUT_PORT && port <= MAX_INPUT_PORT;
}

/**
 * Write data to input port for a given event type
 * @param ns 
 * @param eventType 
 * @param port 
 * @param data 
 */
export function writeToInputPort(ns: NS, eventType: EventType, port: number, data: string): void {
  if (!isInputPort(port)) {
    throw new Error(`Invalid input port: ${port}`);
  }
  const handle = ns.getPortHandle(port);
  const payload = JSON.stringify({ eventType, data: JSON.stringify(data) });
  handle.write(JSON.stringify(payload));
}

/**
 * Write data to output port
 * @param ns 
 * @param payload 
 * @returns 
 */
export function writeToOutputPort(ns: NS, payload: string): boolean {
  const handle = ns.getPortHandle(OUTPUT_PORT);

  if (handle === null) {
    return false;
  }

  handle.write(payload);
  return true;
}

/**
 * Get event from output port
 * @param ns 
 * @param eventType 
 * @returns 
 */
export function getEvent(ns: NS, eventType: EventType): any {
  const handle = ns.getPortHandle(OUTPUT_PORT);
  if (!handle.empty()) {
    const payload = JSON.parse(handle.peek());
    if (payload.eventType === eventType) {
      handle.read();
      return JSON.parse(payload.data);
    }
  }
}
