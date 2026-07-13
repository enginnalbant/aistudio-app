import { RSSFeed } from './types';

export const DEFAULT_FEEDS: RSSFeed[] = [
  {
    id: 'trthaber',
    title: 'TRT Haber Gündem',
    url: 'https://www.trthaber.com/gundem_articles.rss',
    category: 'Haber',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'webtekno',
    title: 'Webtekno',
    url: 'https://www.webtekno.com/rss.xml',
    category: 'Teknoloji',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'ntv',
    title: 'NTV Gündem',
    url: 'https://www.ntv.com.tr/gundem.rss',
    category: 'Haber',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'donanimhaber',
    title: 'DonanımHaber',
    url: 'https://www.donanimhaber.com/rss/tum/',
    category: 'Teknoloji',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'sabah',
    title: 'Sabah Gündem',
    url: 'https://www.sabah.com.tr/rss/anasayfa.xml',
    category: 'Haber',
    isDefault: true,
    isActive: true,
  }
];
