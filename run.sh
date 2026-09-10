#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
ENV_FILE="$PROJECT_ROOT/backend/.env"
ENV_EXAMPLE="$PROJECT_ROOT/backend/.env.example"
CHECK_ONLY=false

if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=true
elif [[ $# -gt 0 ]]; then
  echo "Usage: ./run.sh [--check]" >&2
  exit 2
fi

fail() {
  echo "[TGMS] Error: $1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$2"
}

require_command node "Node.js 20.19 or newer is required: https://nodejs.org/"
require_command npm "npm is required and is normally installed with Node.js."
require_command java "Java 17 or newer is required."

node -e '
const current = process.versions.node.split(".").map(Number);
const minimum = [20, 19, 0];
const supported = current.some((value, index) => value > minimum[index]
  && current.slice(0, index).every((part, partIndex) => part === minimum[partIndex]))
  || current.every((value, index) => value === minimum[index]);
if (!supported) {
  console.error(`[TGMS] Error: Node.js 20.19 or newer is required; found ${process.versions.node}.`);
  process.exit(1);
}
'

cd "$PROJECT_ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  [[ -f "$ENV_EXAMPLE" ]] || fail "Missing backend/.env.example."
  if [[ "$CHECK_ONLY" == true ]]; then
    fail "backend/.env is missing. Run ./run.sh once to create it, then configure the database credentials."
  fi
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "[TGMS] Created backend/.env from backend/.env.example."
  echo "[TGMS] Set DB_PASSWORD and a JWT_SECRET of at least 32 bytes, then run this script again."
  exit 1
fi

if grep -Eq '^DB_PASSWORD=$|^DB_PASSWORD=replace_with_local_password$' "$ENV_FILE"; then
  fail "Set DB_PASSWORD in backend/.env before starting TGMS."
fi

if grep -Eq '^JWT_SECRET=$|^JWT_SECRET=replace_with_' "$ENV_FILE"; then
  fail "Set JWT_SECRET in backend/.env to a random value of at least 32 bytes."
fi

if [[ ! -d "$PROJECT_ROOT/node_modules/concurrently" ]]; then
  if [[ "$CHECK_ONLY" == true ]]; then
    fail "Node.js dependencies are missing. Run npm ci before using --check."
  fi
  echo "[TGMS] Installing dependencies from package-lock.json..."
  npm ci
fi

node scripts/check-smtp.mjs backend/.env ||
  fail "Authentication email cannot be delivered. Correct the SMTP settings in backend/.env."

if command -v mysqladmin >/dev/null 2>&1 && ! mysqladmin ping --silent >/dev/null 2>&1; then
  echo "[TGMS] Warning: MySQL did not answer a local ping. Start MySQL before using database features." >&2
fi

if [[ "$CHECK_ONLY" == true ]]; then
  echo "[TGMS] Environment check passed."
  exit 0
fi

echo "[TGMS] Starting LankaWear Apparel..."
echo "[TGMS] Frontend: http://localhost:5173"
echo "[TGMS] API:      http://localhost:3000/api/health"
echo "[TGMS] Press Ctrl+C to stop both servers."

exec npm run dev
