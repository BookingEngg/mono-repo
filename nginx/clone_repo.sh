#!/bin/bash
set -e

echo "=== Starting clone_repo.sh ==="

if [ -z "$GITHUB_PAT" ]; then
  echo "Error: GITHUB_PAT is not set."
  exit 1
fi

REPO_URL="https://${GITHUB_PAT}@github.com/BookingEngg/mono-repo.git"
CLONE_DIR="/tmp/repo"
TARGET_DIR="/app/repo"

echo "Cloning repo..."
git clone "$REPO_URL" "$CLONE_DIR" --depth=1
echo "Clone completed."

echo "Copying repo to $TARGET_DIR ..."
mkdir -p "$TARGET_DIR"
cp -R "$CLONE_DIR"/* "$TARGET_DIR"

echo "Copy completed successfully."
echo "=== clone_repo.sh finished ==="
