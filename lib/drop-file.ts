import { dirname } from "../src/deps.ts";
import resolvePath from "./resolve-path.ts";

const dropFile = (mode?: number) =>
  (contents: string) =>
    async (path: string) => {
      const resolvedPath: string = resolvePath(path);
      const options: Deno.WriteFileOptions = mode ? { mode } : {};
      const data: Uint8Array = new TextEncoder().encode(contents);
      await Deno.mkdir(dirname(resolvedPath), { recursive: true });
      await Deno.writeFile(resolvedPath, data, options);
    };

export default dropFile;
export const dropExecutable = dropFile(0o775);
