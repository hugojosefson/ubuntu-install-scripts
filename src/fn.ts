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

export type SimpleValue = string | number | boolean;

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

export type Getter<T> = () => T | Promise<T>;
export type Ish<T> = T | Promise<T> | Getter<T>;

export async function resolveValue<T>(x: Ish<T>): Promise<T> {
  if (typeof x === "function") {
    const x_ = x as Getter<T>;
    return await resolveValue(await x_());
  }
  return x;
}

export function startsAndEndsWith(
  start: string,
  end: string = start,
): (s: string) => boolean {
  return function (s: string): boolean {
    return s.startsWith(start) && s.endsWith(end);
  };
}

export async function loopUntil(
  predicate: () => Promise<boolean>,
  delayMs = 100,
  timeoutMs = 10_000,
): Promise<void> {
  const expires = Date.now() + timeoutMs;
  while (true) {
    if (await predicate()) {
      break;
    }
    if (Date.now() > expires) {
      throw new Error("Timeout", predicate.toString());
    }
    await sleep(delayMs);
  }
  return;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
