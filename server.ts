import express from "express";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import Parser from "rss-parser";
import { GoogleGenAI } from "@google/genai";

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

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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
      
      const response = await ai.models.generateContent({
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
