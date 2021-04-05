#!/bin/sh
// 2>/dev/null;DENO_VERSION_RANGE="^1.8";DENO_RUN_ARGS="--unstable --allow-all";: "Via https://github.com/hugojosefson/deno-shebang CC BY 4.0";set -e;(command -v sudo>/dev/null||pacman -Sy --noconfirm sudo>/dev/null);(command -v unzip>/dev/null||pacman -Sy --noconfirm unzip>/dev/null);V="$DENO_VERSION_RANGE";A="$DENO_RUN_ARGS";U="$(expr "$(echo "$V"|curl -Gso/dev/null -w%{url_effective} --data-urlencode @- "")" : '..\(.*\)...')";D="$(command -v deno||true)";t(){ d="$(mktemp -d)";rmdir "${d}";dirname "${d}";};f(){ m="$(command -v "$0"||true)";l="/* 2>/dev/null";! [ -z $m ]&&[ -r $m ]&&[ "$(head -c3 "$m")" = '#!/' ]&&(read x && read y &&[ "$x" = "#!/bin/sh" ]&&[ "$l" != "${y%"$l"*}" ])<"$m";};a(){ [ -n $D ];};s(){ a&&[ -x "$R/deno" ]&&[ "$R/deno" = "$D" ]&&return;deno eval "import{satisfies as e}from'https://deno.land/x/semver@v1.3.0/mod.ts';Deno.exit(e(Deno.version.deno,'$V')?0:1);">/dev/null 2>&1;};g(){ curl -sSfL "https://api.mattandre.ws/semver/github/denoland/deno/$U";};e(){ R="$(t)/deno-range-$V/bin";mkdir -p "$R";export PATH="$R:$PATH";[ -x "$R/deno" ]&&return;a&&s&&([ -L "$R/deno" ]||ln -s "$D" "$R/deno")&&return;v="$(g)";i="$(t)/deno-$v";[ -L "$R/deno" ]||ln -s "$i/bin/deno" "$R/deno";s && return;curl -fsSL https://deno.land/x/install/install.sh|DENO_INSTALL="$i" sh -s "$v" 2>/dev/null >&2;};e;f&&exec deno run $A "$0" "$@";r="$(mktemp --suffix=run.ts)";cat > "$r" <<'//🔚'

import { availableCommands, getCommand } from "./commands/index.ts";
import { Queue } from "./model/queue.ts";

const run = (commandStrings: Array<string>): Promise<any> => {
  const queue = new Queue();
  return Promise.all(
    commandStrings
      .map(getCommand)
      .map((command) => queue.enqueue(command)),
  );
};
export default run;

const usageAndExit = (code: number = 1, message?: string): never => {
  if (message) {
    console.error(message);
  }
  console.error(`
Usage:   ./run.ts <command...>

         Available commands:
${
    availableCommands.map((name) => `            ${name}`)
      .join("\n")
  }

         ...or any valid OS-level package.
  `);
  Deno.exit(code);
  throw new Error(); // not really, because we already exited, but just to appease the compiler about "never" returning.
};

if (import.meta.main) {
  if (!Deno.args.length) {
    usageAndExit();
  }
  await run(Deno.args).then(
    console.dir.bind(console),
    console.error.bind(console),
  );
}

//🔚
// 2>/dev/null || :; sed -E 's#from "\.#from "https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/manjaro-wip/src#g' -i "$r";exec deno run $A "$r" "$@"
