import express from "express";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import Parser from "rss-parser";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from "googleapis";

// Allow connections to servers with expired or custom SSL/TLS certificates for RSS feeds
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

  // API Route: RSS Proxy Fetcher
  app.get("/api/rss-proxy", async (req, res) => {
    const { url: rawUrl } = req.query;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ error: "URL query parameter is required" });
    }

    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
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
          redirect: 'follow'
        });
      },
      // Strategy B: Bare minimum headers (bypasses signature-matching blocks)
      async (targetUrl: string, ua: string) => {
        return await fetch(targetUrl, {
          headers: {
            'User-Agent': ua,
            'Accept': '*/*'
          },
          redirect: 'follow'
        });
      },
      // Strategy C: Pure browser mimic without security tags
      async (targetUrl: string, ua: string) => {
        return await fetch(targetUrl, {
          headers: {
            'User-Agent': ua
          },
          redirect: 'follow'
        });
      }
    ];

    // Try rotating strategies and user agents
    direct_fetch_loop:
    for (const strategy of fetchStrategies) {
      for (const ua of userAgents) {
        try {
          console.log(`[RSS Proxy] Fetching directly: ${url} using UA: ${ua.substring(0, 40)}...`);
          const response = await strategy(url, ua);

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
          console.warn(`[RSS Proxy] Direct fetch strategy failed for ${url}: ${err.message}`);
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }
    }

    // Fallback: try public distributed raw proxies if direct fetches failed
    if (!success) {
      console.log(`[RSS Proxy] Direct fetch failed. Trying high-reputation public CORS proxies for ${url}...`);
      
      const publicProxies = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      ];

      for (const proxyUrl of publicProxies) {
        try {
          console.log(`[RSS Proxy] Fetching via proxy: ${proxyUrl.substring(0, 60)}...`);
          const response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': userAgents[0]
            },
            redirect: 'follow'
          });

          if (!response.ok) {
            throw new Error(`Proxy status: ${response.status}`);
          }

          const text = await response.text();
          const trimmed = text.trim();

          if (trimmed.length > 100 && !trimmed.startsWith('<!DOCTYPE html') && !trimmed.startsWith('<html')) {
            xmlText = text;
            success = true;
            console.log(`[RSS Proxy] Successfully retrieved XML via public proxy fallback!`);
            break;
          } else {
            throw new Error("Proxy response is empty or HTML.");
          }
        } catch (proxyErr: any) {
          console.warn(`[RSS Proxy] Proxy failed for ${url}: ${proxyErr.message}`);
        }
      }
    }

    if (success && xmlText) {
      try {
        const sanitizedXml = sanitizeXml(xmlText);
        const feed = await parser.parseString(sanitizedXml);
        return res.json(feed);
      } catch (parseErr: any) {
        console.warn(`[RSS Proxy] Sanitized XML parsing failed for ${url}, trying raw XML...`, parseErr.message);
        try {
          const feed = await parser.parseString(xmlText);
          return res.json(feed);
        } catch (rawParseErr: any) {
          console.error(`[RSS Proxy] Parsing completely failed for ${url}:`, rawParseErr);
          try {
            const feed = await parser.parseURL(url);
            return res.json(feed);
          } catch (fallbackErr: any) {
            return res.status(500).json({
              error: "Failed to parse feed content.",
              details: rawParseErr.message,
              fallbackDetails: fallbackErr.message
            });
          }
        }
      }
    } else {
      console.warn(`[RSS Proxy] All fetches and proxies failed for ${url}. Trying direct rss-parser parseURL fallback...`);
      try {
        const feed = await parser.parseURL(url);
        return res.json(feed);
      } catch (fallbackErr: any) {
        console.error(`[RSS Proxy] All proxy and library fallbacks failed for ${url}:`, fallbackErr);
        return res.status(500).json({
          error: "Failed to fetch and parse feed.",
          details: lastError ? lastError.message : "Unknown fetch error",
          fallbackDetails: fallbackErr.message
        });
      }
    }
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

  // API Route: AI Personal Chat Assistant
  app.post("/api/ai/chat", async (req, res) => {
    const { message, chatHistory = [], context = "" } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Mesaj parametresi zorunludur." });
    }

    try {
      console.log(`[AI Chat] Processing user message...`);

      const historyPrompt = chatHistory.map((h: any) => `${h.sender === 'user' ? 'Kullanıcı' : 'Asistan'}: ${h.text}`).join("\n");
      const prompt = `Kullanıcı Verileri ve Durum Bağlamı:
${context}

Önceki Sohbet Geçmişi:
${historyPrompt}

Yeni Kullanıcı Mesajı:
${message}

Lütfen yukarıdaki bağlamı, geçmişi ve mesajı göz önünde bulundurarak samimi, son derece zeki, finansal okuryazarlığı yüksek ve yapıcı bir Türkçe yanıt üret. En fazla 3-4 cümlede net öneriler ver, karmaşık analizleri maddeler halinde açıkla.`;

      const response = await getAi().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Sen APEXOS işletim sisteminin yerleşik akıllı asistanı 'Apex AI'sın. Kullanıcıya bütçe analizi, harcama tasarrufları, stok seviyeleri ve işletme kararları konularında yardımcı olursun. Net, profesyonel, yapıcı ve tamamen Türkçe cevaplar verirsin.",
        }
      });

      const responseText = response.text ? response.text.trim() : "Üzgünüm, şu an bunu işleyemiyorum.";
      res.json({ reply: responseText });
    } catch (err: any) {
      console.error("[AI Chat] Error calling Gemini API:", err);
      res.status(500).json({ error: "Yapay zeka asistanı şu an yanıt veremiyor.", details: err.message });
    }
  });

  // API Route: AI Predictive Forecasting
  app.post("/api/ai/forecast", async (req, res) => {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ error: "Context data is required." });
    }

    try {
      console.log(`[AI Forecast] Running predictive engine...`);

      const prompt = `Kullanıcının mevcut finansal/stok verileri:
${context}

Lütfen bu verileri analiz ederek önümüzdeki 3 döneme (aylık) ait tahminleri ve akıllı bütçe uyarılarını hesapla.
Dönecek çıktı tam olarak şu JSON yapısında olmalıdır:
{
  "futurePredictions": [
    { "period": "Dönem adı örn: Temmuz", "income": 45000, "expense": 32000, "savings": 13000, "note": "Kısa tahmin açıklaması" }
  ],
  "warnings": ["Harcama veya stok eşiği limit aşım uyarısı örn: Gıda giderlerinizde artış riski var."],
  "scoreForecast": "Tahmini gelecek sağlık skoru örn: 85",
  "confidence": "Tahmin güvenilirlik yüzdesi örn: %92",
  "advice": "Tasarrufları optimize etmek veya stok bitmesini önlemek için 1-2 cümlelik yapıcı, akıllı tavsiye."
}

Önemli: Sadece saf JSON döndür, açıklama veya markdown kesmeleri (\`\`\`json) yazma.`;

      const response = await getAi().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Sen APEXOS bütçe ve stok tahminleme motorusun. Verilerden yola çıkarak mantıklı gelecek tahminleri yapar ve JSON formatında sunarsın.",
        }
      });

      const responseText = response.text ? response.text.trim() : "";

      let cleanJson = responseText;
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.substring(7);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      cleanJson = cleanJson.trim();

      const parsed = JSON.parse(cleanJson);
      res.json(parsed);
    } catch (err: any) {
      console.error("[AI Forecast] Error calling Gemini:", err);
      res.status(500).json({ error: "Tahmin motoru başarısız oldu.", details: err.message });
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
      const items = (taskLists.data as any).items;
      if (!items || items.length === 0) return res.json({ items: [] });
      
      const taskItems = await tasks.tasks.list({ tasklist: items[0].id!, maxResults: 5 });
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
