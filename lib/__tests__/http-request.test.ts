import { Socket } from 'net';
import { PassThrough } from 'stream';
import { HTTPRequest } from "../http-request";

describe('HTTPRequest tests', () => {
  describe('cookies - Method to access parsed cookies', () => {
    it('Should gracefully handle no cookies', () => {
      const req = new HTTPRequest(({} as Socket));
      expect(req.cookies()).toEqual({});
    });

    it('Should parse single cookie', () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers.cookie = 'foo=bar';
      expect(req.cookies()).toEqual({
        foo: 'bar',
      });
    });

    it('Should parse multiple cookies', () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers.cookie = 'cow=moo; dog=bark';
      expect(req.cookies()).toEqual({
        cow: 'moo',
        dog: 'bark',
      });
    });

    it('Should ignore empty cookie', () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers.cookie = 'cow=moo; dog=bark;';
      expect(req.cookies()).toEqual({
        cow: 'moo',
        dog: 'bark',
      });
    });

    it('Should use parsed cookie if accessed multiple times', () => {
      const origObjFromEntries = Object.fromEntries;
      Object.fromEntries = jest.fn(Object.fromEntries);
      const req = new HTTPRequest(({} as Socket));
      req.headers.cookie = 'cow=moo; dog=bark';
      expect(req.cookies()).toEqual({
        cow: 'moo',
        dog: 'bark',
      });
      req.cookies();
      expect(Object.fromEntries).toHaveBeenCalledTimes(1);
      Object.fromEntries = origObjFromEntries;
    });
  });

  describe('json - Method to read json body from request', () => {
    it('Should ignore requests with empty content-length', async () => {
      const req = new HTTPRequest(({} as Socket));
      await expect(req.json()).resolves.toEqual({});
    });

    it('Should ignore requests with zero content-length', async () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers['content-length'] = '0';
      await expect(req.json()).resolves.toEqual({});
    });

    it('Should ignore requests with non json content-type', async () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers['content-length'] = '100';
      req.headers['content-type'] = 'plain/text';
      await expect(req.json()).resolves.toEqual({});
    });

    it('Should register data, end, and error handlers', async () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers['content-length'] = '100';
      req.headers['content-type'] = 'application/json; encoding=utf8';
      req.on = jest.fn(req.on);
      req.json();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(req.on).toHaveBeenCalledWith('data', expect.anything());
      expect(req.on).toHaveBeenCalledWith('end', expect.anything());
      expect(req.on).toHaveBeenCalledWith('error', expect.anything());
    });

    it('Should parse and return JSON across multiple chunks', async () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers['content-length'] = '100';
      req.headers['content-type'] = 'application/json; encoding=utf8';
      const reqOnMock = jest.fn(req.on);
      req.on = reqOnMock;

      const jsonPromise = req.json();
      await new Promise(resolve => setTimeout(resolve, 0));

      const data = reqOnMock.mock.calls[0][1];
      const end = reqOnMock.mock.calls[1][1];
      data(Buffer.from('{"cow":'));
      data(Buffer.from(Buffer.from('"moo"}')));
      end();
      await expect(jsonPromise).resolves.toEqual({ cow: 'moo' });

      // Second attempt should return from cache
      await(expect(req.json())).resolves.toEqual({ cow: 'moo' });
      expect(reqOnMock).toHaveBeenCalledTimes(3);
    });

    it('Should forward parse errors', async () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers['content-length'] = '100';
      req.headers['content-type'] = 'application/json; encoding=utf8';
      const reqOnMock = jest.fn(req.on);
      req.on = reqOnMock;

      const jsonPromise = req.json();
      await new Promise(resolve => setTimeout(resolve, 0));

      const data = reqOnMock.mock.calls[0][1];
      const end = reqOnMock.mock.calls[1][1];
      data(Buffer.from('{"cow":"moo"'));
      end();
      await expect(jsonPromise).rejects.toThrow();

      // Attempting to access again should return empty object.
      await expect(req.json()).resolves.toEqual({});
    });

    it('Should forward stream errors', async () => {
      const req = new HTTPRequest(({} as Socket));
      req.headers['content-length'] = '100';
      req.headers['content-type'] = 'application/json; encoding=utf8';
      const reqOnMock = jest.fn(req.on);
      req.on = reqOnMock;

      const jsonPromise = req.json();
      await new Promise(resolve => setTimeout(resolve, 0));

      const data = reqOnMock.mock.calls[0][1];
      const end = reqOnMock.mock.calls[1][1];
      const error = reqOnMock.mock.calls[2][1];
      const err = new Error('network error');
      data(Buffer.from('{"cow":"moo"'));
      error(err);
      end();
      await expect(jsonPromise).rejects.toThrow(err);
    });
  });
})