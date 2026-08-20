#!/bin/bash
set -e

DOCKERHUB_USER="tusharthakurepc1"
BACKEND_IMAGE="${DOCKERHUB_USER}/backend:latest"

docker pull --platform linux/arm64 "$BACKEND_IMAGE"

# Clear any leftover containers from a previous run before PM2 starts fresh ones
docker rm -f backend-container >/dev/null 2>&1 || true

# Remove any previously running PM2 processes with these names, then start fresh.
# --interpreter none tells PM2 to exec the command directly instead of running it through node.
# No -d on `docker run`: PM2 supervises a foreground process, so the container's lifetime
# needs to *be* the PM2 process's lifetime for restart/crash-recovery to do anything.
pm2 delete backend >/dev/null 2>&1 || true

pm2 start docker --name backend --interpreter none -- \
  run --rm --name backend-container -p 8080:8080 \
  --platform linux/arm64 "$BACKEND_IMAGE"

pm2 save
