import { ArticleItem } from './types';

// Helper to generate dynamic ISO strings for fresh dates
const getPastDate = (hoursAgo: number, minutesAgo: number = 0): string => {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
};

export const CURATED_ARTICLES: ArticleItem[] = [
  {
    id: 'gundem-1',
    feedId: 'gundem',
    feedTitle: 'APEX Gündem',
    category: 'Gündem',
    title: 'Yapay Zeka ve Eğitimde Yeni Dönem: Türkiye Genelinde Pilot Uygulama Başlıyor',
    link: 'https://apex.os/bulletin/gundem-1',
    pubDate: getPastDate(0, 25), // 25 minutes ago
    creator: 'Engin Nalbant',
    contentSnippet: 'Milli Eğitim Bakanlığı, yapay zeka destekli kişiselleştirilmiş öğrenme platformunu pilot okullarda hayata geçiriyor. Proje, öğrencilerin bireysel öğrenme hızlarına göre ders içeriklerini optimize edecek.',
    content: 'Milli Eğitim Bakanlığı (MEB), modern eğitim teknolojileri vizyonu kapsamında yapay zeka tabanlı "Bireysel Öğrenme Sistemi" pilot uygulamasını bu dönem başlatıyor. Seçilen 50 pilot okulda uygulanacak sistem, yapay zeka algoritmaları kullanarak her öğrencinin anlama kapasitesini, güçlü ve zayıf yönlerini analiz edecek.\n\nEğitmenler ve yapay zeka uzmanları tarafından ortaklaşa geliştirilen platform, öğrencilere kişiselleştirilmiş ev ödevleri, interaktif konu anlatımları ve dinamik deneme sınavları sunacak. Projenin başarılı olması durumunda, önümüzdeki eğitim-öğretim yılından itibaren tüm Türkiye genelindeki ortaöğretim kurumlarında yaygınlaştırılması hedefleniyor.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'gundem-2',
    feedId: 'gundem',
    feedTitle: 'APEX Gündem',
    category: 'Gündem',
    title: 'İstanbul Sürdürülebilir Ulaşım Projesi: Yeni Elektrikli Otobüs Filosu Hizmete Alındı',
    link: 'https://apex.os/bulletin/gundem-2',
    pubDate: getPastDate(1, 45), // 1 hour 45 minutes ago
    creator: 'Selin Yılmaz',
    contentSnippet: 'Sıfır karbon emisyonu vizyonu çerçevesinde, İstanbul caddelerinde tamamen yerli üretim elektrikli otobüslerden oluşan yeni hatlar bugün itibarıyla seferlerine başladı.',
    content: 'İstanbul Metropolitan alanı genelinde çevre kirliliğini azaltmak ve toplu taşımayı daha sürdürülebilir kılmak amacıyla planlanan yeşil ulaşım reformunun ilk adımı atıldı. Yerli imkanlarla üretilen, 350 km menzile sahip 50 yeni elektrikli otobüs, tarihi yarımada ve sahil şeridindeki yoğun hatlarda hizmete girdi.\n\nAkıllı şarj istasyonları ve rejeneratif frenleme sistemleri ile donatılan yeni filo, yıllık bazda tonlarca karbon salınımının önüne geçecek. Belediye yetkilileri, 2030 yılına kadar toplu taşıma filosunun %60\'ının tamamen elektrikli veya hidrojen yakıtlı araçlara dönüştürüleceğini bildirdi.',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'teknoloji-1',
    feedId: 'teknoloji',
    feedTitle: 'Siber Bülten',
    category: 'Teknoloji',
    title: 'Kuantum Bilgisayarlarda Dev Atılım: Ticari Kullanım İçin İlk Modüller Hazır',
    link: 'https://apex.os/bulletin/teknoloji-1',
    pubDate: getPastDate(3, 10),
    creator: 'Can Demir',
    contentSnippet: 'Dünyanın önde gelen kuantum araştırma konsorsiyumu, oda sıcaklığında kararlı çalışabilen yeni bir yarı iletken silikon kuantum işlemci mimarisini duyurdu.',
    content: 'Kuantum hesaplama alanındaki en büyük engellerden biri olan "mutlak sıfır sıcaklık (-273°C)" ihtiyacı, geliştirilen yeni bir teknoloji ile aşılmak üzere. Araştırmacılar, standart silikon çipler üzerine entegre edilebilen ve oda sıcaklığına yakın koşullarda dahi kuantum koheransını koruyabilen yeni bir kübit (qubit) mimarisi geliştirmeyi başardı.\n\nBu gelişme, büyük veri merkezlerinin kuantum işlemcileri standart sunucu raflarına monte edebileceği anlamına geliyor. Siber güvenlik, karmaşık moleküler simülasyonlar ve derin yapay zeka modellerinin eğitilmesi süreçlerini binlerce kat hızlandıracak ticari modüllerin önümüzdeki yıl sonuna kadar satışa sunulması öngörülüyor.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'teknoloji-2',
    feedId: 'teknoloji',
    feedTitle: 'Siber Bülten',
    category: 'Teknoloji',
    title: 'ApexOS v3.5 Sürümü Yayınlandı: Tamamen Yerel ve Güvenli Yapay Zeka Entegrasyonu',
    link: 'https://apex.os/bulletin/teknoloji-2',
    pubDate: getPastDate(4, 50),
    creator: 'Can Demir',
    contentSnippet: 'ApexOS işletim sisteminin merakla beklenen v3.5 güncellemesi kullanıcılara sunuldu. Yeni sürüm, internet bağlantısı olmadan çalışan lokal dil modelleriyle donatıldı.',
    content: 'Yenilikçi arayüzü ve hızıyla dikkat çeken yerli işletim sistemi platformu ApexOS, v3.5 sürümüyle birlikte güvenlik ve yapay zeka odaklı muazzam bir güncelleme aldı. "Cortex Core" adı verilen yeni entegre mimari sayesinde kullanıcılar, kişisel verilerini hiçbir bulut sunucusuna göndermeden tamamen yerel olarak çalışan gelişmiş asistan özelliklerine erişebiliyor.\n\nGüncelleme ile birlikte yenilenen Haber Bülteni modülü, finans kontrol paneli ve hava durumu tahmin motoru da daha yüksek performansla optimize edildi. Özellikle veri gizliliğine önem veren profesyoneller ve kurumsal firmalar için ApexOS v3.5, pazardaki en güçlü alternatiflerden biri haline geliyor.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'ekonomi-1',
    feedId: 'ekonomi',
    feedTitle: 'Finans Analiz',
    category: 'Ekonomi',
    title: 'Dijital Türk Lirası Faz-2 Raporu Açıklandı: Pilot Uygulamalarda Başarı Sağlandı',
    link: 'https://apex.os/bulletin/ekonomi-1',
    pubDate: getPastDate(6, 15),
    creator: 'Selin Yılmaz',
    contentSnippet: 'Türkiye Cumhuriyeti Merkez Bankası, Dijital Türk Lirası Faz-2 çalışmalarına dair detaylı değerlendirmelerini ve akıllı sözleşme entegrasyonu sonuçlarını paylaştı.',
    content: 'Türkiye Cumhuriyeti Merkez Bankası (TCMB) öncülüğünde yürütülen Dijital Türk Lirası projesinde önemli bir aşama daha geride kaldı. Yayınlanan Faz-2 değerlendirme raporuna göre, bankalar arası toptan ödemeler ve akıllı kontrat tabanlı otomatik ödeme sistemleri başarıyla test edildi.\n\nBlokzincir altyapısı üzerinde kurgulanan Dijital TL, geleneksel EFT ve Havale sistemlerine kıyasla işlem maliyetlerini neredeyse sıfıra indirirken işlem sürelerini milisaniyeler mertebesine düşürdü. Önümüzdeki günlerde Faz-3 aşamasına geçilerek sınırlı sayıda perakende alışveriş noktasında halka açık denemelere başlanması planlanıyor.',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'ekonomi-2',
    feedId: 'ekonomi',
    feedTitle: 'Finans Analiz',
    category: 'Ekonomi',
    title: 'Yenilenebilir Enerji Yatırımları Rekor Kırdı: Üretim Kapasitesi %15 Arttı',
    link: 'https://apex.os/bulletin/ekonomi-2',
    pubDate: getPastDate(8, 30),
    creator: 'Selin Yılmaz',
    contentSnippet: 'Ege ve İç Anadolu bölgelerindeki yeni rüzgar ve güneş enerjisi santrallerinin faaliyete geçmesiyle elektrik üretiminde yeşil enerjinin payı tarihi zirveye yükseldi.',
    content: 'Türkiye\'nin enerji bağımsızlığı yolunda attığı stratejik adımlar meyvelerini vermeye devam ediyor. Enerji Bakanlığı verilerine göre, 2026 yılının ilk yarısında tamamlanan rüzgar (RES) ve güneş (GES) projeleriyle ulusal şebekenin yenilenebilir enerji kurulu gücü %15 oranında net bir artış gösterdi.\n\nÖzellikle sanayi bölgelerinde çatı tipi GES uygulamalarının yaygınlaşması, fabrikaların enerji maliyetlerini ciddi oranda düşürdü. Uzmanlar, temiz enerji kapasitesindeki bu istikrarlı artışın cari açığın azaltılmasına doğrudan pozitif katkı sağlayacağını vurguluyor.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'spor-1',
    feedId: 'spor',
    feedTitle: 'Apex Spor',
    category: 'Spor',
    title: 'Milli Okçumuz Mete Gazoz Dünya Şampiyonası\'nda Yeniden Altın Madalyaya Uzandı',
    link: 'https://apex.os/bulletin/spor-1',
    pubDate: getPastDate(12, 10),
    creator: 'Engin Nalbant',
    contentSnippet: 'Klasik yay erkekler kategorisinde mücadele eden olimpiyat şampiyonu milli okçumuz Mete Gazoz, finalde rakibini mağlup ederek bir kez daha dünya lideri oldu.',
    content: 'Milli okçumuz Mete Gazoz, uluslararası arenada göğsümüzü kabartmaya devam ediyor. İsviçre\'de düzenlenen Açık Hava Okçuluk Dünya Şampiyonası finalinde, son derece rüzgarlı hava koşullarında sergilediği kusursuz atışlarla Güney Koreli rakibini 6-2 mağlup etti.\n\nBu tarihi galibiyetle birlikte üst üste ikinci kez Dünya Şampiyonu unvanını koruyan Gazoz, önümüzdeki olimpiyat oyunları öncesinde de en büyük favori olduğunu tescilledi. Karşılaşma sonrası yaptığı açıklamada, "Bu madalya tüm Türkiye\'ye ve genç sporcu kardeşlerime armağandır," dedi.',
    image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'spor-2',
    feedId: 'spor',
    feedTitle: 'Apex Spor',
    category: 'Spor',
    title: 'Süper Lig\'de Tarihi Sezon: Şampiyonluk Yarışı Son Maça Kaldı',
    link: 'https://apex.os/bulletin/spor-2',
    pubDate: getPastDate(14, 20),
    creator: 'Engin Nalbant',
    contentSnippet: 'Lider ile takipçisi arasındaki puan farkının bire inmesiyle futbolseverleri nefes kesen bir şampiyonluk düğümü bekliyor.',
    content: 'Trendyol Süper Lig\'de son yılların en büyük heyecanlarından biri yaşanıyor. Ligin bitimine sadece bir hafta kala, şampiyonluk adayları deplasmanda aldıkları kritik puanlarla yarışı son saniyeye kadar taşıdı. Üst düzey taktik savaşlarına sahne olan ligde, lider takım haftaya kendi sahasında oynayacağı maçı kazanması durumunda kupayı kaldıracak.\n\nFutbol otoriteleri, bu sezon sergilenen yüksek kondisyon ve yeni nesil teknik direktör hamlelerinin Türk futbolunun kalitesini uluslararası standartlara yaklaştırdığını belirtiyor. Tüm biletlerin tükendiği son hafta müsabakaları heyecanla bekleniyor.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'bilim-1',
    feedId: 'bilim',
    feedTitle: 'Bilim ve Evren',
    category: 'Bilim',
    title: 'James Webb Uzay Teleskobu, Atmosferinde Su Buharı Bulunan Yeni Bir Ötegezegen Keşfetti',
    link: 'https://apex.os/bulletin/bilim-1',
    pubDate: getPastDate(18, 0),
    creator: 'Selin Yılmaz',
    contentSnippet: 'Astronomlar, Dünya\'dan 45 ışık yılı uzakta, yaşanabilir bölge sınırında bulunan kayalık bir ötegezegenin atmosfer kimyasını spektroskopi ile netleştirdi.',
    content: 'NASA, ESA ve CSA ortaklığında işletilen James Webb Uzay Teleskobu (JWST), heyecan verici yeni bir keşfe imza attı. "Aura-9" adı verilen ve Dünya\'dan yaklaşık 45 ışık yılı uzakta bulunan bir kırmızı cüce yıldızın etrafında dönen ötegezegenin atmosferinde belirgin su buharı ve karbonmonoksit molekülleri tespit edildi.\n\nSıvı suyun bulunabileceği "yaşanabilir bölge" (Habitable Zone) sınırında yer alan gezegen, kayalık yapısıyla Dünya\'ya oldukça benziyor. Bilim insanları, bu gezegende yaşam olup olmadığını doğrulamak adına JWST\'nin kızılötesi spektrometre cihazıyla daha detaylı taramalar yapacaklarını açıkladı.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'bilim-2',
    feedId: 'bilim',
    feedTitle: 'Bilim ve Evren',
    category: 'Bilim',
    title: 'Kanser Tedavisinde Devrim: Hedefe Yönelik Nano-Robotlar Hücreleri Yok Ediyor',
    link: 'https://apex.os/bulletin/bilim-2',
    pubDate: getPastDate(22, 10),
    creator: 'Engin Nalbant',
    contentSnippet: 'Moleküler biyoloji alanında geliştirilen yeni nano-kapsüller, sağlıklı dokulara zarar vermeden yalnızca tümörlü hücreleri hedef alarak yok etmeyi başardı.',
    content: 'Kanser tedavilerinde kemoterapinin sağlıklı hücrelere verdiği zararları tamamen ortadan kaldırmayı amaçlayan nano-tıp projesinde tarihi bir dönüm noktasına ulaşıldı. Bilim insanları, DNA sarmallarından inşa edilmiş akıllı biyolojik nano-robotlar tasarladı.\n\nBu nano-robotlar, vücuda enjekte edildikten sonra kan dolaşımı yoluyla hareket ediyor ve sadece kanserli hücrelerin yüzeyindeki spesifik proteinleri algılayarak içlerindeki etken maddeyi doğrudan tümöre salgılıyor. Laboratuvar ortamındaki klinik öncesi deneylerde tümörlerin %92 oranında küçüldüğü ve hiçbir yan etki gözlenmediği raporlandı. İnsanlı klinik deneylerin önümüzdeki aylarda başlaması kararlaştırıldı.',
    image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800&auto=format&fit=crop&q=80'
  }
];

export const CURATED_CATEGORIES = ['Gündem', 'Teknoloji', 'Ekonomi', 'Spor', 'Bilim'];
