import { fetchFile } from "../deps.ts";

export async function readFromUrl(url: string | URL): Promise<string> {
  const response: Response = await fetchFile(url);
  return await response.text();
}

export async function readFromUrlBytes(url: string | URL): Promise<Uint8Array> {
  const response: Response = await fetchFile(url);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
