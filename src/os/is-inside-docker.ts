import { isDocker } from "../deps.ts";

export const isInsideDocker: boolean = await isDocker();
