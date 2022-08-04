import { FileSystemPath } from "../model/dependency.ts";

export async function fileEndsWithNewline(
  file: FileSystemPath,
): Promise<boolean> {
  try {
    const data = await Deno.readFile(file.path);
    return data.slice(-1)[0] === 10;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return true;
    }
  }
}
