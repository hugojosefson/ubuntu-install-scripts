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

export const requireEnv = (name: string): string => {
  const maybeValue: string | undefined = Deno.env.get(name);

  if (!maybeValue) {
    throw new Error(`Missing env variable "${name}".`);
  }

  return maybeValue;
};
