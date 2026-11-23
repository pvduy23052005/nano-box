#!/bin/bash
set -e

# ==============================================================================
# Script Backup Tự Động cho Nano Box trên EC2
# ==============================================================================

# 1. Cấu hình đường dẫn & biến môi trường
export PATH="$HOME/bin:/usr/local/bin:$PATH"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_FILE="${BACKUP_DIR}/mongodb_${TIMESTAMP}.gz"
CONFIG_ARCHIVE="${BACKUP_DIR}/configs_${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

# Tự động phát hiện container MongoDB (nano-mongodb hoặc nano-box-mongodb)
if docker ps --format '{{.Names}}' | grep -q '^nano-mongodb$'; then
  DB_CONTAINER="nano-mongodb"
elif docker ps --format '{{.Names}}' | grep -q '^nano-box-mongodb$'; then
  DB_CONTAINER="nano-box-mongodb"
else
  # Mặc định theo docker-compose.production.yml
  DB_CONTAINER="nano-mongodb"
fi

# Nạp biến môi trường database nếu có cấu hình tài khoản
if [ -f "${PROJECT_DIR}/database/.env" ]; then
  export $(grep -v '^#' "${PROJECT_DIR}/database/.env" | xargs)
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Bắt đầu quy trình sao lưu Nano Box ==="
echo "Thư mục dự án: ${PROJECT_DIR}"
echo "Container DB: ${DB_CONTAINER}"

# 2. Backup MongoDB
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 1. Đang sao lưu cơ sở dữ liệu MongoDB..."

AUTH_ARGS=()
if [ -n "$MONGO_INITDB_ROOT_USERNAME" ] && [ -n "$MONGO_INITDB_ROOT_PASSWORD" ]; then
  AUTH_ARGS=(
    --username="$MONGO_INITDB_ROOT_USERNAME"
    --password="$MONGO_INITDB_ROOT_PASSWORD"
    --authenticationDatabase="admin"
  )
fi

docker exec "$DB_CONTAINER" mongodump "${AUTH_ARGS[@]}" --archive --gzip > "$ARCHIVE_FILE"

if [ -s "$ARCHIVE_FILE" ]; then
  FILE_SIZE=$(ls -lh "$ARCHIVE_FILE" | awk '{print $5}')
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] -> Backup DB thành công: ${ARCHIVE_FILE} (${FILE_SIZE})"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] -> LỖI: File backup DB rỗng!"
  exit 1
fi

# 3. Backup file cấu hình & SSL (nén lại các file .env và thư mục quan trọng)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 2. Đang sao lưu cấu hình (.env, nginx.conf, ssl)..."
tar -czf "$CONFIG_ARCHIVE" \
  -C "$PROJECT_DIR" \
  backend/.env \
  frontend/.env \
  database/.env \
  monitoring/.env \
  nginx.conf \
  ssl 2>/dev/null || true

if [ -f "$CONFIG_ARCHIVE" ]; then
  CONFIG_SIZE=$(ls -lh "$CONFIG_ARCHIVE" | awk '{print $5}')
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] -> Sao lưu cấu hình thành công: ${CONFIG_ARCHIVE} (${CONFIG_SIZE})"
fi

# 4. Dọn dẹp bản backup cũ trên EC2 (giữ lại trong vòng 7 ngày)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 3. Dọn dẹp các bản backup cũ hơn 7 ngày trên server..."
find "$BACKUP_DIR" -type f \( -name "mongodb_*.gz" -o -name "configs_*.tar.gz" \) -mtime +7 -delete

# 5. Đồng bộ lên Cloudflare R2 (nếu rclone đã được cấu hình remote 'r2')
if command -v rclone &> /dev/null && rclone listremotes | grep -q '^r2:'; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 4. Đang đồng bộ bản backup lên Cloudflare R2 (bucket: nano-box/backups)..."
  rclone sync "$BACKUP_DIR" r2:nano-box/backups --exclude "*.log"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] -> Đồng bộ lên Cloudflare R2 hoàn tất."
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 4. Bỏ qua R2: Chưa cài rclone hoặc chưa thiết lập remote 'r2'."
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Hoàn tất quy trình sao lưu! ==="
