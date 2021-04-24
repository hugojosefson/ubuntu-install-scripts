import { fetchFile } from "../deps.ts";

export const readFromUrl = async (url: string | URL) =>
  await (await fetchFile(url)).text();
