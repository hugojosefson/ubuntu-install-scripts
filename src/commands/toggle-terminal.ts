import { wmUtils } from "./wm-utils.ts";
import { ROOT } from "../os/user/target-user.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readFromUrl } from "../os/read-from-url.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { dconfLoad } from "./common/dconf-load.ts";
import { Command } from "../model/command.ts";
import { deno } from "./deno.ts";

const installToggleTerminal = new CreateFile(
  ROOT,
  FileSystemPath.of(ROOT, "/usr/local/bin/toggle-terminal.ts"),
  await readFromUrl(
    "https://raw.githubusercontent.com/hugojosefson/toggle-terminal/main/toggle-terminal.ts",
  ),
  false,
  MODE_EXECUTABLE_775,
)
  .withDependencies([
    wmUtils,
    deno,
    ...[
      "coreutils",
      "xdotool",
      "curl",
      "unzip",
    ].map(InstallOsPackage.of),
  ]);

const hotkey = dconfLoad(
  "/org/gnome/settings-daemon/plugins/media-keys/",
  `
[/]
custom-keybindings=['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/']

[custom-keybindings/custom0]
name='toggle-terminal'
command='toggle-terminal.ts'
binding='F1'
`,
)
  .withDependencies([
    InstallOsPackage.of("gnome-settings-daemon"),
  ]);

export const toggleTerminal = Command.custom().withDependencies([
  installToggleTerminal,
  hotkey,
]);
