import { Command } from "../../model/command.ts";
import { Exec } from "../exec.ts";
import { FileSystemPath } from "../../model/dependency.ts";
import { ROOT } from "../../os/user/target-user.ts";
import { PasswdEntry } from "../../deps.ts";

export function ensureSystemGroup(name: string): Command {
  return new Exec(
    [],
    [FileSystemPath.of(ROOT, "/etc/group")],
    ROOT,
    {},
    ["groupadd", "--force", "--system", name],
  );
}

export function ensureUserInSystemGroup(
  user: PasswdEntry,
  group: string,
): Command {
  return new Exec(
    [ensureSystemGroup(group)],
    [
      FileSystemPath.of(ROOT, "/etc/group"),
      FileSystemPath.of(ROOT, "/etc/passwd"),
    ],
    ROOT,
    {},
    ["usermod", "--append", "--groups", group, user.username],
  );
}
