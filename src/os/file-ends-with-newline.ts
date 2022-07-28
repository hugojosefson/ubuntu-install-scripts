import { FileSystemPath } from "../model/dependency.ts";

export async function fileEndsWithNewline(
  file: FileSystemPath,
): Promise<boolean> {
  const data = await Deno.readFile(file.path);
  return data.slice(-1)[0] === 10;
}
