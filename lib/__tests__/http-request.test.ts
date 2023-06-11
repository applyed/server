import { Socket } from 'net';
import { HTTPRequest } from "../http-request";

describe('HTTPRequest tests', () => {
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
})