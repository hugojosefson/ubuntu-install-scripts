import _debounce from "https://cdn.skypack.dev/lodash.debounce@v4.0.8";
import parsePasswd_ from "https://cdn.skypack.dev/parse-passwd@v1.0.0";
import { exists } from "https://deno.land/std@0.93.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.93.0/path/mod.ts";
import {
  error,
  success,
  warning,
} from "https://deno.land/x/colorlog@v1.0/mod.ts";

export { dirname };

export { exists };

export const debounce = (
  func: Function,
  wait: number = 0,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {
    leading: false,
    trailing: true,
  },
) =>
  _debounce(func, wait, {
    leading: false,
    trailing: true,
    ...options,
  });

type LogColorer = (val: any) => string;
export const colorlog: {
  error: LogColorer;
  success: LogColorer;
  warning: LogColorer;
} = { error, success, warning };

export interface PasswdEntry {
  username: string;
  uid: number;
  gid: number;
  homedir: string;
}
interface PasswdEntry_ {
  username: any;
  homedir: any;
  uid: any;
  gid: any;
}
export const parsePasswd = (content: string): Array<PasswdEntry> => {
  const parsed = parsePasswd_(content) as Array<PasswdEntry_>;
  return parsed
    .map(
      (
        { username, uid, gid, homedir }: PasswdEntry_,
      ) => ({
        username: username as string,
        homedir: homedir as string,
        uid: parseInt(uid as string, 10),
        gid: parseInt(gid as string, 10),
      }),
    );
};
