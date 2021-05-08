import { Command } from "../model/command.ts";
import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { bashGitPrompt } from "./bash-git-prompt.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { docker } from "./docker.ts";
import { isolateInDocker } from "./isolate-in-docker.ts";
import { virtManager } from "./virt-manager.ts";

export const all2DeveloperBase = Command.custom()
  .withDependencies([
    all1MinimalSanity,
    ...[
      "meld",
      "moreutils",
      "tig",
      "github-cli",
      "hub",
      "fzf",
    ].map(InstallOsPackage.of),
    ...[
      "git-revise",
      "mdr",
    ].map(InstallAurPackage.of),
    docker,
    virtManager,
    bashGitPrompt,
    isolateInDocker,
  ]);
