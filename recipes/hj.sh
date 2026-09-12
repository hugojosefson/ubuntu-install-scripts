#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
# Match the installed local hj project's policy: allow its own fresh releases,
# but retain Deno's one-day age requirement for all other dependencies.
cat >"$work_dir/deno.json" <<'EOF'
{"minimumDependencyAge":{"age":1440,"exclude":["jsr:@hugojosefson/cli"]}}
EOF
"$HOME/.deno/bin/deno" install --global --config "$work_dir/deno.json" --no-lock --allow-all --force --name hj jsr:@hugojosefson/cli
