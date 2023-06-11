import { HTTPRequest } from "./http-request";
import { HTTPResponse } from "./http-response";
import { Route } from "./types";
import { extractParams, isMatch } from "./utils";

export async function handleRequest(routes: Route[], req: HTTPRequest, res: HTTPResponse) {
  const pathname = req.parsedUrl?.pathname

  if(!pathname) {
    return;
  }

  // Iterate over the routes and call matching middlewares.
  for(const { path, middlewares } of routes) {
    if(isMatch(path, pathname)){
      if(path && path.global) {
        req.params = extractParams(path, pathname);
      }
      
      for(const middleware of middlewares) {
        await middleware(req, res);
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
