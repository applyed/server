import {
  fromCb,
  pathToRegExp,
  isMatch,
  extractParams
} from '../utils';

describe('Utils tests', () => {
  describe('fromCb', () => {
    type AsyncFn = (cb: (err?: Error | null, res?: string) => void) => void;

    const successFn: AsyncFn = (cb) => {
      setTimeout(() => cb(null, 'result'), 0);
    };

    const err = new Error('something went wrong');
    const errFn: AsyncFn = (cb) => {
      setTimeout(() => cb(err));
    };

    it('Should resolve promise is cb called with no error', async () => {
      await expect(fromCb<string>(cb => successFn(cb))).resolves.toBe('result');
    });

    it('Should reject if cb is called with error', async () => {
      await expect(fromCb<string>(cb => errFn(cb))).rejects.toThrow(err);
    });
  });

  describe('pathToRegExp', () => {
    it('Should return regex input as is', () => {
      const regex = /\/foo/g;
      expect(pathToRegExp(regex)).toBe(regex);
    });

    it('Should handle non params url with option trailing slash', () => {
      const regexWithoutSlash = pathToRegExp('/foo/bar');
      const regexWithSlash = pathToRegExp('/foo/bar/');
      
      [
        '/foo/bar',
        '/foo/bar/',
      ].forEach(url => {
        expect(isMatch(regexWithoutSlash, url)).toBe(true);
        expect(isMatch(regexWithSlash, url)).toBe(true);
      });
    });

    it('Should handle path params', () => {
      const regex = pathToRegExp('/foo/:id/patch/:patch');
      [
        ['/foo/1/patch/alpha', { id: '1', patch: 'alpha' }],
        ['/foo/2/patch/beta/', { id: '2', patch: 'beta' }],
        ['/foo/3', {}],
      ].forEach(([url, result]) => {
        expect(extractParams(regex, url.toString())).toEqual(result);
      })
    });
  });

  describe('isMatch', () => {
    it('Should match all urls for null path', () => {
      [
        '/',
        '/foo/bar'
      ].forEach(url => expect(isMatch(null, url)).toBe(true));
    });
  
    it('Should match as per regex', () => {
      const regex = /\/foo\/bar/g;
      [
        ['/', false],
        ['/foo/bar', true]
      ].forEach(([url, res]) => expect(isMatch(regex, url.toString())).toBe(res));
    });
  });
  
  describe('extractParams', () => {
    it('Should return matched params', () => {
      const regex = /\/foo\/(?<name>[^/]+)/g;
      expect(extractParams(regex, '/foo/bar')).toEqual({
        name: 'bar'
      });
    });

    it('Should return default empty object if no params', () => {
      const regex = /\/foo\/bar/g;
      expect(extractParams(regex, '/foo/bar')).toEqual({});
    });
  });
});
