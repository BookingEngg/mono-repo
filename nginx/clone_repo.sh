#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Ensure the GitHub URL is provided
if [ -z "$GITHUB_PAT" ]; then
  echo "Error: GITHUB_PAT is not set."
  exit 1
fi

MONO_REPO_GITHUB_URL="https://${GITHUB_PAT}@github.com/BookingEngg/mono-repo.git"
# MONO_REPO_GITHUB_URL="https://${GITHUB_PAT}@github.com/tusharthakurepc1/secrets"

# Clone the repo, and clean up
git clone "$MONO_REPO_GITHUB_URL" /tmp/repo --depth=1

# Copy the prod config
# mkdir -p src/config
# cp /tmp/repo/mono-repo/backend/config.prod.json src/config/config.prod.json
# Copy the nginx config to shared folder
# mkdir -p /app/shared
# cp /tmp/repo/mono-repo/nginx.conf /app/shared/nginx.conf

# Remove the secret cloned repo
# rm -rf /tmp/repo

echo "Config successfully placed at /dist/src/config/config.prod.json"
