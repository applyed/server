import { HTTPRequest } from './http-request';
import { HTTPResponse } from './http-response';

export type Middleware = (req: HTTPRequest, res: HTTPResponse) => Promise<void>
export type ErrorMiddleware = (err: Error, req: HTTPRequest, res: HTTPResponse) => Promise<void>;

export declare class Route<T extends Function = Middleware> {
  path: RegExp | null;
  middlewares: Array<T>
}

