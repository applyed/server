import {
  IncomingMessage,
} from 'node:http';

export class HTTPRequest extends IncomingMessage {
  parsedUrl?: URL;
  params?: { [key: string]: string};

  private parsedCookies?: {
    [key: string]: string,
  };

  private parsedBody?: object;

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

  async json() {
    if(this.parsedBody) {
      return this.parsedBody;
    }

    const contentLength = parseInt(this.headers['content-length'] ?? '0', 10);
    const contentType = (this.headers['content-type'] ?? '').split(';')[0].trim();

    if(isNaN(contentLength) || contentLength === 0 || contentType !== 'application/json') {
      this.parsedBody = {};
      return this.parsedBody;
    }


    return new Promise((resolve, reject) => {
      const chunks: Array<Buffer> = [];

      this.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      this.on('end', () => {
        const reqBody = Buffer.concat(chunks);
        try {
          this.parsedBody = JSON.parse(reqBody.toString());
          resolve(this.parsedBody);
        }
        catch(err) {
          this.parsedBody = {};
          reject(err);
        }
      });

      this.on('error', (err: Error) => {
        this.parsedBody = {};
        reject(err);
      });
    });
  }
}