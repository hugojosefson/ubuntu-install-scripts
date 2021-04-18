#!/bin/sh

set -e

REPO="hugojosefson/ubuntu-install-scripts"
TAG="manjaro-wip"

docker build -f dev-Dockerfile -t "${REPO}:${TAG}" .

exec docker run --net=host --rm -it -v "$(pwd)":"$(pwd)":ro -w "$(pwd)" "${REPO}:${TAG}"
