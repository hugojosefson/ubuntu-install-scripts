import { dirname } from "https://deno.land/std@0.95.0/path/mod.ts";
export { dirname };

import {
  error,
  success,
  warning,
} from "https://deno.land/x/colorlog@v1.0/mod.ts";

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

import parsePasswd_ from "https://cdn.skypack.dev/parse-passwd@v1.0.0";
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

import { stringify as stringifyYaml_ } from "https://cdn.skypack.dev/yaml@v2.0.0-5";
export const stringifyYaml = (value: any): string =>
  stringifyYaml_(value, undefined, undefined) || "";

import { fetch as fetchFile } from "https://deno.land/x/file_fetch@0.1.0/mod.ts";
export { fetchFile };

import PQueue from "https://cdn.skypack.dev/p-queue@7.1.0?dts";
export { PQueue };
