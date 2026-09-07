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
    | jq -r '.token'
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
docker compose pull

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
CODE=$(curl -s -o /tmp/laravel-mc-teller.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "teller can call /api/make-change" 200 "$CODE" /tmp/laravel-mc-teller.json

CODE=$(curl -s -o /tmp/laravel-mc-customer.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02" -H "Authorization: Bearer $CUSTOMER_TOKEN")
assert_status "customer can call /api/make-change" 200 "$CODE" /tmp/laravel-mc-customer.json

CODE=$(curl -s -o /tmp/laravel-mc-notoken.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02")
assert_status "no token on /api/make-change is rejected" 401 "$CODE" /tmp/laravel-mc-notoken.json

grep -q '4 quarters' /tmp/laravel-mc-teller.json && echo "  PASS: correct change breakdown for \$1.02" || { echo "  FAIL: unexpected change breakdown for \$1.02"; cat /tmp/laravel-mc-teller.json; FAIL=1; }

CODE=$(curl -s -o /tmp/laravel-mc-029.json -w "%{http_code}" "$APP_URL/api/make-change?total=0.29" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "0.29 is accepted" 200 "$CODE" /tmp/laravel-mc-029.json
grep -q '1 quarters 0 dimes 0 nickels 4 pennies' /tmp/laravel-mc-029.json && echo "  PASS: correct change breakdown for \$0.29" || { echo "  FAIL: unexpected breakdown for \$0.29"; cat /tmp/laravel-mc-029.json; FAIL=1; }

CODE=$(curl -s -o /tmp/laravel-mc-missing.json -w "%{http_code}" "$APP_URL/api/make-change" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "missing total is rejected" 400 "$CODE" /tmp/laravel-mc-missing.json

CODE=$(curl -s -o /tmp/laravel-mc-nonsense.json -w "%{http_code}" "$APP_URL/api/make-change?total=nonsense" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "non-numeric total is rejected" 400 "$CODE" /tmp/laravel-mc-nonsense.json

CODE=$(curl -s -o /tmp/laravel-mc-negative.json -w "%{http_code}" "$APP_URL/api/make-change?total=-5.00" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "negative total is rejected" 400 "$CODE" /tmp/laravel-mc-negative.json

echo "Testing /api/panic..."
CODE=$(curl -s -o /tmp/laravel-panic-teller.json -w "%{http_code}" -X POST "$APP_URL/api/panic" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "teller can call /api/panic" 200 "$CODE" /tmp/laravel-panic-teller.json

CODE=$(curl -s -o /tmp/laravel-panic-customer.json -w "%{http_code}" -X POST "$APP_URL/api/panic" -H "Authorization: Bearer $CUSTOMER_TOKEN")
assert_status "customer is denied /api/panic" 403 "$CODE" /tmp/laravel-panic-customer.json

CODE=$(curl -s -o /tmp/laravel-panic-notoken.json -w "%{http_code}" -X POST "$APP_URL/api/panic")
assert_status "no token on /api/panic is rejected" 401 "$CODE" /tmp/laravel-panic-notoken.json

echo "Testing bearer-only authentication (no cookies)..."
CODE=$(curl -s -o /tmp/laravel-cookie-only.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02" --cookie "app.at=$TELLER_TOKEN")
assert_status "cookie-only token is rejected (bearer-only auth)" 401 "$CODE" /tmp/laravel-cookie-only.json

echo "Testing malformed token handling..."
CODE=$(curl -s -o /tmp/laravel-malformed.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02" -H "Authorization: Bearer not-a-valid-jwt")
assert_status "malformed token is rejected" 401 "$CODE" /tmp/laravel-malformed.json

CODE=$(curl -s -o /tmp/laravel-empty-bearer.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02" -H "Authorization: Bearer ")
assert_status "empty bearer token is rejected" 401 "$CODE" /tmp/laravel-empty-bearer.json

CODE=$(curl -s -o /tmp/laravel-garbage.json -w "%{http_code}" "$APP_URL/api/make-change?total=1.02" -H "Authorization: Bearer xyz.abc.123")
assert_status "garbage JWT is rejected" 401 "$CODE" /tmp/laravel-garbage.json

echo "Testing user provisioning (multiple requests from same user)..."
CODE=$(curl -s -o /tmp/laravel-provision-1.json -w "%{http_code}" "$APP_URL/api/make-change?total=2.00" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "first request succeeds (user provisioned)" 200 "$CODE" /tmp/laravel-provision-1.json

CODE=$(curl -s -o /tmp/laravel-provision-2.json -w "%{http_code}" "$APP_URL/api/make-change?total=3.00" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "second request succeeds (no duplicate user issues)" 200 "$CODE" /tmp/laravel-provision-2.json

CODE=$(curl -s -o /tmp/laravel-provision-3.json -w "%{http_code}" "$APP_URL/api/make-change?total=4.00" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "third request succeeds (user provisioning stable)" 200 "$CODE" /tmp/laravel-provision-3.json

echo "Testing JWKS key rotation..."
# Get current JWKS to see existing keys
curl -s "$FA_URL/.well-known/jwks.json" > /tmp/jwks-before.json
BEFORE_KEY_COUNT=$(jq '.keys | length' /tmp/jwks-before.json)
echo "  JWKS has $BEFORE_KEY_COUNT keys before rotation"

# Generate a new RSA key pair in FusionAuth (length is required for RSA)
echo "  Generating new RSA key..."
curl -s -X POST "$FA_URL/api/key/generate" \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": {"algorithm": "RS256", "name": "Test Rotation Key", "length": 2048}}' > /tmp/new-key.json

# Extract the key ID from response
NEW_KEY_ID=$(jq -r '.key.kid' /tmp/new-key.json)
echo "  Generated new key with kid: $NEW_KEY_ID"

# Wait for the key to be available in JWKS
sleep 3

# Verify the new key appears in JWKS
curl -s "$FA_URL/.well-known/jwks.json" > /tmp/jwks-after.json
AFTER_KEY_COUNT=$(jq '.keys | length' /tmp/jwks-after.json)
echo "  JWKS has $AFTER_KEY_COUNT keys after generation"

if [ "$AFTER_KEY_COUNT" -gt "$BEFORE_KEY_COUNT" ]; then
  echo "  PASS: new key added to JWKS"
else
  echo "  FAIL: key count did not increase"
  FAIL=1
fi

# Test that existing tokens still work (JWKS is still valid)
CODE=$(curl -s -o /tmp/laravel-rotation-test.json -w "%{http_code}" "$APP_URL/api/make-change?total=7.00" -H "Authorization: Bearer $TELLER_TOKEN")
assert_status "existing token still works after key generation" 200 "$CODE" /tmp/laravel-rotation-test.json

kill $LOGS_PID 2>/dev/null || true

if [ "$FAIL" -eq 0 ]; then
  echo "All login/authorization checks passed."
  exit 0
else
  echo "Some login/authorization checks failed."
  exit 1
fi
