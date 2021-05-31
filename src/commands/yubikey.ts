import { Command } from "../model/command.ts";
import { ROOT } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const yubikey: Command = Exec.sequentialExec(ROOT, {}, [
  "sudo systemctl enable --now pcscd.service".split(" "),
])
  .withDependencies([
    "yubikey-personalization-gui",
    "yubioath-desktop",
    "yubikey-manager",
    "yubikey-manager-qt",
    "ccid",
  ].map(InstallOsPackage.of));
