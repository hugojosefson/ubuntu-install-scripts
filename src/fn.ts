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
