import {
  IncomingMessage,
  ServerResponse
} from 'node:http';
import {
  Readable,
} from 'node:stream';

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
    else if(typeof arg === 'string') {
      respBuffer = Buffer.from(arg);
    }
    else if(typeof arg === 'object') {
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

  cookie(key: string, value: string, ageOrOptions?: number | CookieOptions) {
    const options = getCookieOptions(ageOrOptions);
    this.appendHeader('Set-Cookie', stringifyCookie(key, value, options));
  }

  isProcessed() {
    return this.processed;
  }
}

declare interface CookieOptions {
  maxAge?: number,
  httpOnly?: boolean,
  domain?: string,
  path?: string,
  sameSite?: 'None' | 'Strict' | 'Lax',
  secure?: boolean,
}

const CookieOptionNameMap:{ [key in keyof CookieOptions]: string} = {
  maxAge: 'Max-Age',
  httpOnly: 'HttpOnly',
  domain: 'Domain',
  path: 'Path',
  sameSite: 'SameSite',
  secure: 'Secure',
}

function getCookieOptions(ageOrOptions?: number | CookieOptions): CookieOptions {
  if(typeof ageOrOptions === 'undefined') {
    return {}; 
  }

  if(typeof ageOrOptions === 'number') {
    return {
      maxAge: ageOrOptions,
    };
  }

  return ageOrOptions;
}

function stringifyCookie(key: string, value: string, options: CookieOptions) {
  const opts = (Object.entries(options) as [ [Extract<keyof CookieOptions, string>, string | number | boolean | undefined] ])
    .filter(([, val]) => val !== undefined)
    .map(([opt, val]) => {
      const key = CookieOptionNameMap[opt];
      if(typeof val === 'boolean') {
        return key;
      }
      return `${key}=${val}`;
    })
    .join('; ');
  return `${key}=${value}${opts ? '; ' : ''}${opts}`;
}
