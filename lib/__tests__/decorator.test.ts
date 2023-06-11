import { decorate } from "../decorator";
import { HTTPRequest } from "../http-request";
import { HTTPResponse } from "../http-response";

function searchParamsToObj(params?: URLSearchParams) {
  return Object.fromEntries([
    ...params?.entries() ?? []
  ]);
}

describe('Decorator tests', () => {
  it('Should parse url', () => {
    const req = ({
      url: '/foo/bar?cow=moo&dog=bark',
      headers: {},
    } as HTTPRequest);
    const res = ({} as HTTPResponse);
    decorate(req, res);
    expect(req.parsedUrl?.pathname).toBe('/foo/bar');
    expect(searchParamsToObj(req.parsedUrl?.searchParams)).toEqual({
      cow: 'moo',
      dog: 'bark',
    });
  });

  it('Should skip parsing if url not defined', () => {
    const req = ({} as HTTPRequest);
    const res = ({} as HTTPResponse);
    decorate(req, res);
    expect(req.parsedUrl).toBe(undefined);
  });

  it('Should skip parsing if the url is already parsed', () => {
    const empty = {};
    const req = ({
      url: '/foo/bar?cow=moo&dog=bark',
      parsedUrl: empty,
    } as HTTPRequest);
    const res = ({} as HTTPResponse);
    decorate(req, res);
    expect(req.parsedUrl).toBe(empty)
  });
});
