import { ROOT, targetUser } from "../os/user/target-user.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { CreateFile, Symlink } from "./common/file-commands.ts";
import { readFromUrlBytes } from "../os/read-from-url.ts";
import { Exec } from "./exec.ts";
import { RemoveSnapPackage } from "./common/os-package.ts";
import { isSuccessful } from "../os/exec.ts";

const installDir = FileSystemPath.of(targetUser, "~/.local/share/firefox");
const desktopDir = FileSystemPath.of(targetUser, "~/.local/share/applications");
const desktopUrl =
  "https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/components/shell/search-provider-files/firefox.desktop";

const symlink = new Symlink(
  ROOT,
  installDir.slash("firefox"),
  FileSystemPath.of(ROOT, "/usr/local/bin/firefox"),
);

const desktopFile = new CreateFile(
  targetUser,
  desktopDir.slash("firefox.desktop"),
  await readFromUrlBytes(desktopUrl),
  true,
);

const downloadAndUnpack = new Exec(
  [],
  [installDir],
  targetUser,
  {
    cwd: installDir.slash(".."),
  },
  [
    "bash",
    "-c",
    "curl -fL 'https://download.mozilla.org/?product=firefox-latest&os=linux64&lang=en-US' | tar xj",
  ],
)
  .withSkipIfAny([
    () =>
      isSuccessful(targetUser, [installDir.slash("firefox").path, "--version"]),
  ]);

const removeSnap = RemoveSnapPackage.of("firefox");

const updateDesktopDatabase = new Exec(
  [
    removeSnap,
    downloadAndUnpack,
    desktopFile,
    symlink,
  ],
  [desktopDir],
  targetUser,
  {},
  ["update-desktop-database", desktopDir.path],
);

export const firefoxLocal = updateDesktopDatabase;
