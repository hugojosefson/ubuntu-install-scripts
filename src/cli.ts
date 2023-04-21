#!/bin/sh
// 2>/dev/null;DENO_VERSION_RANGE="^1.17";DENO_RUN_ARGS="--unstable --allow-all";set -e;V="$DENO_VERSION_RANGE";A="$DENO_RUN_ARGS";h(){ [ -x "$(command -v $1 2>&1)" ];};g(){ u="$([ $(id -u) != 0 ]&&echo sudo||:)";if h brew;then echo "brew install $1";elif h apt;then echo "($u apt update && $u DEBIAN_FRONTEND=noninteractive apt install -y $1)";elif h yum;then echo "$u yum install -y $1";elif h pacman;then echo "$u pacman -yS --noconfirm $1";elif h opkg-install;then echo "$u opkg-install $1";fi;};p(){ q="$(g $1)";if [ -z "$q" ];then echo "Please install '$1' manually, then try again.">&2;exit 1;fi;eval "o=\"\$(set +o)\";set -x;$q;set +x;eval \"\$o\"">&2;};f(){ h "$1"||p "$1";};f curl;U="$(expr "$(echo "$V"|curl -Gso/dev/null -w%{url_effective} --data-urlencode @- "")" : '..\(.*\)...')";D="$(command -v deno||true)";t(){ d="$(mktemp)";rm "${d}";dirname "${d}";};a(){ [ -n $D ];};s(){ a&&[ -x "$R/deno" ]&&[ "$R/deno" = "$D" ]&&return;deno eval "import{satisfies as e}from'https://deno.land/x/semver@v1.4.1/mod.ts';Deno.exit(e(Deno.version.deno,'$V')?0:1);">/dev/null 2>&1;};e(){ R="$(t)/deno-range-$V/bin";mkdir -p "$R";export PATH="$R:$PATH";[ -x "$R/deno" ]&&return;a&&s&&([ -L "$R/deno" ]||ln -s "$D" "$R/deno")&&return;v="$(curl -sSfL "https://semver-version.deno.dev/api/github/denoland/deno/$U")";i="$(t)/deno-$v";[ -L "$R/deno" ]||ln -s "$i/bin/deno" "$R/deno";s && return;f unzip;([ "${A#*-q}" != "$A" ]&&exec 2>/dev/null;curl -fsSL https://deno.land/install.sh|DENO_INSTALL="$i" sh -s $DENO_INSTALL_ARGS "$v">&2);};e;exec "$R/deno" run $A "$0" "$@"

import { getCommand } from "./commands/index.ts";
import { config } from "./config.ts";
import { colorlog } from "./deps.ts";

import { Command, CommandResult } from "./model/command.ts";
import { RejectFn } from "./os/defer.ts";
import { isRunningAsRoot } from "./os/user/is-running-as-root.ts";
import { sudoKeepalive } from "./os/user/sudo-keepalive.ts";
import { targetUser } from "./os/user/target-user.ts";
import { run } from "./run.ts";
import { errorAndExit, usageAndExit } from "./usage.ts";

export const cli = async () => {
  if (!await isRunningAsRoot()) {
    await errorAndExit(
      3,
      "You must run this program as root. Try again with sudo :)",
    );
  }

  const args: string[] = Deno.args;
  if (!args.length) {
    await usageAndExit();
  }

  const commands: Command[] = await Promise.all(args.map(getCommand));
  const runCommandsPromise = run(commands);
  const stopSudoKeepalive: () => void = sudoKeepalive(targetUser);
  try {
    await runCommandsPromise.then(
      (results: Array<CommandResult>) => {
        results.forEach((result) => {
          if (result.stdout) console.error(colorlog.success(result.stdout));
          if (result.stderr) console.error(colorlog.error(result.stderr));
          if (!(result?.status?.success)) {
            console.error(JSON.stringify(result.status));
          }
        });
        const anyError: CommandResult | undefined = results.find((result) =>
          (!result.status.success) ||
          (result.status.code > 0)
        );
        if (anyError) {
          const err: CommandResult = anyError;
          Deno.exit(err.status.code);
        }
      },
      // deno-lint-ignore no-explicit-any : because Promise defines it as ?any
      (err?: any): RejectFn => {
        if (config.VERBOSE) {
          if (err?.message) {
            console.error("err.message: " + colorlog.error(err.message));
          }
          if (err?.stack) {
            console.error("err.stack: " + colorlog.warning(err.stack));
          }
          if (err?.stdout) {
            console.error("err.stdout: " + colorlog.success(err.stdout));
          }
          if (err?.stderr) {
            console.error("err.stderr: " + colorlog.error(err.stderr));
          }

          console.error("err: " + colorlog.error(JSON.stringify(err, null, 2)));
        }
        const code: number = err?.status?.code || err?.code || 1;
        Deno.exit(code);
      },
    );
  } finally {
    stopSudoKeepalive();
  }
};

if (import.meta.main) {
  await cli();
}

//🔚
// 2>/dev/null || :; sed -E 's#from "\.#from "https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/manjaro-wip/src#g' -i "$r";exec deno run $A "$r" "$@"
