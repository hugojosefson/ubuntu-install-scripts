#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

exec deno run --allow-read=. --allow-net https://deno.land/std/http/file_server.ts
