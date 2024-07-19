import { NS } from '@ns';
import { range } from 'lib/utils';
import { SERVER_PREFIX } from 'lib/constants';

export async function main(ns: NS): Promise<void> {
  range(0, 25)
    .map((m) => SERVER_PREFIX + m)
    .forEach((host) => {
      ns.killall(host);
    });
}
