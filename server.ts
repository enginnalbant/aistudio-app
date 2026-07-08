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
      const feed = await parser.parseURL(url);
      res.json(feed);
    } catch (err: any) {
      console.error("[RSS Proxy] Error parsing feed:", err);
      res.status(500).json({ 
        error: "Failed to parse feed. The URL might be invalid, or the server blocked our request.", 
        details: err.message 
      });
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
