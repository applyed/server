import { Server } from './server';

export * from './server-types';

export { Server };

export function server() {
  return new Server
}