# GHD Spor — Yönetici Kılavuzu

## Dernek yöneticisi (üyelik onayı)

1. **https://spor.globalhukukcular.com/auth?mode=login** adresinden yönetici hesabıyla giriş yapın.
2. Sol menüden **Admin → Üyeler** (`/admin/uyeler`) sayfasına gidin.
3. **Bekleyen** sekmesinde başvuruları görürsünüz:
   - Ad soyad, e-posta, doğum tarihi, hukuk statüsü, telefon/şehir
   - **e-Devlet belgesini aç** (yalnızca yetkili yöneticiler erişebilir)
4. Belgeyi inceledikten sonra:
   - **Onayla** → hesap `approved` olur, üye uygulamaya girebilir.
   - **Reddet** → red notu yazılır; üye durum ekranında notu görür.
5. Onay/red işlemi `membership_status`, `membership_note` ve `approved_at` alanlarını günceller. Belgesi olmayan başvuru **onaylanamaz**.

> Üyelik durumu yalnızca `role=admin` hesaplar ve PocketBase superuser'ı tarafından değiştirilebilir. Normal üyeler kendi doğum tarihi/hukuk statüsü/KVKK onayı/üyelik durumunu değiştiremez.

## PocketBase yönetim paneli

- Adres: **https://spor.globalhukukcular.com/_/**
- Superuser bilgileri deploy sırasında oluşturulur ve güvenli biçimde saklanır.
- Gelişmiş işlemler (koleksiyon şeması, yedekleme, loglar) buradan yapılır.
- `membership_documents` dosyaları **protected**; doğrudan URL ile değil, kısa ömürlü dosya token'ı ile açılır.

## Yedekleme

```bash
docker run --rm -v sporgla_pb_data:/data -v "$PWD/backups":/backup alpine \
  tar czf /backup/pb-$(date +%F-%H%M).tgz -C /data .
```

Geri yükleme için container'ı durdurup volume içeriğini yedekten geri alın; ardından `docker compose up -d`.

## Üyelik politikası

- Platform yalnızca Global Hukukçular Derneği üyelerine açıktır.
- Başvuruda zorunlu: doğum tarihi, hukuk öğrencisi/mezunu bilgisi, e-Devlet öğrenci belgesi veya diploma, KVKK onayı.
- Onaylanmamış hesaplar API ve arayüz düzeyinde engellenir.
- e-Devlet belgesi yalnızca üyelik doğrulaması için kullanılır; üyelik sona erdiğinde veya silme talebinde kaldırılır.

## Destek

- E-posta: **info@globalhukukcular.com**
- Dernek: https://globalhukukcular.com
