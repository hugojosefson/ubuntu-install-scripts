export const requireEnv = (name: string): string => {
  const maybeValue: string | undefined = Deno.env.get(name);

  if (!maybeValue) {
    throw new Error(`Missing env variable "${name}".`);
  }

  return maybeValue;
};
