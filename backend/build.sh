#!/bin/bash
set -e

DOCKERHUB_USER="tusharthakurepc1"
BACKEND_IMAGE="${DOCKERHUB_USER}/backend:latest"

if [ -z "$GITHUB_PAT" ]; then
  echo "GITHUB_PAT env var is required" >&2
  exit 1
fi

# --push publishes straight from the builder since buildx can't --load a
# non-host-platform (arm64) image into the local docker daemon.
docker buildx build --platform linux/arm64 \
  -t "$BACKEND_IMAGE" \
  --build-arg GITHUB_PAT="$GITHUB_PAT" \
  --push \
  ./

# docker login
# docker push <<image_name>>
