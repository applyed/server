import { Server } from "./lib/server";
import debug from 'debug';

const debugLog = debug('applyed-server:server')

const s = new Server();
(async () => {
  await s.startServer(3000);
  debugLog('server started at port 3000');
})();
