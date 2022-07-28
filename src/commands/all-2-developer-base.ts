import { Command } from "../model/command.ts";
import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { InstallBrewPackage, InstallOsPackage } from "./common/os-package.ts";
import { docker } from "./docker.ts";
import { fzf } from "./fzf.ts";
import { gitk } from "./gitk.ts";
import { meld } from "./meld.ts";
import { starship } from "./starship.ts";
import { InstallRustPackage } from "./rust.ts";
import {
  isolateInDocker,
  symlinkToIsolateInDocker,
} from "./isolate-in-docker.ts";

export const all2DeveloperBase = Command.custom()
  .withDependencies([
    all1MinimalSanity,
    ...[
      "git-absorb",
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
    symlinkToIsolateInDocker(`firefox40`),
    meld,
    starship,
    await fzf(),
  ]);
