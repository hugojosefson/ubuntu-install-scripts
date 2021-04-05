import { dirname } from "https://deno.land/std@0.91.0/path/mod.ts";
export { dirname };

import { exists } from "https://deno.land/std@0.91.0/fs/mod.ts";
export { exists };

import debounce from "https://cdn.skypack.dev/lodash.debounce@v4.0.8";
export { debounce };

import { error, success, warning } from "https://deno.land/x/colorlog/mod.ts";
type LogColorer = (val: any) => string;
export const colorlog: {
  error: LogColorer;
  success: LogColorer;
  warning: LogColorer;
} = { error, success, warning };
