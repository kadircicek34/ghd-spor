# GHD Spor — Yönetici Kılavuzu

## Otomatik üyelik onayı

Üyelikler **manuel onay gerektirmez**. Üye başvuru formunu doldurup e-Devlet öğrenci belgesini veya diplomasını yüklediği anda backend hook'u hesabı otomatik olarak `approved` yapar ve üye panele girer.

- Belge yüklenmezse/başarısız olursa hesap `pending` kalır; üye durum ekranından yeniden yükleyebilir.
- Eski `pending` kayıtlar için `1794900040_auto_approve_members_with_documents.js` belgesi olanları otomatik onaylar.
- `/admin/uyeler` ekranı artık **istisnai durumlar** içindir: yanlış/şüpheli belgeyi reddetme, üyeliği iptal etme veya manuel düzeltme.

### İstisnai inceleme

1. **https://spor.globalhukukcular.com/auth?mode=login** ile yönetici girişi.
2. **Admin → Üyeler** (`/admin/uyeler`).
3. Başvuru detayında e-posta, doğum tarihi, hukuk statüsü ve e-Devlet belgesini görüntüleyin.
4. Gerekirse **Reddet** ile gerekçe yazın; üye durum ekranında notu görür.
5. Onay/red `membership_status`, `membership_note`, `approved_at` alanlarını günceller.

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
- e-Devlet belgesi yüklendiği anda üyelik otomatik onaylanır; manuel onay beklenmez.
- Otomatik onay dosya formatı/boyutu ve yükleme başarısına dayanır; belge içeriği ayrıca doğrulanmaz. Şüpheli başvuruları reddedebilirsiniz.
- Onaylanmamış hesaplar API ve arayüz düzeyinde engellenir.
- e-Devlet belgesi yalnızca üyelik doğrulaması için kullanılır; üyelik sona erdiğinde veya silme talebinde kaldırılır.

## Destek

- E-posta: **info@globalhukukcular.com**
- Dernek: https://globalhukukcular.com
