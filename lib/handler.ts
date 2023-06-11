import { HTTPRequest } from "./http-request";
import { HTTPResponse } from "./http-response";
import { Middleware, Route } from "./types";
import { extractParams, isMatch } from "./utils";

/*eslint-disable-next-line @typescript-eslint/ban-types */
export async function handleRequest<T extends Function = Middleware>(
  routes: Route<T>[],
  err: Error | null,
  req: HTTPRequest,
  res: HTTPResponse
) {
  const pathname = req.parsedUrl?.pathname

  if(!pathname) {
    return;
  }

  const args: Array<HTTPRequest | HTTPResponse | Error> = [req, res];
  if(err) {
    args.unshift(err);
  }

  // Iterate over the routes and call matching middlewares.
  for(const { path, middlewares } of routes) {
    if(isMatch(path, pathname)){
      if(path && path.global) {
        req.params = extractParams(path, pathname);
      }
      
      for(const middleware of middlewares) {
        await middleware(...args);
        
        if(!processNext(res)) {
          return;
        }
      }
      req.params = {};
    }
  }
}

function processNext(res: HTTPResponse): boolean {
  return !res.isProcessed();
}
