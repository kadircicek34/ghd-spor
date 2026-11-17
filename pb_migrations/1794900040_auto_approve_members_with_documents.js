/// <reference path="../pb_data/types.d.ts" />

/**
 * GHD otomatik onay backfill'i: e-Devlet belgesi yüklü olan mevcut `pending`
 * üyeleri `approved` yap. Belgesiz başvurular pending kalır; durum ekranından
 * belge yükleyince hook otomatik onaylar.
 */
migrate((app) => {
  app.db()
    .newQuery(
      "UPDATE users SET " +
      "membership_status = 'approved', " +
      "approved_at = COALESCE(NULLIF(approved_at, ''), datetime('now')), " +
      "membership_note = 'e-Devlet belgesi yüklendiği için otomatik onaylandı.' " +
      "WHERE membership_status = 'pending' AND EXISTS (" +
      "SELECT 1 FROM membership_documents WHERE membership_documents.user = users.id" +
      ")",
    )
    .execute()
  console.log("[membership_auto_approve] pending users with documents approved")
}, (app) => {
  // Veri backfill'i geri alınmaz.
  console.log("[membership_auto_approve] down: no-op")
})
