import { dirname } from "https://deno.land/std@0.91.0/path/mod.ts";
import resolvePath from "./resolve-path.ts";

export default (contents: string) =>
  async (path: string, mode?: number): Promise<void> => {
    const resolvedPath: string = resolvePath(path);
    const options: Deno.WriteFileOptions = mode ? { mode } : {};
    const data: Uint8Array = new TextEncoder().encode(contents);
    await Deno.mkdir(dirname(resolvedPath), { recursive: true });
    await Deno.writeFile(resolvedPath, data, options);
  };
