export type Config = {
  ANDROID_HOSTNAME: string;
  NON_INTERACTIVE: boolean;
  VERBOSE: boolean;
};
export const config: Config = {
  ANDROID_HOSTNAME: Deno.env.get("ANDROID_HOSTNAME") || "my-android-device",
  NON_INTERACTIVE: Deno.env.get("NON_INTERACTIVE") !== "false",
  VERBOSE: Deno.env.get("VERBOSE") !== "false",
};
