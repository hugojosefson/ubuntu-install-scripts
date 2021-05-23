import { Command } from "../model/command.ts";
import {
  isolateInDocker,
  symlinkToIsolateInDocker,
} from "./isolate-in-docker.ts";

export const signalDesktopViaDocker = Command.custom().withDependencies([
  isolateInDocker,
  symlinkToIsolateInDocker("signal-desktop"),
]);
