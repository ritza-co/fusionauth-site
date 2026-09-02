#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

LOGS_PID=""

# Seconds to wait for a service to come up before giving up. Without this the
# readiness loops below can hang until the CI job's own time limit.
READINESS_TIMEOUT=300

FA_URL="http://localhost:9011"
APP_URL="http://localhost:3000"
API_KEY="this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works"
APPLICATION_ID="e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"

FAIL=0

cleanup() {
  echo "Cleaning up..."
  [ -n "$LOGS_PID" ] && kill "$LOGS_PID" 2>/dev/null || true
  docker stop laravel-api 2>/dev/null || true
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

# wait_for <description> <command...> - poll until the command succeeds or the
# timeout expires, failing loudly rather than hanging.
wait_for() {
  local description="$1"; shift
  local deadline=$(( SECONDS + READINESS_TIMEOUT ))
  until "$@" > /dev/null 2>&1; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      echo "Timed out after ${READINESS_TIMEOUT}s waiting for ${description}." >&2
      return 1
    fi
    echo "  Waiting for ${description}..."
    sleep 5
  done
  echo "${description} is ready."
}

# FusionAuth answers on its root URL before Kickstart has finished creating the
# application, so both conditions have to be waited on separately.
kickstart_done() {
  curl -sf http://localhost:9011/api/application/e9fdb985-9173-4e01-9d73-ac2d60d1dc8e -H "Authorization: $API_KEY"
}

# The API is protected, so an unauthenticated request returning 401 is what
# tells us it is up and enforcing authentication.
laravel_ready() {
  [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/api/panic 2>/dev/null)" = "401" ]
}

login() {
  local login_id="$1"
  local password="$2"
  curl -s "$FA_URL/api/login" \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"loginId\":\"$login_id\",\"password\":\"$password\",\"applicationId\":\"$APPLICATION_ID\"}" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])"
}

assert_status() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  local body_file="${4:-}"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $description (expected $expected, got $actual)"
  else
    echo "  FAIL: $description (expected $expected, got $actual)"
    if [ -n "$body_file" ] && [ -f "$body_file" ]; then
      echo "  --- Response body ---"
      cat "$body_file"
      echo ""
      echo "  --- End response body ---"
    fi
    FAIL=1
  fi
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Installing Composer dependencies for complete-application..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app composer:2.10 composer install --no-interaction --quiet

echo "Syntax-checking complete-application PHP files..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app composer:2.10 sh -c \
  "find app config routes -name '*.php' -print0 | xargs -0 -n1 php -l"

echo "Pulling latest FusionAuth image..."
#docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" curl -sf http://localhost:9011

echo "Waiting for Kickstart to finish (application to exist)..."
wait_for "Kickstart" kickstart_done

echo "Starting Laravel API app..."
docker run --network host --name laravel-api --rm -v "$PROJECT_DIR/complete-application":/app -w /app composer:2.10 sh -c \
  "composer install --no-interaction && php artisan migrate:fresh --force && php artisan serve --host=0.0.0.0 --port=3000" &
until docker inspect laravel-api > /dev/null 2>&1; do
  sleep 1
done
docker logs -f laravel-api &
LOGS_PID=$!

echo "Waiting for Laravel API app to be ready..."
wait_for "Laravel API app" laravel_ready

echo "Logging in as teller@example.com..."
TELLER_TOKEN=$(login "teller@example.com" "password")

echo "Logging in as customer@example.com..."
CUSTOMER_TOKEN=$(login "customer@example.com" "password")

echo "Testing /api/make-change..."
CODE=$(curl -s -o /tmp/laravel-mc-teller.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02" --cookie "app.at=$TELLER_TOKEN")
assert_status "teller can call /api/make-change" 200 "$CODE" /tmp/laravel-mc-teller.json

CODE=$(curl -s -o /tmp/laravel-mc-customer.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02" --cookie "app.at=$CUSTOMER_TOKEN")
assert_status "customer can call /api/make-change" 200 "$CODE" /tmp/laravel-mc-customer.json

CODE=$(curl -s -o /tmp/laravel-mc-notoken.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02")
assert_status "no token on /api/make-change is rejected" 401 "$CODE" /tmp/laravel-mc-notoken.json

grep -q '4 quarters' /tmp/laravel-mc-teller.json && echo "  PASS: correct change breakdown for \$1.02" || { echo "  FAIL: unexpected change breakdown for \$1.02"; cat /tmp/laravel-mc-teller.json; FAIL=1; }

CODE=$(curl -s -o /tmp/laravel-mc-029.json -w "%{http_code}" "$APP_URL/api/make-change?total=0.29" --cookie "app.at=$TELLER_TOKEN")
assert_status "0.29 is accepted" 200 "$CODE" /tmp/laravel-mc-029.json
grep -q '1 quarters 0 dimes 0 nickels 4 pennies' /tmp/laravel-mc-029.json && echo "  PASS: correct change breakdown for \$0.29" || { echo "  FAIL: unexpected breakdown for \$0.29"; cat /tmp/laravel-mc-029.json; FAIL=1; }

CODE=$(curl -s -o /tmp/laravel-mc-missing.json -w "%{http_code}" "$APP_URL/api/make-change" --cookie "app.at=$TELLER_TOKEN")
assert_status "missing total is rejected" 400 "$CODE" /tmp/laravel-mc-missing.json

CODE=$(curl -s -o /tmp/laravel-mc-nonsense.json -w "%{http_code}" "$APP_URL/api/make-change?total=nonsense" --cookie "app.at=$TELLER_TOKEN")
assert_status "non-numeric total is rejected" 400 "$CODE" /tmp/laravel-mc-nonsense.json

CODE=$(curl -s -o /tmp/laravel-mc-negative.json -w "%{http_code}" "$APP_URL/api/make-change?total=-5.00" --cookie "app.at=$TELLER_TOKEN")
assert_status "negative total is rejected" 400 "$CODE" /tmp/laravel-mc-negative.json

echo "Testing /api/panic..."
CODE=$(curl -s -o /tmp/laravel-panic-teller.json -w "%{http_code}" -X POST "$APP_URL/api/panic" --cookie "app.at=$TELLER_TOKEN")
assert_status "teller can call /api/panic" 200 "$CODE" /tmp/laravel-panic-teller.json

CODE=$(curl -s -o /tmp/laravel-panic-customer.json -w "%{http_code}" -X POST "$APP_URL/api/panic" --cookie "app.at=$CUSTOMER_TOKEN")
assert_status "customer is denied /api/panic" 403 "$CODE" /tmp/laravel-panic-customer.json

CODE=$(curl -s -o /tmp/laravel-panic-notoken.json -w "%{http_code}" -X POST "$APP_URL/api/panic")
assert_status "no token on /api/panic is rejected" 401 "$CODE" /tmp/laravel-panic-notoken.json

kill $LOGS_PID 2>/dev/null || true

if [ "$FAIL" -eq 0 ]; then
  echo "All login/authorization checks passed."
  exit 0
else
  echo "Some login/authorization checks failed."
  exit 1
fi
