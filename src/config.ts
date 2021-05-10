export type Config = {
  androidHostname: string;
  verbose: boolean;
};
export const config: Config = {
  verbose: Deno.env.get("VERBOSE") !== "false",
  androidHostname: Deno.env.get("ANDROID_HOSTNAME") || "my-android-device",
};
