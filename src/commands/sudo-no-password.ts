import { CreateFile } from "./common/file-commands.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ensureUserInSystemGroup } from "./common/group.ts";

const GROUP_NAME = "sudo-no-password";

export const sudoNoPassword = new CreateFile(
  ROOT,
  FileSystemPath.of(ROOT, `/etc/sudoers.d/${GROUP_NAME}`),
  `%${GROUP_NAME} ALL=(ALL) NOPASSWD: ALL`,
)
  .withDependencies([
    ensureUserInSystemGroup(targetUser, GROUP_NAME),
    InstallOsPackage.of("sudo"),
  ]);
