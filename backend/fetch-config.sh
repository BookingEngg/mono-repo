#!/bin/sh
set -e  # Exit immediately if a command exits with a non-zero status

# Clone the repo, copy the config, and clean up
git clone github_url /tmp/repo --depth=1
mkdir -p /dist/src/config
cp /tmp/repo/mono-repo/config.prod.json /app/src/config/config.prod.json
rm -rf /tmp/repo

echo "Config successfully placed at /dist/src/config/config.prod.json"
