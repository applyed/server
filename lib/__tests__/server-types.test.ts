import { Readable } from 'node:stream';
import { HTTPRequest, HTTPResponse } from "../server-types";

describe('server-types', () => {
  describe('send - Method to send response', () => {
    const setup = () => {
      const req = ({} as HTTPRequest);
      const res = new HTTPResponse(req);
      res.end = jest.fn((chunk: any, encoding: any, cb: () => void): HTTPResponse => { return res; });
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
});
