import { pb } from '@calistenia/core/lib/pocketbase'
import type {
  AuthUser,
  LegalStatus,
  MembershipDocType,
  MembershipDocument,
  MembershipStatus,
} from '@calistenia/core/types'

export const GHD_SUPPORT_EMAIL = 'info@globalhukukcular.com'
export const GHD_WEBSITE = 'https://globalhukukcular.com'

export const MEMBERSHIP_FILE_MAX_BYTES = 10 * 1024 * 1024
export const MEMBERSHIP_FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'
export const MEMBERSHIP_FILE_HINT = 'PDF, JPG veya PNG · en fazla 10 MB'

export const LEGAL_STATUS_LABELS: Record<LegalStatus, string> = {
  student: 'Hukuk Fakültesi Öğrencisi',
  graduate: 'Hukuk Fakültesi Mezunu',
}

export const DOC_TYPE_LABELS: Record<MembershipDocType, string> = {
  student_certificate: 'Öğrenci Belgesi',
  diploma: 'Diploma',
}

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  pending: 'Onay bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
}

/**
 * Estados antiguos sin `membership_status` se tratan como pendientes: la
 * política del proyecto es que ninguna cuenta vea contenido hasta que el
 * servidor confirme la aprobación.
 */
export function getMembershipStatus(user: AuthUser | null | undefined): MembershipStatus {
  const value = user?.membership_status
  if (value === 'approved' || value === 'rejected') return value
  return 'pending'
}

export function isMembershipApproved(user: AuthUser | null | undefined): boolean {
  return getMembershipStatus(user) === 'approved'
}

/** Fecha local en formato `YYYY-MM-DD` (para `max` del input date). */
export function todayIsoDate(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function formatTrDate(value?: string | null): string {
  if (!value) return '—'
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatTrDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/** Devuelve el mensaje de error en turco, o `null` si el fichero es válido. */
export function validateMembershipFile(file: File | null | undefined): string | null {
  if (!file) return 'e-Devlet belgenizi yükleyin.'
  const name = file.name.toLowerCase()
  const validExtension = name.endsWith('.pdf') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')
  const validMime = file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png'
  if (!validExtension && !validMime) return 'Yalnızca PDF, JPG veya PNG dosyası yükleyebilirsiniz.'
  if (file.size > MEMBERSHIP_FILE_MAX_BYTES) return 'Belge boyutu en fazla 10 MB olabilir.'
  if (file.size === 0) return 'Seçilen dosya boş görünüyor. Lütfen başka bir dosya seçin.'
  return null
}

let cachedFileToken: { token: string; expiresAt: number; userId: string } | null = null

function tokenExpiry(token: string): number {
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    if (json.exp) return json.exp * 1000
  } catch { /* token opaco: usamos una caché corta */ }
  return Date.now() + 5 * 60 * 1000
}

/**
 * `membership_documents.document` es un fichero protegido: el token de sesión
 * NO sirve para `/api/files/...`. PocketBase exige un token de fichero de vida
 * corta (`pb.files.getToken()`), que se pasa como `?token=`.
 */
export async function fetchMembershipFileToken(force = false): Promise<string> {
  const userId = pb.authStore.record?.id ?? ''
  if (
    !force &&
    cachedFileToken &&
    cachedFileToken.userId === userId &&
    cachedFileToken.expiresAt > Date.now() + 30_000
  ) {
    return cachedFileToken.token
  }
  const token = await pb.files.getToken()
  cachedFileToken = { token, expiresAt: tokenExpiry(token), userId }
  return token
}

export function invalidateMembershipFileToken(): void {
  cachedFileToken = null
}

/** URL del fichero protegido. Requiere el token obtenido con `pb.files.getToken()`. */
export function membershipDocumentUrl(doc: MembershipDocument, token: string): string {
  return pb.files.getURL(doc, doc.document, { token })
}

/** Traduce el error del SDK de PB a un mensaje utilizable en la pantalla de login. */
export function friendlyLoginError(message: string | null): string | null {
  if (!message) return null
  const lower = message.toLowerCase()
  if (lower.includes('failed to authenticate') || lower.includes('invalid email or password')) {
    return 'E-posta adresi veya şifre hatalı. Lütfen tekrar deneyin.'
  }
  if (lower.includes('too many') || lower.includes('rate limit')) {
    return 'Çok fazla deneme yapıldı. Lütfen kısa bir süre sonra tekrar deneyin.'
  }
  if (lower.includes('failed to fetch') || lower.includes('failed to connect') || lower.includes('network') || lower.includes('bağlantı')) {
    return 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.'
  }
  if (lower.includes('verify') || lower.includes('verification')) {
    return 'Giriş yapabilmek için e-posta adresinizi doğrulamanız gerekiyor.'
  }
  // PB devuelve mensajes en inglés para el resto de errores; la pantalla es
  // turca y no debe filtrar texto técnico del SDK.
  return 'Giriş yapılamadı. Bilgilerinizi kontrol edip tekrar deneyin.'
}
