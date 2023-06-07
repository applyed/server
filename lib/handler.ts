import { HTTPRequest, HTTPResponse, Route } from "./server-types";

export function handleRequest(routes: Route[], req: HTTPRequest, res: HTTPResponse) {
  // Iterate over the routes and call matching middlewares.
}
