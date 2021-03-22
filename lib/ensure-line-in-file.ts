import { isSuccessful } from "./exec.ts";
import resolvePath from "./resolve-path.ts";

export default (line: string, endWithNewline = true) =>
  async (file: string): Promise<void> => {
    const resolvedPath = resolvePath(file);
    if (await isSuccessful(["grep", line, resolvedPath])) {
      return;
    }
    const prefix = "\n";
    const suffix = endWithNewline ? "\n" : "";
    const data = new TextEncoder().encode(prefix + line + suffix);
    return Deno.writeFile(resolvedPath, data, {
      append: true,
      create: true,
    });
  };
