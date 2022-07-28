import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { targetUser } from "../os/user/target-user.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { readFromUrl } from "../os/read-from-url.ts";

export const gnomeShellExtensionInstallerFile = FileSystemPath.of(
  targetUser,
  "~/bin/gnome-shell-extension-installer",
);

export const gnomeShellExtensionInstaller = new CreateFile(
  targetUser,
  gnomeShellExtensionInstallerFile,
  await readFromUrl(
    "https://github.com/brunelli/gnome-shell-extension-installer/raw/master/gnome-shell-extension-installer",
  ),
  false,
  MODE_EXECUTABLE_775,
)
  .withDependencies([addHomeBinToPath]);
