import { HTTPRequest } from "./http-request";
import { HTTPResponse } from "./http-response";

const DEFAULT_HOST = "http://localhost/";

export function decorate(req: HTTPRequest, res: HTTPResponse): void {
  // Any initialization for extra properties on request or response
  // can be done here.
  if(!req.parsedUrl && req.url) {
    const host = req.headers.origin || DEFAULT_HOST;
    req.parsedUrl = new URL(req.url, host);
  }
  req.params = {};
}
