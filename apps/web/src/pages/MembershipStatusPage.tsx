import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Check,
  Clock3,
  FileCheck2,
  FileText,
  LockKeyhole,
  LogOut,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react'
import { pb } from '@calistenia/core/lib/pocketbase'
import type { MembershipDocType, MembershipDocument } from '@calistenia/core/types'
import { useAuthActions, useAuthState } from '../contexts/AuthContext'
import { GhdBrand } from '../components/ghd/GhdBrand'
import { useGhdMeta } from '../hooks/useGhdMeta'
import {
  DOC_TYPE_LABELS,
  GHD_SUPPORT_EMAIL,
  MEMBERSHIP_FILE_ACCEPT,
  MEMBERSHIP_FILE_HINT,
  fetchMembershipFileToken,
  formatFileSize,
  formatTrDate,
  formatTrDateTime,
  getMembershipStatus,
  membershipDocumentUrl,
  validateMembershipFile,
} from '../lib/membership'
import '../styles/ghd-brand.css'
import '../styles/ghd-status.css'

const DOC_UPLOAD_ERROR_KEY = 'ghd_membership_document_error'

type StepState = 'done' | 'current' | 'upcoming' | 'error'

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') return <Check size={14} aria-hidden="true" />
  if (state === 'error') return <X size={14} aria-hidden="true" />
  if (state === 'upcoming') return <LockKeyhole size={13} aria-hidden="true" />
  return <Clock3 size={14} aria-hidden="true" />
}

function readSignupDocumentError(): string | null {
  try { return sessionStorage.getItem(DOC_UPLOAD_ERROR_KEY) } catch { return null }
}

export default function MembershipStatusPage() {
  useGhdMeta(
    'Üyelik Durumu | GHD Spor',
    'Global Hukukçular Derneği spor platformu üyelik başvurunuzun durumunu görüntüleyin.',
  )

  const navigate = useNavigate()
  const { user, authReady } = useAuthState()
  const { signOut } = useAuthActions()

  const [documents, setDocuments] = useState<MembershipDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [docsError, setDocsError] = useState<string | null>(null)
  const [fileToken, setFileToken] = useState<string | null>(null)
  const [fileTokenError, setFileTokenError] = useState(false)
  const [signupDocError, setSignupDocError] = useState<string | null>(readSignupDocumentError)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<MembershipDocType>(
    user?.legal_status === 'graduate' ? 'diploma' : 'student_certificate',
  )
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)

  const userId = user?.id
  const status = getMembershipStatus(user)

  const loadDocuments = useCallback(async () => {
    if (!userId) return
    setDocsLoading(true)
    setDocsError(null)
    try {
      const result = await pb.collection('membership_documents').getList(1, 25, {
        filter: pb.filter('user = {:userId}', { userId }),
        sort: '-created',
        $autoCancel: false,
      })
      setDocuments(result.items as unknown as MembershipDocument[])
    } catch (error) {
      const statusCode = (error as { status?: number })?.status
      setDocuments([])
      setDocsError(
        statusCode === 403 || statusCode === 404
          ? 'Belge durumu şu anda görüntülenemiyor. Belgenizi yeniden yükleyebilir veya dernekle iletişime geçebilirsiniz.'
          : 'Belge durumu alınamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.',
      )
    } finally {
      setDocsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    void loadDocuments()
  }, [userId, loadDocuments])

  // Los documentos son ficheros protegidos: sin token de fichero el enlace
  // devuelve 404. Se obtiene uno al cargar la pantalla y se renueva al subir.
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setFileTokenError(false)
    fetchMembershipFileToken()
      .then(token => { if (!cancelled) setFileToken(token) })
      .catch(() => {
        if (!cancelled) {
          setFileToken(null)
          setFileTokenError(true)
        }
      })
    return () => { cancelled = true }
  }, [userId])

  // Belge yüklendiyse backend otomatik onaylar; authStore'u kısa aralıklarla
  // tazeleyerek onayın panele dönüşmesini bekle.
  useEffect(() => {
    if (!userId || getMembershipStatus(user) !== 'pending' || documents.length === 0) return
    const timer = setInterval(() => {
      void pb.collection('users').authRefresh().catch(() => {})
    }, 3000)
    return () => clearInterval(timer)
  }, [userId, user, documents.length])

  if (!authReady) {
    return (
      <div className="ghd-status ghd-status--centered">
        <span className="ghd-spinner" aria-label="Yükleniyor" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth?mode=login" replace />
  if (status === 'approved') return <Navigate to="/" replace />

  const pending = status === 'pending'
  const needsDocument = !docsLoading && documents.length === 0
  const showUpload = needsDocument || uploadOpen || Boolean(uploadError) || Boolean(signupDocError) || Boolean(docsError)

  const steps: Array<{ title: string; text: string; state: StepState }> = [
    {
      title: 'Başvuru alındı',
      text: 'Başvuru formunuz ve kişisel bilgileriniz kaydedildi.',
      state: 'done',
    },
    {
      title: 'Belge doğrulaması',
      text: documents.length > 0
        ? 'e-Devlet belgeniz alındı; otomatik onaya hazır.'
        : 'e-Devlet öğrenci belgesi veya diplomanız bekleniyor.',
      state: documents.length > 0 ? 'done' : 'current',
    },
    {
      title: 'Otomatik onay',
      text: pending
        ? (documents.length > 0
            ? 'Belgeniz alındı; üyeliğiniz otomatik onaylanıyor.'
            : 'e-Devlet belgeniz yüklendiğinde üyeliğiniz otomatik onaylanır.')
        : 'Başvurunuz otomatik doğrulanamadı; dernek yönetimi bilgilendirdi.',
      state: pending ? (documents.length > 0 ? 'current' : 'upcoming') : 'error',
    },
    {
      title: 'Kişisel panele erişim',
      text: 'Onay sonrası antrenman, beslenme ve topluluk özellikleri açılır.',
      state: 'upcoming',
    },
  ]

  const handleSignOut = () => {
    signOut()
    navigate('/auth?mode=login', { replace: true })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMessage(null)
    try {
      await pb.collection('users').authRefresh()
      await loadDocuments()
      setRefreshMessage('Durumunuz güncellendi.')
    } catch {
      setRefreshMessage('Durum kontrol edilemedi. Lütfen kısa bir süre sonra tekrar deneyin.')
    } finally {
      setRefreshing(false)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setUploadError(null)
    setUploadSuccess(null)
    setFileError(selected ? validateMembershipFile(selected) : null)
  }

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault()
    setUploadError(null)
    setUploadSuccess(null)
    const validation = validateMembershipFile(file)
    if (validation) {
      setFileError(validation)
      return
    }
    if (!file) return

    setFileError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('user', user.id)
      formData.append('doc_type', docType)
      formData.append('document', file)
      await pb.collection('membership_documents').create(formData)
      // Hook üyeliği otomatik approved yaptı; kapı hemen açılsın.
      try { await pb.collection('users').authRefresh() } catch { /* polling devralır */ }
      setFile(null)
      setUploadSuccess('Belgeniz yüklendi. Üyeliğiniz otomatik onaylanıyor; paneliniz birazdan açılacak.')
      setSignupDocError(null)
      try { sessionStorage.removeItem(DOC_UPLOAD_ERROR_KEY) } catch { /* modo privado */ }
      const input = document.getElementById('ghd-status-document') as HTMLInputElement | null
      if (input) input.value = ''
      await loadDocuments()
      try {
        setFileToken(await fetchMembershipFileToken(true))
        setFileTokenError(false)
      } catch {
        setFileToken(null)
        setFileTokenError(true)
      }
    } catch (error) {
      const statusCode = (error as { status?: number })?.status
      setUploadError(
        statusCode === 403
          ? 'Belge yüklenemedi: bu işlem için oturum yetkiniz doğrulanamadı. Lütfen çıkış yapıp yeniden giriş yapın.'
          : 'Belge yüklenemedi. Lütfen dosyanızı kontrol edip tekrar deneyin veya info@globalhukukcular.com ile iletişime geçin.',
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`ghd-status${pending ? '' : ' ghd-status--rejected'}`}>
      <header className="ghd-status__header">
        <div className="ghd-status__header-inner">
          <GhdBrand subtitle="Üyelik Durumu" />
          <div className="ghd-status__header-actions">
            <a href={`mailto:${GHD_SUPPORT_EMAIL}`} className="ghd-status__header-link">
              <Mail size={14} aria-hidden="true" /> Destek
            </a>
            <button type="button" className="ghd-status__logout" onClick={handleSignOut}>
              <LogOut size={14} aria-hidden="true" /> Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="ghd-status__main">
        <section className="ghd-status__card" aria-labelledby="ghd-status-title">
          <div className="ghd-status__badge">
            {pending ? <Clock3 size={13} aria-hidden="true" /> : <ShieldAlert size={13} aria-hidden="true" />}
            {pending ? 'Otomatik doğrulama' : 'Başvuru reddedildi'}
          </div>

          <div className="ghd-status__seal" aria-hidden="true">
            <img src="/logo-ghd.jpg" alt="" width={150} height={150} />
            <span className="ghd-status__seal-icon">
              {pending ? <Clock3 size={18} /> : <X size={18} />}
            </span>
          </div>

          <p className="ghd-eyebrow">Üyelik başvurusu</p>
          <h1 id="ghd-status-title" className="ghd-display ghd-status__title">
            {pending ? (documents.length > 0 ? 'Belgeniz doğrulanıyor' : 'Belgenizi yükleyin') : 'Başvurunuz reddedildi'}
          </h1>
          <p className="ghd-status__lead">
            {pending
              ? (documents.length > 0
                  ? 'e-Devlet belgeniz alındı. Üyeliğiniz otomatik onaylanıyor; birkaç saniye içinde kişisel paneliniz açılacak.'
                  : 'Üyeliğinizin otomatik onaylanması için e-Devlet öğrenci belgenizi veya diplomanızı yükleyin.')
              : 'Başvurunuz otomatik doğrulanamadı. Aşağıdaki notu inceleyebilir ve dernekle iletişime geçebilirsiniz.'}
          </p>

          <div className="ghd-status__meta">
            <span>Başvuru tarihi: <strong>{formatTrDate(user.created)}</strong></span>
            <span>Hukuk statüsü: <strong>{user.legal_status === 'graduate' ? 'Mezun' : 'Öğrenci'}</strong></span>
            <span>E-posta: <strong>{user.email}</strong></span>
          </div>

          {user.membership_note ? (
            <div className="ghd-status__note" role="note">
              <p className="ghd-status__note-title">Dernek yönetiminin notu</p>
              <p>{user.membership_note}</p>
            </div>
          ) : null}

          {refreshMessage ? (
            <p className="ghd-status__refresh-message" role="status">{refreshMessage}</p>
          ) : null}

          <div className="ghd-status__actions">
            <button
              type="button"
              className="ghd-btn ghd-btn--soft ghd-btn--sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? <span className="ghd-spinner" aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
              {refreshing ? 'Kontrol ediliyor…' : 'Durumu Yenile'}
            </button>
            <a
              href={`mailto:${GHD_SUPPORT_EMAIL}?subject=${encodeURIComponent('GHD Spor üyelik başvurusu')}`}
              className="ghd-btn ghd-btn--ghost ghd-btn--sm"
            >
              <Mail size={14} aria-hidden="true" /> Dernekle İletişime Geç
            </a>
          </div>
        </section>

        <section className="ghd-status__block" aria-labelledby="ghd-status-steps-title">
          <div className="ghd-status__block-head">
            <p className="ghd-eyebrow">Süreç</p>
            <h2 id="ghd-status-steps-title" className="ghd-display">Başvurunuzun aşamaları</h2>
          </div>
          <ol className="ghd-status__steps">
            {steps.map((step, index) => (
              <li key={step.title} className={`ghd-status__step is-${step.state}`}>
                <span className="ghd-status__step-marker"><StepIcon state={step.state} /></span>
                <span className="ghd-status__step-index" aria-hidden="true">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="ghd-status__block" aria-labelledby="ghd-status-docs-title">
          <div className="ghd-status__block-head ghd-status__block-head--row">
            <div>
              <p className="ghd-eyebrow">Belge durumu</p>
              <h2 id="ghd-status-docs-title" className="ghd-display">e-Devlet belgeniz</h2>
            </div>
            {!showUpload ? (
              <button
                type="button"
                className="ghd-btn ghd-btn--soft ghd-btn--sm"
                onClick={() => setUploadOpen(true)}
              >
                <UploadCloud size={14} aria-hidden="true" /> Yeni belge ekle
              </button>
            ) : null}
          </div>

          {signupDocError ? (
            <div className="ghd-alert ghd-alert--error" role="alert">
              <ShieldAlert size={16} aria-hidden="true" />
              <span>{signupDocError}</span>
            </div>
          ) : null}

          {docsError ? (
            <div className="ghd-alert ghd-alert--info" role="status">
              <FileCheck2 size={16} aria-hidden="true" />
              <span>{docsError}</span>
            </div>
          ) : null}

          {uploadSuccess ? (
            <div className="ghd-alert ghd-alert--success" role="status">
              <Check size={16} aria-hidden="true" />
              <span>{uploadSuccess}</span>
            </div>
          ) : null}

          {docsLoading ? (
            <p className="ghd-status__loading"><span className="ghd-spinner" aria-hidden="true" /> Belgeler yükleniyor…</p>
          ) : documents.length > 0 ? (
            <ul className="ghd-status__documents">
              {documents.map(doc => (
                <li key={doc.id}>
                  <span className="ghd-status__document-icon"><FileText size={18} aria-hidden="true" /></span>
                  <span className="ghd-status__document-meta">
                    <strong>{DOC_TYPE_LABELS[doc.doc_type] ?? 'Belge'}</strong>
                    <small>{doc.document} · {formatTrDateTime(doc.created)}</small>
                  </span>
                  {fileToken ? (
                    <a
                      href={membershipDocumentUrl(doc, fileToken)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ghd-status__document-link"
                    >
                      Görüntüle <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="ghd-status__document-link is-pending">
                      {fileTokenError ? 'Bağlantı alınamadı' : 'Hazırlanıyor…'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="ghd-status__empty">
              <FileCheck2 size={22} aria-hidden="true" />
              <div>
                <strong>Henüz belge yüklenmedi</strong>
                <p>Aşağıdaki alandan e-Devlet öğrenci belgenizi veya diplomanızı yükleyebilirsiniz.</p>
              </div>
            </div>
          )}

          {showUpload ? (
            <form className="ghd-status__upload" onSubmit={handleUpload} noValidate>
              <div className="ghd-status__upload-head">
                <p className="ghd-eyebrow">{needsDocument ? 'Eksik belge' : 'Belge yükle'}</p>
                <h3 className="ghd-display">{needsDocument ? 'Belgenizi tamamlayın' : 'Yeni belge yükleyin'}</h3>
                <p>Belgeniz yalnızca üyelik doğrulaması için kullanılır ve yetkili dernek yönetimi tarafından görüntülenir.</p>
              </div>

              {uploadError ? (
                <div className="ghd-alert ghd-alert--error" role="alert">
                  <ShieldAlert size={16} aria-hidden="true" />
                  <span>{uploadError}</span>
                </div>
              ) : null}
              <div className="ghd-status__upload-grid">
                <div className="ghd-field">
                  <label className="ghd-field__label" htmlFor="ghd-status-doc-type">Belge türü</label>
                  <select
                    id="ghd-status-doc-type"
                    className="ghd-select"
                    value={docType}
                    onChange={event => setDocType(event.target.value as MembershipDocType)}
                  >
                    <option value="student_certificate">{DOC_TYPE_LABELS.student_certificate}</option>
                    <option value="diploma">{DOC_TYPE_LABELS.diploma}</option>
                  </select>
                </div>

                <div className="ghd-field">
                  <span className="ghd-field__label" id="ghd-status-document-label">Dosya</span>
                  <label className={`ghd-file${file ? ' has-file' : ''}${fileError ? ' is-invalid' : ''}`} htmlFor="ghd-status-document">
                    <input
                      id="ghd-status-document"
                      type="file"
                      className="ghd-file__input"
                      accept={MEMBERSHIP_FILE_ACCEPT}
                      onChange={handleFileChange}
                      aria-describedby={fileError ? 'ghd-status-file-error' : 'ghd-status-file-hint'}
                    />
                    {file ? (
                      <>
                        <FileText size={20} aria-hidden="true" />
                        <span className="ghd-file__meta">
                          <strong>{file.name}</strong>
                          <small>{formatFileSize(file.size)}</small>
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          className="ghd-file__remove"
                          aria-label="Seçilen belgeyi kaldır"
                          onClick={event => {
                            event.preventDefault()
                            event.stopPropagation()
                            setFile(null)
                            setFileError(null)
                            const input = document.getElementById('ghd-status-document') as HTMLInputElement | null
                            if (input) input.value = ''
                          }}
                          onKeyDown={event => {
                            if (event.key !== 'Enter' && event.key !== ' ') return
                            event.preventDefault()
                            setFile(null)
                            setFileError(null)
                          }}
                        >
                          <X size={15} />
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={20} aria-hidden="true" />
                        <span className="ghd-file__meta">
                          <strong>Belge seçin</strong>
                          <small>{MEMBERSHIP_FILE_HINT}</small>
                        </span>
                      </>
                    )}
                  </label>
                  {fileError
                    ? <p id="ghd-status-file-error" className="ghd-error-text">{fileError}</p>
                    : <p id="ghd-status-file-hint" className="ghd-field__hint">PDF, JPG veya PNG · en fazla 10 MB</p>}
                </div>
              </div>

              <button type="submit" className="ghd-btn ghd-btn--gold" disabled={uploading}>
                {uploading ? <span className="ghd-spinner" aria-hidden="true" /> : <UploadCloud size={15} aria-hidden="true" />}
                {uploading ? 'Belge yükleniyor…' : 'Belgeyi Gönder'}
              </button>
            </form>
          ) : null}
        </section>

        <section className="ghd-status__support">
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <h2>Yardıma mı ihtiyacınız var?</h2>
            <p>
              Başvurunuzla ilgili sorularınız için dernek yönetimine yazabilirsiniz:{' '}
              <a href={`mailto:${GHD_SUPPORT_EMAIL}`}>{GHD_SUPPORT_EMAIL}</a>
            </p>
          </div>
        </section>
      </main>

      <footer className="ghd-status__footer">
        <p>© {new Date().getFullYear()} Global Hukukçular Derneği · GHD Spor</p>
        <p>Justitia et Sapientia</p>
        <p>Yalnızca dernek üyelerine özel</p>
      </footer>
    </div>
  )
}
