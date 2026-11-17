import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react'
import { pb } from '@calistenia/core/lib/pocketbase'
import type { AuthUser, MembershipDocument, MembershipStatus } from '@calistenia/core/types'
import { useAuthState } from '../contexts/AuthContext'
import { useGhdMeta } from '../hooks/useGhdMeta'
import {
  DOC_TYPE_LABELS,
  LEGAL_STATUS_LABELS,
  MEMBERSHIP_STATUS_LABELS,
  fetchMembershipFileToken,
  formatTrDate,
  formatTrDateTime,
  membershipDocumentUrl,
} from '../lib/membership'
import '../styles/ghd-brand.css'
import '../styles/ghd-admin.css'

type Tab = MembershipStatus

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'pending', label: 'Onay bekleyen' },
  { id: 'approved', label: 'Onaylanan' },
  { id: 'rejected', label: 'Reddedilen' },
]

function initials(user: AuthUser): string {
  const name = user.display_name || user.email || '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
}

function statusClass(status: MembershipStatus): string {
  return `is-${status}`
}

export default function AdminMembersPage() {
  useGhdMeta(
    'Üye Başvuruları | GHD Spor Yönetim',
    'Global Hukukçular Derneği spor platformu üyelik başvurularını inceleyin ve sonuçlandırın.',
  )

  const { isAdmin, authReady } = useAuthState()

  const [members, setMembers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('pending')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<MembershipDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [docsError, setDocsError] = useState<string | null>(null)
  const [fileToken, setFileToken] = useState<string | null>(null)
  const [fileTokenError, setFileTokenError] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState<'approved' | 'rejected' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const result = await pb.collection('users').getFullList({
        filter: '(membership_status = "pending" || membership_status = "approved" || membership_status = "rejected" || membership_status = "")',
        sort: '-created',
        $autoCancel: false,
      })
      setMembers(result as unknown as AuthUser[])
    } catch (error) {
      const statusCode = (error as { status?: number })?.status
      setLoadError(
        statusCode === 403
          ? 'Üye listesine erişim yetkiniz yok. Yalnızca dernek yöneticileri başvuruları görüntüleyebilir.'
          : 'Üye başvuruları yüklenemedi. Lütfen bağlantınızı kontrol edip yeniden deneyin.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    void loadMembers()
  }, [isAdmin, loadMembers])

  const memberStatus = (member: AuthUser) => member.membership_status ?? 'pending'

  const counts = useMemo(() => ({
    pending: members.filter(member => memberStatus(member) === 'pending').length,
    approved: members.filter(member => memberStatus(member) === 'approved').length,
    rejected: members.filter(member => memberStatus(member) === 'rejected').length,
  }), [members])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR')
    return members.filter(member => {
      if (memberStatus(member) !== tab) return false
      if (!normalized) return true
      return [member.display_name, member.contact_email || member.email, member.phone, member.city]
        .filter(Boolean)
        .some(value => String(value).toLocaleLowerCase('tr-TR').includes(normalized))
    })
  }, [members, query, tab])

  useEffect(() => {
    if (selectedId && filtered.some(member => member.id === selectedId)) return
    setSelectedId(filtered[0]?.id ?? null)
  }, [filtered, selectedId])

  const selected = members.find(member => member.id === selectedId) ?? null

  useEffect(() => {
    setNote(selected?.membership_note ?? '')
    setConfirmStatus(null)
    setActionError(null)
    setActionMessage(null)
  }, [selected?.id])

  useEffect(() => {
    if (!selectedId) {
      setDocuments([])
      setDocsError(null)
      setFileToken(null)
      return
    }
    let cancelled = false
    setDocsLoading(true)
    setDocsError(null)
    setDocuments([])
    setFileToken(null)
    setFileTokenError(false)
    ;(async () => {
      try {
        const docs = await pb.collection('membership_documents').getFullList({
          filter: pb.filter('user = {:userId}', { userId: selectedId }),
          sort: '-created',
          $autoCancel: false,
        })
        if (cancelled) return
        setDocuments(docs as unknown as MembershipDocument[])
      } catch {
        if (cancelled) return
        setDocsError('Belgeler yüklenemedi. Onay işlemi için belgeyi kontrol edin.')
      } finally {
        if (!cancelled) setDocsLoading(false)
      }

      try {
        const token = await fetchMembershipFileToken()
        if (!cancelled) {
          setFileToken(token)
          setFileTokenError(false)
        }
      } catch {
        if (!cancelled) {
          setFileToken(null)
          setFileTokenError(true)
        }
      }
    })()
    return () => { cancelled = true }
  }, [selectedId])

  if (!authReady) {
    return <div className="ghd-admin ghd-admin--centered"><span className="ghd-spinner" aria-label="Yükleniyor" /></div>
  }

  if (!isAdmin) return <Navigate to="/" replace />

  const applyDecision = async (status: 'approved' | 'rejected') => {
    if (!selected) return
    if (status === 'approved' && documents.length === 0) {
      setActionError('Onaylamak için başvuruda en az bir belge bulunmalıdır.')
      setConfirmStatus(null)
      return
    }
    setSaving(true)
    setActionError(null)
    setActionMessage(null)
    try {
      await pb.collection('users').update(selected.id, {
        membership_status: status,
        membership_note: note.trim(),
      })
      setMembers(previous => previous.map(member => (
        member.id === selected.id
          ? { ...member, membership_status: status, membership_note: note.trim() }
          : member
      )))
      // Kayıt onay/red sekmesine geçtiği için seçimi koru ve başarı mesajını
      // hemen başka bir başvuruya atlamadan göster.
      setTab(status)
      setActionMessage(
        status === 'approved'
          ? 'Üyelik başvurusu onaylandı. Kullanıcı artık platforma erişebilir.'
          : 'Üyelik başvurusu reddedildi. Kullanıcı durum ekranında notunuzu görecek.',
      )
      setConfirmStatus(null)
    } catch (error) {
      const statusCode = (error as { status?: number })?.status
      setActionError(
        statusCode === 400
          ? 'İşlem tamamlanamadı. Başvuruda belge olduğundan emin olun ve tekrar deneyin.'
          : 'İşlem tamamlanamadı. Lütfen bağlantınızı kontrol edip yeniden deneyin.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ghd-admin">
      <header className="ghd-admin__header">
        <div>
          <Link to="/admin" className="ghd-admin__back">
            <ArrowLeft size={14} aria-hidden="true" /> Yönetim
          </Link>
          <p className="ghd-eyebrow">Dernek yönetimi</p>
          <h1 className="ghd-display ghd-admin__title">Üye Başvuruları</h1>
          <p className="ghd-admin__subtitle">
            Üyelikler e-Devlet belgesi yüklendiğinde otomatik onaylanır. Bu ekran istisnai inceleme, red veya iptal içindir.
          </p>
        </div>
        <button type="button" className="ghd-btn ghd-btn--soft ghd-btn--sm" onClick={() => void loadMembers()} disabled={loading}>
          {loading ? <span className="ghd-spinner" aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
          {loading ? 'Yükleniyor…' : 'Yenile'}
        </button>
      </header>

      <div className="ghd-admin__stats" aria-label="Başvuru özeti">
        <div className="ghd-admin__stat">
          <span className="ghd-admin__stat-icon is-pending"><ShieldCheck size={17} aria-hidden="true" /></span>
          <span><strong>{counts.pending}</strong><small>Onay bekleyen</small></span>
        </div>
        <div className="ghd-admin__stat">
          <span className="ghd-admin__stat-icon is-approved"><BadgeCheck size={17} aria-hidden="true" /></span>
          <span><strong>{counts.approved}</strong><small>Onaylanan</small></span>
        </div>
        <div className="ghd-admin__stat">
          <span className="ghd-admin__stat-icon is-rejected"><ShieldAlert size={17} aria-hidden="true" /></span>
          <span><strong>{counts.rejected}</strong><small>Reddedilen</small></span>
        </div>
      </div>

      <div className="ghd-admin__toolbar">
        <div className="ghd-admin__tabs" role="tablist" aria-label="Başvuru durumu">
          {TABS.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`ghd-admin__tab${tab === item.id ? ' is-active' : ''} ${statusClass(item.id)}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              <span>{counts[item.id]}</span>
            </button>
          ))}
        </div>

        <label className="ghd-admin__search">
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Başvuru ara</span>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Ad, e-posta, telefon veya şehir ara"
          />
        </label>
      </div>

      {loadError ? (
        <div className="ghd-alert ghd-alert--error" role="alert">
          <ShieldAlert size={16} aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      ) : null}

      <div className="ghd-admin__layout">
        <section className="ghd-admin__list" aria-label="Başvuru listesi">
          {loading ? (
            <p className="ghd-admin__loading"><span className="ghd-spinner" aria-hidden="true" /> Başvurular yükleniyor…</p>
          ) : filtered.length === 0 ? (
            <div className="ghd-admin__empty">
              <FileText size={22} aria-hidden="true" />
              <strong>Bu sekmede başvuru yok</strong>
              <p>Arama kriterini değiştirin veya başka bir durum sekmesine geçin.</p>
            </div>
          ) : (
            <ul>
              {filtered.map(member => {
                const memberStatus = member.membership_status ?? 'pending'
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      className={`ghd-admin__member${selectedId === member.id ? ' is-selected' : ''}`}
                      onClick={() => setSelectedId(member.id)}
                      aria-pressed={selectedId === member.id}
                    >
                      <span className="ghd-admin__avatar">{initials(member)}</span>
                      <span className="ghd-admin__member-text">
                        <strong>{member.display_name || member.contact_email || member.email}</strong>
                        <small>{member.contact_email || member.email}</small>
                        <small className="ghd-admin__member-meta">
                          {LEGAL_STATUS_LABELS[member.legal_status ?? 'student']} · {formatTrDate(member.created)}
                        </small>
                      </span>
                      <span className={`ghd-admin__badge ${statusClass(memberStatus)}`}>
                        {MEMBERSHIP_STATUS_LABELS[memberStatus]}
                      </span>
                      <ChevronRight size={15} className="ghd-admin__chevron" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <aside className="ghd-admin__detail" aria-label="Başvuru detayı">
          {!selected ? (
            <div className="ghd-admin__detail-empty">
              <ShieldCheck size={24} aria-hidden="true" />
              <strong>Bir başvuru seçin</strong>
              <p>Detayları, belgeleri ve değerlendirme notunu burada göreceksiniz.</p>
            </div>
          ) : (
            <>
              <div className="ghd-admin__detail-head">
                <span className="ghd-admin__avatar ghd-admin__avatar--lg">{initials(selected)}</span>
                <div>
                  <h2>{selected.display_name || 'İsimsiz başvuru'}</h2>
                  <a href={`mailto:${selected.contact_email || selected.email}`}>{selected.contact_email || selected.email}</a>
                </div>
                <span className={`ghd-admin__badge ${statusClass(selected.membership_status ?? 'pending')}`}>
                  {MEMBERSHIP_STATUS_LABELS[selected.membership_status ?? 'pending']}
                </span>
              </div>

              {actionMessage ? (
                <div className="ghd-alert ghd-alert--success" role="status">
                  <Check size={16} aria-hidden="true" />
                  <span>{actionMessage}</span>
                </div>
              ) : null}
              {actionError ? (
                <div className="ghd-alert ghd-alert--error" role="alert">
                  <ShieldAlert size={16} aria-hidden="true" />
                  <span>{actionError}</span>
                </div>
              ) : null}

              <dl className="ghd-admin__fields">
                <div><dt>Doğum tarihi</dt><dd>{formatTrDate(selected.birth_date)}</dd></div>
                <div><dt>Hukuk statüsü</dt><dd>{LEGAL_STATUS_LABELS[selected.legal_status ?? 'student']}</dd></div>
                <div><dt>Telefon</dt><dd>{selected.phone || 'Belirtilmedi'}</dd></div>
                <div><dt>Şehir</dt><dd>{selected.city || 'Belirtilmedi'}</dd></div>
                <div><dt>Başvuru tarihi</dt><dd>{formatTrDateTime(selected.created)}</dd></div>
                <div><dt>KVKK onayı</dt><dd>{selected.kvkk_consent ? 'Onaylandı' : 'Onay yok'}</dd></div>
                {selected.approved_at ? (
                  <div><dt>Onay tarihi</dt><dd>{formatTrDateTime(selected.approved_at)}</dd></div>
                ) : null}
              </dl>

              <div className="ghd-admin__documents">
                <div className="ghd-admin__section-head">
                  <h3>e-Devlet belgeleri</h3>
                  <span>{docsLoading ? '…' : documents.length}</span>
                </div>
                {docsLoading ? (
                  <p className="ghd-admin__loading"><span className="ghd-spinner" aria-hidden="true" /> Belgeler yükleniyor…</p>
                ) : docsError ? (
                  <p className="ghd-admin__doc-error">{docsError}</p>
                ) : documents.length === 0 ? (
                  <p className="ghd-admin__doc-error">Belge yüklenmemiş. Onaylamadan önce kullanıcıdan belge isteyin.</p>
                ) : (
                  <ul>
                    {documents.map(doc => (
                      <li key={doc.id}>
                        <FileText size={16} aria-hidden="true" />
                        <span>
                          <strong>{DOC_TYPE_LABELS[doc.doc_type] ?? 'Belge'}</strong>
                          <small>{formatTrDateTime(doc.created)}</small>
                        </span>
                        {fileToken ? (
                          <a
                            href={membershipDocumentUrl(doc, fileToken)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Aç <ArrowUpRight size={13} aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="ghd-admin__doc-pending">
                            {fileTokenError ? 'Bağlantı alınamadı' : 'Hazırlanıyor…'}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="ghd-admin__decision">
                <label className="ghd-field__label" htmlFor="ghd-admin-note">Değerlendirme notu</label>
                <textarea
                  id="ghd-admin-note"
                  className="ghd-textarea"
                  value={note}
                  onChange={event => setNote(event.target.value)}
                  placeholder="Onay veya ret gerekçesi (kullanıcı durum ekranında görür)"
                  rows={3}
                />
                <p className="ghd-field__hint">Red durumunda gerekçe yazmanız kullanıcı için faydalıdır.</p>

                {confirmStatus ? (
                  <div className={`ghd-admin__confirm ${confirmStatus === 'approved' ? 'is-approved' : 'is-rejected'}`}>
                    <p>
                      {confirmStatus === 'approved'
                        ? 'Bu üyeliği onaylamak üzeresiniz. Kullanıcı platforma erişebilecek.'
                        : 'Bu başvuruyu reddetmek üzeresiniz. Kullanıcı durum ekranında notunuzu görecek.'}
                    </p>
                    <div>
                      <button type="button" className="ghd-btn ghd-btn--soft ghd-btn--sm" onClick={() => setConfirmStatus(null)} disabled={saving}>
                        Vazgeç
                      </button>
                      <button
                        type="button"
                        className={`ghd-btn ghd-btn--sm ${confirmStatus === 'approved' ? 'ghd-btn--gold' : 'ghd-btn--danger'}`}
                        onClick={() => void applyDecision(confirmStatus)}
                        disabled={saving}
                      >
                        {saving ? <span className="ghd-spinner" aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
                        {saving ? 'Kaydediliyor…' : confirmStatus === 'approved' ? 'Onayı Tamamla' : 'Reddi Tamamla'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ghd-admin__decision-actions">
                    <button
                      type="button"
                      className="ghd-btn ghd-btn--gold ghd-btn--sm"
                      onClick={() => setConfirmStatus('approved')}
                      disabled={docsLoading || documents.length === 0 || saving}
                    >
                      <Check size={14} aria-hidden="true" /> Onayla
                    </button>
                    <button
                      type="button"
                      className="ghd-btn ghd-btn--danger ghd-btn--sm"
                      onClick={() => setConfirmStatus('rejected')}
                      disabled={saving}
                    >
                      <X size={14} aria-hidden="true" /> Reddet
                    </button>
                  </div>
                )}
                {documents.length === 0 && !docsLoading ? (
                  <p className="ghd-admin__decision-hint">Onay butonu, en az bir belge yüklenene kadar kapalıdır.</p>
                ) : null}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
