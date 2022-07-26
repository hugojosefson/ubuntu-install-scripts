export const complement =
  <T>(fn: (t: T) => boolean): (t: T) => boolean => (t: T) => !fn(t);

export const toObject = <K extends string | number | symbol, V>() =>
(
  acc: Record<K, V>,
  [key, value]: [K, V],
): Record<K, V> => {
  acc[key] = value;
  return acc;
};

export async function filterAsync<T>(
  predicate: (t: T) => Promise<boolean>,
  array: T[],
): Promise<T[]> {
  return (await Promise.all(
    array
      .map((t) => [t, predicate(t)] as [T, Promise<boolean>])
      .map(
        async ([t, shouldIncludePromise]) =>
          [t, await shouldIncludePromise] as [T, boolean],
      ),
  ))
    .filter(([_t, shouldInclude]) => shouldInclude)
    .map(([t, _shouldInclude]) => t);
}

export function isPromise<T>(
  maybePromise: PromiseLike<T> | unknown,
): maybePromise is Promise<T> {
  return typeof (maybePromise as PromiseLike<T>)?.then === "function";
}

export type Getter<T> = () => T | Promise<T>;
export type Ish<T> = T | Promise<T> | Getter<T>;

export async function resolveValue<T>(x: Ish<T>): Promise<T> {
  if (typeof x === "function") {
    return resolveValue((x as Getter<T>)());
  }
  if (isPromise(x)) {
    return await x;
  }
  return x;
}
