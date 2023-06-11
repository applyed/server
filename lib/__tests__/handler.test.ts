import { handleRequest } from "../handler";
import { HTTPRequest } from "../http-request";
import { HTTPResponse } from "../http-response";
import { pathToRegExp } from "../utils";

describe('Handler tests', () => {
  const sendResponse = jest.fn(async (req: HTTPRequest, res: HTTPResponse) => {
    res.send('response');
  });

  const dontSendResponse = jest.fn(async (req: HTTPRequest, res: HTTPResponse) => { /* Test fn */ });
  const errorHandler = jest.fn(async (err: Error, req, HTTPRequest, res:HTTPResponse) => { /* Test fn */})

  describe('handleRequest - without error', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Should ignore request if no pathname', async () => {
      const req = ({} as HTTPRequest);
      const res = ({} as HTTPResponse);
      await handleRequest([{
        path: null,
        middlewares: [sendResponse]
      }], null, req, res)
      expect(sendResponse).not.toHaveBeenCalled();
    });

    it('Should call multiple middlewares for matched path', async () => {
      const req = ({
        parsedUrl: new URL('http://localhost/foo/bar'),
      } as HTTPRequest);
      const res = new HTTPResponse(req);
      await handleRequest([{
        path: null,
        middlewares: [dontSendResponse, sendResponse]
      }], null, req, res);
      expect(dontSendResponse).toHaveBeenCalledWith(req, res);
      expect(sendResponse).toHaveBeenCalledWith(req, res);
    });

    it('Should skip middlewates after a response is sent', async () => {

      const req = ({
        parsedUrl: new URL('http://localhost/foo/bar'),
      } as HTTPRequest);
      const res = new HTTPResponse(req);
      await handleRequest([{
        path: pathToRegExp('/foo/bar'),
        middlewares: [sendResponse, dontSendResponse],
      }], null, req, res);
      expect(sendResponse).toHaveBeenCalledWith(req, res);
      expect(dontSendResponse).not.toHaveBeenCalled();
    });

    it('Should process multiple routes', async () => {
      const req = ({
        parsedUrl: new URL('http://localhost/foo/bar'),
      } as HTTPRequest);
      const res = new HTTPResponse(req);
      await handleRequest([{
        path: pathToRegExp('/foo/bar'),
        middlewares: [dontSendResponse],
      }, {
        path: pathToRegExp('/foo/bar'),
        middlewares: [sendResponse],
      }], null, req, res);
      expect(dontSendResponse).toHaveBeenCalledWith(req, res);
      expect(sendResponse).toHaveBeenCalledWith(req, res);
    });

    it('Should skip routes after a response is sent', async () => {
      const req = ({
        parsedUrl: new URL('http://localhost/foo/bar'),
      } as HTTPRequest);
      const res = new HTTPResponse(req);
      await handleRequest([{
        path: pathToRegExp('/foo/bar'),
        middlewares: [sendResponse],
      }, {
        path: pathToRegExp('/foo/bar'),
        middlewares: [dontSendResponse],
      }], null, req, res);
      expect(sendResponse).toHaveBeenCalledWith(req, res);
      expect(dontSendResponse).not.toHaveBeenCalled();
    });

    it('Should get fetched params', async () => {
      const req = ({
        parsedUrl: new URL('http://localhost/get/5'),
      } as HTTPRequest);
      const res = new HTTPResponse(req);
      await handleRequest([{
        path: pathToRegExp('/get/:id'),
        middlewares: [sendResponse],
      }], null, req, res);
      expect(sendResponse).toHaveBeenCalledWith(req, res);
      expect(req.params).toEqual({
        id: '5',
      });
    });

    it('Should pass error to middleware if provided', async () => {
      const req = ({
        parsedUrl: new URL('http://localhost/foo/bar'),
      } as HTTPRequest);
      const res = new HTTPResponse(req);
      const err = new Error('Something went wrong');

      await handleRequest([{
        path: pathToRegExp('/foo/bar'),
        middlewares: [errorHandler],
      }], err, req, res);

      expect(errorHandler).toHaveBeenCalledWith(err, req, res);
    });
  });
});
