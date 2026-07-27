export interface Manga {
  id: string;
  title: string;
  author: string;
  artist: string;
  synopsis: string;
  coverUrl: string;
  genres: string[];
  tags: string[];
  year: number;
  rating: number;
  favorite: boolean;
  addedAt: string;
  source: 'local' | 'drive';
  driveId?: string;
  fileSize?: string;
  fileName?: string;
  totalPages?: number;
  totalChapters?: number;
  status: 'Okunuyor' | 'Tamamlandı' | 'Yarım Kaldı' | 'Daha Sonra';
}

export interface MangaChapter {
  id: string;
  mangaId: string;
  title: string;
  chapterNumber: number;
  pageUrls: string[]; // local Blob URLs or empty if we unpack ZIP/CBZ on opening
  isRead: boolean;
  lastReadPage: number;
  lastReadAt?: string;
}

export interface MangaCollection {
  id: string;
  name: string;
  isSystem: boolean;
  mangaIds: string[];
  icon?: string;
  color?: string;
}

export interface ReaderSettings {
  readingMode: 'RTL' | 'LTR' | 'WEBTOON'; // Right to Left, Left to Right, Vertical Webtoon scroll
  fitMode: 'WIDTH' | 'HEIGHT' | 'CONTAIN' | 'ORIGINAL';
  filterMode: 'NONE' | 'NIGHT' | 'SEPIA' | 'BLUE_LIGHT';
  brightness: number; // 0.1 to 1.0
  contrast: number; // 0.5 to 1.5
  autoScrollActive: boolean;
  autoScrollSpeed: number; // 1 to 10
  doublePage: boolean;
  pageAnimation: 'CURL' | 'SLIDE' | 'FADE' | 'NONE';
}

export interface MangaReadingHistory {
  mangaId: string;
  lastReadPage: number;
  lastReadChapter: number;
  lastReadAt: string;
}
