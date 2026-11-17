/// <reference path="../pb_data/types.d.ts" />

/**
 * GHD üyelik alanları — `users` (Faz 1).
 *
 * - Doğum tarihi, hukuk statüsü ve KVKK onayı başvuruda zorunlu.
 * - Üyelik durumu `pending` doğar; yalnızca onaylı bir admin (veya superuser)
 *   değiştirebilir.
 * - `birth_date`, `legal_status`, `kvkk_consent` başvuruda bir kez yazılır;
 *   normal kullanıcı sonradan değiştiremez. Admin/superuser yönetim işlemleri
 *   kuralın admin dalındadır.
 * - `role/tier` public signup'ta gönderilemez ve normal kullanıcı tarafından
 *   değiştirilemez; admin/superuser yönetebilir. Hook ayrıca create sırasında
 *   zorla `role=user`, `tier=free`, `membership_status=pending` yapar
 *   (superuser hariç).
 *
 * Not: create kuralı `birth_date`/`legal_status`/`kvkk_consent` alanlarını
 * engellemez — public başvurunun bu zorunlu alanları göndermesi gerekir.
 * Onları yalnızca update'te kilitleriz. Kilitlenen üyelik alanları create'te
 * de yasaktır; superuser API'si zaten tüm kuralları atlar.
 *
 * `membership_status` bilinçli olarak `required: false`: public signup bu alanı
 * GÖNDERMEZ ve PocketBase validasyonu hook'tan önce çalışır. Zorunlu bırakmak
 * temiz signup'ı 400 ile kırardı. Alanın `pending` doğması
 * `pb_hooks/membership.pb.js` içindeki `onRecordCreateRequest` tarafından
 * garanti edilir; middleware de boş değeri `pending` sayar.
 */

const OLD_CREATE_RULE = ""
const OLD_UPDATE_RULE =
  'id = @request.auth.id && @request.body.role:isset = false && @request.body.tier:isset = false'

// Public signup: kimlik/üyelik yönetim alanları gövdede olamaz.
// (birth_date/legal_status/kvkk_consent başvuruda zorunlu olduğu için serbest.)
const NEW_CREATE_RULE =
  '@request.body.membership_status:isset = false && ' +
  '@request.body.membership_note:isset = false && ' +
  '@request.body.approved_at:isset = false && ' +
  '@request.body.role:isset = false && ' +
  '@request.body.tier:isset = false'

// Kendi kaydını güncelleyen kullanıcı: üyelik ve kimlik alanları kilitli.
const SELF_UPDATE_RULE =
  'id = @request.auth.id && ' +
  '@request.body.role:isset = false && ' +
  '@request.body.tier:isset = false && ' +
  '@request.body.membership_status:isset = false && ' +
  '@request.body.membership_note:isset = false && ' +
  '@request.body.approved_at:isset = false && ' +
  '@request.body.birth_date:isset = false && ' +
  '@request.body.legal_status:isset = false && ' +
  '@request.body.kvkk_consent:isset = false'

// Onaylı admin başka bir üyenin kaydını yönetebilir: üyelik durumu/notu ve
// mevcut AdminPage'in rol değişikliği. Admin dalı kısıtsızdır; superuser
// zaten tüm kuralları atlar. Normal kullanıcının kendi kaydındaki korumalı
// alanlar aşağıdaki SELF dalında kilitli kalır.
const ADMIN_UPDATE_RULE = '@request.auth.role = "admin"'

const NEW_UPDATE_RULE = '(' + SELF_UPDATE_RULE + ') || (' + ADMIN_UPDATE_RULE + ')'

const INDEX = "CREATE INDEX idx_users_membership_status ON users (membership_status)"

const FIELDS = [
  {
    id: "date_ghd_birth_date",
    name: "birth_date",
    type: "date",
    required: true,
  },
  {
    id: "select_ghd_legal_status",
    name: "legal_status",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["student", "graduate"],
  },
  {
    id: "text_ghd_phone",
    name: "phone",
    type: "text",
    required: false,
    max: 20,
  },
  {
    id: "text_ghd_city",
    name: "city",
    type: "text",
    required: false,
    max: 80,
  },
  {
    id: "text_ghd_contact_email",
    name: "contact_email",
    type: "text",
    required: false,
    max: 254,
  },
  {
    id: "bool_ghd_kvkk_consent",
    name: "kvkk_consent",
    type: "bool",
    required: true,
  },
  {
    id: "select_ghd_membership_status",
    name: "membership_status",
    type: "select",
    required: false,
    maxSelect: 1,
    values: ["pending", "approved", "rejected"],
  },
  {
    id: "text_ghd_membership_note",
    name: "membership_note",
    type: "text",
    required: false,
    max: 1000,
  },
  {
    id: "date_ghd_approved_at",
    name: "approved_at",
    type: "date",
    required: false,
  },
]

migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  for (const def of FIELDS) {
    if (!users.fields.find((f) => f.name === def.name)) {
      users.fields.add(new Field(def))
    }
  }

  if (!users.indexes || !users.indexes.some((idx) => idx.indexOf("idx_users_membership_status") !== -1)) {
    users.indexes = (users.indexes || []).concat([INDEX])
  }

  users.createRule = NEW_CREATE_RULE
  users.updateRule = NEW_UPDATE_RULE

  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("users")

  for (const def of FIELDS) {
    const field = users.fields.find((f) => f.name === def.name)
    if (field) users.fields.removeById(field.id)
  }

  users.indexes = (users.indexes || []).filter(
    (idx) => idx.indexOf("idx_users_membership_status") === -1,
  )
  users.createRule = OLD_CREATE_RULE
  users.updateRule = OLD_UPDATE_RULE

  app.save(users)
})
