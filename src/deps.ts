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

import memoize from "https://deno.land/x/memoizy@1.0.0/mod.ts";
export { memoize };

import { isDocker } from "https://deno.land/x/is_docker@v2.0.0/mod.ts";
export { isDocker };

import toposort_ from "https://cdn.skypack.dev/toposort@v2.0.2?dts";
export const toposort = <T>(things: Array<[T, T]>): Array<T> =>
  toposort_(things);

import {
  compose,
  composeUnary,
  pipe,
  pipeline,
  pipelineUnary,
} from "https://deno.land/x/compose@1.3.2/index.js";
export { compose, composeUnary, pipe, pipeline, pipelineUnary };
