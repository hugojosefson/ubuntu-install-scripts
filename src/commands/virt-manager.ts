import { ROOT } from "../os/user/target-user.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const virtManager = new SequentialCommand([
  InstallOsPackage.parallel([
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
  ]),
  new Exec(ROOT, {}, [
    "bash",
    "-c",
    "yes y | pacman --sync --refresh --needed iptables-nft",
  ]),
  Exec.sequential(ROOT, {}, [
    ["systemctl", "enable", "libvirtd.service"],
    ["systemctl", "start", "libvirtd.service"],
  ]),
]);
