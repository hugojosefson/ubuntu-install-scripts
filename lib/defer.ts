export interface ResolveFn<T> {
  (value: (PromiseLike<T> | T)): void;
}

export interface RejectFn {
  (reason?: any): void;
}

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: ResolveFn<T>;
  reject: RejectFn;
}

export default <T>(): Deferred<T> => {
  let resolve: ResolveFn<T>;
  let reject: RejectFn;

  const promise: Promise<T> = new Promise(
    (resolveFn, rejectFn) => {
      resolve = resolveFn;
      reject = rejectFn;
    },
  );

  // Promise constructor argument is called immediately, so our resolve
  // and reject variables have been initialised by the time we get here.
  // @ts-ignore
  return { promise, resolve, reject };
};
