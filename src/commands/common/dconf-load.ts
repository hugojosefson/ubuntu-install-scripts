import { Exec } from "../exec.ts";
import { InstallOsPackage } from "./os-package.ts";
import { Command } from "../../model/command.ts";
import { FileSystemPath } from "../../model/dependency.ts";
import { targetUser } from "../../os/user/target-user.ts";
import { startsAndEndsWith } from "../../fn.ts";

const startsAndEndsWithSlash = startsAndEndsWith("/");

export function dconfLoadRoot(dconfDump: string): Command {
  return dconfLoad("/", dconfDump);
}

export function dconfLoad(directoryPath: string, dconfDump: string): Command {
  if (!startsAndEndsWithSlash(directoryPath)) {
    throw new Error("directoryPath must start and end with a slash");
  }
  return new Exec(
    [
      InstallOsPackage.of("dconf-cli"),
    ],
    [FileSystemPath.of(targetUser, `${targetUser.homedir}/.config/dconf`)],
    targetUser,
    { stdin: dconfDump.trim() },
    ["dconf", "load", directoryPath],
  );
}
