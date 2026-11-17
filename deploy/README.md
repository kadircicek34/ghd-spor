# GHD Spor — canlı deploy notları
# Caddy tarafı: /root/Gakademi/deploy/Caddyfile içine deploy/Caddyfile.snippet bloğu eklenir.
# Container: sporgla-app (gakademi_default ağı), PocketBase + SPA aynı origin'de :8090.
# Veri: sporgla_pb_data named volume.
#
# İlk kurulum:
#   docker compose -f deploy/docker-compose.yml up -d --build
#   docker exec sporgla-app ./pocketbase superuser upsert <email> <strong-password> --dir=/app/pb_data
#
# Güncelleme:
#   git pull && docker compose -f deploy/docker-compose.yml up -d --build
#
# Yedek:
#   docker run --rm -v sporgla_pb_data:/data -v "$PWD/backups":/backup alpine tar czf /backup/pb-$(date +%F).tgz -C /data .
