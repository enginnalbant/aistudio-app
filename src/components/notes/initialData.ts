import { Memo, Notebook, NoteCategory } from './types';

export const INITIAL_NOTE_CATEGORIES: NoteCategory[] = [
  { id: 'cat-work', name: 'İş & Projeler', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'cat-tech', name: 'Yazılım & AI', color: '#8b5cf6', icon: 'Code' },
  { id: 'cat-personal', name: 'Kişisel & Günlük', color: '#ec4899', icon: 'User' },
  { id: 'cat-ideas', name: 'Fikirler & Tasarım', color: '#f59e0b', icon: 'Lightbulb' },
  { id: 'cat-research', name: 'Araştırma & Notlar', color: '#10b981', icon: 'BookOpen' },
  { id: 'cat-finance', name: 'Finans & Strateji', color: '#06b6d4', icon: 'DollarSign' }
];

export const INITIAL_MEMOS: Memo[] = [
  {
    id: 'memo-101',
    content: "🚀 **APEX OS v4.2 Lansman Mimarisi**:\nYapay zeka odaklı bilgi ağacı ve responsive grafik mimarisinde son testler tamamlandı.\n\n- `#mimariler` `#react` `#tailwind` \n- Gemini 3.5 Flash entegrasyonu ile not özetleme gecikmesi 320ms'ye düşürüldü.\n- Micro-memos akışında sesli not kaydı ve otomatik transkripsiyon modülü eklendi.",
    tags: ['mimariler', 'react', 'tailwind', 'yapay-zeka'],
    category: 'Yazılım & AI',
    visibility: 'public',
    isPinned: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    attachments: [
      {
        id: 'att-1',
        name: 'architecture_diagram.png',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
        size: '1.2 MB'
      }
    ],
    reactions: { likes: 12, bookmarks: 5 },
    aiSummary: 'APEX OS v4.2 için yapay zeka performansı, Gemini entegrasyonu ve sesli not modülüne dair güncelleme notu.'
  },
  {
    id: 'memo-102',
    content: "🎙️ **Ürün Stratejisi Haftalık Notu**:\nMemos (usememos) ve Open Notebooks mimarisini tek bir bilgi ağında birleştirme kararı aldık.\n\n#ürün-stratejisi #fikir #toplantı #memos\n\n> \"Bilgiyi parçalamak yerine birbirine bağlı zihin haritasına (Knowledge Graph) dönüştürmek, kullanıcı verimliliğini 4 kat artırıyor.\"",
    tags: ['ürün-stratejisi', 'fikir', 'toplantı', 'memos'],
    category: 'Fikirler & Tasarım',
    visibility: 'workspace',
    isPinned: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    audioMemo: {
      url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
      duration: '01:24',
      transcript: 'Toplantıda alınan kararlar: Hızlı not alma modülünde mikro kart yapısı korunacak, defter tarafında kaynak tabanlı AI sohbeti sunulacak.'
    },
    reactions: { likes: 8, bookmarks: 9 }
  },
  {
    id: 'memo-103',
    content: "💡 **Clean Code & Functional React Tavsiyesi**:\nComponent'lerde `useEffect` dependency array'lerine asla obje ve inline fonksiyon vermeyin. Primitive tipler veya memoized hook'lar (`useCallback`, `useMemo`) tercih edin.\n\n```typescript\nconst memoizedFetch = useCallback(async () => {\n  const res = await fetch('/api/notes');\n  const data = await res.json();\n  setNotes(data);\n}, []);\n```\n\n#kod #react #typescript #clean-code",
    tags: ['kod', 'react', 'typescript', 'clean-code'],
    category: 'Yazılım & AI',
    visibility: 'public',
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22h ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    reactions: { likes: 24, bookmarks: 18 }
  },
  {
    id: 'memo-104',
    content: `📚 **Kitap Notu / Atomik Alışkanlıklar**:
"Bir hedef belirlemek ne yapacağınızı söyler; sistem kurmak ise oraya nasıl ulaşacağınızı belirler." 

#kitap #kişisel-gelişim #motivasyon #sistemler`,
    tags: ['kitap', 'kişisel-gelişim', 'motivasyon', 'sistemler'],
    category: 'Kişisel & Günlük',
    visibility: 'private',
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reactions: { likes: 6, bookmarks: 12 }
  },
  {
    id: 'memo-105',
    content: `📊 **Yıllık Gelir & Birikim Hedefleri**:
Finansal özgürlük yol haritasında bu ay yatırımların %35'i borsa endeks fonlarına, %25'i döviz ve kıymetli madenlere yönlendirilecek.

#finans #bütçe #yatırım #yatırım-stratejisi`,
    tags: ['finans', 'bütçe', 'yatırım', 'yatırım-stratejisi'],
    category: 'Finans & Strateji',
    visibility: 'private',
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    attachments: [
      {
        id: 'att-2',
        name: 'finans_bütçe_planlama.pdf',
        type: 'document',
        url: '#',
        size: '420 KB'
      }
    ],
    reactions: { likes: 3, bookmarks: 7 }
  }
];

export const INITIAL_NOTEBOOKS: Notebook[] = [
  {
    id: 'nb-1',
    title: 'Yapay Zeka & Derin Öğrenme Mimarileri',
    description: 'LLM, RAG sistemleri, vektör veritabanları ve Gemini API uygulamaları üzerine detaylı çalışma defteri.',
    category: 'Yazılım & AI',
    coverColor: 'from-violet-600 to-indigo-900',
    icon: 'Brain',
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    sources: [
      {
        id: 'src-1',
        title: 'Gemini 3.5 Architecture Paper & API Specs',
        type: 'web',
        url: 'https://ai.google.dev/docs',
        contentSnippet: 'Gemini 3.5 Flash, 1 milyon token bağlam penceresi ve multimodal ses, görsel ve kod işleme kabiliyetleri sunar.',
        addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      },
      {
        id: 'src-2',
        title: 'RAG (Retrieval Augmented Generation) En İyi Uygulamaları PDF',
        type: 'pdf',
        url: '#',
        contentSnippet: 'Chunk boyutu 512 token ve hybrid search (semantic + BM25) kullanımı doğruluk oranını %89 seviyesine çıkarmaktadır.',
        addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
      }
    ],
    pages: [
      {
        id: 'page-101',
        title: '1. Bölüm: RAG Mimarisi ve Vektör Arama',
        content: `### RAG (Retrieval Augmented Generation) Temelleri

RAG sistemleri, LLM'lerin kendi eğitim verileri dışındaki özel döküman ve notlardan bilgi çekerek doğru ve kaynaklı yanıtlar vermesini sağlar.

#### Temel Adımlar:
1. **Döküman Bölümleme (Chunking)**: Metinler 300-500 kelimelik parçalara bölünür.
2. **Embedding Üretimi**: Parçalar vektör uzayına aktarılır.
3. **Semantic Search**: Kullanıcı sorusuna en yakın parçalar Cosine Similarity ile bulunur.
4. **Context Ingestion**: Bulunan parçalar Gemini sistem talimatına bağlam olarak eklenir.

> **Önemli İpucu:** Yerel veritabanında SQLite + Cosine Distance veya Firestore kullanılarak hızlı arama yapılabilir.`,
        tags: ['rag', 'vektör-arama', 'llm', 'yapay-zeka'],
        sources: ['src-1', 'src-2'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        readTimeMinutes: 4
      },
      {
        id: 'page-102',
        title: '2. Bölüm: Prompt Engineering ve System Instructions',
        content: `### Sistem Talimatları ve Rol Tanımlama

Gemini modellerine net roller ve format sınırları belirlemek çıktının kalitesini dramatik şekilde artırır.

#### Örnek Şablon:
\`\`\`markdown
Sen uzman bir teknik yazar ve yazılım mimarısın. 
- Yanıtlarını daima Türkçe ver.
- Mümkünse maddeler ve kod blokları kullan.
- Bilinmeyen veya belirsiz konularda tahmin yürütme, eksik bilgi olduğunu belirt.
\`\`\`

#prompt-engineering #gemini #sistem-tasarımı`,
        tags: ['prompt-engineering', 'gemini', 'sistem-tasarımı'],
        sources: ['src-1'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        readTimeMinutes: 3
      }
    ],
    syntheses: [
      {
        id: 'syn-1',
        type: 'summary',
        title: 'Yönetici Özeti: RAG & Gemini Entegrasyon Stratejisi',
        content: 'Defterdeki kaynaklar incelendiğinde RAG sistemlerinin temel başarısı metinlerin doğru boyutlandırılması ve hibrit arama algoritmalarına dayanmaktadır. Gemini 3.5 Flash modeli ile bağlam aktarımı hızı milisaniyeler seviyesine inmiştir.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: 'syn-2',
        type: 'podcast',
        title: '🎙️ Sesli Genel Bakış Senaryosu (AI Audio Overview)',
        content: `**Sunucu 1:** Merhaba! Bugün Yapay Zeka ve RAG mimarileri notebook'umuzun sentezini inceliyoruz. RAG tam olarak ne sağlıyor?
**Sunucu 2:** Harika bir soru! RAG kısaca, yapay zekanın ezberlemek yerine özel kütüphanemizdeki notları anlık okuyup yanıt vermesini sağlıyor.
**Sunucu 1:** Yani halüsinasyonu sıfıra indirip tam kaynak gösteriyor diyebiliriz!`,
        audioScript: 'Podcast audio simulation ready.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
      }
    ]
  },
  {
    id: 'nb-2',
    title: 'APEX OS Ürün Mimarisi & Yol Haritası',
    description: 'Modüler tasarım, mikrofirontend yapısı, performans optimizasyonu ve kullanıcı arayüzü standartları.',
    category: 'İş & Projeler',
    coverColor: 'from-amber-600 to-rose-900',
    icon: 'Compass',
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    sources: [
      {
        id: 'src-3',
        title: 'APEX OS Design System Guidelines v4',
        type: 'text',
        contentSnippet: 'Koyu mod cam efekti (backdrop blur 40px), neon accent renkleri ve 1.25 tipografi ölçeği kullanılacaktır.',
        addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
      }
    ],
    pages: [
      {
        id: 'page-201',
        title: 'APEX OS Not Alma Ekosistemi Tasarım Belgesi',
        content: `### Not Alma Sistemi İlkeleri

1. **Sonsuz Esneklik (Memos + Notebooks)**: Hızlı aklına geleni yazmak isteyenler için mikro-memos; derin araştırma ve dokümantasyon isteyenler için çok sayfalı Notebooks.
2. **Yapay Zeka ile Doğal Bağlantı**: Gemini modelinin tüm notlara erişimi sayesinde sorular sorma, otomatik etiketleme ve sesli özet dinleme.
3. **Görsel Bilgi Ağı (Knowledge Graph)**: Etiketler, konular ve notlar arasındaki ilişki ağının etkileşimli grafik üzerinden gezilmesi.`,
        tags: ['apexos', 'not-sistemi', 'tasarım', 'memos'],
        sources: ['src-3'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        readTimeMinutes: 5
      }
    ],
    syntheses: []
  }
];
