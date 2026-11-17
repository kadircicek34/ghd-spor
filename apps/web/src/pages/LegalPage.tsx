import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const UPDATED = '17 Kasım 2026'

/**
 * KVKK aydınlatma metni ve üyelik koşulları.
 *
 * GHD Spor yalnızca Global Hukukçular Derneği üyelerine açıktır. Üyelik
 * başvurusunda kimlik, iletişim, doğum tarihi, hukuk statüsü ve e-Devlet
 * belgesi işlendiği için metinler kısa ve okunabilir bölümlere ayrıldı.
 * Upstream İspanyolca metin tamamen kaldırıldı.
 */

export default function LegalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const hash = location.hash

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''))
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [hash])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Geri
        </button>

        <section id="privacy" className="mb-16">
          <h1 className="text-3xl font-bold mb-2">KVKK Aydınlatma Metni</h1>
          <p className="text-sm text-muted-foreground mb-6">Son güncelleme: {UPDATED}</p>

          <p className="mb-4">
            Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında,
            GHD Spor platformunu kullanan dernek üyelerini ve üyelik başvurusu yapan kişileri
            bilgilendirmek amacıyla hazırlanmıştır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">1. Veri sorumlusu</h2>
          <p className="mb-4">
            Kişisel verileriniz, veri sorumlusu sıfatıyla <strong>Global Hukukçular Derneği</strong>{' '}
            tarafından işlenmektedir. Platforma{' '}
            <a href="https://spor.globalhukukcular.com" className="text-lime-text hover:underline">
              spor.globalhukukcular.com
            </a>{' '}
            adresinden erişilir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">2. İşlenen kişisel veriler</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Kimlik ve iletişim:</strong> ad soyad, e-posta adresi, isteğe bağlı telefon ve şehir.</li>
            <li><strong>Üyelik doğrulama:</strong> doğum tarihi, hukuk öğrencisi veya hukuk mezunu olduğunuzu gösteren statü bilgisi ve e-Devlet belgesi (öğrenci belgesi veya diploma).</li>
            <li><strong>Hesap:</strong> şifre (geri döndürülemez biçimde saklanır), üyelik durumu, onay/red tarihi ve yönetici notu.</li>
            <li><strong>Platform kullanımı:</strong> antrenman, kardiyo, beslenme, uyku ve ilerleme kayıtları; paylaştığınız içerikler ve teknik günlük kayıtları.</li>
            <li><strong>Sağlık verileri:</strong> yalnızca sizin girdiğiniz kilo, ölçü, sağlık durumu ve sakatlık bilgileri. Bu alanlar isteğe bağlıdır; girmezseniz işlenmez.</li>
          </ul>
          <p className="mb-4">
            e-Devlet belgesi yalnızca üyelik doğrulaması için kullanılır; belge türü, yükleme
            tarihi ve inceleme sonucu üyelik kaydınızla birlikte saklanır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">3. İşleme amaçları</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Üyelik başvurunuzu almak, kimliğinizi ve hukukçu statünüzü doğrulamak.</li>
            <li>Yalnızca dernek üyelerine açık platform erişimini sağlamak ve yetkisiz erişimi engellemek.</li>
            <li>Antrenman, beslenme, kardiyo ve ilerleme özelliklerini sunmak; deneyiminizi kişiselleştirmek.</li>
            <li>Üyelik durumu, belge incelemesi ve güvenlik konularında sizinle iletişim kurmak.</li>
            <li>Hizmetin güvenliğini, bütünlüğünü ve performansını izlemek; hataları gidermek.</li>
            <li>Yasal yükümlülükleri yerine getirmek ve olası uyuşmazlıklarda hakları korumak.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-3">4. Hukuki sebepler</h2>
          <p className="mb-4">
            Kişisel verileriniz; sözleşmenin kurulması veya ifası, hukuki yükümlülüklerin yerine
            getirilmesi, bir hakkın tesisi/kullanılması/korunması ve meşru menfaatlerimiz
            kapsamında KVKK m. 5/2 uyarınca işlenir. Sağlık verileri ile isteğe bağlı alanlar
            yalnızca açık rızanıza dayanılarak işlenir. Açık rızanızı dilediğiniz zaman geri
            çekebilirsiniz; geri çekme, o ana kadar yapılan işlemlerin hukukiliğini etkilemez.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">5. e-Devlet belgesine erişim</h2>
          <p className="mb-4">
            Yüklediğiniz e-Devlet belgesine <strong>yalnızca siz ve dernek tarafından
            yetkilendirilmiş üyelik yöneticileri</strong> erişebilir. Belge herkese açık bir
            bağlantıyla paylaşılmaz; platform içindeki diğer üyeler, eğitmenler veya üçüncü
            kişiler belgeyi görüntüleyemez. Yetkili yöneticiler belgeyi yalnızca başvurunuzu
            incelemek amacıyla açar.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">6. Saklama ve silme</h2>
          <p className="mb-4">
            Üyelik ve doğrulama verileri, üyeliğiniz devam ettiği sürece ve ilgili mevzuatta
            öngörülen zorunlu saklama süreleri boyunca tutulur. Sürelerin sona ermesi veya
            işleme amacının ortadan kalkması hâlinde veriler silinir, yok edilir veya anonim
            hâle getirilir. Hesabınızı profilinizden silebilir veya{' '}
            <a href="mailto:info@globalhukukcular.com" className="text-lime-text hover:underline">
              info@globalhukukcular.com
            </a>{' '}
            adresine yazarak silme talebinde bulunabilirsiniz. Talebiniz en geç 30 gün içinde
            sonuçlandırılır; silme işlemi geri alınamaz.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">7. Aktarım ve güvenlik</h2>
          <p className="mb-4">
            Verileriniz kural olarak üçüncü kişilerle paylaşılmaz, satılmaz veya reklam amacıyla
            kullanılmaz. Hizmetin barındırılması ve e-posta gönderimi için yalnızca gerekli
            ölçüde hizmet sağlayıcılardan yararlanılabilir; bu hâllerde KVKK m. 8 ve m. 9’daki
            şartlar gözetilir. Verilerinize yetkisiz erişimi önlemek için erişim kontrolü,
            şifreli iletişim (HTTPS) ve kayıt bazlı yetkilendirme uygulanır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">8. KVKK kapsamındaki haklarınız</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve buna ilişkin bilgi talep etme.</li>
            <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme.</li>
            <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri öğrenme.</li>
            <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme.</li>
            <li>KVKK m. 7’deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme.</li>
            <li>Otomatik sistemlerle analiz sonucu aleyhinize çıkan sonuca itiraz etme.</li>
            <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-3">9. Başvuru ve iletişim</h2>
          <p className="mb-4">
            Haklarınıza ilişkin taleplerinizi kimliğinizi tespit edici bilgilerle birlikte{' '}
            <a href="mailto:info@globalhukukcular.com" className="text-lime-text hover:underline">
              info@globalhukukcular.com
            </a>{' '}
            adresine iletebilirsiniz. Başvurularınız, niteliğine göre en kısa sürede ve en geç
            30 gün içinde ücretsiz olarak yanıtlanır.
          </p>
        </section>

        <section id="terms">
          <h1 className="text-3xl font-bold mb-2">Üyelik Koşulları</h1>
          <p className="text-sm text-muted-foreground mb-6">Son güncelleme: {UPDATED}</p>

          <p className="mb-4">
            GHD Spor’u kullanarak bu koşulları kabul etmiş olursunuz. Koşulları kabul
            etmiyorsanız platformu kullanmayınız.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">1. Kapsam ve üyelik</h2>
          <p className="mb-4">
            GHD Spor, Global Hukukçular Derneği tarafından dernek üyelerine sunulan antrenman,
            beslenme ve kardiyo platformudur. Platforma erişim, üyelik başvurusunun dernek
            yönetimi tarafından onaylanmasıyla açılır. Onaylanmamış hesaplar uygulama içeriğini
            göremez.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">2. Başvuru ve doğrulama</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Başvuruda ad soyad, e-posta, doğum tarihi ve hukuk statüsü zorunludur.</li>
            <li>Hukuk fakültesi öğrencisi veya mezunu olduğunuzu gösteren e-Devlet belgesi (öğrenci belgesi veya diploma) yüklenmesi zorunludur.</li>
            <li>Belge PDF, JPG veya PNG formatında ve en fazla 10 MB olmalıdır.</li>
            <li>Verilen bilgilerin doğru ve güncel olması sizin sorumluluğunuzdadır. Yanlış veya başkasına ait belge yüklenmesi başvurunun reddine ve üyeliğin sonlandırılmasına yol açabilir.</li>
            <li>Bir kişi yalnızca bir hesap oluşturabilir; hesaplar devredilemez.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-3">3. Üye yükümlülükleri</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Hesap güvenliğini korumak ve şifrenizi kimseyle paylaşmamak.</li>
            <li>Platformu hukuka uygun amaçlarla kullanmak; başkalarının haklarını ihlal etmemek.</li>
            <li>Başka üyelerin hesaplarına veya belgelerine erişmeye çalışmamak.</li>
            <li>Platformun işleyişini bozacak, otomatik bot/script kullanacak veya güvenliği aşacak davranışlarda bulunmamak.</li>
            <li>Hakaret, tehdit, nefret söylemi veya uygunsuz içerik paylaşmamak.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-3">4. Sağlık ve sorumluluk reddi</h2>
          <p className="mb-4">
            Platformdaki antrenman, beslenme ve kardiyo içerikleri genel bilgilendirme amaçlıdır;
            tıbbi tavsiye, teşhis veya tedavi yerine geçmez. Herhangi bir egzersiz programına
            başlamadan önce sağlık durumunuza uygunluk konusunda bir sağlık profesyoneline
            danışmanız önerilir. Platformu kullanmanız nedeniyle oluşabilecek sakatlık veya
            sağlık sorunlarından, kanunların izin verdiği ölçüde, Global Hukukçular Derneği
            sorumlu tutulamaz.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">5. İçerik ve fikri mülkiyet</h2>
          <p className="mb-4">
            Platform üzerinde paylaştığınız antrenman, beslenme ve benzeri kayıtların sahibi
            sizsiniz. Bu içerikleri yalnızca hizmeti sunmak ve görüntülemek amacıyla işlememize
            izin vermiş olursunuz. Platformun tasarımı, yazılımı, logosu ve dernek markası
            Global Hukukçular Derneği’ne aittir; izinsiz kopyalanamaz veya ticari amaçla
            kullanılamaz.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">6. Hizmetin sürekliliği</h2>
          <p className="mb-4">
            Hizmeti kesintisiz sunmak için makul çaba gösterilir; ancak bakım, güvenlik veya
            teknik nedenlerle geçici kesintiler yaşanabilir. Dernek, hizmetin kapsamını
            değiştirme veya hizmeti sonlandırma hakkını saklı tutar.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">7. Askıya alma ve sonlandırma</h2>
          <p className="mb-4">
            Bu koşulların ihlali, doğrulama belgesinin geçersiz çıkması veya platform güvenliğini
            tehdit eden davranışlar hâlinde hesabınız askıya alınabilir veya sonlandırılabilir.
            Hesabınızı dilediğiniz zaman profilinizden silebilirsiniz; silme talebiniz üzerine
            hesabınız ve ilişkili veriler kaldırılır. Zorunlu saklama yükümlülükleri saklıdır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">8. Değişiklikler</h2>
          <p className="mb-4">
            Bu koşullar ve KVKK aydınlatma metni zaman zaman güncellenebilir. Önemli
            değişiklikler platform üzerinden duyurulur. Değişiklikten sonra platformu kullanmaya
            devam etmeniz yeni koşulları kabul ettiğiniz anlamına gelir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">9. Uygulanacak hukuk ve iletişim</h2>
          <p className="mb-4">
            Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Sorularınız ve talepleriniz için{' '}
            <a href="mailto:info@globalhukukcular.com" className="text-lime-text hover:underline">
              info@globalhukukcular.com
            </a>{' '}
            adresinden bize ulaşabilirsiniz.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Global Hukukçular Derneği · GHD Spor. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  )
}
