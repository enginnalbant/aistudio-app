import express from "express";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import Parser from "rss-parser";
import { GoogleGenAI } from "@google/genai";

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

  // API Route: RSS Proxy Fetcher
  app.get("/api/rss-proxy", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL query parameter is required" });
    }

    try {
      console.log(`[RSS Proxy] Fetching feed from: ${url}`);
      
      // Try fetching using custom browser-like headers to avoid 403 Forbidden errors
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();
      
      // Basic check if we received actual HTML instead of XML (sometimes security overlays return 200 with HTML)
      if (xmlText.trim().startsWith('<!DOCTYPE html') || xmlText.trim().startsWith('<html')) {
        throw new Error("Received HTML content instead of XML feed. The site might be blocking programmatic access.");
      }

      const feed = await parser.parseString(xmlText);
      res.json(feed);
    } catch (err: any) {
      console.warn(`[RSS Proxy] Fetch failed, attempting direct parser fallback for URL: ${url}`, err.message);
      try {
        // Fallback to the original library-default parseURL which uses its own request implementation
        const feed = await parser.parseURL(url);
        res.json(feed);
      } catch (fallbackErr: any) {
        console.error("[RSS Proxy] Error parsing feed (both fetch and fallback failed):", fallbackErr);
        res.status(500).json({ 
          error: "Failed to parse feed. The URL might be invalid, or the server blocked our request.", 
          details: fallbackErr.message 
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
