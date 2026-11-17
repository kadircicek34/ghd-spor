/// <reference path="../pb_data/types.d.ts" />

/**
 * Üyelik belgeleri (Faz 1).
 *
 * e-Devlet öğrenci belgesi veya hukuk fakültesi diploması. Sahibi yükler ve
 * yalnızca kendi belgesini görür; onaylı admin tüm belgeleri görebilir.
 * Güncelleme/silme yalnızca admin (superuser zaten kuralları atlar).
 * `user` ilişkisi cascadeDelete: hesap silinirse belge de silinir.
 */

const COLLECTION_ID = "pbc_1794900010"
// Onaylı admin tüm belgeleri yönetir. Pending/rejected bir admin (edge case)
// yalnızca kendi belgesini görür; üyelik onayı olmadan belge erişimi yok.
const ADMIN_RULE = '@request.auth.role = "admin" && @request.auth.membership_status = "approved"'
const OWNER_OR_ADMIN =
  '@request.auth.id != "" && (user = @request.auth.id || (' + ADMIN_RULE + '))'

migrate((app) => {
  try {
    app.findCollectionByNameOrId("membership_documents")
    return
  } catch (e) {
    // Koleksiyon yok; aşağıda oluşturulur.
  }

  app.save(new Collection({
    id: COLLECTION_ID,
    name: "membership_documents",
    type: "base",
    listRule: OWNER_OR_ADMIN,
    viewRule: OWNER_OR_ADMIN,
    createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
    updateRule: '@request.auth.id != "" && ' + ADMIN_RULE,
    deleteRule: '@request.auth.id != "" && ' + ADMIN_RULE,
    fields: [
      {
        id: "relation_ghd_doc_user",
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        id: "file_ghd_doc_document",
        name: "document",
        type: "file",
        required: true,
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
        // protected: dosya URL'i tek başına yetmez; PB file token + viewRule
        // gerekir. Böylece URL sızsa bile sahibi/admin dışında kimse açamaz.
        protected: true,
      },
      {
        id: "select_ghd_doc_type",
        name: "doc_type",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["student_certificate", "diploma"],
      },
      {
        id: "autodate_ghd_doc_created",
        name: "created",
        type: "autodate",
        onCreate: true,
      },
      {
        id: "autodate_ghd_doc_updated",
        name: "updated",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX idx_membership_documents_user ON membership_documents (user)",
    ],
  }))
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId("membership_documents"))
  } catch (e) {
    // Zaten yok.
  }
})
