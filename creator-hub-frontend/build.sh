#!/bin/bash
set -e

DOCKERHUB_USER="tusharthakurepc1"
FRONTEND_IMAGE="${DOCKERHUB_USER}/creator-hub-frontend:latest"

if [ -z "$VITE_API_URL" ]; then
  echo "VITE_API_URL env var is required" >&2
  exit 1
fi

# --push publishes straight from the builder since buildx can't --load a
# non-host-platform (arm64) image into the local docker daemon.
docker buildx build --platform linux/arm64 \
  -t "$FRONTEND_IMAGE" \
  --build-arg VITE_API_URL="$VITE_API_URL" \
  --push \
  ./

# docker login
# docker push <<image_name>>
