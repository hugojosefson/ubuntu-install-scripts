export interface ResolveFn<T> {
  (value: (PromiseLike<T> | T)): void;
}

export interface RejectFn {
  // deno-lint-ignore no-explicit-any : because Promise defines it as ?any
  (reason?: any): void;
}

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: ResolveFn<T>;
  reject: RejectFn;
  isDone: boolean;
}

export const defer = <T>(): Deferred<T> => {
  let resolve: ResolveFn<T>;
  let reject: RejectFn;

  const promise: Promise<T> = new Promise<T>(
    (resolveFn, rejectFn) => {
      resolve = (value) => {
        deferred.isDone = true;
        return resolveFn(value);
      };
      reject = (reason) => {
        deferred.isDone = true;
        return rejectFn(reason);
      };
    },
  );

  // @ts-ignore: Promise constructor argument is called immediately, so our resolve and reject variables have been initialised by the time we get here.
  const deferred = { promise, resolve, reject, isDone: false };
  return deferred;
};

export function deferAlreadyResolvedVoid(): Deferred<void> {
  const deferred: Deferred<void> = defer<void>();
  deferred.resolve();
  return deferred;
}
