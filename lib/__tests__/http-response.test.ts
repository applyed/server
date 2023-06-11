import { Readable } from 'node:stream';
import { Socket } from 'net';
import { HTTPRequest } from '../http-request';
import { HTTPResponse } from '../http-response';

describe('HTTPResponse tests', () => {
  describe('send - Method to send response', () => {
    const setup = () => {
      const req = new HTTPRequest(({} as Socket));
      const res = new HTTPResponse(req);
      res.end = jest.fn((chunk: any, encoding: any, cb?: () => void): HTTPResponse<HTTPRequest> => { return res; });
      return { req, res };
    };

    it('Should send response of Buffer type', () => {
      const {
        req, res
      } = setup();

      const buf = Buffer.from('done');
      res.send(buf);
      
      expect(res.end).toHaveBeenCalledWith(buf);
    });

    it('Should send response of string type', () => {
      const {
        req, res
      } = setup();
      
      res.send('done');
      expect(res.end).toHaveBeenCalledWith(Buffer.from('done'));
    });

    it('Should send response of JSON type', () => {
      const {
        req, res
      } = setup();

      const json = { cow: 'moo' };
      res.send(json);
      expect(res.end).toHaveBeenCalledWith(Buffer.from(JSON.stringify(json)));
    });

    it('Should pipe streams to the response', () => {
      const {
        req, res
      } = setup();
      const r = new Readable();
      r.pipe = jest.fn();

      res.send(r);
      expect(r.pipe).toHaveBeenCalledWith(res);
    })
  });

  describe('cookie - Method to send response cookies', () => {
    it('Should set session cookie', () => {
      const res = new HTTPResponse(({} as HTTPRequest));
      res.appendHeader = jest.fn();
      res.cookie('foo', 'bar');
      expect(res.appendHeader).toHaveBeenCalledWith('Set-Cookie', 'foo=bar');
    });

    it('Should set cookie with max age', () => {
      const res = new HTTPResponse(({} as HTTPRequest));
      res.appendHeader = jest.fn();
      res.cookie('foo', 'bar', 3600);
      expect(res.appendHeader).toHaveBeenCalledWith('Set-Cookie', 'foo=bar; Max-Age=3600');
    });

    it('Should handle boolean options', () => {
      const res = new HTTPResponse(({} as HTTPRequest));
      res.appendHeader = jest.fn();
      res.cookie('foo', 'bar', {
        secure: true,
      });
      expect(res.appendHeader).toHaveBeenCalledWith('Set-Cookie', 'foo=bar; Secure');
    });

    it('Should set cookie with partial options', () => {
      const res = new HTTPResponse(({} as HTTPRequest));
      res.appendHeader = jest.fn();
      res.cookie('foo', 'bar', {
        maxAge: 3600,
        domain: 'example.com',
        secure: true,
        httpOnly: true,
      });
      expect(res.appendHeader).toHaveBeenCalledWith('Set-Cookie', 'foo=bar; Max-Age=3600; Domain=example.com; Secure; HttpOnly');
    });

    it('Should ignore options with undefined value', () => {
      const res = new HTTPResponse(({} as HTTPRequest));
      res.appendHeader = jest.fn();
      res.cookie('foo', 'bar', {
        maxAge: 3600,
        secure: undefined,
      });
      expect(res.appendHeader).toHaveBeenCalledWith('Set-Cookie', 'foo=bar; Max-Age=3600');
    })
  });
});
