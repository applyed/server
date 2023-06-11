# Overview 
An http server with support for routing and middlewares chaining.

# Getting started
```js
import { server } from '@applyed/server';
const s = server();

// Middleware for all routes
s.use((req, res) => {
  // Will be executed for every request.
});

// Middleware for specific route
s.use('/foo', (req, res) => {
  // Will be executed for requests at /foo or /foo/ routes.
});

// Middleware with params
s.use('/get/:id', (req, res) => {
  // Will be executed for requests at /get/<id> or /get/<id>/ routes.
  // req.params will be an object with `id` key.
});

// Middleware for an regex route
s.use(/get\/(?<objId>\d+)\/?/g, (req, res) => {
  // Will be executed if the route matches.
  // req.params will be an object with `objId` key.
});

// Start the server at port 3000.
s.startServer(3000);
```

# Features
- Routing
  - Path of type `string`
  - Path of type `RegExp`
  - Multiple chained middlewares
  - Multiple chained routes
  - Chain termination after response is sent.
- Cookies
  - Parse incoming cookies to request
  - Ability to send outgoing cookies

# To be implemented.
- Request body
  - Ability to parse JSON body
- Response
  - Set content length
  - Set Content type
  - [Potentially] a helper for setting content-type
- Documentation