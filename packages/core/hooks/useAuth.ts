import { storage, lifecycle } from '../platform'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RecordModel } from 'pocketbase'
import { pb, loginWithOAuth2, logout, tryRefreshAuth, verifyAuth, getCurrentUser } from '../lib/pocketbase'
import { joinChallenge } from '../lib/challenge-join'
import { setTimezone } from '../lib/dateUtils'
import { CANONICAL_ANALYTICS_EVENTS, analyticsPlatform, op, trackCanonicalEvent } from '../lib/analytics'
import { detectDeviceTimezone, syncUserTimezone } from '../lib/timezone-sync'
import { clearUserStorage } from '../lib/storage-keys'
import { saveInvitedProgram, trackReferralProgramMatched } from '../lib/invited-program'
import { qk } from '../lib/query-keys'
import i18n from 'i18next'
import type { AuthUser, LegalStatus, MembershipDocType, UserRole, UserTier } from '../types'

const REFERRAL_CODE_KEY = 'calistenia_referral_code'
const EXPRESS_CHALLENGE_KEY = 'calistenia_express_challenge'

/** Save referral code from URL to localStorage so it survives the registration flow. */
export function captureReferralCode(code: string) {
  storage.setItem(REFERRAL_CODE_KEY, code)
}

/** Existing-account login must not leave attribution for a future user. */
export function discardCapturedReferralCode(): void {
  storage.removeItem(REFERRAL_CODE_KEY)
}

/** Get and clear stored referral code. */
function consumeReferralCode(): string | null {
  const code = storage.getItem(REFERRAL_CODE_KEY)
  if (code) storage.removeItem(REFERRAL_CODE_KEY)
  return code
}

/** Save the express-challenge id from an invite link so it survives auth (#313). */
export function captureChallengeId(challengeId: string) {
  storage.setItem(EXPRESS_CHALLENGE_KEY, challengeId)
}

/** Get and clear the stored express-challenge id. */
function consumeChallengeId(): string | null {
  const id = storage.getItem(EXPRESS_CHALLENGE_KEY)
  if (id) storage.removeItem(EXPRESS_CHALLENGE_KEY)
  return id
}

export async function completeNewUserRegistration(
  user: AuthUser,
  method: 'email' | 'google',
): Promise<void> {
  // GHD: analitik opsiyonel olsa bile e-posta/ad gönderilmez. Yalnızca
  // takma kimlik (profileId) ve teknik özellikler.
  op.identify({
    profileId: user.id,
    properties: { tier: 'free', role: 'user', platform: analyticsPlatform() },
  })
  op.track('signup_completed', { method })

  const displayName = user.display_name || user.name || user.email?.split('@')[0] || 'USER'
  try {
    const sanitized = displayName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .toUpperCase()
      .slice(0, 10) || 'USER'

    const hash = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((b: number) => b.toString(36).toUpperCase())
      .join('')
      .slice(0, 6)

    const code = `${sanitized}-${hash}`
    await pb.collection('users').update(user.id, { referral_code: code }).catch(() => {})
  } catch { /* non-critical */ }

  const referrerCode = consumeReferralCode()
  if (!referrerCode) return

  try {
    const referrerUsers = await pb.collection('users').getList(1, 1, {
      filter: pb.filter('referral_code = {:code}', { code: referrerCode }),
      $autoCancel: false,
    })
    if (referrerUsers.items.length === 0) return

    const referrer = referrerUsers.items[0]
    if (referrer.id === user.id) return

    await pb.collection('referrals').create({
      referrer: referrer.id,
      referred: user.id,
      source: 'quick_invite',
    })
    trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.referralConverted, {
      surface: 'referral',
      source: 'quick_invite',
      result: 'converted',
      referrer_id: referrer.id,
    })
    await resolveReferrerProgram(user.id, referrer.id)
  } catch { /* non-critical */ }
}

/**
 * #803: deja el programa actual de quien invita para que el onboarding lo
 * preseleccione. Sin programa activo no hay nada que hacer (flujo normal).
 */
async function resolveReferrerProgram(userId: string, referrerId: string): Promise<void> {
  try {
    const rec = await pb
      .collection('user_programs')
      .getFirstListItem(pb.filter('user = {:uid} && is_current = true', { uid: referrerId }), {
        $autoCancel: false,
      })
    const programId = typeof rec.program === 'string' ? rec.program : ''
    if (!programId) throw new Error('no program')
    saveInvitedProgram(userId, referrerId, programId)
  } catch {
    trackReferralProgramMatched({ referrerId, programId: null, matched: false, stage: 'registration' })
  }
}

/** Datos que viajan en la solicitud de membresía de GHD Spor. */
export interface MembershipSignupInput {
  email: string
  password: string
  displayName: string
  birthDate: string
  legalStatus: LegalStatus
  phone?: string
  city?: string
  file: File
  docType: MembershipDocType
}

export interface MembershipSignupResult {
  ok: boolean
  /** Mensaje general en turco, listo para pintar. */
  error?: string
  /** Errores por campo (clave = nombre del campo en PB). */
  fieldErrors?: Record<string, string>
  /** El alta se completó pero el documento no pudo subirse. */
  documentError?: string
}

interface UseAuthReturn {
  user: AuthUser | null
  authReady: boolean
  authError: string | null
  isLoading: boolean
  userRole: UserRole
  userTier: UserTier
  isAdmin: boolean
  isEditor: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  signUpWithMembership: (input: MembershipSignupInput) => Promise<MembershipSignupResult>
  signOut: () => void
}

const MEMBERSHIP_FIELD_MESSAGES: Record<string, string> = {
  email: 'Geçerli ve daha önce kullanılmamış bir e-posta adresi girin.',
  password: 'Şifre en az 8 karakter olmalı.',
  passwordConfirm: 'Şifreler eşleşmiyor.',
  display_name: 'Ad soyad alanını kontrol edin.',
  birth_date: 'Geçerli bir doğum tarihi girin.',
  legal_status: 'Hukuk statüsünü seçin.',
  phone: 'Telefon numarasını kontrol edin.',
  city: 'Şehir alanını kontrol edin.',
  kvkk_consent: 'KVKK onayı gereklidir.',
}

function membershipSignupError(err: unknown): MembershipSignupResult {
  const error = err as {
    status?: number
    data?: Record<string, unknown>
    response?: { data?: Record<string, unknown> }
  }
  const status = Number(error?.status ?? 0)
  const data = (error?.response?.data ?? error?.data ?? {}) as Record<string, unknown>
  const fieldErrors: Record<string, string> = {}

  for (const field of Object.keys(MEMBERSHIP_FIELD_MESSAGES)) {
    if (!(field in data)) continue
    fieldErrors[field] = MEMBERSHIP_FIELD_MESSAGES[field]
  }

  // PB expone `{ code, message }` por campo. Afinamos los casos más frecuentes.
  const emailError = data.email as { code?: string } | undefined
  if (emailError?.code === 'validation_not_unique') {
    fieldErrors.email = 'Bu e-posta adresiyle kayıtlı bir hesap var.'
  }
  const passwordConfirmError = data.passwordConfirm as { code?: string } | undefined
  if (passwordConfirmError?.code === 'validation_mismatch') {
    fieldErrors.passwordConfirm = 'Şifreler eşleşmiyor.'
  }

  let message = 'Başvuru gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.'
  if (status === 0) {
    message = 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.'
  } else if (status === 403) {
    message = 'Başvuru şu anda tamamlanamadı. Lütfen daha sonra tekrar deneyin veya info@globalhukukcular.com ile iletişime geçin.'
  } else if (fieldErrors.email) {
    message = fieldErrors.email
  } else if (Object.keys(fieldErrors).length > 0) {
    message = 'Lütfen işaretli alanları kontrol edin.'
  } else if (status >= 500) {
    message = 'Sunucuda geçici bir sorun oluştu. Lütfen kısa bir süre sonra tekrar deneyin.'
  }

  return { ok: false, error: message, fieldErrors }
}

/**
 * useAuth — gestiona el ciclo completo de autenticación.
 *
 * Retorna:
 *   user        — registro del usuario autenticado (null si no hay sesión)
 *   authReady   — true cuando el arranque terminó (token verificado o limpiado)
 *   authError   — string con el último error de auth, o null
 *   isLoading   — true mientras hay una operación en curso
 *   signIn(email, password)
 *   signUp(email, password, displayName)
 *   signOut()
 */
/** Identifica al usuario en analytics. Idempotente por id: no reenvía en cada refresh de token. */
let lastIdentified: string | null = null
export function identifyUser(u: { id: string; display_name?: unknown; name?: unknown; email?: unknown; tier?: unknown; role?: unknown }) {
  if (lastIdentified === u.id) return
  lastIdentified = u.id
  op.identify({
    profileId: u.id,
    properties: {
      tier: (u.tier as string) || 'free',
      role: (u.role as string) || 'user',
      platform: analyticsPlatform(),
    },
  })
}
/** Olvida el último id identificado (logout y tests). */
export function resetIdentifiedUser() { lastIdentified = null }

export function useAuth(): UseAuthReturn {
  const qc = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ── Arranque: intentar refrescar token existente ────────────────────────
  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      await tryRefreshAuth()
      if (!cancelled) {
        const u = getCurrentUser()
        // La zona de la app es la del dispositivo, no la guardada (ver timezone-sync).
        setTimezone(detectDeviceTimezone())
        if (u) {
          identifyUser(u)
          // Persistir la zona en el registro: el servidor la necesita para
          // enviar los recordatorios a la hora local correcta.
          void syncUserTimezone(u.id, u.timezone as string | undefined)
        }
        setUser(u)
        setAuthReady(true)
      }
    }
    boot()
    return () => { cancelled = true }
  }, [])

  // ── Revalidar el token al volver la app a primer plano ───────────────────
  // Un token invalidado con la app abierta no genera 401s (PB lo degrada a
  // invitado → listas vacías, #254); al volver a primer plano se re-comprueba
  // contra el server. Si el token murió, authStore se limpia y el listener
  // de abajo saca al usuario a la vista de invitado.
  //
  // Antes esto escuchaba `document.visibilitychange` a pelo, así que en nativo
  // (sin `document`) era un no-op SILENCIOSO y el token fantasma del #254 nunca
  // se revalidaba. Ahora va por el lifecycle de la plataforma (#482): web lo
  // resuelve con visibilitychange y RN con AppState.
  useEffect(() => lifecycle.onForeground(() => void verifyAuth().catch(() => {})), [])

  // ── Escuchar cambios del authStore (login/logout/token expirado) ─────────
  useEffect(() => {
    const unsub = pb.authStore.onChange((_token: string, record: RecordModel | null) => {
      if (record) setTimezone(detectDeviceTimezone())
      // Login (incl. OAuth) / refresh: asegurar que el servidor conoce la zona.
      if (record) void syncUserTimezone(record.id, record.timezone as string | undefined)
      // Login de un usuario EXISTENTE: el arranque corrió con u=null y solo
      // los registros nuevos pasaban por identify → la sesión entera salía
      // anónima en OpenPanel hasta la siguiente recarga (en móvil, nunca).
      if (record) identifyUser(record as RecordModel & Record<string, unknown>)
      // Logout (propio o sincronizado desde otra pestaña vía storage event):
      // vaciar la caché de queries también AQUÍ, no solo en signOut(). Si otra
      // pestaña conserva en memoria las queries del usuario anterior, su
      // persister las re-escribe a localStorage y los datos del usuario A
      // quedan en disco durante la sesión del usuario B.
      if (!record) qc.clear()
      setUser(record ?? null)
    })
    return () => unsub()
  }, [qc])

  // Track whether this is a new user (first OAuth login) to trigger post-registration side effects
  const registrationMethod = useRef<'email' | 'google' | null>(null)

  // ── Post-registration: generate referral code + track referral ──────────
  useEffect(() => {
    if (!registrationMethod.current || !user) return
    const method = registrationMethod.current
    registrationMethod.current = null
    void completeNewUserRegistration(user, method)
  }, [user])

  // ── Auto-inscripción en reto express tras autenticarse (#313) ────────────
  // El link /invite/<code>/challenge/<id> guarda el id antes del registro o
  // login; al haber usuario se consume y se crea la participación propia (la
  // rule de challenge_participants solo permite auto-inscribirse, ver #261).
  useEffect(() => {
    if (!user) return
    const challengeId = consumeChallengeId()
    if (!challengeId) return

    const joinFromInvite = async () => {
      try {
        const challenge = await pb.collection('challenges').getOne(challengeId, { $autoCancel: false })
        if (challenge.status !== 'active') return
        await joinChallenge(challengeId, user.id) // idempotente si ya estaba inscrito
        op.track('challenge_joined', { challenge_id: challengeId, source: 'invite' })
        qc.invalidateQueries({ queryKey: qk.challenges(user.id) })
      } catch { /* reto borrado o inaccesible: no bloquear el login */ }
    }
    joinFromInvite()
  }, [user, qc])

  // ── signInWithGoogle ───────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    setIsLoading(true)
    // #636 §4: solo existían los `*_completed`, así que la parte de ARRIBA del
    // embudo de registro estaba a ciegas: no se sabía cuánta gente lo intenta
    // ni cuánta se queda por el camino. El mensaje del error NO viaja: puede
    // llevar el correo dentro (§6).
    trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.loginStarted, {
      surface: 'auth', source: 'auth_screen', method: 'google',
    })
    try {
      const result = await loginWithOAuth2('google')
      // If this is a newly created user (no referral_code yet), trigger post-registration
      if (result.record && !result.record.referral_code) {
        registrationMethod.current = 'google'
      } else {
        discardCapturedReferralCode()
        op.track('login_completed', { method: 'google' })
      }
    } catch (err: any) {
      if (err?.isAbort) return // user closed popup
      trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.loginFailed, {
        surface: 'auth', source: 'auth_screen', method: 'google',
        status: err?.status ?? 0,
      })
      setAuthError(err?.message || i18n.t('auth.googleError'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── signInWithEmail ──────────────────────────────────────────────────────
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null)
    setIsLoading(true)
    trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.loginStarted, {
      surface: 'auth', source: 'auth_screen', method: 'email',
    })
    try {
      await pb.collection('users').authWithPassword(email, password)
      discardCapturedReferralCode()
      op.track('login_completed', { method: 'email' })
    } catch (err: any) {
      trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.loginFailed, {
        surface: 'auth', source: 'auth_screen', method: 'email',
        status: err?.status ?? 0,
      })
      setAuthError(err?.message || i18n.t('auth.loginError'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── signUpWithEmail ─────────────────────────────────────────────────────
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    setAuthError(null)
    setIsLoading(true)
    trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.signupStarted, {
      surface: 'auth', source: 'auth_screen', method: 'email',
    })
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        display_name: displayName,
      })
      // Auto-login after signup
      const result = await pb.collection('users').authWithPassword(email, password)
      if (result.record && !result.record.referral_code) {
        registrationMethod.current = 'email'
      }
    } catch (err: any) {
      trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.signupFailed, {
        surface: 'auth', source: 'auth_screen', method: 'email',
        status: err?.status ?? 0,
      })
      setAuthError(err?.message || i18n.t('auth.signupError'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── signUpWithMembership ────────────────────────────────────────────────
  // Alta + login + subida del documento e-Devlet en una sola operación. Si el
  // documento falla, la cuenta ya está autenticada y el estado sigue pendiente:
  // la pantalla de estado ofrece reintentar la subida.
  const signUpWithMembership = useCallback(async (input: MembershipSignupInput): Promise<MembershipSignupResult> => {
    setAuthError(null)
    setIsLoading(true)
    trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.signupStarted, {
      surface: 'auth', source: 'auth_screen', method: 'email', membership: true,
    })
    try {
      const created = await pb.collection('users').create({
        email: input.email.trim(),
        password: input.password,
        passwordConfirm: input.password,
        display_name: input.displayName.trim(),
        birth_date: input.birthDate,
        legal_status: input.legalStatus,
        phone: input.phone?.trim() || '',
        city: input.city?.trim() || '',
        kvkk_consent: true,
      })

      await pb.collection('users').authWithPassword(input.email.trim(), input.password)

      let documentError: string | undefined
      try {
        const formData = new FormData()
        formData.append('user', created.id)
        formData.append('doc_type', input.docType)
        formData.append('document', input.file)
        await pb.collection('membership_documents').create(formData)
      } catch {
        documentError = 'Belgeniz yüklenemedi. Başvurunuz kaydedildi; aşağıdan belgenizi tekrar yükleyebilirsiniz.'
      }

      if (!documentError) {
        // Belge hook'u üyeliği otomatik approved yaptı; authStore'daki kullanıcı
        // kaydını tazele ki kapı beklemeden açılsın.
        try {
          await pb.collection('users').authRefresh()
        } catch {
          // Yine de pending ekranından "Durumu Yenile" ile açılabilir.
        }
      }

      op.track('signup_completed', { method: 'email', membership: true })
      return { ok: true, documentError }
    } catch (err) {
      trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.signupFailed, {
        surface: 'auth', source: 'auth_screen', method: 'email',
        status: (err as { status?: number })?.status ?? 0,
      })
      const mapped = membershipSignupError(err)
      setAuthError(mapped.error ?? null)
      return mapped
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── signOut ──────────────────────────────────────────────────────────────
  const signOut = useCallback(() => {
    // Captura el id ANTES de logout(): luego authStore queda vacío.
    const signedOutUserId = pb.authStore.record?.id ?? pb.authStore.model?.id
    op.clear()
    resetIdentifiedUser()
    logout()
    // Limpia toda la caché de queries: evita que datos del usuario anterior
    // (nutrición, progreso, social…) persistan tras logout / cambio de cuenta.
    qc.clear()
    // Elimina las entradas de localStorage del usuario (offline-first hooks).
    clearUserStorage(signedOutUserId)
    // onChange listener limpia `user` automáticamente
  }, [qc])

  const userRole: UserRole = (user?.role as UserRole) || 'user'
  const userTier: UserTier = (user?.tier as UserTier) || 'free'
  const isAdmin = userRole === 'admin'
  const isEditor = userRole === 'editor'

  return {
    user, authReady, authError, isLoading, userRole, userTier, isAdmin, isEditor,
    signInWithGoogle, signInWithEmail, signUpWithEmail, signUpWithMembership, signOut,
  }
}
