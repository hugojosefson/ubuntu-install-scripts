#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

exec deno fmt lib src
