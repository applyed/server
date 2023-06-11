import { 
  createServer,
  Server as HTTPServer
} from 'node:http';
import { Server } from "../server";
import { ErrorMiddleware, Middleware, Route } from '../types';
import { handleRequest } from '../handler';
import { decorate } from '../decorator';
import { HTTPRequest } from '../http-request';
import { HTTPResponse } from '../http-response';

const MOCK_LISTEN = jest.fn((port: number, cb: () => void) => { setTimeout(cb, 0) });
const MOCK_CLOSE = jest.fn((cb: () => void) => { setTimeout(cb, 0) });
const MOCK_LISTENING = jest.fn(() => false);
const MOCK_EVENT_EMITTER = jest.fn(() => {/* test fn */});
jest.mock('node:http', () => ({
  ...jest.requireActual('node:http'),
  createServer: jest.fn(() => ({
    listen: MOCK_LISTEN,
    close: MOCK_CLOSE,
    on: MOCK_EVENT_EMITTER,
    get listening() {
      return MOCK_LISTENING();
    }
  } as unknown as HTTPServer))
}));

jest.mock('../handler.ts', () => ({
  handleRequest: jest.fn(),
}));

jest.mock('../decorator.ts', () => ({
  decorate: jest.fn(),
}));

describe('Server tests', () => {
  describe('startServer - create and start a new node server', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Should create a new server and start it', async () => {
      const s = new Server();
      await s.startServer(3000);
      expect(createServer).toHaveBeenCalled();
      expect(MOCK_LISTEN).toHaveBeenCalledWith(3000, expect.anything());
      expect(MOCK_CLOSE).not.toHaveBeenCalled();
    });

    it('Should create stop existing server if started again', async () => {
      const s = new Server();
      await s.startServer(3000);
      expect(MOCK_CLOSE).not.toHaveBeenCalled();
      MOCK_LISTENING.mockReturnValueOnce(true);
      await s.startServer(3000);
      expect(MOCK_CLOSE).toHaveBeenCalled();
    });

    it('Should not try to stop server if not listening', async () => {
      const s = new Server();
      await s.startServer(3000);
      expect(MOCK_CLOSE).not.toHaveBeenCalled();
      MOCK_LISTENING.mockReturnValueOnce(false);
      await s.startServer(3000);
      expect(MOCK_CLOSE).not.toHaveBeenCalled();
    });
  });

  describe('attachTo - Use existing node server with this module', () => {
    it('Should attach to server to existing server', async () => {
      const s = new Server();
      const httpServer = createServer();
      await s.attachTo(httpServer);
      expect(MOCK_EVENT_EMITTER).toHaveBeenCalled();
    });

    it('Should close existing server before attaching to new one', async () => {
      const s = new Server();
      await s.startServer(3000);
      MOCK_LISTENING.mockReturnValueOnce(true);
      await s.attachTo(createServer());
      expect(MOCK_CLOSE).toHaveBeenCalled();
      expect(MOCK_EVENT_EMITTER).toHaveBeenCalled();
    });
  });

  describe('use - Add new middleware method', () => {
    const s = new Server();
    let routes: Array<Route>;

    const clean = () => {
      routes.length = 0;
    };

    const middlewareOne = async (req: HTTPRequest, res: HTTPResponse) => {/* test fn */};
    const middlewareTwo = async (req: HTTPRequest, res: HTTPResponse) => {/* test fn */};

    beforeAll(async () => {
      const req = ({} as HTTPRequest);
      const res = new HTTPResponse(req);
      await s.onRequest(req, res);

      // Extract routes arrays from the server;
      routes = (handleRequest as jest.MockedFunction<typeof handleRequest<Middleware>>).mock.calls[0][0];
    });

    it('Should use the first param as middleware if its type is function', () => {
      clean();

      s.use(middlewareOne);
      expect(routes).toEqual([{
        path: null,
        middlewares: [middlewareOne]
      }]);
    });

    it('Should use the first param as path if its RegEx', () => {
      clean();

      const regex = /^\/foo\/bar\/?$/g;
      s.use(regex, middlewareOne);
      expect(routes).toEqual([{
        path: regex,
        middlewares: [middlewareOne],
      }]);
    });

    it('Should use the first param as path if its String', () => {
      clean();
      s.use('/foo/bar', middlewareOne);
      expect(routes.length).toBe(1);
      expect(routes).toEqual([{
        path: /^\/foo\/bar\/?$/g,
        middlewares: [middlewareOne],
      }]);
    });

    it('Should handle multiple middlewares', () => {
      clean();

      s.use('/foo/bar', middlewareOne, middlewareTwo);
      expect(routes).toEqual([{
        path: /^\/foo\/bar\/?$/g,
        middlewares: [middlewareOne, middlewareTwo],
      }])
    });

    it('Should handle multiple routes', () => {
      clean();

      s.use('/foo', middlewareOne, middlewareTwo);
      s.use('/bar', middlewareTwo);
      expect(routes).toEqual([{
        path: /^\/foo\/?$/g,
        middlewares: [middlewareOne, middlewareTwo],
      }, {
        path: /^\/bar\/?$/g,
        middlewares: [middlewareTwo],
      }]);
    });
  });

  describe('useErrorHandler - Add new error middleware', () => {
    const s = new Server();
    let errorRoutes: Array<Route<ErrorMiddleware>>;

    const clean = () => {
      errorRoutes.length = 0;
    };

    const errMiddlewareOne = jest.fn(async (err: Error, req: HTTPRequest, res: HTTPResponse) => {/* test fn */});
    const errMiddlewareTwo = jest.fn(async (err: Error, req: HTTPRequest, res: HTTPResponse) => {/* test fn */});

    beforeAll(async () => {
      jest.resetAllMocks();
      
      const req = ({} as HTTPRequest);
      const res = new HTTPResponse(req);
      (handleRequest as jest.MockedFunction<typeof handleRequest<Middleware>>).mockRejectedValueOnce(new Error('NETWORK_ERROR'));
      await s.onRequest(req, res);
      expect(handleRequest).toHaveBeenCalledTimes(2);

      // Extract error routes array from the server;
      errorRoutes = (handleRequest as jest.MockedFunction<typeof handleRequest<ErrorMiddleware>>).mock.calls[1][0];
    });

    it('Should use the first param as middleware if its type is function', () => {
      clean();

      s.useErrorHandler(errMiddlewareOne);
      expect(errorRoutes).toEqual([{
        path: null,
        middlewares: [errMiddlewareOne]
      }]);
    });

    it('Should use the first param as path if its RegEx', () => {
      clean();

      const regex = /^\/foo\/bar\/?$/g;
      s.useErrorHandler(regex, errMiddlewareOne);
      expect(errorRoutes).toEqual([{
        path: regex,
        middlewares: [errMiddlewareOne],
      }]);
    });

    it('Should use the first param as path if its String', () => {
      clean();
      s.useErrorHandler('/foo/bar', errMiddlewareOne);
      expect(errorRoutes.length).toBe(1);
      expect(errorRoutes).toEqual([{
        path: /^\/foo\/bar\/?$/g,
        middlewares: [errMiddlewareOne],
      }]);
    });

    it('Should handle multiple middlewares', () => {
      clean();

      s.useErrorHandler('/foo/bar', errMiddlewareOne, errMiddlewareTwo);
      expect(errorRoutes).toEqual([{
        path: /^\/foo\/bar\/?$/g,
        middlewares: [errMiddlewareOne, errMiddlewareTwo],
      }])
    });

    it('Should handle multiple routes', () => {
      clean();

      s.useErrorHandler('/foo', errMiddlewareOne, errMiddlewareTwo);
      s.useErrorHandler('/bar', errMiddlewareTwo);
      expect(errorRoutes).toEqual([{
        path: /^\/foo\/?$/g,
        middlewares: [errMiddlewareOne, errMiddlewareTwo],
      }, {
        path: /^\/bar\/?$/g,
        middlewares: [errMiddlewareTwo],
      }]);
    });
  });

  describe('onRequest - request handler method', () => {
    it('Should call decorate followed by handler', async () => {
      const s = new Server();
      const req = ({} as HTTPRequest);
      const res = new HTTPResponse(req);
      res.end = jest.fn(res.end);

      await s.onRequest(req, res);
      expect(decorate).toHaveBeenCalledWith(req, res);
      expect(handleRequest).toHaveBeenCalledWith([], null, req, res);
      expect(res.end).toHaveBeenCalledWith('');
    })
  });
});
