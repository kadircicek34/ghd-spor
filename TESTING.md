# Test ve Kabul Kanıtları

> Son doğrulama: 17 Kasım 2026 — canlı ortam `https://spor.globalhukukcular.com`

## Otomatik testler

```bash
pnpm --filter @calistenia/web typecheck   # PASS
pnpm --filter @calistenia/web build       # PASS
pnpm --filter @calistenia/core test       # 2746/2746 PASS
pnpm --filter @calistenia/web test        # 675/675 PASS
```

## Üyelik akışı (gerçek PocketBase, Playwright)

| Adım | Sonuç |
|---|---|
| Landing açılışı (1440px / 390px) | ✅ HTTP 200, yatay taşma yok |
| Başvuru formu zorunlu alanları | ✅ doğum tarihi, hukuk statüsü, e-Devlet belgesi, KVKK |
| Geçersiz dosya türü / gelecekte tarih | ✅ Türkçe hata |
| Başvuru gönderimi (users + auth + belge) | ✅ `pending` |
| Pending API erişimi (`/api/collections/programs/records`) | ✅ 403 `membership_pending` |
| Pending kullanıcı doğrudan URL (`/nutrition`, `/admin/uyeler`) | ✅ durum ekranı |
| Antrenman ekranı `/workout?day=mar` | ✅ tamamen Türkçe (FAZ/ANTRENMAN GÜNÜ/SAL/BAŞLA) |
| Logged-out public app rotaları (`/race`, `/blog`, `/shared`, `/features`) | ✅ landing'e redirect |
| Legacy statik marketing kabukları (`/blog/*`, `/en/*`, `/es/*`) | ✅ Caddy 302 → `/` |
| `robots.txt` / `sitemap.xml` | ✅ yalnız GHD domaini; upstream URL yok |
| Admin onay sonrası UX | ✅ sekme/selection korunur, başarı mesajı kalır |
| What's New (TR) | ✅ Türkçe placeholder; Calistenia/eski changelog yok |
| Legacy `membership_status` backfill | ✅ boş → pending; legacy admin → approved |
| Anonim `/api/programs/{id}/public` | ✅ 404 |
| Gelecekteki doğum tarihi (API) | ✅ 400 |
| Admin `/admin/uyeler` | ✅ başvuru + iletişim e-postası + belge |
| Belge görüntüleme (protected, file token) | ✅ HTTP 200 |
| Admin onayı | ✅ `approved`, üye paneli açıldı; başarı mesajı görünür |
| Belgesiz onay | ✅ 400 |
| Kullanıcı kendi `membership_status` yükseltmesi | ✅ 403 |
| Süper kullanıcı belgesiz normal üye onayı | ✅ 400 (bootstrap admin istisnası) |
| Belge gizliliği: başka üye / tokensız | ✅ 404 |

## Canlı ortam

- DNS: `spor.globalhukukcular.com` → `169.58.198.19` (A kaydı)
- TLS: Let's Encrypt, otomatik yenileme
- Caddy: `spor.globalhukukcular.com` → `sporgla-app:8090`
- Container health: `healthy`
- `/api/health`: `200 {"message":"API is healthy.","code":200}`
- Public yüzey: landing, `/auth`, `/legal`; diğer rotalar üyelik gerektirir.

## Test dosyaları

- `docs/screenshots/final-landing-desktop.png`
- `docs/screenshots/final-landing-mobile.png`
- `docs/screenshots/final-membership-form.png`
- `docs/screenshots/final-pending.png`
- `docs/screenshots/final-admin-members.png`
- `docs/screenshots/final-member-dashboard.png`
- `docs/screenshots/final-workout-tr.png`
- `docs/screenshots/final-whatsnew-tr.png`

## Not

Canlı test kullanıcıları doğrulama sonrasında silinir. Üretimde yalnızca dernek yöneticisi hesapları bırakılır.
