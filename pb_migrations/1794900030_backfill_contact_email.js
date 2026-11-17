/// <reference path="../pb_data/types.d.ts" />

/**
 * GHD: legacy kullanıcıların `contact_email` alanını doldur.
 *
 * Üyelik öncesi kayıtlarda `contact_email` yoktur; PocketBase `email` system
 * alanı `emailVisibility=false` iken admin rolüne bile gösterilmez. Admin
 * başvuru ekranında iletişim adresi görünsün diye sistem e-postası, gizlilik
 * hook'u tarafından üçüncü kişilerden saklanan `contact_email` alanına
 * kopyalanır. Down: veri backfill'i geri alınmaz.
 */
migrate((app) => {
  app.db()
    .newQuery(
      "UPDATE users SET contact_email = email " +
      "WHERE (contact_email IS NULL OR contact_email = '') AND email != ''",
    )
    .execute()
  console.log("[contact_email_backfill] done")
}, (app) => {
  console.log("[contact_email_backfill] down: no-op")
})
