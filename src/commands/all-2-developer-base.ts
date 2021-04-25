import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { bashGitPrompt } from "./bash-git-prompt.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { docker } from "./docker.ts";
import { isolateInDocker } from "./isolate-in-docker.ts";
import { virtManager } from "./virt-manager.ts";

export const all2DeveloperBase = new ParallelCommand([
  all1MinimalSanity,
  InstallOsPackage.parallel([
    "meld",
    "moreutils",
    "tig",
    "github-cli",
    "hub",
    "fzf",
  ]),
  InstallAurPackage.parallel([
    "git-revise",
    "mdr",
  ]),
  docker,
  virtManager,
  bashGitPrompt,
  isolateInDocker,
]);
