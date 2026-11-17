import { beforeEach, describe, expect, it, vi } from 'vitest'
import { op } from '../lib/analytics'
import { identifyUser, resetIdentifiedUser } from './useAuth'

vi.mock('../platform', () => ({
  storage: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
  lifecycle: { onForeground: vi.fn(() => vi.fn()) },
  // #636 §5: `identifyUser` sella `platform` en el perfil. Sin esto,
  // `analyticsPlatform()` cae en su try/catch y devuelve 'unknown', que es
  // justo lo que el fix arregla.
  getClientInfo: () => ({ version: '1.0.0', build: 0, platform: 'web' as const }),
}))
vi.mock('../lib/pocketbase', () => ({
  pb: { authStore: { onChange: vi.fn(() => vi.fn()) }, collection: vi.fn() },
  getCurrentUser: vi.fn(() => null),
  loginWithOAuth2: vi.fn(),
  logout: vi.fn(),
  tryRefreshAuth: vi.fn(),
  verifyAuth: vi.fn(),
}))
vi.mock('../lib/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/analytics')>()
  return { ...actual, op: { track: vi.fn(), identify: vi.fn(), clear: vi.fn() }, trackCanonicalEvent: vi.fn() }
})

beforeEach(() => { vi.clearAllMocks(); resetIdentifiedUser() })

describe('identifyUser (usuarios anónimos en OpenPanel)', () => {
  it('manda profileId = id de PB sin PII; email/nombre analitiğe gitmez', () => {
    identifyUser({ id: 'u1', display_name: 'Ana', email: 'a@x.test' })
    expect(op.identify).toHaveBeenCalledWith({
      profileId: 'u1',
      // GHD: KVKK gereği e-posta/ad gönderilmez; yalnızca takma kimlik.
      properties: { tier: 'free', role: 'user', platform: 'web' },
    })
    const payload = vi.mocked(op.identify).mock.calls[0][0] as Record<string, unknown>
    expect(payload.email).toBeUndefined()
    expect(payload.firstName).toBeUndefined()
  })

  it('es idempotente por id: un refresh de token no reenvía el identify', () => {
    identifyUser({ id: 'u1' })
    identifyUser({ id: 'u1' })
    expect(op.identify).toHaveBeenCalledTimes(1)
  })

  it('otro usuario (o el mismo tras logout) vuelve a identificarse', () => {
    identifyUser({ id: 'u1' })
    identifyUser({ id: 'u2' })
    resetIdentifiedUser()
    identifyUser({ id: 'u1' })
    expect(op.identify).toHaveBeenCalledTimes(3)
  })
})
