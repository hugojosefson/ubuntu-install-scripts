import { readFromUrl } from "./read-from-url.ts";

export const readRelativeFile = async (
  relativeFilePath: string,
  base: string | URL,
) => await readFromUrl(new URL(relativeFilePath, base));
