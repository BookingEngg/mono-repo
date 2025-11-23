#!/bin/bash
set -e

FRONTEND_PATH="/app/repo/frontend"

if [ ! -d "$FRONTEND_PATH" ]; then
  echo "⚠️ No frontend directory found at $FRONTEND_PATH. Skipping build."
  exit 0
fi

echo "📦 Installing frontend dependencies..."
cd "$FRONTEND_PATH"
npm install

echo "🏗️ Building frontend..."
npm run build

echo "✅ Frontend build completed."
