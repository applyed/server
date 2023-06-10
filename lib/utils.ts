type CallbackFn<T> = (err?: Error | null, res?: T) => void;
type CallbackAccepterFn<T> = (arg: CallbackFn<T>) => void;

export function fromCb<T = void>(fn: CallbackAccepterFn<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err?: Error | null, res?: T) => {
      if(err) {
        reject(err);
      }
      else {
        resolve((res as T));
      }
    });
  });
}

export function pathToRegExp(path: string | RegExp): RegExp {
  if(path instanceof RegExp) {
    return path;
  }

  let pathRegexStr = path.split('/')
  .map(part => {
    if(!part.startsWith(':')) {
      return part;
    }
    const name = part.substring(1);
    return `(?<${name}>[^/]+)`;
  })
  .join('/');

  if(!pathRegexStr.endsWith('/')) {
    pathRegexStr = pathRegexStr + '/?';
  }
  else if(pathRegexStr !== '/'){
    pathRegexStr = pathRegexStr + '?';
  }
  return new RegExp(`^${pathRegexStr}$`, 'g');
}

export function isMatch(path: RegExp | null, url: string) {
  if(path === null) {
    return true;
  }
  
  path.lastIndex = 0;
  return path.test(url);
}

export function extractParams(path: RegExp, url: string) {
  path.lastIndex = 0; // reset RegEx
  return [...url.matchAll(path)][0]?.groups || {};
}
