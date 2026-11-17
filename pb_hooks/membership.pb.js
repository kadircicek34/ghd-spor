/// <reference path="../pb_data/types.d.ts" />

/**
 * GHD üyelik yaşam döngüsü (Faz 1).
 *
 * 1. `users` create: public başvuru her zaman `membership_status=pending`,
 *    `role=user`, `tier=free` doğar. Superuser API'si bu zorlamanın dışındadır;
 *    dernek admin hesabı doğrudan `approved` + `role=admin` oluşturulabilir.
 * 2. `users` update: üyelik durumunu yalnızca onaylı bir admin veya superuser
 *    değiştirebilir. Admin onayında en az bir `membership_documents` kaydı
 *    zorunludur; superuser bootstrap için bundan muaftır.
 * 3. `approved` durumuna geçişte `approved_at` otomatik yazılır; `pending` /
 *    `rejected` durumunda temizlenir.
 * 4. Router middleware: onaylanmamış kullanıcı uygulama API'lerinde 403 alır.
 *    Auth uçları, kendi user kaydı, üyelik belgeleri ve kendi dosyaları muaftır.
 *
 * JSVM notu: her handler ayrı bir runtime'da çalışır. Bu yüzden tüm sabitler
 * ve yardımcılar handler'ların İÇİNDE tanımlanır; dosya üstünde tanımlanan bir
 * değişken handler içinde `undefined` olur. `e.next()` zinciri kırmamak için
 * her başarılı yolda tam olarak bir kez çağrılır.
 */

console.log("[membership] hook file loaded")

onRecordCreateRequest(function (e) {
  var isSuperuser = e.hasSuperuserAuth()

  // Admin'in görebilmesi için başvuru e-postasını ayrı, gizlilik kontrollü bir
  // alana kopyala. PocketBase `email` system alanı `emailVisibility=false`
  // iken diğer kullanıcılara (admin rolüne bile) gösterilmez.
  var signupEmail = e.record.getString("email")
  if (signupEmail) e.record.set("contact_email", signupEmail)

  // Doğum tarihi sunucu tarafında da doğrulanır (client validation atlatılabilir).
  var birthRaw = e.record.getString("birth_date")
  if (birthRaw) {
    var birth = new Date(String(birthRaw).replace(" ", "T"))
    var now = new Date()
    if (isNaN(birth.getTime()) || birth.getTime() > now.getTime()) {
      throw new BadRequestError("Geçerli bir doğum tarihi girin; tarih gelecekte olamaz.")
    }
    if (birth.getUTCFullYear() < 1900) {
      throw new BadRequestError("Geçerli bir doğum tarihi girin.")
    }
  }

  if (!isSuperuser) {
    // Public signup: istemci ne gönderirse göndersin bu yönetim alanları sabittir.
    e.record.set("membership_status", "pending")
    e.record.set("role", "user")
    e.record.set("tier", "free")
    e.record.set("membership_note", "")
    e.record.set("approved_at", "")
  } else {
    // Superuser bootstrap: değer verilmişse korunur, verilmemişse güvenli
    // varsayılanlar uygulanır.
    var status = e.record.getString("membership_status")
    if (!status) {
      e.record.set("membership_status", "pending")
      e.record.set("approved_at", "")
    } else if (status === "approved") {
      // Bootstrap istisnası yalnızca admin hesabı içindir. Normal bir üyeyi
      // belgesiz approved oluşturmak üyelik doğrulamasını atlatır.
      if (e.record.getString("role") !== "admin") {
        throw new BadRequestError(
          "Belge olmadan üyelik onaylanamaz. Önce pending başvuru oluşturup belge yükletin.",
        )
      }
      if (!e.record.getString("approved_at")) {
        e.record.set("approved_at", new DateTime())
      }
    } else {
      e.record.set("approved_at", "")
    }

    if (!e.record.getString("role")) e.record.set("role", "user")
    if (!e.record.getString("tier")) e.record.set("tier", "free")
  }

  e.next()
}, "users")

onRecordUpdateRequest(function (e) {
  var isSuperuser = e.hasSuperuserAuth()
  var original = e.record.original()
  var prevStatus = original ? original.getString("membership_status") : ""
  var status = e.record.getString("membership_status")

  // Doğum tarihi doğrulaması superuser dahil her update'te çalışır.
  var nextBirth = e.record.getString("birth_date")
  var prevBirth = original ? original.getString("birth_date") : ""
  if (nextBirth && nextBirth !== prevBirth) {
    var parsedBirth = new Date(String(nextBirth).replace(" ", "T"))
    if (isNaN(parsedBirth.getTime()) || parsedBirth.getTime() > Date.now() || parsedBirth.getUTCFullYear() < 1900) {
      throw new BadRequestError("Geçerli bir doğum tarihi girin; tarih gelecekte olamaz.")
    }
  }

  if (isSuperuser) {
    // Bootstrap / kurtarma yolu: korumalı alanlar serbest, ancak normal bir
    // üyeyi belgesiz onaylamak üyelik doğrulamasını atlatamaz. Yalnızca admin
    // hesabı (bootstrap) belgesiz approved olabilir.
    if (!status) {
      status = "pending"
      e.record.set("membership_status", "pending")
    }
    if (status === "approved" && prevStatus !== "approved" && e.record.getString("role") !== "admin") {
      var docs = $app.findRecordsByFilter(
        "membership_documents",
        "user = {:uid}",
        "",
        1,
        0,
        { uid: e.record.id },
      )
      if (!docs || docs.length === 0) {
        throw new BadRequestError(
          "Onay için kullanıcının en az bir üyelik belgesi yüklenmiş olmalı.",
        )
      }
    }
    if (status === "approved") {
      if (prevStatus !== "approved" || !e.record.getString("approved_at")) {
        e.record.set("approved_at", new DateTime())
      }
    } else {
      e.record.set("approved_at", "")
    }
    return e.next()
  }

  // E-posta değişirse admin görünümündeki iletişim adresi de güncellensin.
  var newEmail = e.record.getString("email")
  if (newEmail && (!isSuperuser || (original && newEmail !== original.getString("email")))) {
    e.record.set("contact_email", newEmail)
  }

  var auth = e.auth
  if (!auth) {
    try {
      auth = e.requestInfo().auth
    } catch (err) {
      auth = null
    }
  }

  var isAdmin = !!auth && auth.getString("role") === "admin"
  var adminApproved = isAdmin && auth.getString("membership_status") === "approved"

  // Eski (alan eklenmeden önceki) kayıtlar boş durumla gelebilir. Admin ilk
  // dokunuşunda güvenli varsayılana çekilir; kullanıcının kendi güncellemesi
  // boş durumu değiştirmez (middleware boşu pending sayar).
  if (isAdmin && !status) {
    status = "pending"
    e.record.set("membership_status", "pending")
  }

  // Defense-in-depth: normal kullanıcı kendi kaydında korumalı alanları
  // değiştiremez (create/update kuralları zaten engelliyor). Admin dalı
  // bilinçli olarak serbesttir: AdminPage rol değiştirir, üye onay ekranı
  // membership_status/note yazar. Superuser yukarıda erken döner.
  if (!isAdmin) {
    var protectedFields = ["role", "tier", "birth_date", "legal_status", "kvkk_consent"]
    for (var i = 0; i < protectedFields.length; i++) {
      var field = protectedFields[i]
      var nextValue = e.record.getString(field)
      var oldValue = original ? original.getString(field) : ""
      if (nextValue !== oldValue) {
        throw new ForbiddenError(
          "Bu alan yalnızca yönetici tarafından değiştirilebilir.",
        )
      }
    }
  }

  if (status !== prevStatus) {
    if (!adminApproved) {
      throw new ForbiddenError(
        "Üyelik durumunu yalnızca dernek yöneticisi değiştirebilir.",
      )
    }

    if (status === "approved" && prevStatus !== "approved") {
      var docs = $app.findRecordsByFilter(
        "membership_documents",
        "user = {:uid}",
        "",
        1,
        0,
        { uid: e.record.id },
      )
      if (!docs || docs.length === 0) {
        throw new BadRequestError(
          "Onay için kullanıcının en az bir üyelik belgesi yüklenmiş olmalı.",
        )
      }
    }
  }

  if (!isAdmin) {
    // Kendi kaydında üyelik notu / onay tarihi de kilitli. Admin not ekleyebilir;
    // approved_at her hâlükârda aşağıda duruma göre sunucu tarafından yönetilir.
    if (e.record.getString("membership_note") !== original.getString("membership_note")) {
      throw new ForbiddenError("Üyelik notunu yalnızca dernek yöneticisi değiştirebilir.")
    }
    if (e.record.getString("approved_at") !== original.getString("approved_at")) {
      throw new ForbiddenError("Onay tarihini yalnızca sistem belirleyebilir.")
    }
  }

  if (status === "approved") {
    if (prevStatus !== "approved") {
      e.record.set("approved_at", new DateTime())
    }
  } else {
    e.record.set("approved_at", "")
  }

  e.next()
}, "users")

onRecordCreateRequest(function (e) {
  // Kullanıcının seçtiği dosya adı diskte/DB'de kalmasın: ad, e-posta veya
  // gerçek isim içerebilir. PB'nin kendi normalizasyonu rastgele sonek ekler
  // ama orijinal tabanı korur; burada adı tamamen nötr ve $security ile
  // rastgele hale getiriyoruz. Uzantı korunur (MIME doğrulaması ayrıca var).
  try {
    var value = e.record.get("document")
    if (value) {
      var files = []
      if (typeof value === "string") {
        // Beklenmez (create'te dosya nesnesi gelir), ama savunmacı davran.
      } else if (value.name) {
        files.push(value)
      } else if (value.length !== undefined) {
        for (var i = 0; i < value.length; i++) files.push(value[i])
      }
      for (var j = 0; j < files.length; j++) {
        var file = files[j]
        if (!file || !file.name) continue
        var original = String(file.name)
        var dot = original.lastIndexOf(".")
        var ext = dot >= 0 ? original.substring(dot) : ""
        // $security.randomString: kriptografik, URL-safe; dosya adı artık ne
        // kullanıcı adı ne e-posta ne de orijinal dosya adı taşır.
        file.name = "belge_" + $security.randomString(16) + "_" + j + ext
      }
    }
  } catch (err) {
    // Ad temizliği başarısız olsa bile yükleme devam etsin; asıl erişim
    // kontrolü protected dosya + view rule ile sağlanıyor.
    console.log("[membership] belge adı normalize edilemedi:", err)
  }

  e.next()
}, "membership_documents")

/**
 * Onaysız üyelerin uygulama API'lerine erişimini kapatır.
 *
 * Muafiyetler:
 *  - auth uçları (giriş/refresh; token yenilemeden durum ekranı çalışmaz),
 *  - kendi user kaydı (GET/PATCH; profil ve durum ekranı),
 *  - membership_documents (collection kuralları sahibi/admin ile sınırlar),
 *  - kendi dosyaları ve protected dosyalar için /api/files/token
 *    (PB view rule korur),
 *  - /api/health, /api/app-config ve /api/public/* (açılış/public uçlar).
 *
 * Public/auth istekleri (auth yok) olduğu gibi geçer; landing ve giriş açık
 * kalır. Superuser token'ı ve approved kullanıcılar hiç engellenmez.
 */
routerUse(function (e) {
  var path = e.request.url.path

  // Yalnızca API'leri koru; SPA ve statik dosyalar yüklenmeye devam etmeli ki
  // pending kullanıcı durum ekranını görebilsin.
  if (path.indexOf("/api/") !== 0) return e.next()

  var info = e.requestInfo()
  var auth = info.auth

  // Giriş yapmamış ziyaretçi: public auth/landing akışı.
  if (!auth) return e.next()
  if (info.hasSuperuserAuth()) return e.next()

  var status = auth.getString("membership_status")
  if (status === "approved") return e.next()

  // Auth endpoint'leri: login, auth-refresh, OAuth2 vb.
  if (path.indexOf("/api/collections/users/auth-") === 0) return e.next()

  // Kendi user kaydı: yalnızca okuma ve profil güncelleme.
  if (
    path === "/api/collections/users/records/" + auth.id &&
    (e.request.method === "GET" || e.request.method === "PATCH")
  ) {
    // Update rule'u zaten 404 ile reddediyor; normal kullanıcıya daha açık bir
    // 403 sinyali verelim. Admin kendi kaydında kuralın admin dalını kullanır.
    if (e.request.method === "PATCH" && auth.getString("role") !== "admin") {
      var body = info.body || {}
      var locked = [
        "role", "tier", "membership_status", "membership_note",
        "approved_at", "birth_date", "legal_status", "kvkk_consent",
      ]
      for (var i = 0; i < locked.length; i++) {
        if (body[locked[i]] !== undefined) {
          return e.json(403, { code: "protected_field", field: locked[i] })
        }
      }
    }
    return e.next()
  }

  // Belge yükleme/listeleme: yalnızca kayıt endpoint'i; koleksiyon altına
  // ileride eklenecek başka bir endpoint otomatik açılmasın. Erişim ayrıca
  // collection rule'larında sahibi/admin ile sınırlı.
  if (
    path === "/api/collections/membership_documents/records" ||
    path.indexOf("/api/collections/membership_documents/records/") === 0
  ) return e.next()

  // Protected dosyalar için kısa ömürlü file token. Yalnızca kendi auth
  // kaydı için üretilir; belge görünürlüğü ayrıca PB view rule ile denetlenir.
  if (path === "/api/files/token" && e.request.method === "POST") return e.next()

  // Kendi avatarı / kendi e-Devlet belgesi. PB dosya görünürlüğünü viewRule ile
  // ayrıca denetler; burada yalnızca kendi users dosya yolu muaftır.
  if (path.indexOf("/api/files/users/" + auth.id + "/") === 0) return e.next()
  if (path.indexOf("/api/files/membership_documents/") === 0) return e.next()

  // Açılış sağlık kontrolü ve public uçlar: uygulama pending kullanıcıyı
  // çevrimdışı sanmasın. Bu uçlar zaten hassas veri döndürmez.
  if (path === "/api/health") return e.next()
  if (path === "/api/app-config") return e.next()
  if (path.indexOf("/api/public/") === 0) return e.next()

  return e.json(403, {
    code: status === "rejected" ? "membership_rejected" : "membership_pending",
  })
})
