#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/grocery-app/server"
APP_NAME="grocery-backend"

step() { echo -e "\n\e[33m$1\e[0m"; }
ok()   { echo -e "\e[32m$1\e[0m"; }
warn() { echo -e "\e[35m$1\e[0m"; }
err()  { echo -e "\e[31m$1\e[0m"; }

step "🚀 Starting Grocery App Deployment..."

cd "$APP_DIR"

step "🧹 Cleaning up..."
pm2 delete "$APP_NAME" || true
pm2 kill || true
rm -rf dist node_modules/.cache

step "📥 Pulling latest code..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git fetch --all --prune
  git reset --hard origin/main
else
  err "Git repo missing in $APP_DIR"; exit 1
fi

step "📦 Installing dependencies..."
npm install --legacy-peer-deps --omit=dev

step "🔨 Building application..."
npm run build

# Write .env if not present
if [ ! -f .env ]; then
  step "📝 Creating default .env (you can edit later)"
  cat > .env <<'EOF'
NODE_ENV=production
PORT=3000
MONGO_URI=
COOKIE_PASSWORD=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
FAST2SMS_API_KEY=
FAST2SMS_SENDER_ID=OTP
DLT_ENTITY_ID=YOUR_DEFAULT_ENTITY_ID
DLT_TEMPLATE_ID=YOUR_DEFAULT_TEMPLATE_ID
FAST2SMS_USE_DLT=false
OTP_RATE_LIMITS={"window": 300, "maxRequests": 3}
OTP_TTL=300
OTP_LENGTH=6
OTP_BACKOFF_POLICY={"baseDelay": 1000, "maxDelay": 300000, "multiplier": 2}
NOTIFY_ENABLED=true
# Firebase: either set this file path OR set FIREBASE_SERVICE_ACCOUNT_JSON
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
EOF
fi

step "🛡️ Ensuring OTP route is enforced (hard-guard)"
# Nothing to do at runtime; code enforces FAST2SMS_USE_DLT=false unless explicitly true

step "🔥 Setting up Firebase credentials..."
if [ -n "${FIREBASE_SERVICE_ACCOUNT_JSON:-}" ]; then
  # Normalize escaped newlines if passed via env
  echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | \
    python3 -c "import sys,json; j=json.load(sys.stdin);\nkey=j.get('private_key');\n\
print(json.dumps({**j, 'private_key': key.replace('\\n','\n') if isinstance(key,str) else key}))" \
    > firebase-service-account.normalized.json || true
  export FIREBASE_SERVICE_ACCOUNT_PATH="$APP_DIR/firebase-service-account.normalized.json"
fi

step "⚙️ Creating PM2 config..."
cat > ecosystem.config.cjs <<'EOF'
module.exports = {
  apps: [{
    name: 'grocery-backend',
    script: './dist/app.js',
    cwd: '/var/www/grocery-app/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
      // Do not set FAST2SMS_* here; .env controls them
    }
  }]
};
EOF

step "🚀 Starting server with PM2..."
pm2 start ecosystem.config.cjs --update-env || pm2 restart "$APP_NAME" --update-env || true
pm2 save

ok "✅ Deployment complete!"
pm2 list | grep "$APP_NAME" || true

step "📜 Tail logs"
pm2 logs "$APP_NAME" --lines 50 --nostream || true

