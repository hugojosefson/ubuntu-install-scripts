import { Command } from "../model/command.ts";
import { isInsideDocker } from "../os/is-inside-docker.ts";
import { ROOT } from "../os/user/target-user.ts";
import { InstallOsPackage, ReplaceOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

const activateLibvirtd: Command = isInsideDocker
  ? Command.custom()
  : Exec.sequentialExec(ROOT, {}, [
    ["systemctl", "enable", "libvirtd.service"],
    ["systemctl", "start", "libvirtd.service"],
  ]);

export const virtManager = Command
  .custom()
  .withDependencies([
    activateLibvirtd
      .withDependencies(
        [
          "bridge-utils",
          "dmidecode",
          "dnsmasq",
          "edk2-ovmf",
          "inxi",
          "openbsd-netcat",
          "qemu",
          "swtpm",
          "vde2",
          "virt-manager",
        ]
          .map(InstallOsPackage.of)
          .map((command) =>
            command.withDependencies([
              ReplaceOsPackage.of2("iptables", "iptables-nft"),
              ReplaceOsPackage.of2("jack", "jack2"),
            ])
          ),
      ),
  ]);
