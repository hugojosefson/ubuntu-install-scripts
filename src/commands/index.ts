import { Command } from "../model/command.ts";
import { requireEnv } from "../os/require-env.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { SymlinkElsewhere } from "./common/file-commands.ts";
import { OsPackage } from "./common/os-package.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { UpdateOsPackages } from "./update-os-packages.ts";
import { vim } from "./vim.ts";
import { gitk } from "./gitk.ts";

const HOME: string = requireEnv("HOME");

const desktopIsHome = new SymlinkElsewhere(
  ".",
  `${HOME}/Desktop`,
);
const downloadsIsTmp = new SymlinkElsewhere(
  "/tmp",
  `${HOME}/Downloads`,
);
const commands: Record<string, Command> = {
  updateOsPackages: new UpdateOsPackages(),
  gitk,
  saveBashHistory,
  addHomeBinToPath,
  vim,
  awscli: new OsPackage("aws-cli"),
  libreoffice: OsPackage.multi([
    "libreoffice-fresh",
    "libreoffice-fresh-en-gb",
    "libreoffice-fresh-sv",
  ]),
  downloadsIsTmp,
  desktopIsHome,
};

export const getCommand = (name: string): Command =>
  commands[name] || new OsPackage(name);

export const availableCommands: Array<string> = Object.keys(commands);
