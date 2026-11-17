import type { Phase, WeekDay, Workout, WorkoutsMap, DayId } from '../types'

export const PHASES: Phase[] = [
  { id: 1, name: "Temel & Aktivasyon", nameKey: "phase.1", weeks: "1-6", color: "#d4af37", bg: "rgba(212, 175, 55,0.08)" },
  { id: 2, name: "Temel Kuvvet", nameKey: "phase.2", weeks: "7-13", color: "#42c8f5", bg: "rgba(66,200,245,0.08)" },
  { id: 3, name: "Yoğunluk & Beceriler", nameKey: "phase.3", weeks: "14-20", color: "#f542c8", bg: "rgba(245,66,200,0.08)" },
  { id: 4, name: "Zirve & Pekiştirme", nameKey: "phase.4", weeks: "21-26", color: "#f5c842", bg: "rgba(245,200,66,0.08)" },
]

export const WEEK_DAYS: WeekDay[] = [
  { id: "lun", name: "Pazartesi",  nameKey: "day.lun", focus: "İtiş + Core",      focusKey: "dayFocus.lun", type: "push",   color: "#d4af37" },
  { id: "mar", name: "Salı",       nameKey: "day.mar", focus: "Çekiş + Mobilite", focusKey: "dayFocus.mar", type: "pull",   color: "#42c8f5" },
  { id: "mie", name: "Çarşamba",   nameKey: "day.mie", focus: "Bel + Esnetme",    focusKey: "dayFocus.mie", type: "lumbar", color: "#f54242" },
  { id: "jue", name: "Perşembe",   nameKey: "day.jue", focus: "Bacaklar + Kalçalar", focusKey: "dayFocus.jue", type: "legs",   color: "#f542c8" },
  { id: "vie", name: "Cuma",       nameKey: "day.vie", focus: "Tüm Vücut + Core", focusKey: "dayFocus.vie", type: "full",   color: "#f5c842" },
  { id: "sab", name: "Cumartesi",  nameKey: "day.sab", focus: "Aktif yürüyüş",    focusKey: "dayFocus.sab", type: "rest",   color: "#888899" },
  { id: "dom", name: "Pazar",      nameKey: "day.dom", focus: "Tam dinlenme",     focusKey: "dayFocus.dom", type: "rest",   color: "#888899" },
]

export const WORKOUTS: WorkoutsMap = {
  // ═══════════════════════════════════════ 1. FAZ ══════════════════════════════
  p1_lun: {
    phase: 1, day: "lun", title: "İtiş + Bel Core",
    exercises: [
      { id: "bird_dog", name: "Kuş-Köpek", sets: 3, reps: "12/yan", rest: 60, muscles: "Bel, core, kalçalar", note: "Sırt nötr, yukarıda 2 sn tut. YÜKSEK ÖNCELİK.", youtube: "Bird Dog exercise tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "hollow_hold", name: "Hollow Duruşu", sets: 3, reps: "20-30 sn", rest: 60, muscles: "Derin core, enine karın kası", note: "Bel yere YAPIŞIK. Bacakları olabildiğince uzağa uzat.", youtube: "Hollow body hold tutorial calisthenics", priority: "high", isTimer: true, timerSeconds: 25, equipment: ['ninguno'] },
      { id: "pushup_std", name: "Standart Şınav", sets: 4, reps: "8-12", rest: 90, muscles: "Göğüs, omuzlar, triceps", note: "Vücut tahta gibi gergin, dirsekler 45°, göğüs yere değsin.", youtube: "perfect push up form tutorial", priority: "med", equipment: ['ninguno'] },
      { id: "pike_pushup", name: "Ters V Şınavı", sets: 3, reps: "8-10", rest: 90, muscles: "Omuzlar, triceps", note: "Kalçalar yukarıda V şeklinde. İnerken baş iki kol arasında.", youtube: "pike push up tutorial shoulder", priority: "med", equipment: ['ninguno'] },
      { id: "dips_chair", name: "Sandalye Arka Kol İtişi", sets: 3, reps: "8-12", rest: 90, muscles: "Triceps, omuzlar", note: "Sırt sehpaya yapışık, dirsekler 90°'yi geçmesin.", youtube: "tricep dips chair tutorial", priority: "low", equipment: ['banco'] },
      { id: "plank", name: "Plank", sets: 3, reps: "30-45 sn", rest: 60, muscles: "Tüm core", note: "Kalçaları düşürme. Kalçaları sık.", youtube: "perfect plank form tutorial", priority: "high", isTimer: true, timerSeconds: 40, equipment: ['ninguno'] },
    ]
  },
  p1_mar: {
    phase: 1, day: "mar", title: "Çekiş + Mobilite",
    exercises: [
      { id: "scap_retract", name: "Kürek Kemiği Sıkıştırma", sets: 3, reps: "10-12", rest: 60, muscles: "Romboidler, trapez", note: "Kollar düz, sadece kürek kemikleriyle yüksel. Duruş için kritik.", youtube: "scapular retraction dead hang tutorial", priority: "high", equipment: ['barra_dominadas'] },
      { id: "australian_pullup", name: "Avustralya Barfiksi", sets: 4, reps: "8-12", rest: 90, muscles: "Dorsal, biceps, romboidler", note: "Vücut gergin, göğsü bara çek. Alçak bar yoksa masa/sandalye kullan.", youtube: "australian pull up inverted row tutorial", priority: "high", equipment: ['barra_dominadas'] },
      { id: "neg_pullup", name: "Negatif Barfiks", sets: 3, reps: "5 (5 sn iniş)", rest: 120, muscles: "Dorsal, biceps", note: "Sandalyeyle yüksel, 5 saniyede ÇOK yavaş in. Barfiks için temel.", youtube: "negative pull up tutorial beginners", priority: "med", equipment: ['barra_dominadas'] },
      { id: "face_pull", name: "Yüz Çekişi (bant/havlu)", sets: 3, reps: "12-15", rest: 60, muscles: "Arka omuz, rotator manşet", note: "Dirsekleri ayırarak yüze doğru çek. Lordoz karşıtı kritik.", youtube: "face pull band tutorial posture", priority: "med", equipment: ['banda_elastica', 'toalla'] },
      { id: "cat_cow", name: "Kedi-Deve", sets: 2, reps: "12 yavaş", rest: 30, muscles: "Omurga, bel", note: "Yavaş ve kontrollü. Her omuru hisset.", youtube: "cat cow yoga stretch spine", priority: "high", equipment: ['ninguno'] },
      { id: "superman", name: "Süpermen Duruşu", sets: 3, reps: "10 (3 sn yukarıda)", rest: 60, muscles: "Sırt ekstansörleri, kalçalar, bel", note: "Arka zinciri güçlendirir. Belin için temel.", youtube: "superman exercise back extension tutorial", priority: "high", equipment: ['ninguno'] },
    ]
  },
  p1_mie: {
    phase: 1, day: "mie", title: "Bel + Aktif Esnetme",
    exercises: [
      { id: "hip_flexor", name: "Kalça Fleksörü Esnetme (Psoas)", sets: 3, reps: "60 sn/yan", rest: 30, muscles: "Psoas, iliak kas", note: "Sıkı psoas ağrının NEDENİ. Her yanda en az 60 sn.", youtube: "hip flexor stretch psoas tight tutorial", priority: "high", isTimer: true, timerSeconds: 60, equipment: ['ninguno'] },
      { id: "pigeon", name: "Güvercin Duruşu", sets: 2, reps: "90 sn/yan", rest: 30, muscles: "Kalça, piriformis", note: "Sıkı piriformis siyatik siniri sıkıştırır → bel ağrısı.", youtube: "pigeon pose tutorial piriformis stretch", priority: "high", isTimer: true, timerSeconds: 90, equipment: ['ninguno'] },
      { id: "childs_pose", name: "Çocuk Duruşu (Traksiyonlu)", sets: 3, reps: "60 sn", rest: 30, muscles: "Bel, dorsal, kalçalar", note: "Kollar öne uzat. Yerçekimi omurgayı açsın.", youtube: "child pose yoga extended arms spine", priority: "high", isTimer: true, timerSeconds: 60, equipment: ['ninguno'] },
      { id: "glute_bridge", name: "Kalça Köprüsü", sets: 4, reps: "15", rest: 60, muscles: "Kalçalar, hamstring, bel", note: "Zayıf kalçalar bele yük bindirir. Yukarıda sık, 1 sn bekle.", youtube: "glute bridge tutorial form", priority: "high", equipment: ['ninguno'] },
      { id: "dead_bug", name: "Ölü Böcek", sets: 3, reps: "10/yan", rest: 60, muscles: "Derin core, enine karın kası", note: "Bel sürekli yere YAPIŞIK. Yavaş ve kontrollü.", youtube: "dead bug exercise core tutorial", priority: "med", equipment: ['ninguno'] },
      { id: "thoracic_rot", name: "Göğüs Omurga Rotasyonu", sets: 3, reps: "10/yan", rest: 30, muscles: "Göğüs omurgası, oblikler", note: "Yan yat, dizler bükülü, sadece gövdeyi döndür. Bel basıncını alır.", youtube: "thoracic rotation stretch tutorial spine", priority: "med", equipment: ['ninguno'] },
      { id: "forward_fold", name: "Oturarak Öne Katlanma", sets: 3, reps: "60 sn", rest: 30, muscles: "Hamstring, bel", note: "Kısalmış hamstring = kifotik duruş = bel ağrısı.", youtube: "seated forward fold hamstring stretch tutorial", priority: "med", isTimer: true, timerSeconds: 60, equipment: ['ninguno'] },
    ]
  },
  p1_jue: {
    phase: 1, day: "jue", title: "Bacaklar + Kalçalar",
    exercises: [
      { id: "glute_bridge_uni", name: "Tek Bacak Kalça Köprüsü", sets: 3, reps: "12/yan", rest: 60, muscles: "Kalça, hamstring", note: "Bel ağrısına yol açan sağ/sol dengesizliğini düzeltir.", youtube: "single leg glute bridge tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "goblet_squat", name: "Kupa Çömelmesi", sets: 4, reps: "12-15", rest: 90, muscles: "Quadriceps, kalçalar, core", note: "Sırt düz, dizler ayak uçlarının üzerinde, 90°.", youtube: "goblet squat bodyweight tutorial form", priority: "high", equipment: ['ninguno'] },
      { id: "reverse_lunge", name: "Geri Hamle", sets: 3, reps: "10/yan", rest: 90, muscles: "Quadriceps, kalçalar, hamstring", note: "Geriye adım. Dizler için öne hamleden daha güvenli.", youtube: "reverse lunge tutorial form", priority: "med", equipment: ['ninguno'] },
      { id: "good_morning", name: "Günaydın Egzersizi (ağırlıksız)", sets: 3, reps: "12", rest: 60, muscles: "Hamstring, bel, kalçalar", note: "Ayaklar omuz genişliğinde, sırt düz şekilde gövdeyi öne eğ.", youtube: "good morning exercise bodyweight tutorial", priority: "med", equipment: ['ninguno'] },
      { id: "calf_raise", name: "Topuk Kaldırma", sets: 3, reps: "20", rest: 45, muscles: "Baldır, soleus", note: "Yavaş ve tam hareket açıklığıyla.", youtube: "calf raise tutorial form", priority: "low", equipment: ['ninguno'] },
      { id: "wall_sit", name: "Duvar Oturuşu", sets: 3, reps: "45 sn", rest: 60, muscles: "Quadriceps, core", note: "Sırt duvara düz, dizler 90°.", youtube: "wall sit exercise tutorial", priority: "med", isTimer: true, timerSeconds: 45, equipment: ['pared'] },
    ]
  },
  p1_vie: {
    phase: 1, day: "vie", title: "Tüm Vücut + Tam Core",
    exercises: [
      { id: "archer_pushup", name: "Okçu Şınavı (Kolaylaştırılmış)", sets: 3, reps: "6/yan", rest: 90, muscles: "Tek taraflı göğüs", note: "Kılavuz kol açık, yük diğer kolda. Tek kol şınava geçiş.", youtube: "archer push up tutorial progression", priority: "high", equipment: ['ninguno'] },
      { id: "pullup_neg2", name: "Destekli Barfiks veya Negatifler", sets: 4, reps: "5-8", rest: 120, muscles: "Dorsal, biceps", note: "Tam barfiks yapamıyorsan direnç bandı kullan.", youtube: "assisted pull up band tutorial", priority: "high", equipment: ['barra_dominadas', 'banda_elastica'] },
      { id: "jump_squat", name: "Sıçrama Çömelmesi", sets: 3, reps: "10", rest: 60, muscles: "Bacaklar, patlayıcı güç", note: "Dizler bükülü yumuşak in. Ağrı varsa yapma.", youtube: "jump squat tutorial plyometric", priority: "med", equipment: ['ninguno'] },
      { id: "lsit_prog", name: "L Oturuşu İlerlemesi", sets: 3, reps: "15-20 sn", rest: 90, muscles: "Core, kalça fleksörleri", note: "Topukları yere koyarak başla, sonra bir bacağı kaldır.", youtube: "L-sit progression tutorial beginners", priority: "high", isTimer: true, timerSeconds: 20, equipment: ['ninguno'] },
      { id: "side_plank", name: "Yan Plank", sets: 3, reps: "30 sn/yan", rest: 60, muscles: "Oblikler, bel yan kasları", note: "Vücut tahta gibi düz.", youtube: "side plank tutorial form", priority: "med", isTimer: true, timerSeconds: 30, equipment: ['ninguno'] },
      { id: "burpees", name: "Burpee", sets: 3, reps: "8-10", rest: 90, muscles: "Tüm vücut, kardiyo", note: "Kontrollü. Ağrı varsa dağcı hareketiyle değiştir.", youtube: "burpee tutorial form proper", priority: "low", equipment: ['ninguno'] },
    ]
  },
  // ═══════════════════════════════════════ 2. FAZ ══════════════════════════════
  p2_lun: {
    phase: 2, day: "lun", title: "İleri İtiş",
    exercises: [
      { id: "hollow_rock", name: "Hollow Salınımı", sets: 3, reps: "15-20", rest: 60, muscles: "Derin core", note: "Statik hollow duruşun ilerlemesi. Kontrollü salınım.", youtube: "hollow body rock calisthenics tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "diamond_pushup", name: "Elmas Şınav", sets: 4, reps: "8-12", rest: 90, muscles: "Triceps, iç göğüs", note: "Eller göğüs kemiğinin altında elmas şeklinde. İnerken dirsekler birleşsin.", youtube: "diamond push up triceps tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "wide_pushup", name: "Geniş Şınav", sets: 3, reps: "10-15", rest: 90, muscles: "Dış göğüs, omuzlar", note: "Eller omuzlardan daha geniş.", youtube: "wide push up chest tutorial", priority: "med", equipment: ['ninguno'] },
      { id: "pike_elevated", name: "Yükseltilmiş Ters V Şınavı", sets: 4, reps: "8-10", rest: 90, muscles: "Omuzlar, triceps", note: "Ayaklar sandalyede. Omuzlara daha fazla yük. Amut şınavına geçiş.", youtube: "elevated pike push up shoulder press tutorial", priority: "med", equipment: ['banco'] },
      { id: "dips_parallel", name: "Paralel Bar Arka Kol İtişi (2 Sandalye)", sets: 4, reps: "8-12", rest: 90, muscles: "Triceps, alt göğüs", note: "Tam hareket açıklığı. Omuzların yükselmesine izin verme.", youtube: "parallel bar dips chairs tutorial", priority: "high", equipment: ['paralelas'] },
      { id: "plank_shoulder", name: "Plank Omuz Dokunuşu", sets: 3, reps: "12/yan", rest: 60, muscles: "Anti-rotasyon core", note: "Karşı omuza dokunurken kalçaları oynatma.", youtube: "plank shoulder tap anti rotation core tutorial", priority: "high", equipment: ['ninguno'] },
    ]
  },
  p2_mar: {
    phase: 2, day: "mar", title: "İleri Çekiş",
    exercises: [
      { id: "pullup_strict", name: "Sıkı Barfiks", sets: 5, reps: "maks (hedef 8-12)", rest: 120, muscles: "Dorsal, biceps", note: "Salınım yok. Yukarıda 1 sn bekle.", youtube: "strict pull up form tutorial", priority: "high", equipment: ['barra_dominadas'] },
      { id: "chinup", name: "Ters Kavrama Barfiks", sets: 4, reps: "maks", rest: 120, muscles: "Biceps, dorsal", note: "Barfiksten daha kolay. Hacim biriktirmek için kullan.", youtube: "chin up supinated grip tutorial", priority: "high", equipment: ['barra_dominadas'] },
      { id: "renegade_row", name: "Dönüşümlü Kürek Çekişi", sets: 3, reps: "10/yan", rest: 90, muscles: "Dorsal, anti-rotasyon core", note: "Şınav pozisyonundan, her yana dönüşümlü çek.", youtube: "renegade row tutorial bodyweight", priority: "med", equipment: ['ninguno'] },
      { id: "inverted_row_pause", name: "Duraklamalı Ters Kürek", sets: 4, reps: "10-12", rest: 90, muscles: "Romboidler, orta trapez", note: "Yukarıda 2 sn bekle. Bilgisayar duruşu için kritik.", youtube: "inverted row pause tutorial", priority: "high", equipment: ['barra_dominadas'] },
      { id: "pull_apart", name: "Havluyla Göğüs Açma", sets: 3, reps: "15", rest: 60, muscles: "Arka omuz", note: "Kollar omuz hizasında, tamamen ayır.", youtube: "band pull apart posterior deltoid tutorial", priority: "med", equipment: ['toalla'] },
    ]
  },
  p2_mie: {
    phase: 2, day: "mie", title: "İleri Bel",
    exercises: [
      { id: "single_rdl", name: "Tek Bacak Romen Kaldırışı", sets: 3, reps: "10/yan", rest: 60, muscles: "Hamstring, kalça, bel", note: "Kusursuz kalça menteşesi. Sırt her zaman nötr.", youtube: "single leg RDL bodyweight tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "glute_bridge_pause", name: "Duraklamalı Kalça Köprüsü (3 sn)", sets: 4, reps: "15", rest: 60, muscles: "Kalçalar, hamstring", note: "Yukarıda 3 sn izometrik bekle. Kolaysa tek bacak yap.", youtube: "glute bridge pause isometric tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "dead_bug_adv", name: "İleri Ölü Böcek", sets: 3, reps: "12/yan", rest: 60, muscles: "Core, enine karın kası", note: "Bacaklar tamamen uzatılmış. Beli yerde tutmak daha zor.", youtube: "dead bug advanced tutorial extended legs", priority: "med", equipment: ['ninguno'] },
      { id: "hip_flexor2", name: "Psoas Esnetme", sets: 2, reps: "90 sn/yan", rest: 30, muscles: "Psoas, iliak kas", note: "Her antrenmanda var. Bunu asla atlama.", youtube: "deep hip flexor stretch psoas", priority: "high", isTimer: true, timerSeconds: 90, equipment: ['ninguno'] },
      { id: "thoracic_ext", name: "Göğüs Omurga Açılması (havlu)", sets: 3, reps: "60 sn", rest: 30, muscles: "Göğüs omurgası", note: "Havlu rulosunu göğüs omurgası hizasına koy. Göğsü tavana aç.", youtube: "thoracic extension foam roller towel tutorial", priority: "med", isTimer: true, timerSeconds: 60, equipment: ['toalla'] },
      { id: "worlds_stretch", name: "Dünyanın En İyi Esnetmesi", sets: 3, reps: "6/yan", rest: 30, muscles: "Tüm vücut, arka zincir", note: "Var olan en kapsamlı esnetme.", youtube: "world greatest stretch tutorial", priority: "low", equipment: ['ninguno'] },
    ]
  },
  p2_jue: {
    phase: 2, day: "jue", title: "İleri Bacaklar",
    exercises: [
      { id: "bulgarian", name: "Bulgar Çömelmesi", sets: 4, reps: "10/yan", rest: 120, muscles: "Quadriceps, kalça, hamstring", note: "Arka ayak sehpa/sandalyede. Kalistenikte en etkili bacak hareketi.", youtube: "bulgarian split squat tutorial form", priority: "high", equipment: ['banco'] },
      { id: "nordic_curl", name: "Nordic Kıvrılma (Kolaylaştırılmış)", sets: 3, reps: "6-8", rest: 120, muscles: "Hamstring", note: "Ayakları koltuk altına sabitle. Sakatlanmayı önler, arka zinciri güçlendirir.", youtube: "nordic curl tutorial hamstrings beginners", priority: "high", equipment: ['ninguno'] },
      { id: "squat_pause", name: "Duraklamalı Çömelme (3 sn)", sets: 4, reps: "10", rest: 90, muscles: "Quadriceps, kalçalar", note: "Duraklama sekme etkisini kaldırır, gerçek gücü artırır.", youtube: "pause squat bodyweight tutorial", priority: "med", equipment: ['ninguno'] },
      { id: "step_up", name: "Patlayıcı Basamak Çıkışı", sets: 3, reps: "10/yan", rest: 90, muscles: "Kalça, quadriceps", note: "Güçlü çık, kontrollü in. Basamak veya sağlam sandalye kullan.", youtube: "explosive step up tutorial plyometric", priority: "med", equipment: ['escalon'] },
      { id: "calf_uni", name: "Tek Bacak Topuk Kaldırma", sets: 3, reps: "15/yan", rest: 45, muscles: "Gastroknemius, soleus", note: "Tam hareket açıklığı, sekme yok.", youtube: "single leg calf raise tutorial", priority: "low", equipment: ['ninguno'] },
    ]
  },
  p2_vie: {
    phase: 2, day: "vie", title: "Tüm Vücut Yoğunluk",
    exercises: [
      { id: "archer2", name: "Okçu Şınavı", sets: 4, reps: "8/yan", rest: 90, muscles: "Tek taraflı göğüs", note: "Kılavuz kolu her hafta biraz daha aç. Tek kol şınava geçiş.", youtube: "archer push up advanced tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "lsit_full", name: "Paralel Bar/Sandalye L Oturuşu", sets: 4, reps: "15-25 sn", rest: 90, muscles: "Core, kalça fleksörleri, omuzlar", note: "Yapabiliyorsan bacaklar düz. Yapamıyorsan dizler bükülü.", youtube: "L-sit on chairs tutorial progression", priority: "high", isTimer: true, timerSeconds: 20, equipment: ['paralelas'] },
      { id: "muscleup_neg", name: "Negatif Barfiks Geçişi", sets: 3, reps: "5 (5 sn)", rest: 120, muscles: "Tam çekiş + itiş", note: "Sandalyeyle yüksel, geçişten çok yavaş in.", youtube: "muscle up negative tutorial progression", priority: "high", equipment: ['barra_dominadas'] },
      { id: "pistol_prog", name: "Tek Bacak Çömelme İlerlemesi", sets: 3, reps: "8/yan", rest: 90, muscles: "Quadriceps, kalça, denge", note: "Tek bacak havada sandalyeye oturarak başla.", youtube: "pistol squat progression tutorial beginners", priority: "med", equipment: ['banco'] },
      { id: "hollow_arch", name: "Gergin-Ark Salınımı", sets: 3, reps: "10", rest: 60, muscles: "Tüm core, dorsal, kalçalar", note: "Barda, gergin ve ark pozisyonları arasında kontrollü salın.", youtube: "hollow arch swing bar calisthenics tutorial", priority: "med", equipment: ['barra_dominadas'] },
    ]
  },
  // ═══════════════════════════════════════ 3. FAZ ══════════════════════════════
  p3_lun: {
    phase: 3, day: "lun", title: "İtiş + Amut",
    exercises: [
      { id: "handstand_wall", name: "Duvarda Amut", sets: 3, reps: "30-60 sn", rest: 120, muscles: "Omuzlar, core, denge", note: "Eller duvardan 10-15 cm. Vücut düz, beli çukurlaştırma.", youtube: "handstand against wall tutorial beginner", priority: "high", isTimer: true, timerSeconds: 45, equipment: ['pared'] },
      { id: "pike_hspu", name: "Ters V Amut Şınavı", sets: 4, reps: "6-10", rest: 120, muscles: "Omuzlar, triceps", note: "Ayaklar yüksek sandalyede. Hedef: tam amut şınavı.", youtube: "pike handstand push up tutorial", priority: "high", equipment: ['banco'] },
      { id: "one_arm_prog", name: "Tek Kol Şınav İlerlemesi", sets: 4, reps: "5/yan", rest: 120, muscles: "Tek taraflı tam göğüs", note: "Dizlerden veya el top üzerinde yükseltilmiş şekilde başla.", youtube: "one arm push up progression tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "pseudo_planche", name: "Yalancı Planche Şınavı", sets: 3, reps: "6-8", rest: 120, muscles: "Ön omuz, göğüs", note: "Parmaklar ayaklara dönük, vücut hafif öne eğik.", youtube: "pseudo planche push up tutorial", priority: "med", equipment: ['ninguno'] },
      { id: "planche_lean", name: "Planche Eğimi", sets: 4, reps: "20-30 sn", rest: 90, muscles: "Omuzlar, bilek, core", note: "Eller üzerinde öne eğil. Planche'ye hazırlık.", youtube: "planche lean tutorial progression", priority: "med", isTimer: true, timerSeconds: 25, equipment: ['ninguno'] },
    ]
  },
  p3_mar: {
    phase: 3, day: "mar", title: "Çekiş + Beceriler",
    exercises: [
      { id: "weighted_pullup", name: "Sırt Çantalı Barfiks", sets: 5, reps: "6-8", rest: 180, muscles: "Dorsal, biceps", note: "Çantaya 5-10 kg koy. Sağlam barfiksin varsa.", youtube: "weighted pull up backpack tutorial", priority: "high", equipment: ['barra_dominadas', 'lastre'] },
      { id: "muscleup_real", name: "Barfiks Geçişi", sets: 3, reps: "3-5 (veya negatif)", rest: 180, muscles: "Tam çekiş + itiş", note: "Hâlâ yapamıyorsan: 5 çok yavaş negatif.", youtube: "muscle up tutorial step by step", priority: "high", equipment: ['barra_dominadas'] },
      { id: "front_lever_tuck", name: "Ön Kaldıraç (Büzülmüş)", sets: 4, reps: "10-20 sn", rest: 120, muscles: "Dorsal, core, kürek kemikleri", note: "Dizler göğüste. Vücut yatay. Çok zorlayıcı.", youtube: "front lever tuck tutorial progression", priority: "high", isTimer: true, timerSeconds: 15, equipment: ['barra_dominadas'] },
      { id: "typewriter_pullup", name: "Daktilo Barfiks", sets: 3, reps: "toplam 6", rest: 120, muscles: "Tek taraflı dorsal", note: "Ortaya çık, bir yana kay, diğer yana kay, in.", youtube: "typewriter pull up tutorial advanced", priority: "med", equipment: ['barra_dominadas'] },
    ]
  },
  p3_mie: {
    phase: 3, day: "mie", title: "Bel Bakımı",
    exercises: [
      { id: "hip_flexor_deep", name: "Kalça Fleksörü 90/90", sets: 3, reps: "90 sn/yan", rest: 30, muscles: "Psoas, kalça kapsülü", note: "Yerde 90/90 pozisyonu. Temel versiyondan daha derin.", youtube: "90 90 hip flexor stretch tutorial", priority: "high", isTimer: true, timerSeconds: 90, equipment: ['ninguno'] },
      { id: "jefferson_curl", name: "Jefferson Kıvrılması (çok yavaş)", sets: 3, reps: "8", rest: 60, muscles: "Omurga, hamstring, bel", note: "Omurgayı omur omur yuvarla. ÇOK yavaş.", youtube: "jefferson curl tutorial spine mobility", priority: "med", equipment: ['ninguno'] },
      { id: "cossack_squat", name: "Kazak Çömelmesi", sets: 3, reps: "8/yan", rest: 60, muscles: "İç bacak, kalça, mobilite", note: "Derin yan çömelme. Kalça ve bel mobilitesini çalıştırır.", youtube: "cossack squat tutorial mobility", priority: "med", equipment: ['ninguno'] },
      { id: "glute_bridge_march", name: "Kalça Köprüsü Yürüyüşü", sets: 3, reps: "12/yan", rest: 60, muscles: "Kalçalar, dengeleyici core", note: "Köprü pozisyonundan dizleri dönüşümlü göğse kaldır.", youtube: "glute bridge march tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "thoracic_mobility", name: "Tam Göğüs Omurga Mobilitesi", sets: 2, reps: "toplam 10 dk", rest: 0, muscles: "Tüm göğüs omurgası", note: "Rotasyonlar, açılmalar, köpük rulo. Tam rutin.", youtube: "thoracic spine mobility routine programmer", priority: "high", equipment: ['ninguno'] },
    ]
  },
  p3_jue: {
    phase: 3, day: "jue", title: "Bacaklar + Tek Bacak Çömelme",
    exercises: [
      { id: "pistol_free", name: "Serbest Tek Bacak Çömelme", sets: 4, reps: "5/yan", rest: 120, muscles: "Quadriceps, kalça, denge", note: "Destek yok. Güç, ayak bileği mobilitesi ve denge gerekir.", youtube: "pistol squat free tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "nordic_adv", name: "Tam Nordic Kıvrılma", sets: 3, reps: "5-8", rest: 120, muscles: "Hamstring", note: "Yere kadar tam hareket. Gerekirse sonunda ellerini kullan.", youtube: "nordic hamstring curl full tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "bulgarian_adv", name: "Bulgar Çömelmesi + Sıçrama", sets: 3, reps: "8/yan", rest: 120, muscles: "Bacak patlayıcı gücü", note: "Bacak değiştirirken sıçra. Yüksek yoğunluk.", youtube: "bulgarian split squat jump plyometric tutorial", priority: "med", equipment: ['banco'] },
      { id: "shrimp_squat", name: "Karides Çömelme İlerlemesi", sets: 3, reps: "6/yan", rest: 90, muscles: "Quadriceps, denge", note: "Arka ayağı arkada elle tut. Tek bacak çömelmeden daha zor.", youtube: "shrimp squat tutorial progression", priority: "med", equipment: ['ninguno'] },
    ]
  },
  p3_vie: {
    phase: 3, day: "vie", title: "Beceri Günü",
    exercises: [
      { id: "lsit_30s", name: "L Oturuşu 30 sn", sets: 5, reps: "30 sn", rest: 120, muscles: "Core, fleksörler, omuzlar", note: "Faz hedefi: düz bacaklarla 30 sn kesintisiz.", youtube: "L-sit 30 seconds tutorial progression", priority: "high", isTimer: true, timerSeconds: 30, equipment: ['paralelas'] },
      { id: "handstand_free", name: "Serbest Amut (denemeler)", sets: 3, reps: "5-15 sn", rest: 60, muscles: "Denge, omuzlar, core", note: "Serbest dengeyi çalış. Dinlenerek çok deneme yap.", youtube: "freestanding handstand tutorial balance", priority: "high", isTimer: true, timerSeconds: 10, equipment: ['ninguno'] },
      { id: "human_flag_prog", name: "İnsan Bayrağı İlerlemesi", sets: 3, reps: "5-10 sn", rest: 120, muscles: "Oblikler, omuzlar, dorsal", note: "Büzülmüş pozisyonla başla. En etkileyici becerilerden biri.", youtube: "human flag progression tutorial beginners", priority: "med", isTimer: true, timerSeconds: 8, equipment: ['barra_dominadas'] },
      { id: "front_lever_single", name: "Tek Bacak Ön Kaldıraç", sets: 3, reps: "10-15 sn", rest: 120, muscles: "Dorsal, core", note: "Bir bacak uzatılmış. Tam ön kaldıraca geçiş.", youtube: "front lever single leg tutorial progression", priority: "med", isTimer: true, timerSeconds: 12, equipment: ['barra_dominadas'] },
    ]
  },
  // ═══════════════════════════════════════ 4. FAZ ══════════════════════════════
  p4_lun: {
    phase: 4, day: "lun", title: "Zirve İtiş + Amut",
    exercises: [
      { id: "hspu_wall", name: "Duvar Amut Şınavı", sets: 5, reps: "5-8", rest: 180, muscles: "Omuzlar, triceps, core", note: "Duvarda amut, başını yere indir. Elit seviye.", youtube: "handstand push up wall tutorial", priority: "high", equipment: ['pared'] },
      { id: "one_arm_actual", name: "Tek Kol Şınav", sets: 4, reps: "5/yan", rest: 120, muscles: "Tek taraflı tam göğüs", note: "Yapamıyorsan: maksimum eğimli okçu şınavı.", youtube: "one arm push up tutorial full", priority: "high", equipment: ['ninguno'] },
      { id: "planche_tuck", name: "Büzülmüş Planche", sets: 4, reps: "5-15 sn", rest: 120, muscles: "Ön omuz, core", note: "Dizler göğüste, vücut yatay. Aşırı zor.", youtube: "tuck planche tutorial progression", priority: "high", isTimer: true, timerSeconds: 10, equipment: ['paralelas'] },
      { id: "ring_dip_prog", name: "Halka Arka Kol İtişi (veya Ağırlıklı)", sets: 4, reps: "8-10", rest: 120, muscles: "Triceps, göğüs, denge kasları", note: "Halka veya sırt çantası. İleri seviye.", youtube: "ring dips tutorial beginner progression", priority: "med", equipment: ['anillas'] },
    ]
  },
  p4_mar: {
    phase: 4, day: "mar", title: "Zirve Çekiş + Beceriler",
    exercises: [
      { id: "front_lever_full", name: "Tam Ön Kaldıraç", sets: 4, reps: "5-10 sn", rest: 180, muscles: "Dorsal, core, kürek kemikleri", note: "Vücut tamamen yatay. En etkileyici çekiş becerisi.", youtube: "front lever full tutorial", priority: "high", isTimer: true, timerSeconds: 8, equipment: ['barra_dominadas'] },
      { id: "one_arm_pullup_prog", name: "Tek Kol Barfiks İlerlemesi", sets: 4, reps: "3-5/yan", rest: 180, muscles: "Tek taraflı dorsal", note: "Bantla veya yarım kavramayla. Uzun yol ama buradan başla.", youtube: "one arm pull up progression tutorial", priority: "high", equipment: ['barra_dominadas'] },
      { id: "muscleup_flow", name: "Barfiks Geçişi x5 Akış", sets: 4, reps: "5 ard arda", rest: 180, muscles: "Tam çekiş + itiş", note: "Bardan inmeden 5 tekrar. Çekişin zirvesi.", youtube: "muscle up 5 in a row tutorial", priority: "high", equipment: ['barra_dominadas'] },
      { id: "back_lever", name: "Arka Kaldıraç İlerlemesi", sets: 3, reps: "5-15 sn", rest: 120, muscles: "Omuzlar, göğüs, core", note: "Büzülmüş arka kaldıraçla başla.", youtube: "back lever progression tutorial beginners", priority: "med", isTimer: true, timerSeconds: 10, equipment: ['barra_dominadas'] },
    ]
  },
  p4_mie: {
    phase: 4, day: "mie", title: "Zirve Bel + Mobilite",
    exercises: [
      { id: "yoga_flow_lumbar", name: "Bel için Yoga Akışı (15 dk)", sets: 1, reps: "15 dk", rest: 0, muscles: "Tüm omurga, kalçalar", note: "Bel için özel yoga rutini. Tam bir video takip et.", youtube: "yoga flow lower back pain relief 15 minutes", priority: "high", equipment: ['ninguno'] },
      { id: "jefferson_adv", name: "Jefferson Kıvrılması + Ağırlık", sets: 3, reps: "8 (2-5 kg ile)", rest: 60, muscles: "Omurga, hamstring", note: "Artık hafif ağırlıkla. Maksimum omurga mobilitesi.", youtube: "jefferson curl weighted tutorial", priority: "med", equipment: ['lastre'] },
      { id: "deep_hip_mobility", name: "Tam Kalça Mobilitesi Rutini", sets: 1, reps: "10 dk", rest: 0, muscles: "Tüm kalça, bel", note: "Tam kalça mobilitesi rutini. Bir video takip et.", youtube: "hip mobility full routine 10 minutes", priority: "high", equipment: ['ninguno'] },
      { id: "glute_activation_peak", name: "Zirve Kalça Aktivasyonu", sets: 4, reps: "20", rest: 45, muscles: "Kalçalar, hamstring", note: "Bant yürüyüşü, istiridye, kurbağa pompası. Tam aktivasyon.", youtube: "glute activation routine complete tutorial", priority: "high", equipment: ['banda_elastica'] },
    ]
  },
  p4_jue: {
    phase: 4, day: "jue", title: "Zirve Bacaklar",
    exercises: [
      { id: "pistol_vol", name: "Tek Bacak Çömelme Hacmi", sets: 5, reps: "8/yan", rest: 90, muscles: "Quadriceps, kalça", note: "8 tekrarlık 5 set. Kalistenikte maksimum bacak hacmi.", youtube: "pistol squat volume training tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "nordic_full", name: "Eller Serbest Tam Nordic Kıvrılma", sets: 4, reps: "8-10", rest: 120, muscles: "Hamstring", note: "Sonunda elleri kullanma. Maksimum eksantrik güç.", youtube: "nordic hamstring curl advanced", priority: "high", equipment: ['ninguno'] },
      { id: "shrimp_full", name: "Tam Karides Çömelme", sets: 3, reps: "8/yan", rest: 90, muscles: "Quadriceps, ayak bileği, denge", note: "Arka diz yere yumuşakça değsin.", youtube: "shrimp squat full tutorial", priority: "med", equipment: ['ninguno'] },
      { id: "box_jump", name: "Kutu Sıçraması (sağlam sandalye)", sets: 4, reps: "8", rest: 90, muscles: "Tam patlayıcı güç", note: "Sağlam sandalye veya basamağa sıçra. Yumuşak in.", youtube: "box jump tutorial plyometric form", priority: "med", equipment: ['escalon'] },
    ]
  },
  p4_vie: {
    phase: 4, day: "vie", title: "Beceri Zirvesi Günü",
    exercises: [
      { id: "skill_complex", name: "Beceri Kombinasyonu (3 beceri seç)", sets: 3, reps: "beceriye göre", rest: 180, muscles: "Değişken", note: "En sevdiğin 3 beceriyi seç ve çalış. Amut, L oturuşu, barfiks geçişi, ön kaldıraç.", youtube: "calisthenics skills complex advanced", priority: "high", equipment: ['barra_dominadas'] },
      { id: "lsit_45", name: "L Oturuşu 45 sn Hedefi", sets: 4, reps: "maks (hedef 45 sn)", rest: 120, muscles: "Core, fleksörler, omuzlar", note: "Programın son hedefi. 45 saniye kesintisiz.", youtube: "L-sit 45 seconds tutorial", priority: "high", isTimer: true, timerSeconds: 45, equipment: ['paralelas'] },
      { id: "handstand_60", name: "Serbest Amut 60 sn", sets: 3, reps: "hedef 60 sn serbest", rest: 60, muscles: "Tam denge", note: "Hedef: 6 ay sonunda 60 sn serbest amut.", youtube: "freestanding handstand 60 seconds tutorial", priority: "high", equipment: ['ninguno'] },
      { id: "strength_test", name: "Aylık Kuvvet Testi", sets: 1, reps: "her şeyde maks", rest: 300, muscles: "Tüm vücut", note: "Ayın son cuma günü: maks barfiks, maks şınav, L oturuşu süresi, maks tek bacak çömelme. Not al ve karşılaştır.", youtube: "calisthenics strength test benchmark", priority: "high", equipment: ['barra_dominadas'] },
    ]
  },
}

export const getWorkout = (phase: number, day: DayId): Workout | null =>
  WORKOUTS[`p${phase}_${day}`] || null
