import { isDocker } from "https://deno.land/x/is_docker@v2.0.0/mod.ts";

export const isInsideDocker: boolean = await isDocker();
