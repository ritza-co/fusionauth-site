#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cleanup() {
  echo "Cleaning up..."
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

echo "Pulling latest images..."
cd "$PROJECT_DIR"
docker compose pull

echo "Starting containers..."
cd "$PROJECT_DIR"
docker compose up -d

echo "Waiting for FusionAuth to be ready..."
until curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "Login | FusionAuth"; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done
echo "FusionAuth is ready."

echo "Waiting for Drupal to be ready..."
until curl -sf http://localhost > /dev/null 2>&1; do
  echo "  Waiting for Drupal..."
  sleep 5
done
echo "Drupal is ready."

echo "Setting up Drupal database..."
cd "$PROJECT_DIR/complete-application"
docker run --rm --init -v .:/app -w /app composer:2.6 composer install --ignore-platform-req=ext-gd
./setupDrupal.sh

echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --add-host=host.docker.internal:host-gateway --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "timeout 120 npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
