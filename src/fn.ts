export const complement = <T>(fn: (t: T) => boolean): (t: T) => boolean =>
  (t: T) => !fn(t);

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
