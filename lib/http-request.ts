import {
  IncomingMessage,
} from 'node:http';

export class HTTPRequest extends IncomingMessage {
  parsedUrl?: URL;
  params?: { [key: string]: string};

  private parsedCookies?: {
    [key: string]: string,
  };

  cookies() {
    if(this.parsedCookies) {
      return this.parsedCookies;
    }

    this.parsedCookies = Object.fromEntries(
      this.headers.cookie
        ?.split(';')
        ?.map(cookie => cookie.trim())
        ?.filter(Boolean)
        ?.map(cookie => cookie.split('='))
      ?? []
    );

    return this.parsedCookies;
  }
}