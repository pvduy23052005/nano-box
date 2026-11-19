#!/bin/bash
set -e

# ==============================================================================
# Script Khôi Phục Dữ Liệu (Restore) cho Nano Box
# Cách dùng: ./scripts/restore.sh <đường_dẫn_file_mongodb.gz>
# Ví dụ: ./scripts/restore.sh backups/mongodb_2026-11-03_02-00-00.gz
# ==============================================================================

export PATH="$HOME/bin:/usr/local/bin:$PATH"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "LỖI: Vui lòng cung cấp file backup MongoDB cần khôi phục!"
  echo "Cách dùng: $0 <duong_dan_file_backup.gz>"
  echo ""
  echo "Các bản backup hiện có trong thư mục backups:"
  ls -lh "${PROJECT_DIR}/backups"/mongodb_*.gz 2>/dev/null || echo "Chưa có bản backup nào."
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "LỖI: File không tồn tại: $BACKUP_FILE"
  exit 1
fi

# Tự động phát hiện container MongoDB
if docker ps --format '{{.Names}}' | grep -q '^nano-mongodb$'; then
  DB_CONTAINER="nano-mongodb"
elif docker ps --format '{{.Names}}' | grep -q '^nano-box-mongodb$'; then
  DB_CONTAINER="nano-box-mongodb"
else
  DB_CONTAINER="nano-mongodb"
fi

# Nạp biến môi trường database
if [ -f "${PROJECT_DIR}/database/.env" ]; then
  export $(grep -v '^#' "${PROJECT_DIR}/database/.env" | xargs)
fi

AUTH_ARGS=()
if [ -n "$MONGO_INITDB_ROOT_USERNAME" ] && [ -n "$MONGO_INITDB_ROOT_PASSWORD" ]; then
  AUTH_ARGS=(
    --username="$MONGO_INITDB_ROOT_USERNAME"
    --password="$MONGO_INITDB_ROOT_PASSWORD"
    --authenticationDatabase="admin"
  )
fi

echo "================================================================="
echo " CẢNH BÁO: Dữ liệu hiện tại của database sẽ bị ghi đè (--drop)!"
echo " File khôi phục: $BACKUP_FILE"
echo " Container đích: $DB_CONTAINER"
echo "================================================================="
read -p "Bạn có chắc chắn muốn tiếp tục khôi phục? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Đã hủy thao tác khôi phục."
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Đang tiến hành khôi phục MongoDB..."
cat "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" mongorestore \
  "${AUTH_ARGS[@]}" \
  --archive --gzip --drop

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Khôi phục dữ liệu thành công!"
