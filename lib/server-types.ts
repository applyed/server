import {
  IncomingMessage,
  ServerResponse
} from 'node:http';
import {
  Readable,
} from 'node:stream';

export class HTTPRequest extends IncomingMessage {
  parsedUrl?: URL;
  params?: { [key: string]: string};
}

export class HTTPResponse<Request extends IncomingMessage = IncomingMessage> extends ServerResponse<Request> {
  private processed: boolean;

  constructor(req: Request) {
    super(req);
    this.processed = false;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  override end(chunk?: any, encoding?: any, cb?: () => void): this {
    this.processed = true;
    super.end(chunk, encoding, cb);
    return this;
  }

  send(arg: Buffer | string | object | Readable): HTTPResponse {
    if(arg instanceof Readable) {
      return this.stream(arg);
    }

    let respBuffer;
    if(Buffer.isBuffer(arg)) {
      respBuffer = arg;
    }

    if(typeof arg === 'string') {
      respBuffer = Buffer.from(arg);
    }

    if(typeof arg === 'object') {
      respBuffer = Buffer.from(
        JSON.stringify(arg)
      );
    }

    this.end(respBuffer);
    return this;
  }

  stream(arg: Readable): HTTPResponse {
    this.processed = true;
    arg.pipe(this);
    return this;
  }

  json(arg: object): HTTPResponse {
    this.processed = true;
    const serialized = JSON.stringify(arg);
    this.end(serialized, 'utf-8');
    return this;
  }

  isProcessed() {
    return this.processed;
  }
}

export type Middleware = (req: HTTPRequest, res: HTTPResponse) => Promise<void>

export declare class Route {
  path: RegExp | null;
  middlewares: Array<Middleware>
}
