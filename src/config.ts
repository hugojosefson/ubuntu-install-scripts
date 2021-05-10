export type Config = {
  ANDROID_HOSTNAME: string;
  VERBOSE: boolean;
};
export const config: Config = {
  VERBOSE: Deno.env.get("VERBOSE") !== "false",
  ANDROID_HOSTNAME: Deno.env.get("ANDROID_HOSTNAME") || "my-android-device",
};
