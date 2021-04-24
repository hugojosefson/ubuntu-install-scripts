import { ROOT } from "../os/user/target-user.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const virtManager = new SequentialCommand([
  InstallOsPackage.parallel([
    "bridge-utils",
    "dmidecode",
    "dnsmasq",
    "iptables-nft",
    "edk2-ovmf",
    "inxi",
    "openbsd-netcat",
    "qemu",
    "swtpm",
    "vde2",
    "virt-manager",
  ]),
  Exec.sequential(ROOT, {}, [
    ["systemctl", "enable", "libvirtd.service"],
    ["systemctl", "start", "libvirtd.service"],
  ]),
]);
