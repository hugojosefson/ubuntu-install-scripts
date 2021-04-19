import { fetchFile } from "../deps.ts";

export const readRelativeFile = async (
  relativeFilePath: string,
  base: string | URL,
) =>
  await (await fetchFile(new URL(relativeFilePath, base)))
    .text();
