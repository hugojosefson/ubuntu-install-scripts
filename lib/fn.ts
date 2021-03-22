export const prop = <K extends string | number | symbol, V>(p: K) =>
  (a: Record<K, V>): V => a[p];

export const complement = (fn: (...args: any) => any) =>
  (...args: any) => !fn(...args);
