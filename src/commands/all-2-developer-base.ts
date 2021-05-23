import { Command } from "../model/command.ts";
import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { docker } from "./docker.ts";
import { fzf } from "./fzf.ts";
import { gitk } from "./gitk.ts";
import { isolateInDocker } from "./isolate-in-docker.ts";
import { meld } from "./meld.ts";
import { starship } from "./starship.ts";
import { virtManager } from "./virt-manager.ts";

export const all2DeveloperBase = Command.custom()
  .withDependencies([
    all1MinimalSanity,
    ...[
      "moreutils",
      "tig",
      "github-cli",
      "hub",
      "bat",
      "exa",
      "fd",
      "ripgrep",
    ].map(InstallOsPackage.of),
    ...[
      "git-revise",
      "mdr",
    ].map(InstallAurPackage.of),
    docker,
    gitk,
    isolateInDocker,
    meld,
    starship,
    await fzf(),
    virtManager,
  ]);
