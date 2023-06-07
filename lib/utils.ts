type CallbackFn<T> = (err?: Error, res?: T) => void;
type CallbackAccepterFn<T> = (arg: CallbackFn<T>) => void;

export function fromCb<T = void>(fn: CallbackAccepterFn<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err?: Error, res?: T) => {
      if(err) {
        reject(err);
      }
      else {
        resolve((res as T));
      }
    });
  });
}
