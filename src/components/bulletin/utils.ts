import { ArticleItem, OPMLImportItem, RSSFeed } from './types';

export const formatTimeAgo = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMins < 1) return 'Henüz';
    if (diffMins < 60) return `${diffMins} dk önce`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} saat önce`;
    return `${Math.floor(diffHrs / 24)} gün önce`;
  } catch {
    return dateStr;
  }
};

export const ensureString = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (typeof val._ === 'string') return val._;
    if (val._ !== undefined) return String(val._);
    if (Array.isArray(val)) {
      return val.map(ensureString).filter(Boolean).join(' ');
    }
    const keys = Object.keys(val);
    if (keys.length > 0) {
      const nonAttrKeys = keys.filter(k => k !== '$');
      if (nonAttrKeys.length > 0) {
        const firstVal = val[nonAttrKeys[0]];
        return ensureString(firstVal);
      }
    }
    return '';
  }
  return String(val);
};

export const ensureLink = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (val.$ && typeof val.$.href === 'string') return val.$.href;
    if (typeof val._ === 'string') return val._;
    if (val.href && typeof val.href === 'string') return val.href;
  }
  return ensureString(val);
};

export const stripHtml = (html: string): string => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const extractImageFromXmlNode = (node: Element): string | undefined => {
  // 1. Check enclosure tag
  const enclosure = node.querySelector('enclosure');
  if (enclosure) {
    const url = enclosure.getAttribute('url');
    const type = enclosure.getAttribute('type');
    if (url && (!type || type.startsWith('image/'))) {
      return url;
    }
  }

  // 2. Check media:content or media:thumbnail
  const mediaContent = node.querySelector('media\\:content, content') || node.getElementsByTagName('media:content')[0];
  if (mediaContent && mediaContent.getAttribute('url')) {
    return mediaContent.getAttribute('url')!;
  }
  const mediaThumbnail = node.querySelector('media\\:thumbnail, thumbnail') || node.getElementsByTagName('media:thumbnail')[0] || node.getElementsByTagName('thumbnail')[0];
  if (mediaThumbnail && mediaThumbnail.getAttribute('url')) {
    return mediaThumbnail.getAttribute('url')!;
  }

  // 3. Search YouTube video ID or link
  const ytVideoIdNode = node.querySelector('yt\\:videoId, videoId') || node.getElementsByTagName('yt:videoId')[0];
  if (ytVideoIdNode && ytVideoIdNode.textContent) {
    return `https://i.ytimg.com/vi/${ytVideoIdNode.textContent.trim()}/hqdefault.jpg`;
  }

  let link = '';
  const linkNode = node.querySelector('link');
  if (linkNode) {
    link = linkNode.getAttribute('href') || linkNode.textContent || '';
  }
  if (link) {
    const ytMatch = link.match(/(?:watch\?v=|shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
  }

  // 4. Search img src in description or content
  const desc = node.querySelector('description, content\\:encoded, content')?.textContent || '';
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return undefined;
};

export interface FeedPlatformInfo {
  platform: string;
  subCategory: string;
}

export const detectFeedPlatformInfo = (feed: { title: string; url: string; category: string }): FeedPlatformInfo => {
  const url = (feed.url || '').toLowerCase();
  const title = (feed.title || '').toLowerCase();

  // 1. Reddit
  if (url.includes('reddit.com') || title.includes('reddit') || title.includes('r/')) {
    let sub = 'Genel Subreddit';
    const match = url.match(/\/r\/([a-zA-Z0-9_]+)/i);
    if (match && match[1]) {
      sub = `r/${match[1]}`;
    } else if (feed.title.includes('r/')) {
      const titleMatch = feed.title.match(/r\/([a-zA-Z0-9_]+)/i);
      if (titleMatch && titleMatch[1]) sub = `r/${titleMatch[1]}`;
    }
    return { platform: 'Reddit', subCategory: sub };
  }

  // 2. YouTube
  if (url.includes('youtube.com') || title.includes('youtube')) {
    let sub = feed.title.replace(/^youtube\s*-\s*/i, '').replace(/^youtube\s*/i, '').trim() || 'Video Kanalı';
    return { platform: 'YouTube', subCategory: sub };
  }

  // 3. Hacker News
  if (url.includes('ycombinator.com') || title.includes('hacker news')) {
    return { platform: 'Hacker News', subCategory: 'Girişim & Teknoloji' };
  }

  // 4. Dev.to
  if (url.includes('dev.to') || title.includes('dev.to')) {
    return { platform: 'Dev.to', subCategory: 'Yazılım Topluluğu' };
  }

  // 5. Product Hunt
  if (url.includes('producthunt.com') || title.includes('product hunt')) {
    return { platform: 'Product Hunt', subCategory: 'Girişim & Ürünler' };
  }

  // 6. X / Twitter
  if (url.includes('twitter.com') || url.includes('x.com') || url.includes('nitter') || title.includes('twitter')) {
    return { platform: 'X (Twitter)', subCategory: feed.title || 'Hesap Akışı' };
  }

  // Categories
  if (feed.category === 'Gündem') return { platform: 'Gündem Basını', subCategory: feed.title };
  if (feed.category === 'Teknoloji') return { platform: 'Teknoloji Basını', subCategory: feed.title };
  if (feed.category === 'Ekonomi') return { platform: 'Ekonomi Basını', subCategory: feed.title };
  if (feed.category === 'Bilim') return { platform: 'Bilim & Akademi', subCategory: feed.title };
  if (feed.category === 'Spor') return { platform: 'Spor Basını', subCategory: feed.title };
  if (feed.category === 'Kültür & Sanat') return { platform: 'Kültür & Sanat', subCategory: feed.title };

  return { platform: feed.category || 'Diğer Kaynaklar', subCategory: feed.title };
};

export const parseRSSXml = (xmlText: string, feed: RSSFeed): ArticleItem[] => {
  const articles: ArticleItem[] = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Try RSS2 <item> tags first
    let items = Array.from(xmlDoc.querySelectorAll('item'));
    
    // If no <item>, try Atom <entry> tags
    if (items.length === 0) {
      items = Array.from(xmlDoc.querySelectorAll('entry'));
    }

    const platformInfo = detectFeedPlatformInfo(feed);

    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent || 'Başlıksız Haber';
      
      let link = '';
      const linkNode = item.querySelector('link');
      if (linkNode) {
        link = linkNode.getAttribute('href') || linkNode.textContent || '';
      }

      const pubDate = item.querySelector('pubDate, published, updated, dc\\:date')?.textContent || new Date().toISOString();
      let creator = item.querySelector('dc\\:creator, author, name')?.textContent || feed.title;
      
      let cleanFeedTitle = feed.title;
      if (feed.url.includes('UCxHlq3cewhURy3V05cjBvTQ') || feed.url.toLowerCase().includes('siyahzetsu') || feed.title.toLowerCase().includes('siyahzetsu') || creator.includes('Beyaz Zetsu')) {
        creator = creator.replace(/Beyaz Zetsu/gi, 'Siyah Zetsu');
        cleanFeedTitle = cleanFeedTitle.replace(/Beyaz Zetsu/gi, 'Siyah Zetsu');
      }
      
      const rawDesc = item.querySelector('description, summary, content\\:encoded, content')?.textContent || '';
      const contentSnippet = stripHtml(rawDesc).trim().substring(0, 240);
      const content = rawDesc || contentSnippet;
      const image = extractImageFromXmlNode(item);

      let itemSubCategory = platformInfo.subCategory;
      if (platformInfo.platform === 'YouTube' || feed.url.includes('youtube.com')) {
        itemSubCategory = 'YouTube Videosu';
      }

      const cleanKey = (link || title || `idx-${index}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 60);
      const articleId = `${feed.id}-${cleanKey}`;

      articles.push({
        id: articleId,
        feedId: feed.id,
        feedTitle: cleanFeedTitle,
        category: feed.category,
        platform: platformInfo.platform,
        subCategory: itemSubCategory,
        title: title.trim(),
        link: link.trim(),
        pubDate: pubDate.trim(),
        creator: creator.trim(),
        contentSnippet: contentSnippet ? `${contentSnippet}...` : title,
        content: content,
        image: image
      });
    });
  } catch (err) {
    console.error(`[parseRSSXml] Failed to parse XML for feed ${feed.title}:`, err);
  }
  return articles;
};

export const exportToOPML = (feeds: RSSFeed[]): string => {
  const categories = Array.from(new Set(feeds.map(f => f.category)));
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n    <title>APEXOS RSS Feeds Export</title>\n    <dateCreated>${new Date().toUTCString()}</dateCreated>\n  </head>\n  <body>\n`;
  
  categories.forEach(cat => {
    xml += `    <outline text="${cat}" title="${cat}">\n`;
    feeds.filter(f => f.category === cat).forEach(f => {
      xml += `      <outline type="rss" text="${f.title}" title="${f.title}" xmlUrl="${f.url}" category="${cat}"/>\n`;
    });
    xml += `    </outline>\n`;
  });

  xml += `  </body>\n</opml>`;
  return xml;
};

export const parseOPML = (opmlText: string): OPMLImportItem[] => {
  const importedItems: OPMLImportItem[] = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(opmlText, 'text/xml');
    const outlines = Array.from(xmlDoc.querySelectorAll('outline[xmlUrl]'));

    outlines.forEach(node => {
      const url = node.getAttribute('xmlUrl');
      const title = node.getAttribute('title') || node.getAttribute('text') || 'Yeni RSS Kaynağı';
      
      let category = node.getAttribute('category') || 'Genel';
      const parentOutline = node.parentElement;
      if (parentOutline && parentOutline.tagName.toLowerCase() === 'outline' && parentOutline.getAttribute('title')) {
        category = parentOutline.getAttribute('title')!;
      }

      if (url) {
        importedItems.push({
          title,
          url,
          category
        });
      }
    });
  } catch (err) {
    console.error('[parseOPML] Failed to parse OPML string:', err);
  }
  return importedItems;
};

export const getFeedHomepageUrl = (feedUrl: string, feedTitle?: string): { homepageUrl: string; label: string; hostName: string } => {
  if (!feedUrl) {
    return { homepageUrl: '#', label: 'Ana Sayfa', hostName: '' };
  }

  const rawUrl = feedUrl.trim();
  const lower = rawUrl.toLowerCase();

  try {
    // 1. YouTube feeds
    if (lower.includes('youtube.com')) {
      const channelMatch = rawUrl.match(/channel_id=(UC[a-zA-Z0-9_-]{22})/i);
      if (channelMatch && channelMatch[1]) {
        return {
          homepageUrl: `https://www.youtube.com/channel/${channelMatch[1]}`,
          label: feedTitle && feedTitle.includes('@') ? feedTitle.replace(/^YouTube\s*-\s*/i, '') : 'YouTube Kanalı',
          hostName: 'youtube.com'
        };
      }
      const userMatch = rawUrl.match(/[?&]user=([^&]+)/i);
      if (userMatch && userMatch[1]) {
        return {
          homepageUrl: `https://www.youtube.com/@${userMatch[1]}`,
          label: `@${userMatch[1]}`,
          hostName: 'youtube.com'
        };
      }
      return {
        homepageUrl: 'https://www.youtube.com',
        label: 'YouTube',
        hostName: 'youtube.com'
      };
    }

    // 2. Reddit feeds
    if (lower.includes('reddit.com')) {
      const subMatch = rawUrl.match(/reddit\.com\/r\/([^/?&]+)/i);
      if (subMatch && subMatch[1]) {
        return {
          homepageUrl: `https://www.reddit.com/r/${subMatch[1]}`,
          label: `r/${subMatch[1]}`,
          hostName: 'reddit.com'
        };
      }
      return {
        homepageUrl: 'https://www.reddit.com',
        label: 'Reddit',
        hostName: 'reddit.com'
      };
    }

    // 3. GitHub Trending
    if (lower.includes('github.com')) {
      if (lower.includes('trending')) {
        return {
          homepageUrl: 'https://github.com/trending',
          label: 'GitHub Trending',
          hostName: 'github.com'
        };
      }
      return {
        homepageUrl: 'https://github.com',
        label: 'GitHub',
        hostName: 'github.com'
      };
    }

    // 4. Hacker News
    if (lower.includes('ycombinator.com')) {
      return {
        homepageUrl: 'https://news.ycombinator.com',
        label: 'Hacker News',
        hostName: 'ycombinator.com'
      };
    }

    // 5. Dev.to
    if (lower.includes('dev.to')) {
      return {
        homepageUrl: 'https://dev.to',
        label: 'Dev.to',
        hostName: 'dev.to'
      };
    }

    // 6. Product Hunt
    if (lower.includes('producthunt.com')) {
      return {
        homepageUrl: 'https://www.producthunt.com',
        label: 'Product Hunt',
        hostName: 'producthunt.com'
      };
    }

    // 7. General Website URL
    const formatted = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const parsed = new URL(formatted);
    const host = parsed.hostname.replace(/^www\./i, '');
    const homepageUrl = `${parsed.protocol}//${parsed.hostname}`;

    return {
      homepageUrl,
      label: host || 'Ana Sayfa',
      hostName: host
    };
  } catch {
    return {
      homepageUrl: feedUrl,
      label: 'Ana Sayfa',
      hostName: ''
    };
  }
};


