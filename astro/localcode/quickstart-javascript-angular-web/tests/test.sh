#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Initialised up front so cleanup stays safe under `set -u` when compose
# validation, pulling or startup fails before the app is launched.
# Otherwise cleanup aborts before docker compose down.
APP_PID=""

cleanup() {
  echo "Cleaning up..."
  [ -n "$APP_PID" ] && kill "$APP_PID" 2>/dev/null || true
  docker stop app 2>/dev/null || true
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose config > /dev/null

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Waiting for FusionAuth to be ready..."
timeout 480 bash -c 'until curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "<title>Login"; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done'
echo "FusionAuth is ready."

echo "Starting Angular app..."
docker run --network host --name app --rm -v "$PROJECT_DIR/complete-application":/app -w /app node:26 sh -c "npm install && npx ng serve --host 0.0.0.0" &
APP_PID=$!

echo "Waiting for Angular app to be ready..."
timeout 120 bash -c 'until curl -sf http://localhost:4200 > /dev/null 2>&1; do
  echo "  Waiting for Angular app..."
  sleep 2
done'
echo "Angular app is ready."

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
