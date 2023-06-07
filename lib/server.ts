import {
  createServer,
  Server as HTTPServer,
} from 'node:http';
import debug from 'debug';
import { HTTPRequest, HTTPResponse, Route } from './server-types';

const debugLog = debug('applyed-server:server')

export class Server {
  private routes:Array<Route>
  private server:HTTPServer|null

  constructor() {
    this.routes = [];
    this.server = null;
    this.onRequest = this.onRequest.bind(this);
  }

  onRequest(req: HTTPRequest, res: HTTPResponse) {
    debugLog(`${req.method} request received for '${req.url}'`);
    res.end();
  }

  async startServer(port: number) {
    await this.stopServer();

    const server = this.server = createServer(this.onRequest);
    return new Promise<void>((resolve) => {
      server.listen(port, resolve);
    });
  }

  async stopServer() {
    // The server is not started, nothing to be done
    if(!this.server || !this.server.listening) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      this.server?.close(() => {
        this.server = null;
        resolve();
      });
    });
  }

  async attachTo(server:HTTPServer) {
    await this.stopServer();

    this.server = server;
    server.on('request', this.onRequest);
  }
}