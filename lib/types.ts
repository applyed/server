import { HTTPRequest } from './http-request';
import { HTTPResponse } from './http-response';

export type Middleware = (req: HTTPRequest, res: HTTPResponse) => Promise<void>

export declare class Route {
  path: RegExp | null;
  middlewares: Array<Middleware>
}
