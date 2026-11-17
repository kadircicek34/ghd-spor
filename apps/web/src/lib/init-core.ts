/**
 * Inicialización de @calistenia/core para web.
 *
 * DEBE ser de los primeros imports de main.tsx (solo después de Sentry):
 * los módulos de core leen el platform adapter al evaluarse.
 */
import * as Sentry from '@sentry/react'
import { OpenPanel } from '@openpanel/web'
import { initCore } from '@calistenia/core/platform'
import { shouldSendAnalytics } from '@calistenia/core/lib/analytics'

// GHD: hiçbir dış analitik servisi varsayılan olarak açık değildir. Upstream'de
// gömülü OpenPanel URL/client ID vardı; üye verileri üçüncü tarafa gidiyordu.
// Kendi OpenPanel kurulumunuz varsa deploy sırasında iki env değişkenini verin.
const opApiUrl = import.meta.env.VITE_OPENPANEL_API_URL || ''
const opClientId = import.meta.env.VITE_OPENPANEL_CLIENT_ID || ''
const analyticsConfigured = Boolean(opApiUrl && opClientId)

// Session replay yalnızca açıkça yapılandırılmışsa ve gerçek tarayıcıda çalışır.
const replayEnabled =
  analyticsConfigured &&
  !import.meta.env.DEV &&
  typeof navigator !== 'undefined' &&
  !navigator.webdriver

const op = analyticsConfigured
  ? new OpenPanel({
      apiUrl: opApiUrl,
      clientId: opClientId,
      trackScreenViews: true,
      trackOutgoingLinks: true,
      trackAttributes: true,
      filter: shouldSendAnalytics,
      sessionReplay: {
        enabled: replayEnabled,
        maskAllText: true,
        unmaskTextSelector: '[data-op-unmask]',
      },
    })
  : null

initCore({
  storage: localStorage,
  // Estado de una sola sesión (snapshot de carrera): F5 lo conserva, cerrar la pestaña no.
  sessionStorage,
  env: {
    // Vacío en prod → la web se sirve desde el propio PocketBase
    pbUrl: import.meta.env.VITE_POCKETBASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8090' : window.location.origin),
    // GHD: AI API varsayılan olarak kapalı. Upstream sunucusuna veri gönderilmez.
    aiApiUrl: import.meta.env.VITE_AI_API_URL || '',
    isDev: import.meta.env.DEV,
    // Identidad del cliente → cabeceras X-App-* en cada request a PocketBase.
    // `build: 0` a propósito: la web no tiene builds instalados que puedan
    // quedarse atrás (el service worker en modo prompt ya la actualiza sola), y
    // `evaluateUpdate` trata el 0 como "nunca bloquear". La versión sigue
    // viajando para poder correlacionar un bug con un deploy concreto.
    client: { version: __APP_VERSION__, build: 0, platform: 'web' },
  },
  analytics: {
    track: (name, properties) => {
      op?.track(name, properties)
    },
    identify: (payload) => {
      op?.identify(payload as Parameters<OpenPanel['identify']>[0])
      // Sentry yapılandırılmadıysa kullanıcı kimliği hiçbir yere gönderilmez.
      if (Sentry.getClient()) {
        const profileId = (payload as { profileId?: string }).profileId
        if (profileId) Sentry.setUser({ id: profileId })
      }
    },
    clear: () => {
      op?.clear()
      if (Sentry.getClient()) Sentry.setUser(null)
    },
  },
  reportError: (e, context) => Sentry.captureException(e, context),
  lifecycle: {
    isForeground: () => document.visibilityState === 'visible',
    onForeground: (handler) => {
      const onVisibility = () => {
        if (document.visibilityState === 'visible') handler()
      }
      document.addEventListener('visibilitychange', onVisibility)
      return () => document.removeEventListener('visibilitychange', onVisibility)
    },
    onBackground: (handler) => {
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') handler()
      }
      document.addEventListener('visibilitychange', onVisibility)
      return () => document.removeEventListener('visibilitychange', onVisibility)
    },
  },
  connectivity: {
    isOnline: () => navigator.onLine,
    onOnline: (handler) => {
      window.addEventListener('online', handler)
      return () => window.removeEventListener('online', handler)
    },
    onChange: (handler) => {
      const on = () => handler(true)
      const off = () => handler(false)
      window.addEventListener('online', on)
      window.addEventListener('offline', off)
      return () => {
        window.removeEventListener('online', on)
        window.removeEventListener('offline', off)
      }
    },
  },
})
