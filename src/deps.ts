// Compare old dependency with latest:
// url=https://deno.land/std@0.95.0/path/posix.ts; new_url="$(echo "${url}"| sed -E "s/@[^/?]*//")"; meld <(echo "${url}"; curl -sfL "${url}") <(echo "${new_url}"; curl -sfL "${new_url}")

import { dirname } from "https://deno.land/std@0.150.0/path/mod.ts";
export { dirname };
export { equals as equalsBytes } from "https://deno.land/std@0.150.0/bytes/equals.ts";
export { readAll } from "https://deno.land/std@0.150.0/streams/conversion.ts";

import {
  error,
  success,
  warning,
} from "https://deno.land/x/colorlog@v1.0/mod.ts";

// colorlog uses any
// deno-lint-ignore no-explicit-any
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
  // parse-passwd has no typings
  // deno-lint-ignore no-explicit-any
  username: any;
  // parse-passwd has no typings
  // deno-lint-ignore no-explicit-any
  homedir: any;
  // parse-passwd has no typings
  // deno-lint-ignore no-explicit-any
  uid: any;
  // parse-passwd has no typings
  // deno-lint-ignore no-explicit-any
  gid: any;
}

import parsePasswd_ from "https://cdn.skypack.dev/pin/parse-passwd@v1.0.0-c1feX7BOq3S3SMESPpB1/mode=imports/optimized/parse-passwd.js?dts";
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

import { stringify as stringifyYaml_ } from "https://cdn.skypack.dev/pin/yaml@v2.1.1-940wF4nVcO1JvartcxSp/mode=imports/optimized/yaml.js?dts";
// yaml can stringify any-thing ;)
// deno-lint-ignore no-explicit-any
export const stringifyYaml = (value: any): string =>
  stringifyYaml_(value, undefined, undefined) || "";

import { fetch as fetchFile } from "https://deno.land/x/file_fetch@0.2.0/mod.ts";
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

import { paramCase } from "https://deno.land/x/case@2.1.1/mod.ts";
export function kebabCase(s: string): string {
  const kebab: string = paramCase(s);

  return kebab
    .replace(/([a-z])([0-9])/, "$1-$2") // Insert '-' between 'all' and the number.
    .replace(/\bv-4l/, "v4l"); // fix v4l (video for linux)
}

export {
  decode as decodeToml,
  encode as encodeToml,
} from "https://deno.land/x/ini@v2.1.0/ini.ts";
