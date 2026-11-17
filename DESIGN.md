# GHD Spor — Tasarım Brief'i

## Marka
- Ad: **Global Hukukçular Derneği — Spor Platformu** (kısa: **GHD Spor**)
- Referans: https://globalhukukcular.com
- Logo: `apps/web/public/logo-ghd.jpg` (bronz madalyon: adalet terazisi + dünya + kitap)
- Kurumsal motto: **Justitia et Sapientia** (Adalet ve Bilgelik)
- Ses tonu: ağırbaşlı, prestijli, davetkâr; hukukçulara hitap eden sofistike bir dil. Abartılı fitness sloganları yok.

## Renk Paleti (referans siteyle uyumlu)
Referans `globalhukukcular.com` kimliği: krem zemin + lacivert + altın.

| Rol | Renk |
|---|---|
| Krem zemin (landing) | `#FBF9F4` |
| Lacivert (ana metin/CTA) | `#0F1E3D` |
| Soluk lacivert | `#47536B` |
| Koyu lacivert-siyah (spor bölümleri) | `#0B1526` |
| Obsidyen (uygulama içi) | `#080806` / `#0B0B08` |
| Kömür kart | `#12110D` / `#17150F` |
| Bronz | `#A87F45` / `#B08D57` |
| Altın (ana vurgu) | `#C9A227` / `#D4AF37` |
| Şampanya (metin) | `#F2E7CF` |
| Krem | `#F7F2E7` |
| Soluk altın metin | `#C9BFA9` |
| Çizgi | `rgba(176,141,87,0.25)` |
| Hata | `#E06A5A` |
| Başarı | `#7FAE8B` |

Landing krem/lacivert/altın ağırlıklı; en az bir özellik bölümü koyu lacivert. Auth/üyelik durum ve uygulama içi ekranlar koyu tema kalabilir. Altın üzerine **koyu** metin kullanılacak (kontrast). Beyaz üzerine altın metin kullanılmayacak.

## Tipografi
- Display / hero: **Cormorant Garamond** (600–700, gerekirse italic) — hukuki zarafet.
- Gövde / UI: **DM Sans**.
- Rakam/etiket: Bebas Neue (mevcut) veya DM Sans uppercase, geniş harf aralığı.
- Google Fonts linki `apps/web/index.html` içine eklenecek.

## Landing Page Bölümleri (Türkçe)
1. **Üst duyuru çubuğu**: "Yalnızca Global Hukukçular Derneği üyelerine özel"
2. **Navbar**: madalyon logo + `GHD SPOR`; linkler: Program, Beslenme, Topluluk, Üyelik; sağda "Üye Girişi" (outline) ve "Üyelik Başvurusu" (altın buton). Mobilde hamburger.
3. **Hero**:
   - Eyebrow: `GLOBAL HUKUKÇULAR DERNEĞİ · SPOR PLATFORMU`
   - H1: **Hukukun disiplini, sporun gücü.**
   - Alt metin: "Dernek üyelerine özel antrenman, beslenme ve kardiyo programları. Hukukçu kimliğinizle başvurun, e-Devlet belgenizle doğrulanın, forma girin."
   - CTA: "Üyelik Başvurusu" (altın), "Üye Girişi" (ghost)
   - Güven notu: "Başvurular e-Devlet öğrenci belgesi veya hukuk fakültesi diploması ile doğrulanır."
   - Sağda altın halkalı madalyon logo, ışık huzmesi, yüzen bilgi kartları: "Yapılandırılmış programlar", "Üyeye özel erişim", "Veri gizliliği".
4. **Güven şeridi**: "Disiplinli antrenman · Hukukçu topluluğu · Üyelik kontrollü erişim · KVKK uyumlu"
5. **Neden GHD Spor?** 3 kart: "Hukukçu disiplini", "Üyeye özel topluluk", "Gizlilik önce gelir".
6. **Özellikler** (6 kart): Antrenman programları, Beslenme takibi, Kardiyo & GPS, İlerleme analizi, Topluluk & liderlik tablosu, Hatırlatıcılar & rozetler.
7. **Üyelik süreci** 4 adım: 1 Başvuru formu (kimlik + doğum tarihi + hukuk statüsü), 2 e-Devlet belgesi (öğrenci belgesi/diploma), 3 Dernek onayı, 4 Kişisel panele erişim.
8. **Alıntı bölümü**: "Justitia et Sapientia" — "Adalet ve bilgelik; bedenin ve zihnin disiplinini gerektirir."
9. **SSS** (accordion): Kimler başvurabilir? / Hangi belge gerekli? / Onay ne kadar sürer? / Verilerim nasıl korunuyor? / Platform ücretli mi?
10. **Son CTA**: "Forma girmeye hazır mısınız?" + butonlar.
11. **Footer**: logo, dernek adı, globalhukukcular.com, iletişim, KVKK/legal, "Yalnızca dernek üyelerine özeldir", açık kaynak atıf (Calistenia, MIT) küçük yazı.

## Üyelik Başvuru Formu (Türkçe)
Zorunlu alanlar:
- Ad Soyad
- E-posta
- Şifre + Şifre tekrar (min 8)
- **Doğum tarihi** (date, gelecekte olamaz)
- **Hukuk statüsü** (select): `Hukuk Fakültesi Öğrencisi` / `Hukuk Fakültesi Mezunu`
- **e-Devlet belgesi** (dosya): PDF/JPG/PNG, max 10 MB; belge türü: `Öğrenci Belgesi` / `Diploma`
- **KVKK onayı** (checkbox, zorunlu)
Opsiyonel: Telefon, Şehir.
Buton: "Başvuruyu Gönder". Başarıda: "Başvurunuz alındı. Dernek yönetimi belgenizi inceledikten sonra hesabınız aktifleşecek." ve durum ekranı.

## Üyelik Durum Ekranı
- Onay bekliyor: altın saat ikonu, "Başvurunuz inceleniyor", süreç adımları, belge durumu, çıkış.
- Reddedildi: sebep (varsa), dernek ile iletişim, çıkış.
- Belge eksikse yükleme alanı (retry).
- **Uygulama içeriği görünmez**; sidebar/dashboard render edilmez.

## Auth (Giriş) Ekranı
- Sol: koyu zemin, madalyon, "Hukukun disiplini, sporun gücü." alıntısı.
- Sağ: giriş kartı. "Üye Girişi" / "Üyelik Başvurusu" sekmeleri.
- Google ile giriş **kaldırılacak** (üyelik doğrulama akışını atlar).
- Hatalar Türkçe ve alan bazlı.

## Erişim Kontrolü
- Giriş yapan ama `membership_status !== "approved"` olan kullanıcı **hiçbir uygulama rotasına** erişemez; doğrudan URL denese bile durum ekranı görür.
- Backend'de de API kuralları/hook ile veri erişimi engellenir (sadece kendi kaydı, auth, belge yükleme).

## Kalite
- Mobil 390px ve masaüstü 1440px'te kusursuz; yatay taşma yok.
- `prefers-reduced-motion` desteği.
- Erişilebilirlik: kontrast, focus ring, aria-label, form label.
- Animasyonlar CSS tabanlı, hafif; ağır kütüphane eklenmeyecek.
- Dış görsel yok; yalnızca yerel logo/ikonlar ve CSS gradyanlar.
