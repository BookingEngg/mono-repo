#!/bin/bash
set -e

DOCKERHUB_USER="tusharthakurepc1"
BACKEND_IMAGE="${DOCKERHUB_USER}/backend:latest"

docker pull --platform linux/arm64 "$BACKEND_IMAGE"

# Stop the old PM2-supervised deployment first — otherwise PM2 just respawns
# the container we're about to remove below.
pm2 delete backend >/dev/null 2>&1 || true

# Clear any leftover container from a previous run so the name below is free.
# Covers both the old PM2 setup's container name and this script's own.
docker rm -f backend >/dev/null 2>&1 || true

# pm2 start docker --name backend --interpreter none -- \
#   run --rm --name backend-container -p 8080:8080 \
#   --platform linux/arm64 "$BACKEND_IMAGE"

docker run -d --name backend -p 8080:8080 "$BACKEND_IMAGE"

# pm2 save
