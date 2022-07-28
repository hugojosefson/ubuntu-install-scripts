import { Command } from "../model/command.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { ROOT } from "../os/user/target-user.ts";

/** pre-register accept license for deb package virtualbox-ext-pack */
const acceptLicense = new Exec(
  [],
  [],
  ROOT,
  {},
  [
    "sh",
    "-c",
    "echo virtualbox-ext-pack virtualbox-ext-pack/license select true | debconf-set-selections",
  ],
);

export const virtualbox: Command = Command
  .custom()
  .withDependencies([
    InstallOsPackage.of("virtualbox"),
    InstallOsPackage.of("virtualbox-guest-additions-iso"),
    InstallOsPackage.of("virtualbox-ext-pack").withDependencies([
      acceptLicense,
    ]),
    InstallOsPackage.of("virtualbox-qt"),
  ]);
