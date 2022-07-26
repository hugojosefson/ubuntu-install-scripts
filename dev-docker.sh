#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

REPO="hugojosefson/ubuntu-install-scripts"
TAG="ubuntu-22.04"

docker build -f dev-Dockerfile -t "${REPO}:${TAG}" .

exec docker run --net=host --rm -it -v "$(pwd)":"$(pwd)":ro -w "$(pwd)" "${REPO}:${TAG}" "$@"
