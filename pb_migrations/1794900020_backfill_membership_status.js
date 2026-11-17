/// <reference path="../pb_data/types.d.ts" />

/**
 * GHD üyelik backfill'i.
 *
 * Yeni alanlar eklendiğinde eski `users` kayıtlarında `membership_status` boş
 * kalır. Boş durum güvenlik gereği `approved` sayılmaz; ancak bu kayıtlar
 * admin listesinde de görünmezse ne onaylanabilir ne reddedilebilir.
 *
 * - Eski normal kullanıcılar → `pending` (admin incelemesi gerekir).
 * - Eski `role=admin` hesapları → `approved` (yönetim erişimi kilitlenmesin).
 *
 * Veri dönüşü geri alınamaz; down bilinçli olarak no-op.
 */
migrate((app) => {
  app.db()
    .newQuery(
      "UPDATE users SET membership_status = 'pending' " +
      "WHERE membership_status IS NULL OR membership_status = ''",
    )
    .execute()

  app.db()
    .newQuery(
      "UPDATE users SET membership_status = 'approved', " +
      "approved_at = COALESCE(NULLIF(approved_at, ''), datetime('now')) " +
      "WHERE role = 'admin' AND (membership_status IS NULL OR membership_status = 'pending')",
    )
    .execute()

  console.log("[membership_backfill] legacy users normalized")
}, (app) => {
  // Veri backfill'i geri alınmaz.
  console.log("[membership_backfill] down: no-op")
})
