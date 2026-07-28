import { Manga, MangaCollection, ReaderSettings, MangaChapter, MangaBookmark, MangaReadingStats } from './mangaTypes';

const MANGA_STORAGE_KEY = 'apex_manga_items_v2';
const CHAPTER_STORAGE_KEY = 'apex_manga_chapters_v2';
const COLLECTION_STORAGE_KEY = 'apex_manga_collections_v2';
const READER_SETTINGS_KEY = 'apex_manga_reader_settings_v2';
const BOOKMARKS_STORAGE_KEY = 'apex_manga_bookmarks_v2';
const STATS_STORAGE_KEY = 'apex_manga_stats_v2';

const INITIAL_MANGAS: Manga[] = [
  {
    id: 'manga-cyberpunk',
    title: 'Neon Düşleri: Tokyo 2099',
    author: 'Kenji Sato',
    artist: 'Yuki Tanaka',
    synopsis: 'Yapay zeka devriminin zirvesindeki Tokyo\'da, kayıp anılarını arayan sibernetik bir dedektifin maceraları. Şehrin en derin katmanlarında saklanan sır, tüm insanlığın kaderini değiştirebilir.',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    genres: ['Cyberpunk', 'Aksiyon', 'Gizem', 'Bilim Kurgu'],
    tags: ['Yapay Zeka', 'Dystopia', 'Siber Dedektif'],
    year: 2026,
    rating: 5,
    favorite: true,
    addedAt: new Date().toLocaleDateString('tr-TR'),
    source: 'local',
    fileName: 'tokyo_2099_sample.cbz',
    fileSize: '12.4 MB',
    totalPages: 12,
    status: 'Okunuyor',
    readProgress: 42,
    lastReadPage: 5,
    isCachedOffline: true
  },
  {
    id: 'manga-fantasy',
    title: 'Eski Kıta: Rüzgarın Sesi',
    author: 'Aria Thorne',
    artist: 'Liam Vance',
    synopsis: 'Uçsuz bucaksız gökyüzü adalarında geçen epik bir fantastik macera. Genç rüzgar terbiyecisi, kayıp kadim kristali bulmak ve adaları bir arada tutan rüzgar akıntılarını kurtarmak için tehlikeli bir yolculuğa çıkar.',
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    genres: ['Fantastik', 'Macera', 'Shounen'],
    tags: ['Gökyüzü Adaları', 'Kristal Gücü', 'Rüzgar Büyüsü'],
    year: 2025,
    rating: 4,
    favorite: false,
    addedAt: new Date().toLocaleDateString('tr-TR'),
    source: 'local',
    fileName: 'wind_whisper_volume1.pdf',
    fileSize: '8.7 MB',
    totalPages: 24,
    status: 'Daha Sonra',
    readProgress: 0,
    lastReadPage: 1,
    isCachedOffline: false
  },
  {
    id: 'manga-sliceoflife',
    title: 'Kahve Kokulu Sabahlar',
    author: 'Haru Yoshida',
    artist: 'Haru Yoshida',
    synopsis: 'Tokyo\'nun arka sokaklarındaki küçük bir kafede yolları kesişen beş farklı karakterin sıcak, samimi ve dinlendirici günlük hayat hikayeleri. Her bölüm, hayatın içinden küçük bir mutluluğu anlatıyor.',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    genres: ['Slice of Life', 'Dram', 'Romantik'],
    tags: ['Huzurlu', 'Kafeterya', 'Dostluk'],
    year: 2024,
    rating: 5,
    favorite: true,
    addedAt: new Date().toLocaleDateString('tr-TR'),
    source: 'local',
    fileName: 'coffee_manga.cbz',
    fileSize: '15.1 MB',
    totalPages: 8,
    status: 'Tamamlandı',
    readProgress: 100,
    lastReadPage: 8,
    isCachedOffline: true
  }
];

const INITIAL_COLLECTIONS: MangaCollection[] = [
  { id: 'col-reading', name: 'Okuduklarım', isSystem: true, mangaIds: ['manga-cyberpunk'], icon: '📖', color: 'indigo' },
  { id: 'col-completed', name: 'Tamamlananlar', isSystem: true, mangaIds: ['manga-sliceoflife'], icon: '✅', color: 'emerald' },
  { id: 'col-favorites', name: 'Favorilerim', isSystem: true, mangaIds: ['manga-cyberpunk', 'manga-sliceoflife'], icon: '💖', color: 'rose' },
  { id: 'col-watch', name: 'Daha Sonra', isSystem: true, mangaIds: ['manga-fantasy'], icon: '⏳', color: 'amber' }
];

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  readingMode: 'RTL',
  fitMode: 'CONTAIN',
  filterMode: 'NONE',
  brightness: 1.0,
  contrast: 1.0,
  autoScrollActive: false,
  autoScrollSpeed: 3,
  doublePage: false,
  guidedPanelMode: false,
  pageAnimation: 'CURL'
};

const INITIAL_STATS: MangaReadingStats = {
  weeklyMinutes: { 'Pzt': 25, 'Sal': 40, 'Çar': 15, 'Per': 55, 'Cum': 30, 'Cmt': 90, 'Paz': 65 },
  favoriteGenres: { 'Cyberpunk': 45, 'Slice of Life': 30, 'Aksiyon': 25, 'Gizem': 20, 'Fantastik': 10 },
  totalReadMinutes: 320,
  totalPagesRead: 112
};

export const MangaStorageService = {
  getMangas(): Manga[] {
    try {
      const stored = localStorage.getItem(MANGA_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(MANGA_STORAGE_KEY, JSON.stringify(INITIAL_MANGAS));
      return INITIAL_MANGAS;
    } catch (e) {
      console.error('Failed to get mangas:', e);
      return INITIAL_MANGAS;
    }
  },

  saveMangas(mangas: Manga[]): void {
    try {
      localStorage.setItem(MANGA_STORAGE_KEY, JSON.stringify(mangas));
    } catch (e) {
      console.error('Failed to save mangas:', e);
    }
  },

  getChapters(): MangaChapter[] {
    try {
      const stored = localStorage.getItem(CHAPTER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to get chapters:', e);
      return [];
    }
  },

  saveChapters(chapters: MangaChapter[]): void {
    try {
      localStorage.setItem(CHAPTER_STORAGE_KEY, JSON.stringify(chapters));
    } catch (e) {
      console.error('Failed to save chapters:', e);
    }
  },

  getCollections(): MangaCollection[] {
    try {
      const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(INITIAL_COLLECTIONS));
      return INITIAL_COLLECTIONS;
    } catch (e) {
      console.error('Failed to get collections:', e);
      return INITIAL_COLLECTIONS;
    }
  },

  saveCollections(collections: MangaCollection[]): void {
    try {
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collections));
    } catch (e) {
      console.error('Failed to save collections:', e);
    }
  },

  getReaderSettings(): ReaderSettings {
    try {
      const stored = localStorage.getItem(READER_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(DEFAULT_READER_SETTINGS));
      return DEFAULT_READER_SETTINGS;
    } catch (e) {
      console.error('Failed to get reader settings:', e);
      return DEFAULT_READER_SETTINGS;
    }
  },

  saveReaderSettings(settings: ReaderSettings): void {
    try {
      localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save reader settings:', e);
    }
  },

  getBookmarks(): MangaBookmark[] {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to get bookmarks:', e);
      return [];
    }
  },

  saveBookmarks(bookmarks: MangaBookmark[]): void {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  },

  addBookmark(mangaId: string, pageNumber: number, note?: string): void {
    const bookmarks = this.getBookmarks();
    const newBookmark: MangaBookmark = {
      id: `bookmark-${Date.now()}`,
      mangaId,
      pageNumber,
      chapterNumber: 1,
      note,
      createdAt: new Date().toLocaleDateString('tr-TR')
    };
    this.saveBookmarks([...bookmarks, newBookmark]);
  },

  deleteBookmark(id: string): void {
    const bookmarks = this.getBookmarks();
    this.saveBookmarks(bookmarks.filter(b => b.id !== id));
  },

  getStats(): MangaReadingStats {
    try {
      const stored = localStorage.getItem(STATS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(INITIAL_STATS));
      return INITIAL_STATS;
    } catch (e) {
      console.error('Failed to get stats:', e);
      return INITIAL_STATS;
    }
  },

  saveStats(stats: MangaReadingStats): void {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  },

  incrementPagesRead(count: number = 1): void {
    const stats = this.getStats();
    stats.totalPagesRead += count;

    // Simulate daily stats addition
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const currentDay = days[new Date().getDay()];
    stats.weeklyMinutes[currentDay] = (stats.weeklyMinutes[currentDay] || 0) + 1; // mock minutes
    stats.totalReadMinutes += 1;

    this.saveStats(stats);
  },

  updateMangaProgress(mangaId: string, lastReadPage: number, status?: Manga['status']): void {
    const mangas = this.getMangas();
    const updated = mangas.map(m => {
      if (m.id === mangaId) {
        const nextStatus = status || m.status;
        const total = m.totalPages || 12;
        const progress = Math.min(100, Math.round((lastReadPage / total) * 100));
        return {
          ...m,
          status: progress >= 100 ? 'Tamamlandı' as const : nextStatus,
          lastReadPage,
          readProgress: progress
        };
      }
      return m;
    });
    this.saveMangas(updated);

    // Also update chapter stats if stored
    const chapters = this.getChapters();
    const chapterIndex = chapters.findIndex(c => c.mangaId === mangaId);
    if (chapterIndex > -1) {
      chapters[chapterIndex].lastReadPage = lastReadPage;
      chapters[chapterIndex].lastReadAt = new Date().toLocaleDateString('tr-TR');
      this.saveChapters(chapters);
    } else {
      const newChapter: MangaChapter = {
        id: `chapter-${mangaId}-1`,
        mangaId,
        title: 'Bölüm 1',
        chapterNumber: 1,
        pageUrls: [],
        isRead: false,
        lastReadPage,
        lastReadAt: new Date().toLocaleDateString('tr-TR')
      };
      this.saveChapters([...chapters, newChapter]);
    }
  }
};
