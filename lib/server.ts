import {
  createServer,
  Server as HTTPServer,
} from 'node:http';
import { Middleware, Route } from './types';
import { fromCb, pathToRegExp } from './utils';
import { decorate } from './decorator';
import { handleRequest } from './handler';
import { HTTPRequest } from './http-request';
import { HTTPResponse } from './http-response';

export class Server {
  private routes:Array<Route>
  private server:HTTPServer<typeof HTTPRequest, typeof HTTPResponse>|null

  constructor() {
    this.routes = [];
    this.server = null;
    this.onRequest = this.onRequest.bind(this);
  }

  use(path: string | RegExp| Middleware, ...middlewares: Array<Middleware>): void {
    const pathProvided = typeof path !== 'function';

    if(!pathProvided) {
      middlewares.unshift(path);
    }

    this.routes.push({
      path: pathProvided? pathToRegExp(path) : null,
      middlewares,
    });
  }

  async onRequest(req: HTTPRequest, res: HTTPResponse) {
    decorate(req, res);
    
    await handleRequest(this.routes, req, res);

    if(!res.isProcessed()) {
      res.end('');
    }
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