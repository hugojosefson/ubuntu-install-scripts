export type Config = { verbose: boolean };
export const config: Config = {
  verbose: Deno.env.get("VERBOSE") !== "false",
};
