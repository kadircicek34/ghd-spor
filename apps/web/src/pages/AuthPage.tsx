import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react'
import { captureChallengeId, captureReferralCode } from '@calistenia/core/hooks/useAuth'
import { CANONICAL_ANALYTICS_EVENTS, trackCanonicalEvent } from '@calistenia/core/lib/analytics'
import type { LegalStatus, MembershipDocType } from '@calistenia/core/types'
import { useAuthActions, useAuthState } from '../contexts/AuthContext'
import { GhdBrand } from '../components/ghd/GhdBrand'
import { useGhdMeta } from '../hooks/useGhdMeta'
import {
  DOC_TYPE_LABELS,
  LEGAL_STATUS_LABELS,
  MEMBERSHIP_FILE_ACCEPT,
  MEMBERSHIP_FILE_HINT,
  formatFileSize,
  friendlyLoginError,
  todayIsoDate,
  validateMembershipFile,
} from '../lib/membership'
import '../styles/ghd-brand.css'
import '../styles/ghd-auth.css'

const DOC_UPLOAD_ERROR_KEY = 'ghd_membership_document_error'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Mode = 'login' | 'signup'

type SignupField =
  | 'fullName'
  | 'email'
  | 'password'
  | 'passwordConfirm'
  | 'birthDate'
  | 'legalStatus'
  | 'phone'
  | 'city'
  | 'docType'
  | 'document'
  | 'kvkk'

type SignupErrors = Partial<Record<SignupField, string>>

interface SignupValues {
  fullName: string
  email: string
  password: string
  passwordConfirm: string
  birthDate: string
  legalStatus: LegalStatus | ''
  phone: string
  city: string
  docType: MembershipDocType | ''
  document: File | null
  kvkk: boolean
}

const SERVER_FIELD_TO_FORM: Record<string, SignupField> = {
  display_name: 'fullName',
  email: 'email',
  password: 'password',
  passwordConfirm: 'passwordConfirm',
  birth_date: 'birthDate',
  legal_status: 'legalStatus',
  phone: 'phone',
  city: 'city',
  kvkk_consent: 'kvkk',
}

const FORM_FOCUS_IDS: Record<SignupField, string> = {
  fullName: 'ghd-signup-name',
  email: 'ghd-signup-email',
  password: 'ghd-signup-password',
  passwordConfirm: 'ghd-signup-password-confirm',
  birthDate: 'ghd-signup-birth',
  legalStatus: 'ghd-signup-legal',
  phone: 'ghd-signup-phone',
  city: 'ghd-signup-city',
  docType: 'ghd-signup-doc-type',
  document: 'ghd-signup-document',
  kvkk: 'ghd-signup-kvkk',
}

function validateSignup(values: SignupValues): SignupErrors {
  const errors: SignupErrors = {}
  const today = todayIsoDate()

  if (!values.fullName.trim()) errors.fullName = 'Ad soyadınızı girin.'
  else if (values.fullName.trim().length < 3) errors.fullName = 'Ad soyadınızı eksiksiz girin.'

  if (!values.email.trim()) errors.email = 'E-posta adresinizi girin.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Geçerli bir e-posta adresi girin.'

  if (!values.password) errors.password = 'Bir şifre oluşturun.'
  else if (values.password.length < 8) errors.password = 'Şifre en az 8 karakter olmalı.'

  if (!values.passwordConfirm) errors.passwordConfirm = 'Şifrenizi bir kez daha girin.'
  else if (values.password !== values.passwordConfirm) errors.passwordConfirm = 'Şifreler eşleşmiyor.'

  if (!values.birthDate) errors.birthDate = 'Doğum tarihinizi girin.'
  else if (values.birthDate > today) errors.birthDate = 'Doğum tarihi gelecekte olamaz.'
  else if (values.birthDate < '1900-01-01') errors.birthDate = 'Geçerli bir doğum tarihi girin.'

  if (!values.legalStatus) errors.legalStatus = 'Hukuk statünüzü seçin.'
  if (!values.docType) errors.docType = 'Belge türünü seçin.'

  if (!values.document) errors.document = 'e-Devlet belgenizi yükleyin.'
  else {
    const fileError = validateMembershipFile(values.document)
    if (fileError) errors.document = fileError
  }

  if (!values.kvkk) errors.kvkk = 'Devam etmek için KVKK onayını işaretleyin.'

  const phoneDigits = values.phone.replace(/\D/g, '')
  if (values.phone.trim() && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
    errors.phone = 'Telefon numarasını ülke koduyla birlikte kontrol edin.'
  }
  if (values.city.trim().length > 60) errors.city = 'Şehir adı çok uzun.'

  return errors
}

export default function AuthPage() {
  useGhdMeta(
    'GHD Spor | Üyelik Başvurusu ve Giriş',
    'Global Hukukçular Derneği üyelerine özel GHD Spor platformuna giriş yapın veya üyelik başvurusu oluşturun.',
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const initialMode: Mode = searchParams.get('mode') === 'signup' || searchParams.get('ref') ? 'signup' : 'login'
  const [mode, setMode] = useState<Mode>(initialMode)

  const { authError, isLoading } = useAuthState()
  const { signInWithEmail, signUpWithMembership } = useAuthActions()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({})

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [birthDate, setBirthDate] = useState('')
  const [legalStatus, setLegalStatus] = useState<LegalStatus | ''>('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [docType, setDocType] = useState<MembershipDocType | ''>('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [kvkk, setKvkk] = useState(false)
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const today = todayIsoDate()

  useEffect(() => {
    const nextMode = searchParams.get('mode')
    if (nextMode === 'login' || nextMode === 'signup') setMode(nextMode)
  }, [searchParams])

  // Conserva los flujos de invitación/reto existentes.
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) captureReferralCode(ref)
    const challenge = searchParams.get('challenge')
    if (challenge) captureChallengeId(challenge)
  }, [searchParams])

  useEffect(() => {
    trackCanonicalEvent(CANONICAL_ANALYTICS_EVENTS.authViewed, {
      surface: 'auth', source: 'ghd_auth_page', mode: initialMode,
      has_referral: !!searchParams.get('ref'),
      has_challenge: !!searchParams.get('challenge'),
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- una vista por visita

  const switchMode = (next: Mode) => {
    setMode(next)
    setFormError(null)
    const params = new URLSearchParams(searchParams)
    params.set('mode', next)
    setSearchParams(params, { replace: true })
  }

  const focusFirstError = (field: SignupField) => {
    document.getElementById(FORM_FOCUS_IDS[field])?.focus()
  }

  const applyServerFieldErrors = (fieldErrors?: Record<string, string>) => {
    if (!fieldErrors) return
    const mapped: SignupErrors = {}
    let first: SignupField | null = null
    for (const [serverField, message] of Object.entries(fieldErrors)) {
      const formField = SERVER_FIELD_TO_FORM[serverField]
      if (!formField) continue
      mapped[formField] = message
      if (!first) first = formField
    }
    setSignupErrors(prev => ({ ...prev, ...mapped }))
    if (first) focusFirstError(first)
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    const errors: { email?: string; password?: string } = {}
    if (!loginEmail.trim()) errors.email = 'E-posta adresinizi girin.'
    else if (!EMAIL_RE.test(loginEmail.trim())) errors.email = 'Geçerli bir e-posta adresi girin.'
    if (!loginPassword) errors.password = 'Şifrenizi girin.'
    setLoginErrors(errors)
    if (Object.keys(errors).length > 0) {
      document.getElementById(errors.email ? 'ghd-login-email' : 'ghd-login-password')?.focus()
      return
    }
    await signInWithEmail(loginEmail.trim(), loginPassword)
  }

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    try { sessionStorage.removeItem(DOC_UPLOAD_ERROR_KEY) } catch { /* modo privado */ }

    const values: SignupValues = {
      fullName, email, password, passwordConfirm, birthDate, legalStatus,
      phone, city, docType, document: documentFile, kvkk,
    }
    const errors = validateSignup(values)
    setSignupErrors(errors)
    if (Object.keys(errors).length > 0) {
      const first = (Object.keys(FORM_FOCUS_IDS) as SignupField[]).find(key => errors[key])
      if (first) focusFirstError(first)
      return
    }
    if (!documentFile || !legalStatus || !docType) return

    const result = await signUpWithMembership({
      email: email.trim(),
      password,
      displayName: fullName.trim(),
      birthDate,
      legalStatus,
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      file: documentFile,
      docType,
    })

    if (!result.ok) {
      applyServerFieldErrors(result.fieldErrors)
      setFormError(result.error ?? 'Başvuru gönderilemedi. Lütfen tekrar deneyin.')
      return
    }

    if (result.documentError) {
      try { sessionStorage.setItem(DOC_UPLOAD_ERROR_KEY, result.documentError) } catch { /* modo privado */ }
    }
    setSubmitted(true)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    setDocumentFile(selected)
    if (!selected) {
      setSignupErrors(prev => ({ ...prev, document: undefined }))
      return
    }
    const fileError = validateMembershipFile(selected)
    setSignupErrors(prev => ({ ...prev, document: fileError ?? undefined }))
  }

  const handleLegalStatusChange = (value: string) => {
    const next = value as LegalStatus | ''
    setLegalStatus(next)
    setSignupErrors(prev => ({ ...prev, legalStatus: undefined }))
    if (next === 'student') setDocType('student_certificate')
    else if (next === 'graduate') setDocType('diploma')
  }

  const loginError = friendlyLoginError(authError)

  if (submitted) {
    return (
      <div className="ghd-auth ghd-auth--success">
        <div className="ghd-auth__success-card">
          <img src="/ghd-icon-512.png" alt="" className="ghd-auth__success-seal" />
          <p className="ghd-eyebrow">GHD Spor</p>
          <h1 className="ghd-display">Başvurunuz alındı.</h1>
          <p>
            Dernek yönetimi belgenizi inceledikten sonra hesabınız aktifleşecek.
            Durum ekranına yönlendiriliyorsunuz…
          </p>
          <span className="ghd-spinner" aria-hidden="true" />
        </div>
      </div>
    )
  }

  return (
    <div className="ghd-auth">
      <aside className="ghd-auth__brand" aria-label="GHD Spor tanıtımı">
        <div className="ghd-auth__brand-inner">
          <GhdBrand subtitle="Spor Platformu" />

          <div className="ghd-auth__brand-center">
            <div className="ghd-auth__seal">
              <span aria-hidden="true" />
              <img src="/logo-ghd.jpg" alt="Global Hukukçular Derneği madalyon logosu" width={260} height={260} />
            </div>
            <p className="ghd-eyebrow">Global Hukukçular Derneği</p>
            <p className="ghd-auth__quote ghd-display">
              Hukukun disiplini,<br />
              <em>sporun gücü.</em>
            </p>
            <p className="ghd-auth__brand-text">
              Hukukçu kimliğinizle başvurun, e-Devlet belgenizle doğrulanın.
              Antrenman, beslenme ve topluluk özelliklerine tek bir çatı altında erişin.
            </p>
            <ul className="ghd-auth__points">
              <li><ShieldCheck size={15} aria-hidden="true" /> Üyelik kontrollü erişim</li>
              <li><LockKeyhole size={15} aria-hidden="true" /> KVKK uyumlu belge doğrulama</li>
              <li><FileCheck2 size={15} aria-hidden="true" /> e-Devlet belgesiyle onay</li>
            </ul>
          </div>

          <p className="ghd-auth__brand-foot">Justitia et Sapientia · Est. 2024</p>
        </div>
      </aside>

      <main className="ghd-auth__panel">
        <div className="ghd-auth__topbar">
          <Link to="/" className="ghd-auth__back">
            <ArrowLeft size={15} aria-hidden="true" /> Ana sayfa
          </Link>
          <span className="ghd-auth__exclusive">
            <LockKeyhole size={11} aria-hidden="true" /> Üyeye özel
          </span>
        </div>

        <div className="ghd-auth__card">
          <div className="ghd-auth__tabs" role="tablist" aria-label="Giriş veya üyelik başvurusu">
            <button
              id="ghd-tab-login"
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              aria-controls="ghd-panel-login"
              className={`ghd-auth__tab${mode === 'login' ? ' is-active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Üye Girişi
            </button>
            <button
              id="ghd-tab-signup"
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              aria-controls="ghd-panel-signup"
              className={`ghd-auth__tab${mode === 'signup' ? ' is-active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Üyelik Başvurusu
            </button>
          </div>

          {mode === 'login' ? (
            <section
              id="ghd-panel-login"
              role="tabpanel"
              aria-labelledby="ghd-tab-login"
              className="ghd-auth__panel-body"
            >
              <div className="ghd-auth__heading">
                <p className="ghd-eyebrow">Tekrar hoş geldiniz</p>
                <h1 className="ghd-display">Üye Girişi</h1>
                <p>Onaylı üyelik hesabınızla GHD Spor’a giriş yapın.</p>
              </div>

              {loginError ? (
                <div className="ghd-alert ghd-alert--error" role="alert">
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{loginError}</span>
                </div>
              ) : null}

              <form className="ghd-form" onSubmit={handleLogin} noValidate>
                <div className="ghd-field">
                  <label className="ghd-field__label" htmlFor="ghd-login-email">E-posta</label>
                  <input
                    id="ghd-login-email"
                    type="email"
                    className={`ghd-input${loginErrors.email ? ' is-invalid' : ''}`}
                    value={loginEmail}
                    onChange={event => {
                      setLoginEmail(event.target.value)
                      if (loginErrors.email) setLoginErrors(prev => ({ ...prev, email: undefined }))
                    }}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="ornek@eposta.com"
                    aria-invalid={Boolean(loginErrors.email)}
                    aria-describedby={loginErrors.email ? 'ghd-login-email-error' : undefined}
                  />
                  {loginErrors.email ? <p id="ghd-login-email-error" className="ghd-error-text">{loginErrors.email}</p> : null}
                </div>

                <div className="ghd-field">
                  <label className="ghd-field__label" htmlFor="ghd-login-password">Şifre</label>
                  <div className="ghd-input-wrap">
                    <input
                      id="ghd-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      className={`ghd-input${loginErrors.password ? ' is-invalid' : ''}`}
                      value={loginPassword}
                      onChange={event => {
                        setLoginPassword(event.target.value)
                        if (loginErrors.password) setLoginErrors(prev => ({ ...prev, password: undefined }))
                      }}
                      autoComplete="current-password"
                      placeholder="Şifreniz"
                      aria-invalid={Boolean(loginErrors.password)}
                      aria-describedby={loginErrors.password ? 'ghd-login-password-error' : undefined}
                    />
                    <button
                      type="button"
                      className="ghd-input-wrap__toggle"
                      onClick={() => setShowLoginPassword(value => !value)}
                      aria-label={showLoginPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {loginErrors.password ? <p id="ghd-login-password-error" className="ghd-error-text">{loginErrors.password}</p> : null}
                </div>

                <button type="submit" className="ghd-btn ghd-btn--gold ghd-btn--block" disabled={isLoading}>
                  {isLoading ? <span className="ghd-spinner" aria-hidden="true" /> : null}
                  {isLoading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
                  {!isLoading ? <ArrowRight size={16} className="ghd-btn__arrow" aria-hidden="true" /> : null}
                </button>
              </form>

              <p className="ghd-auth__switch">
                Henüz üye değil misiniz?{' '}
                <button type="button" onClick={() => switchMode('signup')}>Üyelik başvurusu yapın</button>
              </p>
            </section>
          ) : (
            <section
              id="ghd-panel-signup"
              role="tabpanel"
              aria-labelledby="ghd-tab-signup"
              className="ghd-auth__panel-body"
            >
              <div className="ghd-auth__heading">
                <p className="ghd-eyebrow">Aramıza katılın</p>
                <h1 className="ghd-display">Üyelik Başvurusu</h1>
                <p>
                  Başvurunuz dernek yönetimi tarafından incelenir. Onaydan sonra
                  kişisel paneliniz açılır.
                </p>
              </div>

              {formError ? (
                <div className="ghd-alert ghd-alert--error" role="alert">
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              ) : null}

              <form className="ghd-form" onSubmit={handleSignup} noValidate>
                <div className="ghd-form__grid">
                  <div className="ghd-field ghd-field--full">
                    <label className="ghd-field__label" htmlFor="ghd-signup-name">Ad soyad</label>
                    <input
                      id="ghd-signup-name"
                      type="text"
                      className={`ghd-input${signupErrors.fullName ? ' is-invalid' : ''}`}
                      value={fullName}
                      onChange={event => {
                        setFullName(event.target.value)
                        if (signupErrors.fullName) setSignupErrors(prev => ({ ...prev, fullName: undefined }))
                      }}
                      autoComplete="name"
                      placeholder="Adınız ve soyadınız"
                      aria-invalid={Boolean(signupErrors.fullName)}
                      aria-describedby={signupErrors.fullName ? 'ghd-signup-name-error' : undefined}
                    />
                    {signupErrors.fullName ? <p id="ghd-signup-name-error" className="ghd-error-text">{signupErrors.fullName}</p> : null}
                  </div>

                  <div className="ghd-field ghd-field--full">
                    <label className="ghd-field__label" htmlFor="ghd-signup-email">E-posta</label>
                    <input
                      id="ghd-signup-email"
                      type="email"
                      className={`ghd-input${signupErrors.email ? ' is-invalid' : ''}`}
                      value={email}
                      onChange={event => {
                        setEmail(event.target.value)
                        if (signupErrors.email) setSignupErrors(prev => ({ ...prev, email: undefined }))
                      }}
                      autoComplete="email"
                      inputMode="email"
                      placeholder="ornek@eposta.com"
                      aria-invalid={Boolean(signupErrors.email)}
                      aria-describedby={signupErrors.email ? 'ghd-signup-email-error' : undefined}
                    />
                    {signupErrors.email ? <p id="ghd-signup-email-error" className="ghd-error-text">{signupErrors.email}</p> : null}
                  </div>

                  <div className="ghd-field">
                    <label className="ghd-field__label" htmlFor="ghd-signup-password">Şifre</label>
                    <div className="ghd-input-wrap">
                      <input
                        id="ghd-signup-password"
                        type={showPassword ? 'text' : 'password'}
                        className={`ghd-input${signupErrors.password ? ' is-invalid' : ''}`}
                        value={password}
                        onChange={event => {
                          setPassword(event.target.value)
                          if (signupErrors.password) setSignupErrors(prev => ({ ...prev, password: undefined }))
                        }}
                        autoComplete="new-password"
                        placeholder="En az 8 karakter"
                        aria-invalid={Boolean(signupErrors.password)}
                        aria-describedby={signupErrors.password ? 'ghd-signup-password-error' : 'ghd-signup-password-hint'}
                      />
                      <button
                        type="button"
                        className="ghd-input-wrap__toggle"
                        onClick={() => setShowPassword(value => !value)}
                        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {signupErrors.password
                      ? <p id="ghd-signup-password-error" className="ghd-error-text">{signupErrors.password}</p>
                      : <p id="ghd-signup-password-hint" className="ghd-field__hint">En az 8 karakter.</p>}
                  </div>

                  <div className="ghd-field">
                    <label className="ghd-field__label" htmlFor="ghd-signup-password-confirm">Şifre tekrar</label>
                    <input
                      id="ghd-signup-password-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className={`ghd-input${signupErrors.passwordConfirm ? ' is-invalid' : ''}`}
                      value={passwordConfirm}
                      onChange={event => {
                        setPasswordConfirm(event.target.value)
                        if (signupErrors.passwordConfirm) setSignupErrors(prev => ({ ...prev, passwordConfirm: undefined }))
                      }}
                      autoComplete="new-password"
                      placeholder="Şifrenizi tekrarlayın"
                      aria-invalid={Boolean(signupErrors.passwordConfirm)}
                      aria-describedby={signupErrors.passwordConfirm ? 'ghd-signup-password-confirm-error' : undefined}
                    />
                    {signupErrors.passwordConfirm ? <p id="ghd-signup-password-confirm-error" className="ghd-error-text">{signupErrors.passwordConfirm}</p> : null}
                  </div>

                  <div className="ghd-field">
                    <label className="ghd-field__label" htmlFor="ghd-signup-birth">Doğum tarihi</label>
                    <input
                      id="ghd-signup-birth"
                      type="date"
                      className={`ghd-input${signupErrors.birthDate ? ' is-invalid' : ''}`}
                      value={birthDate}
                      max={today}
                      min="1900-01-01"
                      onChange={event => {
                        setBirthDate(event.target.value)
                        if (signupErrors.birthDate) setSignupErrors(prev => ({ ...prev, birthDate: undefined }))
                      }}
                      autoComplete="bday"
                      aria-invalid={Boolean(signupErrors.birthDate)}
                      aria-describedby={signupErrors.birthDate ? 'ghd-signup-birth-error' : undefined}
                    />
                    {signupErrors.birthDate ? <p id="ghd-signup-birth-error" className="ghd-error-text">{signupErrors.birthDate}</p> : null}
                  </div>

                  <div className="ghd-field">
                    <label className="ghd-field__label" htmlFor="ghd-signup-legal">Hukuk statüsü</label>
                    <select
                      id="ghd-signup-legal"
                      className={`ghd-select${signupErrors.legalStatus ? ' is-invalid' : ''}`}
                      value={legalStatus}
                      onChange={event => handleLegalStatusChange(event.target.value)}
                      aria-invalid={Boolean(signupErrors.legalStatus)}
                      aria-describedby={signupErrors.legalStatus ? 'ghd-signup-legal-error' : undefined}
                    >
                      <option value="">Seçiniz</option>
                      <option value="student">{LEGAL_STATUS_LABELS.student}</option>
                      <option value="graduate">{LEGAL_STATUS_LABELS.graduate}</option>
                    </select>
                    {signupErrors.legalStatus ? <p id="ghd-signup-legal-error" className="ghd-error-text">{signupErrors.legalStatus}</p> : null}
                  </div>

                  <div className="ghd-field">
                    <label className="ghd-field__label" htmlFor="ghd-signup-phone">
                      Telefon <span className="ghd-field__optional">isteğe bağlı</span>
                    </label>
                    <input
                      id="ghd-signup-phone"
                      type="tel"
                      className={`ghd-input${signupErrors.phone ? ' is-invalid' : ''}`}
                      value={phone}
                      onChange={event => {
                        setPhone(event.target.value)
                        if (signupErrors.phone) setSignupErrors(prev => ({ ...prev, phone: undefined }))
                      }}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+90 5xx xxx xx xx"
                      aria-invalid={Boolean(signupErrors.phone)}
                      aria-describedby={signupErrors.phone ? 'ghd-signup-phone-error' : undefined}
                    />
                    {signupErrors.phone ? <p id="ghd-signup-phone-error" className="ghd-error-text">{signupErrors.phone}</p> : null}
                  </div>

                  <div className="ghd-field">
                    <label className="ghd-field__label" htmlFor="ghd-signup-city">
                      Şehir <span className="ghd-field__optional">isteğe bağlı</span>
                    </label>
                    <input
                      id="ghd-signup-city"
                      type="text"
                      className={`ghd-input${signupErrors.city ? ' is-invalid' : ''}`}
                      value={city}
                      onChange={event => {
                        setCity(event.target.value)
                        if (signupErrors.city) setSignupErrors(prev => ({ ...prev, city: undefined }))
                      }}
                      autoComplete="address-level2"
                      placeholder="Örn. Ankara"
                      aria-invalid={Boolean(signupErrors.city)}
                      aria-describedby={signupErrors.city ? 'ghd-signup-city-error' : undefined}
                    />
                    {signupErrors.city ? <p id="ghd-signup-city-error" className="ghd-error-text">{signupErrors.city}</p> : null}
                  </div>

                  <div className="ghd-field ghd-field--full">
                    <label className="ghd-field__label" htmlFor="ghd-signup-doc-type">Belge türü</label>
                    <select
                      id="ghd-signup-doc-type"
                      className={`ghd-select${signupErrors.docType ? ' is-invalid' : ''}`}
                      value={docType}
                      onChange={event => {
                        setDocType(event.target.value as MembershipDocType | '')
                        if (signupErrors.docType) setSignupErrors(prev => ({ ...prev, docType: undefined }))
                      }}
                      aria-invalid={Boolean(signupErrors.docType)}
                      aria-describedby={signupErrors.docType ? 'ghd-signup-doc-type-error' : undefined}
                    >
                      <option value="">Seçiniz</option>
                      <option value="student_certificate">{DOC_TYPE_LABELS.student_certificate}</option>
                      <option value="diploma">{DOC_TYPE_LABELS.diploma}</option>
                    </select>
                    {signupErrors.docType ? <p id="ghd-signup-doc-type-error" className="ghd-error-text">{signupErrors.docType}</p> : null}
                  </div>

                  <div className="ghd-field ghd-field--full">
                    <span className="ghd-field__label" id="ghd-signup-document-label">e-Devlet belgesi</span>
                    <label
                      className={`ghd-file${signupErrors.document ? ' is-invalid' : ''}${documentFile ? ' has-file' : ''}`}
                      htmlFor="ghd-signup-document"
                    >
                      <input
                        id="ghd-signup-document"
                        type="file"
                        accept={MEMBERSHIP_FILE_ACCEPT}
                        onChange={handleFileChange}
                        className="ghd-file__input"
                        aria-describedby={signupErrors.document ? 'ghd-signup-document-error' : 'ghd-signup-document-hint'}
                      />
                      {documentFile ? (
                        <>
                          <FileText size={22} aria-hidden="true" />
                          <span className="ghd-file__meta">
                            <strong>{documentFile.name}</strong>
                            <small>{formatFileSize(documentFile.size)} · Değiştirmek için tıklayın</small>
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            className="ghd-file__remove"
                            aria-label="Seçilen belgeyi kaldır"
                            onClick={event => {
                              event.preventDefault()
                              event.stopPropagation()
                              setDocumentFile(null)
                              setSignupErrors(prev => ({ ...prev, document: undefined }))
                              const input = document.getElementById('ghd-signup-document') as HTMLInputElement | null
                              if (input) input.value = ''
                            }}
                            onKeyDown={event => {
                              if (event.key !== 'Enter' && event.key !== ' ') return
                              event.preventDefault()
                              event.stopPropagation()
                              setDocumentFile(null)
                              setSignupErrors(prev => ({ ...prev, document: undefined }))
                              const input = document.getElementById('ghd-signup-document') as HTMLInputElement | null
                              if (input) input.value = ''
                            }}
                          >
                            <X size={16} />
                          </span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={22} aria-hidden="true" />
                          <span className="ghd-file__meta">
                            <strong>Belgenizi seçin veya sürükleyin</strong>
                            <small>{MEMBERSHIP_FILE_HINT}</small>
                          </span>
                        </>
                      )}
                    </label>
                    {signupErrors.document
                      ? <p id="ghd-signup-document-error" className="ghd-error-text">{signupErrors.document}</p>
                      : <p id="ghd-signup-document-hint" className="ghd-field__hint">e-Devlet’ten aldığınız öğrenci belgesi veya diploma.</p>}
                  </div>

                  <div className="ghd-field ghd-field--full">
                    <label className="ghd-check" htmlFor="ghd-signup-kvkk">
                      <input
                        id="ghd-signup-kvkk"
                        type="checkbox"
                        checked={kvkk}
                        onChange={event => {
                          setKvkk(event.target.checked)
                          if (signupErrors.kvkk) setSignupErrors(prev => ({ ...prev, kvkk: undefined }))
                        }}
                        aria-invalid={Boolean(signupErrors.kvkk)}
                        aria-describedby={signupErrors.kvkk ? 'ghd-signup-kvkk-error' : undefined}
                      />
                      <span>
                        <a href="/legal#privacy" target="_blank" rel="noopener noreferrer">KVKK Aydınlatma Metni</a>’ni
                        okudum; kişisel verilerimin üyelik doğrulaması amacıyla işlenmesine onay veriyorum.
                      </span>
                    </label>
                    {signupErrors.kvkk ? <p id="ghd-signup-kvkk-error" className="ghd-error-text">{signupErrors.kvkk}</p> : null}
                  </div>
                </div>

                <button type="submit" className="ghd-btn ghd-btn--gold ghd-btn--block ghd-auth__submit" disabled={isLoading}>
                  {isLoading ? <span className="ghd-spinner" aria-hidden="true" /> : null}
                  {isLoading ? 'Başvurunuz oluşturuluyor…' : 'Başvuruyu Gönder'}
                  {!isLoading ? <ArrowRight size={16} className="ghd-btn__arrow" aria-hidden="true" /> : null}
                </button>

                <p className="ghd-auth__fine">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  Başvurunuz onaylanana kadar uygulama içeriği görünmez.
                </p>
              </form>

              <p className="ghd-auth__switch">
                Zaten üye misiniz?{' '}
                <button type="button" onClick={() => switchMode('login')}>Üye girişi yapın</button>
              </p>
            </section>
          )}

          <div className="ghd-auth__legal">
            <Link to="/legal#privacy">KVKK</Link>
            <span aria-hidden="true">·</span>
            <Link to="/legal">Kullanım Koşulları</Link>
            <span aria-hidden="true">·</span>
            <a href="mailto:info@globalhukukcular.com">Destek</a>
          </div>
        </div>
      </main>
    </div>
  )
}
