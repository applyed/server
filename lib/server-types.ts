import {
  IncomingMessage,
  ServerResponse
} from 'node:http';

export declare class HTTPRequest extends IncomingMessage {}

export declare class HTTPResponse extends ServerResponse {}

export type Middleware = (req: Request, res: Response) => Promise<void>

export declare class Route {
  path: string;
  middlewares: Array<Middleware>
}
