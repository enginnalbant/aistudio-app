import { ArticleItem, RSSFeed } from './types';

// Helper to generate dynamic ISO strings for fresh dates
const getPastDate = (hoursAgo: number, minutesAgo: number = 0): string => {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
};

export const DEFAULT_FEEDS: RSSFeed[] = [
  { id: 'trthaber', title: 'TRT Haber Gündem', url: 'https://www.trthaber.com/gundem_articles.rss', category: 'Gündem', isDefault: true, isActive: true },
  { id: 'aa-gundem', title: 'Anadolu Ajansı Gündem', url: 'https://www.aa.com.tr/tr/rss/default?cat=gundem', category: 'Gündem', isDefault: true, isActive: true },
  { id: 'bbc-turkce', title: 'BBC Türkçe', url: 'https://feeds.bbci.co.uk/turkce/rss.xml', category: 'Gündem', isDefault: true, isActive: true },
  { id: 'ntv-gundem', title: 'NTV Gündem', url: 'https://www.ntv.com.tr/gundem.rss', category: 'Gündem', isDefault: true, isActive: true },
  
  { id: 'shiftdelete', title: 'ShiftDelete.Net', url: 'https://shiftdelete.net/feed', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'webrazzi', title: 'Webrazzi', url: 'https://webrazzi.com/feed/', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'donanimhaber', title: 'DonanımHaber', url: 'https://www.donanimhaber.com/rss/tum/', category: 'Teknoloji', isDefault: true, isActive: true },
  { id: 'webtekno', title: 'Webtekno', url: 'https://www.webtekno.com/rss.xml', category: 'Teknoloji', isDefault: true, isActive: true },

  { id: 'reddit-turkey', title: 'Reddit - r/turkey', url: 'https://www.reddit.com/r/turkey/hot.rss', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },
  { id: 'reddit-tech', title: 'Reddit - r/technology', url: 'https://www.reddit.com/r/technology/hot.rss', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },
  { id: 'reddit-programming', title: 'Reddit - r/programming', url: 'https://www.reddit.com/r/programming/hot.rss', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },
  { id: 'hackernews', title: 'Hacker News (Global)', url: 'https://news.ycombinator.com/rss', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },
  { id: 'devto', title: 'Dev.to (Yazılım)', url: 'https://dev.to/feed', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },
  { id: 'producthunt', title: 'Product Hunt', url: 'https://www.producthunt.com/feed', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },
  { id: 'github-trending', title: 'GitHub Trending', url: 'https://github.com/trending', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },
  { id: 'yt-siyahzetsu', title: 'YouTube - @siyahzetsu', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCxHlq3cewhURy3V05cjBvTQ', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },
  { id: 'yt-pintipanda', title: 'YouTube - @pintipandaYT', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCuU0qYesQjAT_qXcQJqgV3w', category: 'Sosyal Medya & Forumlar', isDefault: true, isActive: true },

  { id: 'bloomberght', title: 'Bloomberg HT', url: 'https://www.bloomberght.com/rss', category: 'Ekonomi', isDefault: true, isActive: true },
  { id: 'ntv-ekonomi', title: 'NTV Ekonomi', url: 'https://www.ntv.com.tr/ekonomi.rss', category: 'Ekonomi', isDefault: true, isActive: true },

  { id: 'evrimagaci', title: 'Evrim Ağacı', url: 'https://evrimagaci.org/rss.xml', category: 'Bilim', isDefault: true, isActive: true },
  { id: 'sarkac', title: 'Sarkaç Bilim', url: 'https://sarkac.org/feed/', category: 'Bilim', isDefault: true, isActive: true },

  { id: 'ntvspor', title: 'NTV Spor', url: 'https://www.ntv.com.tr/spor.rss', category: 'Spor', isDefault: true, isActive: true },

  { id: 'kayiprihtim', title: 'Kayıp Rıhtım', url: 'https://kayiprihtim.com/feed/', category: 'Kültür & Sanat', isDefault: true, isActive: true },
];

export const CURATED_CATEGORIES = ['Gündem', 'Teknoloji', 'Sosyal Medya & Forumlar', 'Ekonomi', 'Bilim', 'Spor', 'Kültür & Sanat'];

export const CURATED_ARTICLES: ArticleItem[] = [];
