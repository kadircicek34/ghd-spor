import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  ChevronDown,
  Dumbbell,
  FileText,
  HeartPulse,
  KeyRound,
  LineChart,
  LockKeyhole,
  Menu,
  Scale,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { op } from '@calistenia/core/lib/analytics'
import { GhdBrand } from '../components/ghd/GhdBrand'
import { GhdReveal } from '../components/ghd/GhdReveal'
import { useGhdMeta } from '../hooks/useGhdMeta'
import '../styles/ghd-brand.css'
import '../styles/ghd-landing.css'

const NAV_LINKS = [
  { href: '#program', label: 'Program' },
  { href: '#beslenme', label: 'Beslenme' },
  { href: '#topluluk', label: 'Topluluk' },
  { href: '#uyelik', label: 'Üyelik' },
] as const

const TRUST_ITEMS = [
  { icon: Dumbbell, label: 'Disiplinli antrenman' },
  { icon: Scale, label: 'Hukukçu topluluğu' },
  { icon: ShieldCheck, label: 'Üyelik kontrollü erişim' },
  { icon: LockKeyhole, label: 'KVKK uyumlu' },
] as const

const REASONS = [
  {
    icon: Scale,
    title: 'Hukukçu disiplini',
    text: 'Hedefleri net, ritmi sürdürülebilir programlar. Yoğun çalışma temposuna uyum sağlayan, hukukçu disiplinini spora taşıyan bir yaklaşım.',
  },
  {
    icon: Users,
    title: 'Üyeye özel topluluk',
    text: 'Türkiye’nin dört bir yanından hukuk öğrencileri ve mezunlarıyla aynı çatı altında. İlham veren, birbirini destekleyen kapalı bir topluluk.',
  },
  {
    icon: ShieldCheck,
    title: 'Gizlilik önce gelir',
    text: 'e-Devlet belgeleri yalnızca üyelik doğrulaması için kullanılır; yalnızca yetkili dernek yönetimi erişebilir. Verileriniz KVKK kapsamında korunur.',
  },
] as const

const FEATURES = [
  {
    icon: Dumbbell,
    title: 'Antrenman programları',
    text: 'Seviyenize ve hedeflerinize göre yapılandırılmış, haftalık ilerleyen antrenman planları.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Beslenme takibi',
    text: 'Günlük besin kaydı, makro hedefleri ve sürdürülebilir beslenme alışkanlıkları.',
  },
  {
    icon: HeartPulse,
    title: 'Kardiyo & GPS',
    text: 'Koşu ve yürüyüş rotalarınızı kaydedin, temponuzu ve mesafelerinizi takip edin.',
  },
  {
    icon: LineChart,
    title: 'İlerleme analizi',
    text: 'Güç, ölçü ve performans gelişiminizi tek ekranda, anlaşılır grafiklerle görün.',
  },
  {
    icon: Users,
    title: 'Topluluk & liderlik tablosu',
    text: 'Dernek üyeleriyle deneyim paylaşın, sağlıklı rekabetle motivasyonunuzu yüksek tutun.',
  },
  {
    icon: BellRing,
    title: 'Hatırlatıcılar & rozetler',
    text: 'Antrenman ve su hatırlatıcıları, hedef rozetleri ve seri takibiyle düzeninizi koruyun.',
  },
] as const

const STEPS = [
  {
    icon: FileText,
    title: 'Başvuru formu',
    text: 'Kimlik bilgileriniz, doğum tarihiniz ve hukuk statünüzle başvurunuzu oluşturun.',
  },
  {
    icon: BadgeCheck,
    title: 'e-Devlet belgesi',
    text: 'Öğrenci belgenizi veya diplomanızı PDF, JPG ya da PNG olarak yükleyin.',
  },
  {
    icon: ShieldCheck,
    title: 'Otomatik onay',
    text: 'e-Devlet belgeniz yüklendiği anda hukukçu üyeliğiniz otomatik doğrulanır; manuel onay beklemezsiniz.',
  },
  {
    icon: KeyRound,
    title: 'Kişisel panele erişim',
    text: 'Onay sonrası antrenman, beslenme, kardiyo ve topluluk özellikleri açılır.',
  },
] as const

const FAQS = [
  {
    q: 'Kimler başvurabilir?',
    a: 'Hukuk fakültesi öğrencileri ve hukuk fakültesi mezunları başvurabilir. Başvuru sırasında hukuk statünüzü seçmeniz ve bunu e-Devlet belgesiyle doğrulamanız gerekir.',
  },
  {
    q: 'Hangi belge gerekli?',
    a: 'e-Devlet üzerinden alınan öğrenci belgesi veya hukuk fakültesi diploması. Belge PDF, JPG ya da PNG formatında ve en fazla 10 MB olmalıdır. Belge türünü başvuru formunda ayrıca seçersiniz.',
  },
  {
    q: 'Onay otomatik mi?',
    a: 'Evet. e-Devlet öğrenci belgeniz veya diplomanız yüklendiği anda üyeliğiniz otomatik onaylanır. Belge eksik/geçersizse durum ekranından yeniden yükleyebilirsiniz.',
  },
  {
    q: 'Verilerim nasıl korunuyor?',
    a: 'Doğum tarihi, iletişim bilgileri ve e-Devlet belgeniz yalnızca üyelik doğrulaması için kullanılır. Belgeniz otomatik doğrulanır; belgeye yalnızca siz ve yetkili dernek yönetimi erişebilir.',
  },
  {
    q: 'Platform ücretli mi?',
    a: 'Platforma erişim, onaylı dernek üyeliğiyle birlikte açılır. Üyelik koşulları ve olası katkı payları dernek yönetimi tarafından duyurulur.',
  },
] as const

function FaqItem({ index, question, answer, open, onToggle }: {
  index: number
  question: string
  answer: string
  open: boolean
  onToggle: () => void
}) {
  const panelId = `ghd-faq-panel-${index}`
  const buttonId = `ghd-faq-button-${index}`

  return (
    <div className={`ghd-faq__item${open ? ' is-open' : ''}`}>
      <h3 className="ghd-faq__heading">
        <button
          id={buttonId}
          type="button"
          className="ghd-faq__question"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{question}</span>
          <ChevronDown className="ghd-faq__chevron" size={18} aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} className="ghd-faq__panel" role="region" aria-labelledby={buttonId}>
        <div className="ghd-faq__panel-inner">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  useGhdMeta()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const trackCta = (location: string, intent: 'login' | 'apply') => {
    op.track('cta_clicked', { location, intent: intent === 'apply' ? 'membership_apply' : 'membership_login' })
  }

  return (
    <div className="ghd-page">
      <a className="ghd-skip-link" href="#main">İçeriğe geç</a>

      <div className="ghd-announce">
        <ShieldCheck size={13} aria-hidden="true" />
        <span>Yalnızca Global Hukukçular Derneği üyelerine özel</span>
      </div>

      <header className="ghd-nav">
        <div className="ghd-container ghd-nav__inner">
          <GhdBrand />

          <nav className="ghd-nav__links" aria-label="Ana menü">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} className="ghd-nav__link">{link.label}</a>
            ))}
          </nav>

          <div className="ghd-nav__actions">
            <Link
              to="/auth?mode=login"
              className="ghd-btn ghd-btn--ghost ghd-btn--sm"
              onClick={() => trackCta('header', 'login')}
            >
              Üye Girişi
            </Link>
            <Link
              to="/auth?mode=signup"
              className="ghd-btn ghd-btn--navy ghd-btn--sm"
              onClick={() => trackCta('header', 'apply')}
            >
              Üyelik Başvurusu
            </Link>
          </div>

          <button
            type="button"
            className="ghd-nav__burger"
            aria-expanded={menuOpen}
            aria-controls="ghd-mobile-menu"
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen ? (
          <div id="ghd-mobile-menu" className="ghd-mobile">
            <nav className="ghd-mobile__links" aria-label="Mobil menü">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="ghd-mobile__link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              ))}
            </nav>
            <div className="ghd-mobile__actions">
              <Link
                to="/auth?mode=login"
                className="ghd-btn ghd-btn--ghost ghd-btn--block"
                onClick={() => { trackCta('mobile_menu', 'login'); setMenuOpen(false) }}
              >
                Üye Girişi
              </Link>
              <Link
                to="/auth?mode=signup"
                className="ghd-btn ghd-btn--navy ghd-btn--block"
                onClick={() => { trackCta('mobile_menu', 'apply'); setMenuOpen(false) }}
              >
                Üyelik Başvurusu
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main id="main">
        <section className="ghd-hero" aria-labelledby="ghd-hero-title">
          <div className="ghd-hero__wash" aria-hidden="true" />
          <div className="ghd-hero__beam" aria-hidden="true" />
          <div className="ghd-hero__grid-lines" aria-hidden="true" />

          <div className="ghd-container ghd-hero__grid">
            <div className="ghd-hero__copy">
              <p className="ghd-eyebrow ghd-rise" style={{ animationDelay: '40ms' }}>
                Global Hukukçular Derneği · Spor Platformu
              </p>
              <h1 id="ghd-hero-title" className="ghd-display ghd-hero__title ghd-rise" style={{ animationDelay: '110ms' }}>
                <span>Hukukun disiplini,</span>
                <span className="ghd-hero__title-accent">sporun gücü.</span>
              </h1>
              <p className="ghd-hero__lead ghd-rise" style={{ animationDelay: '190ms' }}>
                Dernek üyelerine özel antrenman, beslenme ve kardiyo programları.
                Hukukçu kimliğinizle başvurun, e-Devlet belgenizle doğrulanın, forma girin.
              </p>
              <div className="ghd-hero__actions ghd-rise" style={{ animationDelay: '270ms' }}>
                <Link
                  to="/auth?mode=signup"
                  className="ghd-btn ghd-btn--navy"
                  onClick={() => trackCta('hero', 'apply')}
                >
                  Üyelik Başvurusu
                  <ArrowRight size={16} className="ghd-btn__arrow" aria-hidden="true" />
                </Link>
                <Link
                  to="/auth?mode=login"
                  className="ghd-btn ghd-btn--ghost"
                  onClick={() => trackCta('hero', 'login')}
                >
                  Üye Girişi
                </Link>
              </div>
              <p className="ghd-hero__note ghd-rise" style={{ animationDelay: '340ms' }}>
                <ShieldCheck size={14} aria-hidden="true" />
                Başvurular e-Devlet öğrenci belgesi veya hukuk fakültesi diploması ile doğrulanır.
              </p>
            </div>

            <div className="ghd-hero__visual ghd-rise" style={{ animationDelay: '240ms' }}>
              <div className="ghd-halo" aria-hidden="true" />
              <div className="ghd-medallion">
                <span className="ghd-medallion__ring" aria-hidden="true" />
                <span className="ghd-medallion__ring ghd-medallion__ring--inner" aria-hidden="true" />
                <img src="/logo-ghd.jpg" alt="Global Hukukçular Derneği madalyon logosu" width={520} height={520} />
              </div>

              <div className="ghd-hero__cards">
                <div className="ghd-float-card ghd-float-card--one">
                  <span className="ghd-float-card__icon"><Dumbbell size={16} aria-hidden="true" /></span>
                  <span>
                    <strong>Yapılandırılmış programlar</strong>
                    <small>Hedefe göre haftalık plan</small>
                  </span>
                </div>
                <div className="ghd-float-card ghd-float-card--two">
                  <span className="ghd-float-card__icon"><ShieldCheck size={16} aria-hidden="true" /></span>
                  <span>
                    <strong>Üyeye özel erişim</strong>
                    <small>Onaylı hukukçu topluluğu</small>
                  </span>
                </div>
                <div className="ghd-float-card ghd-float-card--three">
                  <span className="ghd-float-card__icon"><LockKeyhole size={16} aria-hidden="true" /></span>
                  <span>
                    <strong>Veri gizliliği</strong>
                    <small>KVKK uyumlu doğrulama</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ghd-trust" aria-label="Güven unsurları">
          <ul className="ghd-container ghd-trust__list">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon size={15} aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ghd-section" id="topluluk">
          <div className="ghd-container">
            <GhdReveal className="ghd-section__head">
              <p className="ghd-eyebrow">Neden GHD Spor?</p>
              <h2 className="ghd-display ghd-section__title">
                Hukukçuya yakışan bir<br />
                <em>beden ve zihin disiplini.</em>
              </h2>
              <p className="ghd-section__lead">
                GHD Spor; hukuk camiasının bilgi birikimini, dayanışmasını ve disiplinini
                sağlıklı bir yaşam kültürüyle buluşturur.
              </p>
            </GhdReveal>

            <div className="ghd-reasons">
              {REASONS.map(({ icon: Icon, title, text }, index) => (
                <GhdReveal key={title} delay={index * 90}>
                  <article className="ghd-reason">
                    <span className="ghd-reason__index" aria-hidden="true">0{index + 1}</span>
                    <span className="ghd-reason__icon"><Icon size={21} aria-hidden="true" /></span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                </GhdReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="ghd-section ghd-section--features" id="program">
          <div className="ghd-container">
            <GhdReveal className="ghd-section__head ghd-section__head--split">
              <div>
                <p className="ghd-eyebrow">Platform</p>
                <h2 className="ghd-display ghd-section__title">
                  Antrenmandan beslenmeye,<br />
                  <em>tek bir düzen.</em>
                </h2>
              </div>
              <p className="ghd-section__lead">
                Günlük hayatınıza uyum sağlayan araçlar; dağınık notlar ve tahminler yerine
                ölçülebilir, sürdürülebilir bir ilerleme.
              </p>
            </GhdReveal>

            <div className="ghd-features">
              {FEATURES.map(({ icon: Icon, title, text }, index) => (
                <GhdReveal key={title} delay={index * 60}>
                  <article className="ghd-feature" id={index === 1 ? 'beslenme' : undefined}>
                    <span className="ghd-feature__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span className="ghd-feature__icon"><Icon size={20} aria-hidden="true" /></span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                </GhdReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="ghd-section ghd-section--process" id="uyelik">
          <div className="ghd-container">
            <GhdReveal className="ghd-section__head ghd-section__head--center">
              <p className="ghd-eyebrow">Üyelik süreci</p>
              <h2 className="ghd-display ghd-section__title">
                Dört adımda <em>forma girin.</em>
              </h2>
              <p className="ghd-section__lead">
                Başvurunuz e-Devlet belgesiyle doğrulanır. Onaylı üyeler platformun tüm
                özelliklerine erişir.
              </p>
            </GhdReveal>

            <ol className="ghd-steps">
              {STEPS.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="ghd-step">
                  <GhdReveal delay={index * 80}>
                    <span className="ghd-step__num" aria-hidden="true">0{index + 1}</span>
                    <span className="ghd-step__icon"><Icon size={19} aria-hidden="true" /></span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </GhdReveal>
                </li>
              ))}
            </ol>

            <GhdReveal className="ghd-process__cta">
              <p>Belgeniz hazırsa başvurunuz birkaç dakika içinde tamamlanır.</p>
              <Link
                to="/auth?mode=signup"
                className="ghd-btn ghd-btn--navy"
                onClick={() => trackCta('process', 'apply')}
              >
                Başvuruya Başla
                <ArrowRight size={16} className="ghd-btn__arrow" aria-hidden="true" />
              </Link>
            </GhdReveal>
          </div>
        </section>

        <section className="ghd-quote" aria-labelledby="ghd-motto">
          <GhdReveal className="ghd-container ghd-quote__inner">
            <span className="ghd-quote__mark" aria-hidden="true">“</span>
            <p id="ghd-motto" className="ghd-display ghd-quote__latin">Justitia et Sapientia</p>
            <blockquote className="ghd-quote__text">
              Adalet ve bilgelik; bedenin ve zihnin disiplinini gerektirir.
            </blockquote>
            <p className="ghd-quote__source">Global Hukukçular Derneği</p>
          </GhdReveal>
        </section>

        <section className="ghd-section ghd-section--faq" id="sss">
          <div className="ghd-container--narrow">
            <GhdReveal className="ghd-section__head ghd-section__head--center">
              <p className="ghd-eyebrow">Sıkça sorulan sorular</p>
              <h2 className="ghd-display ghd-section__title">Merak edilenler.</h2>
            </GhdReveal>

            <GhdReveal className="ghd-faq">
              {FAQS.map((item, index) => (
                <FaqItem
                  key={item.q}
                  index={index}
                  question={item.q}
                  answer={item.a}
                  open={openFaq === index}
                  onToggle={() => setOpenFaq(current => current === index ? null : index)}
                />
              ))}
            </GhdReveal>
          </div>
        </section>

        <section className="ghd-final" aria-labelledby="ghd-final-title">
          <div className="ghd-container ghd-final__inner">
            <img className="ghd-final__seal" src="/ghd-icon-512.png" alt="" aria-hidden="true" />
            <div className="ghd-final__copy">
              <p className="ghd-eyebrow">Üyelik başvurusu</p>
              <h2 id="ghd-final-title" className="ghd-display ghd-final__title">
                Forma girmeye hazır mısınız?
              </h2>
              <p>
                Hukukçu kimliğinizle başvurun, belgeniz doğrulansın; antrenman,
                beslenme ve topluluk özelliklerine erişin.
              </p>
            </div>
            <div className="ghd-final__actions">
              <Link
                to="/auth?mode=signup"
                className="ghd-btn ghd-btn--gold"
                onClick={() => trackCta('final', 'apply')}
              >
                Üyelik Başvurusu
                <ArrowRight size={16} className="ghd-btn__arrow" aria-hidden="true" />
              </Link>
              <Link
                to="/auth?mode=login"
                className="ghd-btn ghd-btn--gold ghd-final__login"
                onClick={() => trackCta('final', 'login')}
              >
                Üye Girişi
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="ghd-footer">
        <div className="ghd-container ghd-footer__grid">
          <div className="ghd-footer__brand">
            <GhdBrand />
            <p>
              Global Hukukçular Derneği’nin spor platformu. Hukuk camiasını sağlıklı,
              disiplinli ve dayanışma içinde bir araya getirir.
            </p>
            <span className="ghd-footer__exclusive">
              <LockKeyhole size={12} aria-hidden="true" />
              Yalnızca dernek üyelerine özeldir
            </span>
          </div>

          <nav className="ghd-footer__col" aria-label="Platform bağlantıları">
            <p className="ghd-footer__title">Platform</p>
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
            <a href="#sss">Sıkça sorulan sorular</a>
          </nav>

          <nav className="ghd-footer__col" aria-label="Dernek bağlantıları">
            <p className="ghd-footer__title">Dernek</p>
            <a href="https://globalhukukcular.com" target="_blank" rel="noopener noreferrer">
              globalhukukcular.com <ArrowUpRight size={12} aria-hidden="true" />
            </a>
            <a href="mailto:info@globalhukukcular.com">İletişim</a>
            <Link to="/legal#privacy">KVKK Aydınlatma Metni</Link>
            <Link to="/legal">Kullanım Koşulları</Link>
          </nav>

          <div className="ghd-footer__col">
            <p className="ghd-footer__title">İletişim</p>
            <a href="mailto:info@globalhukukcular.com">info@globalhukukcular.com</a>
            <p className="ghd-footer__note">
              Üyelik başvuruları ve belge doğrulaması hakkında dernek yönetimine
              yazabilirsiniz.
            </p>
          </div>
        </div>

        <div className="ghd-container ghd-footer__bottom">
          <p>© {new Date().getFullYear()} Global Hukukçular Derneği · GHD Spor</p>
          <p className="ghd-footer__motto">Justitia et Sapientia</p>
        </div>
      </footer>
    </div>
  )
}
