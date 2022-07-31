import { CreateFile } from "./common/file-commands.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { FileSystemPath } from "../model/dependency.ts";

const contents = `
#Type Path               Mode User Group Age Argument
d!    ${targetUser.homedir}/Downloads 0770 ${targetUser.uid}   ${targetUser.gid}  -
`.trimStart();

export const downloadsIsCleanedOnBoot = new CreateFile(
  ROOT,
  FileSystemPath.of(
    ROOT,
    `/etc/tmpfiles.d/${targetUser.username}-downloads.conf`,
  ),
  contents,
  false,
  0o0644,
);
