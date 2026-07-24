import express from "express";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import Parser from "rss-parser";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from "googleapis";

// Allow connections to servers with expired or custom SSL/TLS certificates for RSS feeds
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

process.on('unhandledRejection', (reason) => {
  console.warn('[Server] Caught Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Caught Uncaught Exception:', err);
});

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure'],
      ['image', 'image']
    ]
  }
});

// Lazy initialization of Gemini SDK
let aiInstance: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "dummy_key_to_prevent_startup_crash",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Helper to extract HTML tag contents (like <title>)
function extractTagContent(html: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

// Helper to extract meta tag attributes (like description or keywords)
function extractMetaAttribute(html: string, attrName: string, attrValue: string): string {
  const regex1 = new RegExp(`<meta[^>]*(?:${attrName})\\s*=\\s*["']${attrValue}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, 'i');
  const regex2 = new RegExp(`<meta[^>]*content\\s*=\\s*["']([^"']*)["'][^>]*(?:${attrName})\\s*=\\s*["']${attrValue}["']`, 'i');
  
  const match1 = html.match(regex1);
  if (match1) return match1[1].trim();
  
  const match2 = html.match(regex2);
  if (match2) return match2[1].trim();
  
  return '';
}

// Robust Dynamic Heuristics Local Bookmark Analyzer
function localAnalyze(url: string, title: string, htmlContent: string = ""): { title: string, description: string, category: string, tags: string[], aiSummary: string } {
  let finalTitle = title || "";
  let description = "";
  let category = "Kişisel";
  let tags: string[] = [];
  
  // Try to parse HTML if available
  if (htmlContent) {
    const htmlTitle = extractTagContent(htmlContent, 'title');
    if (htmlTitle && (!finalTitle || finalTitle.toLowerCase() === "yer imi" || finalTitle.toLowerCase() === "yeni yer imi" || finalTitle.toLowerCase().includes('http'))) {
      finalTitle = htmlTitle;
    }
    
    description = extractMetaAttribute(htmlContent, 'name', 'description') || 
                  extractMetaAttribute(htmlContent, 'property', 'og:description') ||
                  extractMetaAttribute(htmlContent, 'name', 'twitter:description') || "";
                  
    const keywordsStr = extractMetaAttribute(htmlContent, 'name', 'keywords');
    if (keywordsStr) {
      tags = keywordsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    }
  }
  
  // Clean title/description from any stray HTML tags or encoding issues
  finalTitle = finalTitle.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
  description = description.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
  
  let domain = "";
  try {
    const parsed = new URL(url);
    domain = parsed.hostname.toLowerCase();
  } catch (e) {
    domain = url.toLowerCase();
  }
  
  if (!finalTitle) {
    finalTitle = domain || "Web Sayfası";
  }
  
  const cleanDomain = domain.replace('www.', '').split('.')[0];
  const textToAnalyze = `${finalTitle} ${description} ${domain} ${tags.join(' ')}`.toLowerCase();
  
  // Custom Dynamic Categorization Rules
  if (textToAnalyze.includes('github') || textToAnalyze.includes('gitlab') || textToAnalyze.includes('bitbucket') || textToAnalyze.includes('open source') || textToAnalyze.includes('kodum')) {
    category = "Yazılım & Geliştirme";
    if (tags.length === 0) tags = ["github", "kod", "yazilim"];
  } else if (textToAnalyze.includes('react') || textToAnalyze.includes('vue') || textToAnalyze.includes('angular') || textToAnalyze.includes('svelte') || textToAnalyze.includes('next.js') || textToAnalyze.includes('node') || textToAnalyze.includes('typescript') || textToAnalyze.includes('javascript') || textToAnalyze.includes('css') || textToAnalyze.includes('html') || textToAnalyze.includes('api') || textToAnalyze.includes('developer') || textToAnalyze.includes('programming') || textToAnalyze.includes('yazılım') || textToAnalyze.includes('npm') || textToAnalyze.includes('pnpm') || textToAnalyze.includes('vite') || textToAnalyze.includes('build')) {
    category = "Yazılım & Geliştirme";
    if (tags.length === 0) tags = ["yazilim", "kodlama", "kutuphane"];
  } else if (textToAnalyze.includes('figma') || textToAnalyze.includes('canva') || textToAnalyze.includes('dribbble') || textToAnalyze.includes('behance') || textToAnalyze.includes('design') || textToAnalyze.includes('tasarım') || textToAnalyze.includes('logo') || textToAnalyze.includes('font') || textToAnalyze.includes('icon') || textToAnalyze.includes('uiverse') || textToAnalyze.includes('ui') || textToAnalyze.includes('ux') || textToAnalyze.includes('kreatif')) {
    category = "Tasarım & Kreatif";
    if (tags.length === 0) tags = ["tasarim", "arayuz", "kreatif"];
  } else if (textToAnalyze.includes('ai') || textToAnalyze.includes('chatgpt') || textToAnalyze.includes('claude') || textToAnalyze.includes('gemini') || textToAnalyze.includes('llm') || textToAnalyze.includes('intelligence') || textToAnalyze.includes('yapay zeka') || textToAnalyze.includes('deepseek') || textToAnalyze.includes('grok') || textToAnalyze.includes('openai') || textToAnalyze.includes('copilot') || textToAnalyze.includes('notebooklm') || textToAnalyze.includes('agents')) {
    category = "Yapay Zeka & Araçlar";
    if (tags.length === 0) tags = ["yapay-zeka", "ai", "teknoloji"];
  } else if (textToAnalyze.includes('twitter') || textToAnalyze.includes('facebook') || textToAnalyze.includes('instagram') || textToAnalyze.includes('linkedin') || textToAnalyze.includes('tiktok') || textToAnalyze.includes('reddit') || textToAnalyze.includes('sosyal') || textToAnalyze.includes('social') || textToAnalyze.includes('whatsapp') || textToAnalyze.includes('discord')) {
    category = "Sosyal Medya";
    if (tags.length === 0) tags = ["sosyal-medya", "topluluk", "iletisim"];
  } else if (textToAnalyze.includes('education') || textToAnalyze.includes('learning') || textToAnalyze.includes('udemy') || textToAnalyze.includes('coursera') || textToAnalyze.includes('akademi') || textToAnalyze.includes('eğitim') || textToAnalyze.includes('okul') || textToAnalyze.includes('ders') || textToAnalyze.includes('kurs') || textToAnalyze.includes('öğrenim') || textToAnalyze.includes('tutorial') || textToAnalyze.includes('learn') || textToAnalyze.includes('belge') || textToAnalyze.includes('doc')) {
    category = "Eğitim & Öğrenim";
    if (tags.length === 0) tags = ["egitim", "ogrenim", "ders"];
  } else if (textToAnalyze.includes('news') || textToAnalyze.includes('haber') || textToAnalyze.includes('blog') || textToAnalyze.includes('gazete') || textToAnalyze.includes('yazı') || textToAnalyze.includes('makale') || textToAnalyze.includes('medium') || textToAnalyze.includes('ekşi') || textToAnalyze.includes('bülten')) {
    category = "Haber & Blog";
    if (tags.length === 0) tags = ["haber", "guncel", "blog"];
  } else if (textToAnalyze.includes('amazon') || textToAnalyze.includes('trendyol') || textToAnalyze.includes('hepsiburada') || textToAnalyze.includes('aliexpress') || textToAnalyze.includes('shopping') || textToAnalyze.includes('alisveris') || textToAnalyze.includes('satın al') || textToAnalyze.includes('ürün') || textToAnalyze.includes('fiyat') || textToAnalyze.includes('store') || textToAnalyze.includes('sepet')) {
    category = "Alışveriş & Ürünler";
    if (tags.length === 0) tags = ["alisveris", "urunler", "e-ticaret"];
  } else if (textToAnalyze.includes('finance') || textToAnalyze.includes('borsa') || textToAnalyze.includes('yatırım') || textToAnalyze.includes('kripto') || textToAnalyze.includes('crypto') || textToAnalyze.includes('para') || textToAnalyze.includes('finans') || textToAnalyze.includes('banka') || textToAnalyze.includes('iş') || textToAnalyze.includes('business') || textToAnalyze.includes('muhasebe') || textToAnalyze.includes('fatura')) {
    category = "Finans & İş";
    if (tags.length === 0) tags = ["finans", "is-dunyasi", "yatirim"];
  } else if (textToAnalyze.includes('manga') || textToAnalyze.includes('anime') || textToAnalyze.includes('film') || textToAnalyze.includes('sinema') || textToAnalyze.includes('netflix') || textToAnalyze.includes('dizi') || textToAnalyze.includes('game') || textToAnalyze.includes('oyun') || textToAnalyze.includes('eğlence') || textToAnalyze.includes('radyo') || textToAnalyze.includes('spotify') || textToAnalyze.includes('müzik') || textToAnalyze.includes('music') || textToAnalyze.includes('tv') || textToAnalyze.includes('youtube') || textToAnalyze.includes('izle')) {
    category = "Eğlence & Kültür";
    if (tags.length === 0) tags = ["eglence", "kultur", "medya"];
  } else {
    category = "Kişisel";
    if (tags.length === 0) {
      if (cleanDomain.length > 2) {
        tags = [cleanDomain, "web", "yer-imi"];
      } else {
        tags = ["web", "yer-imi", "kaynak"];
      }
    }
  }

  // Ensure small case tag strings and max 3 tags
  const cleanTags = tags.map(t => t.toLowerCase().replace(/[^a-z0-9ğüşıöç-]/g, '').trim()).filter(Boolean).slice(0, 3);
  if (cleanTags.length === 0) {
    cleanTags.push("web", "bookmark");
  }

  if (!description) {
    description = `Yer imlerine eklenen ${finalTitle} web sitesi. Detaylı bilgi almak için siteyi ziyaret edebilir veya kendiniz notlar ekleyebilirsiniz.`;
  } else if (description.length > 150) {
    description = description.substring(0, 147) + "...";
  }

  const aiSummary = `Sitenin adı "${finalTitle}". Bu web platformu, ${category.toLowerCase()} kategorisine uygun olup ${cleanTags.join(', ')} etiketleri ile eşleşmektedir. Hızlı erişim ve kürasyon amacıyla başarıyla yer imlerine kaydedilmiştir.`;

  return {
    title: finalTitle.substring(0, 80),
    description,
    category,
    tags: cleanTags,
    aiSummary
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper function to sanitize and correct common XML errors in RSS feeds
  const sanitizeXml = (xml: string): string => {
    if (!xml) return "";

    // 1. Unquoted attribute values inside XML tags (e.g., width=100% or src=http://...)
    let cleaned = xml.replace(/<([^>]+)>/g, (match, tagContent) => {
      let updatedContent = tagContent;
      const unquotedAttrRegex = /\s+([a-zA-Z0-9_:-]+)\s*=\s*([^"'\s>]+)/g;
      updatedContent = updatedContent.replace(unquotedAttrRegex, (attrMatch, name, value) => {
        return ` ${name}="${value}"`;
      });
      return `<${updatedContent}>`;
    });

    // 2. Unescaped ampersands that are not valid XML entities (e.g., & inside query params)
    cleaned = cleaned.replace(/&(?![a-zA-Z0-9#]+;)/g, "&amp;");

    return cleaned;
  };

  // In-Memory RSS Proxy Cache (5-minute TTL)
  const rssProxyCache = new Map<string, { xmlText: string; timestamp: number }>();
  const RSS_PROXY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  // In-Memory YouTube Channel ID Resolution Cache
  const youtubeChannelCache = new Map<string, string>([
    ['siyahzetsu', 'UCxHlq3cewhURy3V05cjBvTQ'],
    ['beyazzetsu', 'UCxHlq3cewhURy3V05cjBvTQ'],
    ['pintipandayt', 'UCuU0qYesQjAT_qXcQJqgV3w'],
    ['pintipanda', 'UCuU0qYesQjAT_qXcQJqgV3w']
  ]);

  async function resolveYouTubeChannelId(handleOrUser: string): Promise<string | null> {
    const cleanHandle = handleOrUser.replace(/^@/, '').trim();
    if (!cleanHandle) return null;
    const lowerKey = cleanHandle.toLowerCase();
    if (youtubeChannelCache.has(lowerKey)) {
      return youtubeChannelCache.get(lowerKey)!;
    }

    const urlsToTry = [
      `https://www.youtube.com/@${cleanHandle}`,
      `https://www.youtube.com/user/${cleanHandle}`,
      `https://www.youtube.com/c/${cleanHandle}`
    ];

    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    for (const tryUrl of urlsToTry) {
      try {
        const res = await fetch(tryUrl, {
          headers: {
            'User-Agent': ua,
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) continue;
        const html = await res.text();

        const matches = [
          html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/),
          html.match(/itemprop="identifier" content="(UC[a-zA-Z0-9_-]{22})"/),
          html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/),
          html.match(/"browseId":"(UC[a-zA-Z0-9_-]{22})"/),
          html.match(/channel_id=(UC[a-zA-Z0-9_-]{22})/)
        ];

        for (const m of matches) {
          if (m && m[1]) {
            const channelId = m[1];
            youtubeChannelCache.set(lowerKey, channelId);
            return channelId;
          }
        }
      } catch (e) {
        console.warn(`[resolveYouTubeChannelId] Error fetching ${tryUrl}:`, e);
      }
    }

    return null;
  }

  async function fetchGitHubTrendingRSS(): Promise<string> {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const res = await fetch('https://github.com/trending', {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      throw new Error(`GitHub Trending status: ${res.status}`);
    }

    const html = await res.text();
    const repoBlocks = html.split('<article class="Box-row');
    const items: string[] = [];

    for (let i = 1; i < repoBlocks.length && i <= 25; i++) {
      const block = repoBlocks[i];
      const titleMatch = block.match(/href="\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)"/);
      if (!titleMatch || !titleMatch[1]) continue;
      const repoPath = titleMatch[1];
      const repoUrl = `https://github.com/${repoPath}`;

      const descMatch = block.match(/<p class="col-9[^">]*">([\s\S]*?)<\/p>/);
      let description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : 'GitHub Trending Repository';

      const langMatch = block.match(/itemprop="programmingLanguage">([^<]+)</);
      const language = langMatch ? langMatch[1].trim() : '';

      const starsMatch = block.match(/([0-9,]+)\s+stars\s+today/i);
      const starsToday = starsMatch ? starsMatch[1].trim() : '';

      const fullTitle = `${repoPath}${language ? ` [${language}]` : ''}${starsToday ? ` (+${starsToday} stars today)` : ''}`;

      items.push(`
        <item>
          <title><![CDATA[${fullTitle}]]></title>
          <link>${repoUrl}</link>
          <guid isPermaLink="true">${repoUrl}</guid>
          <description><![CDATA[${description}]]></description>
          <pubDate>${new Date().toUTCString()}</pubDate>
        </item>
      `);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>GitHub Trending Repositories</title>
    <link>https://github.com/trending</link>
    <description>Daily trending repositories on GitHub</description>
    <pubDate>${new Date().toUTCString()}</pubDate>
    ${items.join('\n')}
  </channel>
</rss>`;
  }

  function escapeXml(str: string): string {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // API Route: RSS Proxy Fetcher
  app.get("/api/rss-proxy", async (req, res) => {
    const { url: rawUrl, force } = req.query;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ error: "URL query parameter is required" });
    }

    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Special Handler: GitHub Trending Feed
    if (url.includes('github-trending') || url.includes('github.com/trending')) {
      try {
        const xml = await fetchGitHubTrendingRSS();
        rssProxyCache.set(url, { xmlText: xml, timestamp: Date.now() });
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        return res.send(xml);
      } catch (err: any) {
        console.warn('[GitHub Trending Proxy Error]:', err);
      }
    }

    // Special Handler: YouTube Feed (Videos Only)
    if (url.includes('youtube.com')) {
      let channelId: string | null = null;
      const chMatch = url.match(/channel_id=(UC[a-zA-Z0-9_-]{22})/i);
      if (chMatch && chMatch[1]) {
        channelId = chMatch[1];
      } else {
        const userMatch = url.match(/[?&]user=([^&]+)/i) || url.match(/youtube\.com\/@([^/?&]+)/i);
        if (userMatch && userMatch[1]) {
          channelId = await resolveYouTubeChannelId(userMatch[1]);
        }
      }

      if (channelId) {
        url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      }
    }

    // Check in-memory cache unless force reload is requested
    const isForce = force === 'true' || force === '1';
    const cached = rssProxyCache.get(url);
    if (!isForce && cached && (Date.now() - cached.timestamp < RSS_PROXY_CACHE_TTL_MS)) {
      let cachedXml = cached.xmlText;
      if (url.includes('UCxHlq3cewhURy3V05cjBvTQ') || url.includes('siyahzetsu')) {
        cachedXml = cachedXml.replace(/Beyaz Zetsu/g, 'Siyah Zetsu');
      }
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      res.setHeader('X-Cache', 'HIT');
      return res.send(cachedXml);
    }

    // Extract origin to mimic referrer headers correctly
    let origin = '';
    try {
      const parsedUrl = new URL(url);
      origin = parsedUrl.origin;
    } catch (e) {}

    // List of rotating, authentic browser User-Agents.
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ];

    let lastError: any = null;
    let xmlText = '';
    let success = false;

    // Direct fetch strategies
    const fetchStrategies = [
      // Strategy A: Clean RSS and XML headers
      async (targetUrl: string, ua: string) => {
        return await fetch(targetUrl, {
          headers: {
            'User-Agent': ua,
            'Accept': 'application/rss+xml, application/rdf+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': origin || targetUrl,
            'Connection': 'keep-alive'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(4000)
        });
      },
      // Strategy B: Bare minimum headers
      async (targetUrl: string, ua: string) => {
        return await fetch(targetUrl, {
          headers: {
            'User-Agent': ua,
            'Accept': '*/*'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(4000)
        });
      }
    ];

    // Try rotating strategies and user agents
    direct_fetch_loop:
    for (const strategy of fetchStrategies) {
      for (const ua of userAgents.slice(0, 2)) {
        try {
          const response = await strategy(url, ua);

          if (response.status === 403 || response.status === 404 || response.status === 401) {
            lastError = new Error(`HTTP ${response.status}`);
            // If WAF/Cloudflare blocks IP with 403, don't waste time repeating direct requests
            break direct_fetch_loop;
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
          }

          const text = await response.text();
          const trimmed = text.trim();
          
          if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html') || trimmed.startsWith('<!doctype html')) {
            throw new Error("Received HTML content instead of XML feed.");
          }

          xmlText = text;
          success = true;
          break direct_fetch_loop;
        } catch (err: any) {
          lastError = err;
          if (err.message && (err.message.includes('403') || err.message.includes('404'))) {
            break direct_fetch_loop;
          }
        }
      }
    }

    // Fallback: try public distributed raw proxies if direct fetches failed
    if (!success) {
      const publicProxies = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      ];

      for (const proxyUrl of publicProxies) {
        try {
          const response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': userAgents[0]
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(4000)
          });

          if (!response.ok) {
            throw new Error(`Proxy status: ${response.status}`);
          }

          const text = await response.text();
          const trimmed = text.trim();

          if (trimmed.length > 100 && !trimmed.startsWith('<!DOCTYPE html') && !trimmed.startsWith('<html')) {
            xmlText = text;
            success = true;
            break;
          } else {
            throw new Error("Proxy response is empty or HTML.");
          }
        } catch (proxyErr: any) {
          // Silent catch for proxy fallback
        }
      }
    }

    if (success && xmlText) {
      if (url.includes('UCxHlq3cewhURy3V05cjBvTQ') || url.includes('siyahzetsu')) {
        xmlText = xmlText.replace(/Beyaz Zetsu/g, 'Siyah Zetsu');
      }
      rssProxyCache.set(url, { xmlText, timestamp: Date.now() });
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      res.setHeader('X-Cache', 'MISS');
      return res.send(xmlText);
    } else {
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Unavailable</title><description>Feed could not be retrieved (${lastError?.message || 'Access Restricted'})</description></channel></rss>`);
    }
  });

  // Helper: Fetch and verify if an RSS feed URL returns valid XML
  async function fetchAndVerifyRSS(targetUrl: string): Promise<{ ok: boolean; xml?: string; error?: string }> {
    let url = targetUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (url.includes('github-trending') || url.includes('github.com/trending')) {
      try {
        const xml = await fetchGitHubTrendingRSS();
        return { ok: true, xml };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    }

    if (url.includes('youtube.com')) {
      let channelId: string | null = null;
      const chMatch = url.match(/channel_id=(UC[a-zA-Z0-9_-]{22})/i);
      if (chMatch && chMatch[1]) {
        channelId = chMatch[1];
      } else {
        const userMatch = url.match(/[?&]user=([^&]+)/i) || url.match(/youtube\.com\/@([^/?&]+)/i);
        if (userMatch && userMatch[1]) {
          channelId = await resolveYouTubeChannelId(userMatch[1]);
        }
      }

      if (channelId) {
        url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      }
    }

    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
    ];

    for (const ua of userAgents) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': ua,
            'Accept': 'application/rss+xml, application/rdf+xml, application/xml, text/xml, */*'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(6000)
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const text = await res.text();
        const trimmed = text.trim();

        if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html') || trimmed.startsWith('<!doctype html')) {
          throw new Error("Received HTML page instead of XML feed");
        }

        if (
          (trimmed.includes('<rss') || trimmed.includes('<feed') || trimmed.includes('<channel') || trimmed.includes('<?xml')) &&
          (trimmed.includes('<item') || trimmed.includes('<entry') || trimmed.includes('<title>'))
        ) {
          return { ok: true, xml: text };
        } else {
          throw new Error("Invalid RSS/Atom XML structure");
        }
      } catch (err: any) {
        // Try next strategy
      }
    }

    // Proxy Fallback
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    try {
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const text = await res.text();
        const trimmed = text.trim();
        if (
          !trimmed.startsWith('<!DOCTYPE html') &&
          !trimmed.startsWith('<html') &&
          (trimmed.includes('<rss') || trimmed.includes('<feed') || trimmed.includes('<channel'))
        ) {
          return { ok: true, xml: text };
        }
      }
    } catch (e) {}

    return { ok: false, error: 'Feed cannot be accessed or invalid XML' };
  }

  // Helper: Try to auto-repair a broken RSS feed URL
  async function tryAutoRepairRSS(originalUrl: string, title?: string): Promise<{ ok: boolean; repairedUrl?: string; error?: string }> {
    const firstCheck = await fetchAndVerifyRSS(originalUrl);
    if (firstCheck.ok) {
      return { ok: true, repairedUrl: originalUrl };
    }

    let domain = '';
    let path = '';
    try {
      const parsed = new URL(originalUrl);
      domain = `${parsed.protocol}//${parsed.hostname}`;
      path = parsed.pathname;
    } catch (e) {
      return { ok: false, error: 'Invalid URL format' };
    }

    // Domain Specific Known Overrides
    if (originalUrl.includes('youtube.com') || (title && title.toLowerCase().includes('youtube'))) {
      let handleCandidate = '';
      const match = originalUrl.match(/[?&]user=([^&]+)/i) || originalUrl.match(/youtube\.com\/@([^/?&]+)/i);
      if (match && match[1]) {
        handleCandidate = match[1];
      } else if (title) {
        const titleMatch = title.match(/@([a-zA-Z0-9_.-]+)/) || title.match(/youtube\s*-\s*@?([a-zA-Z0-9_.-]+)/i);
        if (titleMatch && titleMatch[1]) handleCandidate = titleMatch[1];
      }

      if (handleCandidate) {
        const channelId = await resolveYouTubeChannelId(handleCandidate);
        if (channelId) {
          const repUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
          const check = await fetchAndVerifyRSS(repUrl);
          if (check.ok) return { ok: true, repairedUrl: repUrl };
        }
      }
    }

    if (originalUrl.includes('github-trending') || originalUrl.includes('github.com')) {
      const repUrl = 'https://github.com/trending';
      const check = await fetchAndVerifyRSS(repUrl);
      if (check.ok) return { ok: true, repairedUrl: repUrl };
    }

    if (originalUrl.includes('ntvspor.net')) {
      const candidate = 'https://www.ntv.com.tr/spor.rss';
      const check = await fetchAndVerifyRSS(candidate);
      if (check.ok) return { ok: true, repairedUrl: candidate };
    }
    if (originalUrl.includes('ntv.com.tr') && originalUrl.includes('gundem')) {
      const candidate = 'https://www.ntv.com.tr/gundem.rss';
      const check = await fetchAndVerifyRSS(candidate);
      if (check.ok) return { ok: true, repairedUrl: candidate };
    }

    const candidateUrls: string[] = [];
    const cleanPath = path.replace(/\/$/, '');
    const pathParts = cleanPath.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1] || '';

    if (lastPart) {
      candidateUrls.push(`${domain}/${lastPart}.rss`);
      candidateUrls.push(`${domain}/${lastPart}/feed`);
      candidateUrls.push(`${domain}/rss/${lastPart}`);
    }

    candidateUrls.push(`${domain}/feed`);
    candidateUrls.push(`${domain}/feed/`);
    candidateUrls.push(`${domain}/rss`);
    candidateUrls.push(`${domain}/rss.xml`);
    candidateUrls.push(`${domain}/rss/tum/`);
    candidateUrls.push(`${domain}/rss/anasayfa`);
    candidateUrls.push(`${domain}/atom.xml`);
    candidateUrls.push(`${domain}/index.xml`);
    candidateUrls.push(`${domain}/sondakika.rss`);
    candidateUrls.push(`${domain}/export/rss`);

    if (originalUrl.startsWith('http://')) {
      candidateUrls.push(originalUrl.replace('http://', 'https://'));
    } else if (originalUrl.startsWith('https://')) {
      candidateUrls.push(originalUrl.replace('https://', 'http://'));
    }

    const uniqueCandidates = Array.from(new Set(candidateUrls)).filter(u => u !== originalUrl);

    for (const candidate of uniqueCandidates) {
      const check = await fetchAndVerifyRSS(candidate);
      if (check.ok) {
        console.log(`[RSS Auto-Repair] Successfully auto-repaired ${originalUrl} -> ${candidate}`);
        return { ok: true, repairedUrl: candidate };
      }
    }

    // Scraping Domain HTML for feed link tags
    try {
      const pageRes = await fetch(domain, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(5000)
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        const rssLinkMatches = Array.from(html.matchAll(/<link[^>]+type=["']application\/(rss\+xml|atom\+xml|xml)["'][^>]+href=["']([^"']+)["']/gi));
        for (const match of rssLinkMatches) {
          let href = match[2];
          if (href) {
            if (href.startsWith('/')) href = domain + href;
            if (!href.startsWith('http')) href = domain + '/' + href;
            const check = await fetchAndVerifyRSS(href);
            if (check.ok) {
              console.log(`[RSS Auto-Repair Scraped] Auto-repaired ${originalUrl} -> ${href}`);
              return { ok: true, repairedUrl: href };
            }
          }
        }
      }
    } catch (e) {}

    return { ok: false, error: 'HTTP 404/403 veya geçersiz XML formatı. Otomatik onarım alternatifleri başarısız oldu.' };
  }

  // API Route: RSS Health Check & Auto-Repair for single URL
  app.get("/api/rss-health/check", async (req, res) => {
    const { url: rawUrl, title } = req.query;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ error: "URL query parameter is required" });
    }

    const feedTitle = typeof title === 'string' ? title : '';
    const repairResult = await tryAutoRepairRSS(rawUrl, feedTitle);

    if (repairResult.ok) {
      if (repairResult.repairedUrl === rawUrl) {
        return res.json({ status: 'healthy', url: rawUrl, message: 'Kaynak sorunsuz çalışıyor' });
      } else {
        return res.json({
          status: 'repaired',
          originalUrl: rawUrl,
          repairedUrl: repairResult.repairedUrl,
          message: 'Hatalı URL tespit edildi ve çalışan alternatif URL ile otomatik değiştirildi'
        });
      }
    } else {
      return res.json({
        status: 'broken',
        originalUrl: rawUrl,
        error: repairResult.error || 'Kaynak yanıt vermiyor (HTTP 404/403)',
        message: 'Kaynak bağlantısına erişilemiyor veya geçerli bir haber akışı değil'
      });
    }
  });

  // API Route: RSS Health Batch Inspector
  app.post("/api/rss-health/batch", express.json(), async (req, res) => {
    const { feeds } = req.body;
    if (!Array.isArray(feeds)) {
      return res.status(400).json({ error: "Feeds array is required" });
    }

    const results = {
      healthy: [] as any[],
      repaired: [] as any[],
      broken: [] as any[]
    };

    // Run health checks sequentially or in small concurrency batches
    for (const feed of feeds) {
      if (!feed.url) continue;
      const repairResult = await tryAutoRepairRSS(feed.url, feed.title);
      if (repairResult.ok) {
        if (repairResult.repairedUrl === feed.url) {
          results.healthy.push({ ...feed, status: 'healthy' });
        } else {
          results.repaired.push({
            ...feed,
            status: 'repaired',
            originalUrl: feed.url,
            repairedUrl: repairResult.repairedUrl
          });
        }
      } else {
        results.broken.push({
          ...feed,
          status: 'broken',
          error: repairResult.error || 'HTTP 404/403 veya Geçersiz XML'
        });
      }
    }

    return res.json(results);
  });

  // API Route: AI Article Summarizer
  app.post("/api/bulletin/summarize", async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required for summarization." });
    }

    try {
      console.log(`[Gemini Summarizer] Summarizing article: ${title}`);
      
      const response = await getAi().models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Lütfen aşağıdaki makalenin çok net, profesyonel, okuması kolay ve Türkçe bir özetini çıkar. 
Format olarak bülten tarzında kalın başlıklar ve 3-4 madde halinde en önemli kısımları (TL;DR) öne çıkar. Makaleyi heyecanlı ve akıcı bir dille anlat.
 
Başlık: ${title}
İçerik: ${content.substring(0, 10000)}`, // Limit to 10k chars to stay safe
        config: {
          systemInstruction: "Sen profesyonel bir bülten editörüsün. Amacın, okuyucunun uzun haberleri ve makaleleri 5 saniyede anlayabileceği harika özetler çıkarmaktır.",
        }
      });

      res.json({ summary: response.text });
    } catch (err: any) {
      console.error("[Gemini Summarizer] Error summarizing:", err);
      res.status(500).json({ error: "Yapay zeka özeti oluşturulamadı.", details: err.message });
    }
  });

  // API Route: AI Daily Bulletin Digest Generator
  app.post("/api/bulletin/digest", async (req, res) => {
    const { articles } = req.body;
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: "Articles array is required" });
    }

    try {
      console.log(`[Bulletin AI Digest] Generating daily digest from ${articles.length} articles...`);
      const articlesContext = articles.slice(0, 15).map((a: any, i: number) => 
        `[${i + 1}] Kategori: ${a.category || 'Genel'} | Kaynak: ${a.feedTitle || 'Bilinmiyor'}\nBaşlık: ${a.title}\nÖzet: ${a.contentSnippet || a.content || ''}`
      ).join("\n\n");

      const prompt = `Aşağıdaki güncel haber ve RSS akışlarını analiz ederek okuyucular için şık, okuması zevkli ve tamamen Türkçe bir "Günün Akıllı Bülteni" (Daily Executive Briefing) hazırla.

Haber Akışı Verileri:
${articlesContext}

Lütfen yanıtı tamamen saf JSON formatında şu şemada döndür:
{
  "title": "Bülten Başlığı (Örn: 'Bugünün Öne Çıkan Gündem ve Teknoloji Bülteni')",
  "greeting": "Okuyucuya samimi, enerjik 1-2 cümlelik karşılama mesajı.",
  "highlights": [
    {
      "topic": "Haber Başlığı / Konu",
      "summary": "1-2 cümlelik vurucu özet",
      "impact": "Bu gelişmenin neden önemli olduğu",
      "category": "Kategori"
    }
  ],
  "quickTakeaways": [
    "30 saniyede bilmeniz gereken madde 1",
    "30 saniyede bilmeniz gereken madde 2",
    "30 saniyede bilmeniz gereken madde 3"
  ],
  "editorNote": "Günün genel akışına dair editörün vizyoner değerlendirme notu."
}`;

      const response = await getAi().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Sen APEXOS'un Baş Editörü ve Akıllı Yapay Zeka Bülten Yazarısın. Türkçe dilinde, son derece akıcı, profesyonel ve etkileyici bültenler hazırlarsın.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              greeting: { type: Type.STRING },
              highlights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ["topic", "summary", "impact", "category"]
                }
              },
              quickTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              editorNote: { type: Type.STRING }
            },
            required: ["title", "greeting", "highlights", "quickTakeaways", "editorNote"]
          }
        }
      });

      const responseText = response.text ? response.text.trim() : "";
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (err: any) {
      console.error("[Bulletin AI Digest] Error:", err);
      return res.status(500).json({ error: "Bülten özeti oluşturulamadı.", details: err.message });
    }
  });

  // API Route: AI Notes Wizard
  app.post("/api/notes/wizard", async (req, res) => {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ error: "rawText is required for the notes wizard." });
    }

    try {
      console.log(`[Notes Wizard] Processing raw thoughts...`);
      
      const prompt = `Aşağıdaki serbest yazılmış ham notu analiz et ve yapılandırılmış, temiz bir JSON objesi döndür.
JSON objesi tam olarak şu alanları içermelidir:
{
  "title": "Not için kısa, profesyonel ve ilgi çekici bir başlık (en fazla 6-7 kelime)",
  "summary": "Notun temizlenmiş, imla kuralları düzeltilmiş ve gerekirse ek detaylarla zenginleştirilmiş profesyonel paragraf hali",
  "tags": ["Notla ilgili 2-3 adet tek kelimelik etiket/tag örn: İş, Kişisel, Yazılım, Alışveriş, Fikir"],
  "color": "amber, rose, emerald, blue veya violet renklerinden notun ruhuna en uygun olanı",
  "category": "Notun kategorisi (örn: Plan, Tasarım, Günlük, İş, Finans, Sağlık)",
  "todoItems": ["Eğer not yapılacak işler içeriyorsa veya yapılacaklara dönüştürülebilecek adımlar varsa, bunları maddeler halinde ayır. Yoksa boş dizi [] gönder."],
  "extractedLinks": [{"title": "Ham notta geçen web siteleri veya referans verilen linklerin başlığı veya tanımı", "url": "Varsa tam urlsi (örn: https://google.com), yoksa ilgili sitenin adresi"}]
}

Önemli Kurallar:
- Sadece saf JSON döndür. Başında veya sonunda açıklama veya markdown kesmeleri (\`\`\`json) olmasın.
- Dil kesinlikle Türkçe olmalıdır.
- Ham Not: ${rawText}`;

      const response = await getAi().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Sen profesyonel bir akıllı kişisel asistan ve not alma sihirbazısın. Kullanıcıların dağınık düşüncelerini organize eder, onlara harika başlıklar, etiketler, web bağlantıları ve yapılacaklar listesi çıkartırsın.",
        }
      });

      const responseText = response.text ? response.text.trim() : "";
      
      // Clean potential markdown quotes
      let cleanJson = responseText;
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.substring(7);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      cleanJson = cleanJson.trim();

      try {
        const parsed = JSON.parse(cleanJson);
        res.json(parsed);
      } catch (parseErr) {
        console.warn("[Notes Wizard] JSON parse failed, returning fallback parsed fields", responseText);
        res.json({
          title: "Akıllı Asistan Notu",
          summary: rawText,
          tags: ["Fikir"],
          color: "amber",
          category: "Genel",
          todoItems: [],
          extractedLinks: []
        });
      }
    } catch (err: any) {
      console.error("[Notes Wizard] Error analyzing notes:", err);
      res.status(500).json({ error: "Yapay zeka analiz motoru başarısız oldu.", details: err.message });
    }
  });

  // API Route: AI Advanced Notes Assistant
  app.post("/api/notes/assistant", async (req, res) => {
    const { action, text, context = "" } = req.body;
    if (!text || !action) {
      return res.status(400).json({ error: "text and action parameters are required." });
    }

    try {
      let prompt = "";
      let systemInstruction = "Sen profesyonel ve son derece zeki bir ApexOS not asistanısın. Kullanıcının yazılarını zenginleştirir ve düzenlersin.";

      switch (action) {
        case "polish":
          prompt = `Lütfen aşağıdaki metni imla, akıcılık ve üslup açısından mükemmel hale getir. 
Gereksiz tekrarları çıkar, cümleleri daha profesyonel ve kulağa hoş gelen bir hale sok ancak ana fikri asla değiştirme.
Metin:
${text}`;
          break;
        case "summarize":
          prompt = `Lütfen aşağıdaki metnin profesyonel bir özetini çıkar. 
Ana fikirleri, önemli noktaları (özellikle kalın vurgulayarak) ve varsa eylem maddelerini net bir şekilde Türkçe listele.
Metin:
${text}`;
          break;
        case "expand":
          prompt = `Lütfen aşağıdaki notu veya fikri derinleştir, yeni yaratıcı bakış açıları ekle ve yapılandırılmış alt başlıklarla genişlet. 
Not sahibinin işine yarayacak ek detaylar ve öneriler eklemeyi unutma.
Metin:
${text}`;
          break;
        case "extract-todos":
          prompt = `Lütfen aşağıdaki metinden yapılacak işleri, eylem maddelerini ve görevleri ayıkla.
Bunları JSON dizisi olarak döndür. Format tam olarak şu şekilde olmalıdır:
["Yapılacak iş 1", "Yapılacak iş 2"]
Yalnızca saf JSON dizisi döndür, başka açıklama yazma.
Metin:
${text}`;
          systemInstruction = "Görevin metindeki yapılacak işleri saptayıp sadece saf bir JSON dize dizisi döndürmektir.";
          break;
        case "extract-links":
          prompt = `Aşağıdaki metinde geçen web linklerini, kaynakları veya adı geçen siteleri bul ve bir JSON dizisi olarak döndür.
Format tam olarak şu şekilde olmalıdır:
[{"title": "Site Başlığı/Açıklaması", "url": "https://url.com"}]
Yalnızca saf JSON dizisi döndür, başka açıklama yazma.
Metin:
${text}`;
          systemInstruction = "Görevin metindeki web sitelerini saptayıp sadece saf bir JSON dizi objeleri döndürmektir.";
          break;
        case "tone-professional":
          prompt = `Aşağıdaki metni daha profesyonel, kurumsal ve ciddi bir dille yeniden yaz:
${text}`;
          break;
        case "tone-casual":
          prompt = `Aşağıdaki metni daha samimi, enerjik, sıcak ve akıcı bir sosyal medya/sohbet tarzında yeniden yaz:
${text}`;
          break;
        default:
          return res.status(400).json({ error: "Geçersiz asistan aksiyonu." });
      }

      const response = await getAi().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
        }
      });

      const responseText = response.text ? response.text.trim() : "";
      res.json({ result: responseText });
    } catch (err: any) {
      console.error("[Notes Assistant] Error running action:", err);
      res.status(500).json({ error: "Asistan işlemi sırasında bir hata oluştu.", details: err.message });
    }
  });

  // API Route: Bookmark Analyzer (Unified with dynamic AI and Local heuristic modes)
  const handleAnalyzeBookmark = async (req: express.Request, res: express.Response) => {
    const { url, title, notes, mode } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL parametresi zorunludur." });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // 1. Fetch HTML in the background for local analysis or dynamic extraction
    let htmlContent = "";
    try {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      ];
      console.log(`[Analyzer] Attempting to fetch HTML for: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': userAgents[0],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(3000) // 3 second timeout so the client never waits too long
      });
      
      if (response.ok) {
        htmlContent = await response.text();
      }
    } catch (fetchErr: any) {
      console.warn(`[Analyzer] Could not fetch HTML for URL ${targetUrl}: ${fetchErr.message}`);
    }

    // 2. Determine if AI should be used
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const useAi = mode !== "local" && apiKey && apiKey !== "dummy_key_to_prevent_startup_crash";

    if (useAi) {
      try {
        console.log(`[Analyzer] Running AI Analysis for: ${targetUrl}`);
        
        // Extract title & description if available from HTML to help the AI model form a better prompt
        let scrapedTitle = "";
        let scrapedDesc = "";
        if (htmlContent) {
          scrapedTitle = extractTagContent(htmlContent, 'title');
          scrapedDesc = extractMetaAttribute(htmlContent, 'name', 'description') || 
                        extractMetaAttribute(htmlContent, 'property', 'og:description') || "";
        }

        const prompt = `Aşağıdaki web sitesini (yer imini) detaylıca analiz et:
Site URL'si: ${targetUrl}
Kullanıcının Belirttiği Başlık: ${title || "Belirtilmemiş"}
Siteden Çekilen HTML Başlığı: ${scrapedTitle || "Çekilemedi"}
Siteden Çekilen Meta Açıklaması: ${scrapedDesc || "Çekilemedi"}
Kullanıcının Eklediği Notlar: ${notes || "Belirtilmemiş"}

Lütfen sitenin amacını ve içeriğini göz önünde bulundurarak en doğru ve en kısa Türkçe başlık, açıklama, kategori, 3 adet etiket ve yapay zeka özetini oluştur.`;

        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Sen profesyonel bir web küratörü ve akıllı yer imi (bookmark) asistanısın. Web sitelerini analiz eder, onları doğru kategorilere yerleştirir, etiketler ve harika özetler çıkartırsın. Daima tamamen Türkçe yanıtlar verirsin.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Site için en uygun, kısa, profesyonel ve net Türkçe başlık."
                },
                description: {
                  type: Type.STRING,
                  description: "Sitenin ne işe yaradığına dair en fazla 1-2 cümlelik, son derece kısa, net og akıcı Türkçe açıklama."
                },
                category: {
                  type: Type.STRING,
                  description: "Sitenin kategorisi. En uygun, kısa ve profesyonel bir kategori ismi belirle (örn: 'Yazılım & Geliştirme', 'Tasarım & Kreatif', 'Sosyal Medya', 'Eğitim & Öğrenim', 'Haber & Blog', 'Yapay Zeka & Araçlar', 'Alışveriş & Ürünler', 'Finans & İş', 'Kişisel', 'Sağlık & Spor', 'Eğlence & Sinema', 'Yemek & Tarif', 'Seyahat & Tatil')."
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Siteyle ilgili 3 adet kısa, modern, küçük harfli Türkçe etiket. Örn: ['react', 'css', 'figma']"
                },
                aiSummary: {
                  type: Type.STRING,
                  description: "Site hakkında detaylı analiz, ana özellikleri ve ne amaçla kullanılabileceklerine dair en fazla 1-2 maddelik, son derece kısa, öz ve net bir Türkçe özet."
                }
              },
              required: ["title", "description", "category", "tags", "aiSummary"]
            }
          }
        });

        const responseText = response.text ? response.text.trim() : "";
        const parsed = JSON.parse(responseText);
        return res.json({ ...parsed, method: "ai" });
      } catch (aiErr: any) {
        console.warn(`[Analyzer] AI analysis failed, falling back to local heuristic analysis: ${aiErr.message}`);
      }
    }

    // 3. Heuristic / Local Fallback
    console.log(`[Analyzer] Running Local/Heuristics Analysis for: ${targetUrl}`);
    const localResult = localAnalyze(targetUrl, title, htmlContent);
    return res.json({ ...localResult, method: "local", isFallback: !!useAi });
  };

  app.post("/api/bookmarks/analyze", handleAnalyzeBookmark);
  app.post("/api/analyze-bookmark", handleAnalyzeBookmark);

  app.post("/api/books/extract-ai", async (req, res) => {
    try {
      const { title, author } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Kullanıcı tarafından sağlanan veri (bir dosya adı, eksik veya karmaşık bir başlık olabilir): "${title}"
Yazar (eğer belirtilmişse): "${author || 'Bilinmiyor'}"

Lütfen bu veriyi analiz et. Eğer bu bir dosya adıysa (örneğin: '1984_George_Orwell_epub', 'harry-potter-1-pdf' gibi), öncelikle içindeki gerçek kitap adını ve yazarını temizleyerek ayırt et.
Ardından bu kitap hakkında en doğru, zengin meta verileri toparla ve aşağıdaki JSON formatında, Türkçe dilinde dön:

{
  "title": "Kitabın doğru, tam ve temiz adı (Dosya uzantıları veya gereksiz karakterler olmadan)",
  "author": "Yazarın doğru ve tam adı",
  "category": "En uygun tek bir ana kategori (örn: Bilim Kurgu, Roman, Tarih, Felsefe)",
  "tags": ["ilgili-etiket-1", "ilgili-etiket-2", "ilgili-etiket-3"],
  "description": "Kitabın profesyonel, merak uyandırıcı, 2-3 cümlelik çok iyi yazılmış bir arka kapak veya tanıtım özeti.",
  "coverUrl": "Eğer internette bilinen iyi çözünürlüklü bir kapak görseli URL'si bulabilirsen (veya tahmini bir public resim URL'si), aksi takdirde boş bırak"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              coverUrl: { type: Type.STRING }
            },
            required: ["title", "author", "category", "tags", "description"]
          }
        }
      });

      const responseText = response.text ? response.text.trim() : "";
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (err: any) {
      console.error("[BookAI] AI extraction failed:", err.message);
      return res.status(500).json({ error: "AI extraction failed" });
    }
  });

  app.get("/api/google/drive", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    try {
      const files = await drive.files.list({ pageSize: 5, fields: 'files(id, name, mimeType)' });
      res.json(files.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/google/drive/music", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    try {
      const q = "(mimeType contains 'audio/' or name contains '.mp3' or name contains '.flac' or name contains '.m4a' or name contains '.wav' or name contains '.ogg') and trashed = false";
      const files = await drive.files.list({
        q,
        pageSize: 150,
        fields: 'files(id, name, mimeType, size, iconLink, webContentLink)'
      });
      res.json(files.data);
    } catch (err: any) {
      console.error("[MusicPlayer] Drive list failed:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/google/drive/videos", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    try {
      const q = "(mimeType contains 'video/' or name contains '.mp4' or name contains '.mkv' or name contains '.webm' or name contains '.avi' or name contains '.mov') and trashed = false";
      const files = await drive.files.list({
        q,
        pageSize: 150,
        fields: 'files(id, name, mimeType, size, iconLink, webContentLink)'
      });
      res.json(files.data);
    } catch (err: any) {
      console.error("[VideoPlayer] Drive list failed:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/google/drive/stream/:id", async (req, res) => {
    const authHeader = req.headers.authorization || req.query.token;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') 
      ? authHeader.split(" ")[1] 
      : authHeader as string;
      
    const fileId = req.params.id;
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    try {
      const requestHeaders: any = {};
      if (req.headers.range) {
        requestHeaders.range = req.headers.range;
      }

      const fileResponse = await drive.files.get(
        { fileId, alt: 'media' },
        { 
          responseType: 'stream',
          headers: requestHeaders
        }
      );
      
      // Copy status and headers from Google Drive to support 206 Partial Content (Streaming Seek)
      if (fileResponse.status) {
        res.status(fileResponse.status);
      }
      
      if (fileResponse.headers) {
        Object.entries(fileResponse.headers).forEach(([key, val]) => {
          if (val && ['content-type', 'content-length', 'content-range', 'accept-ranges'].includes(key.toLowerCase())) {
            res.setHeader(key, val as string);
          }
        });
      }
      
      fileResponse.data.pipe(res);
    } catch (err: any) {
      console.error("[MediaPlayer] Drive stream failed:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/google/docs", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    try {
      const files = await drive.files.list({ 
        pageSize: 5, 
        q: "mimeType = 'application/vnd.google-apps.document'",
        fields: 'files(id, name)'
      });
      res.json(files.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/google/sheets", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    try {
      const files = await drive.files.list({ 
        pageSize: 5, 
        q: "mimeType = 'application/vnd.google-apps.spreadsheet'",
        fields: 'files(id, name)'
      });
      res.json(files.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/google/gmail", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    try {
      const messages = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
      res.json(messages.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/google/calendar", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    try {
      const events = await calendar.events.list({ calendarId: 'primary', timeMin: new Date().toISOString(), maxResults: 5 });
      res.json(events.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/google/tasks", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    
    const token = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    
    const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
    try {
      const taskLists = await tasks.tasklists.list();
      if (!taskLists.data.items || taskLists.data.items.length === 0) return res.json({ items: [] });
      
      const taskItems = await tasks.tasks.list({ tasklist: taskLists.data.items[0].id!, maxResults: 5 });
      res.json(taskItems.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });



  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
