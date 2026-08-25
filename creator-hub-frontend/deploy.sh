#!/bin/bash
set -e

DOCKERHUB_USER="tusharthakurepc1"
FRONTEND_IMAGE="${DOCKERHUB_USER}/creator-hub-frontend:latest"

docker pull --platform linux/arm64 "$FRONTEND_IMAGE"

# Stop the old PM2-supervised deployment first — otherwise PM2 just respawns
# the container we're about to remove below.
pm2 delete creator-hub-frontend >/dev/null 2>&1 || true

# Clear any leftover container from a previous run so the name below is free.
# Covers both the old PM2 setup's container name and this script's own.
docker rm -f creator-hub-frontend >/dev/null 2>&1 || true

# pm2 start docker --name creator-hub-frontend --interpreter none -- \
#   run --rm --name creator-hub-frontend-container -p 3001:3001 \
#   --platform linux/arm64 "$FRONTEND_IMAGE"

docker run -d --name creator-hub-frontend -p 3001:3001 "$FRONTEND_IMAGE"

# pm2 save
