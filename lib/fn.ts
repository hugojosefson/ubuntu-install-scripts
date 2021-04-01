export const prop = <K extends string | number | symbol, V>(p: K) =>
  (a: Record<K, V>): V => a[p];

export const complement = (fn: (...args: Array<any>) => boolean) =>
  (...args: Array<any>) => !fn(...args);

export const toObject = <K extends string | number | symbol, V>() =>
  (
    acc: Record<K, V>,
    [key, value]: [K, V],
  ): Record<K, V> => {
    acc[key] = value;
    return acc;
  };
