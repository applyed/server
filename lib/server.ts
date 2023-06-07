import {
  createServer,
  Server as HTTPServer,
} from 'node:http';
import debug from 'debug';
import { HTTPRequest, HTTPResponse, Middleware, Route } from './server-types';
import { fromCb } from './utils';

const debugLog = debug('applyed-server:server')

export class Server {
  private routes:Array<Route>
  private server:HTTPServer<typeof HTTPRequest, typeof HTTPResponse>|null

  constructor() {
    this.routes = [];
    this.server = null;
    this.onRequest = this.onRequest.bind(this);
  }

  use(path: string, ...middlewares: Array<Middleware>): void {
    this.routes.push({
      path,
      middlewares,
    });
  }

  onRequest(req: HTTPRequest, res: HTTPResponse) {
    debugLog(`${req.method} request received for '${req.url}'`);
    res.send({
      foo: 'bar'
    });
  }

  async startServer(port: number) {
    await this.stopServer();

    const server = this.server = createServer<typeof HTTPRequest, typeof HTTPResponse>({
      IncomingMessage: HTTPRequest,
      ServerResponse: HTTPResponse,
    },this.onRequest);
    return fromCb(cb => server.listen(port, cb));
  }

  async stopServer() {
    // The server is not started, nothing to be done
    if(!this.server || !this.server.listening) {
      return;
    }

    await fromCb(cb => this.server?.close(cb));
    this.server = null;
  }

  async attachTo(server:HTTPServer) {
    await this.stopServer();

    this.server = server;
    server.on('request', this.onRequest);
  }
}