#!/bin/bash
set -e

# ============================================================
# deploy.sh — Production Deploy Script
# Usage: bash deploy.sh
# ============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$ROOT_DIR/public"

# Load .env values jika tersedia
if [ -f "$ROOT_DIR/.env" ]; then
  export $(grep -v '^#' "$ROOT_DIR/.env" | grep -E '^(BE_PORT|FE_PORT|FE_VITE_API_URL|FE_BASE_URL)=' | xargs)
fi

BE_PORT="${BE_PORT:-3000}"
FE_PORT="${FE_PORT:-80}"
# Deteksi IP — kompatibel di Linux & macOS
if command -v hostname &> /dev/null && hostname -I &> /dev/null 2>&1; then
  SERVER_IP="$(hostname -I | awk '{print $1}')"
elif command -v ipconfig &> /dev/null; then
  SERVER_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr eth0 2>/dev/null || echo 'localhost')"
else
  SERVER_IP="$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)"
fi
SERVER_IP="${SERVER_IP:-localhost}"

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ============================================================
# 1. Install dependencies
# ============================================================
log "Installing dependencies..."
bun install || fail "bun install failed"

# ============================================================
# 2. Build (type-check backend + build frontend)
# ============================================================
log "Building project..."
bun run build || fail "Build failed"

# ============================================================
# 3. Run database migrations
# ============================================================
log "Running database migrations..."
bun run db:migrate || fail "Database migration failed"

# ============================================================
# 4. Copy frontend build to /public
# ============================================================
log "Copying frontend build to $PUBLIC_DIR..."
rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR"
cp -r "$ROOT_DIR/apps/frontend/dist/." "$PUBLIC_DIR/"
log "Frontend assets copied to $PUBLIC_DIR"

# ============================================================
# 4b. Generate .htaccess for SPA routing (refresh fallback)
# ============================================================
log "Generating .htaccess file in $PUBLIC_DIR..."
BASE_PATH="${FE_BASE_URL:-/}"
# Ensure base path starts with /
if [[ ! "$BASE_PATH" =~ ^/ ]]; then
  BASE_PATH="/$BASE_PATH"
fi
# Ensure base path ends with /
if [[ ! "$BASE_PATH" =~ /$ ]]; then
  BASE_PATH="$BASE_PATH/"
fi

cat <<EOF > "$PUBLIC_DIR/.htaccess"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase $BASE_PATH
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . ${BASE_PATH}index.html [L]
</IfModule>
EOF
log ".htaccess successfully generated with RewriteBase $BASE_PATH"

# ============================================================
# 5. Start or restart backend with PM2
# ============================================================
if pm2 list | grep -q "trading-backend"; then
  log "Restarting existing PM2 process: trading-backend..."
  pm2 restart trading-backend
else
  log "Starting backend with PM2 for the first time..."
  pm2 start "bun run --cwd $ROOT_DIR/apps/backend start" \
    --name "trading-backend" \
    --cwd "$ROOT_DIR"

  log "Saving PM2 process list..."
  pm2 save

  log "Setting up PM2 startup script..."
  pm2 startup
fi

# ============================================================
# Done
# ============================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅  DEPLOY BERHASIL                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
FRONTEND_URL="${FE_BASE_URL:-http://${SERVER_IP}:${FE_PORT}}"
echo -e "  ${YELLOW}🌐 Frontend${NC}   → ${FRONTEND_URL}"
echo -e "  ${YELLOW}⚙️  Backend API${NC} → http://${SERVER_IP}:${BE_PORT}"
echo ""
echo -e "  ${YELLOW}📁 Frontend Dir${NC} : $PUBLIC_DIR"
echo -e "  ${YELLOW}📋 PM2 Process${NC}  : trading-backend"
echo ""
echo -e "  Cek log backend  : ${GREEN}pm2 logs trading-backend${NC}"
echo -e "  Monitor proses   : ${GREEN}pm2 monit${NC}"
echo ""
pm2 status
