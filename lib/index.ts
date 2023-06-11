import { Server } from './server';

export * from './types';

export { Server };

export function server() {
  return new Server
}