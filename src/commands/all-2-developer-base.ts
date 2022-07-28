import { Command } from "../model/command.ts";
import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { InstallBrewPackage, InstallOsPackage } from "./common/os-package.ts";
import { docker } from "./docker.ts";
import { fzf } from "./fzf.ts";
import { gitk } from "./gitk.ts";
import { isolateInDocker } from "./isolate-in-docker.ts";
import { meld } from "./meld.ts";
import { starship } from "./starship.ts";
import { InstallRustPackage } from "./rust.ts";

export const all2DeveloperBase = Command.custom()
  .withDependencies([
    all1MinimalSanity,
    ...[
      "moreutils",
      "bind9-dnsutils",
      "stunnel4",
      "tig",
    ].map(InstallOsPackage.of),
    ...[
      "gh",
      "git-revise",
    ].map(InstallBrewPackage.of),
    ...[
      "bat",
      "exa",
      "fd-find",
      "ripgrep",
    ].map(InstallRustPackage.of),
    docker,
    gitk,
    isolateInDocker,
    meld,
    starship,
    await fzf(),
  ]);
