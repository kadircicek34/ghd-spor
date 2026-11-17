import { Navigate } from 'react-router-dom'

/**
 * Upstream bu sayfa Android APK / GitHub Releases indirme akışını gösteriyordu.
 * GHD Spor tarayıcı üzerinden çalışan, yalnızca dernek üyelerine açık bir
 * platform olduğu için dış indirme bağlantıları kaldırıldı; eski `/download`
 * ve `/descargar` adresleri ana sayfaya yönlenir.
 */
export default function DownloadPage() {
  return <Navigate to="/" replace />
}
