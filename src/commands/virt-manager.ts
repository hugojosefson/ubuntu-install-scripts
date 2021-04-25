import { isInsideDocker } from "../os/is-inside-docker.ts";
import { ROOT } from "../os/user/target-user.ts";
import { NOOP } from "./common/noop.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const virtManager = new SequentialCommand([
  InstallOsPackage.parallel([
    "bridge-utils",
    "dmidecode",
    "dnsmasq",
    "iptables-nft",
    "community/jack2",
    "edk2-ovmf",
    "inxi",
    "openbsd-netcat",
    "qemu",
    "swtpm",
    "vde2",
    "virt-manager",
  ]),
  isInsideDocker ? NOOP : Exec.sequential(ROOT, {}, [
    ["systemctl", "enable", "libvirtd.service"],
    ["systemctl", "start", "libvirtd.service"],
  ]),
]);