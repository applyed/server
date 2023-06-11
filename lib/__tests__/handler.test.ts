import { handleRequest } from "../handler";
import { HTTPRequest } from "../http-request";
import { HTTPResponse } from "../http-response";
import { pathToRegExp } from "../utils";

describe('Handler tests', () => {
  const sendResponse = jest.fn(async (req: HTTPRequest, res: HTTPResponse) => {
    res.send('response');
  });

  const dontSendResponse = jest.fn(async (req: HTTPRequest, res: HTTPResponse) => { /* Do nothing */ });

  describe('handleRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Should ignore request if no pathname', async () => {
      const req = ({} as HTTPRequest);
      const res = ({} as HTTPResponse);
      await handleRequest([{
        path: null,
        middlewares: [sendResponse]
      }], req, res)
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
      }], req, res);
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
      }], req, res);
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
      }], req, res);
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
      }], req, res);
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
      }], req, res);
      expect(sendResponse).toHaveBeenCalledWith(req, res);
      expect(req.params).toEqual({
        id: '5',
      });
    })
  });
});
