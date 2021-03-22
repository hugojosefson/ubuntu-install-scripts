import { ensureSuccessful } from "./lib/exec.ts";

export default () => ensureSuccessful(["pacman", "-Syu", "--noconfirm"]);
