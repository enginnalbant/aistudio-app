import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({ 
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API routes
  app.post("/api/gemini/assist", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API anahtarı yapılandırılmamış." });
    }
    const { task, content } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Aşağıdaki metin için şu görevi yerine getir: "${task}".
        
        Metin:
        """
        ${content}
        """
        
        Lütfen sadece talep edilen değişikliği yapılmış metni döndür. Ek açıklama, giriş veya çıkış cümleleri ekleme. Doğrudan sonucu ver.`,
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Note Assist Error:", error);
      res.status(500).json({ error: "AI yardımı sırasında bir hata oluştu." });
    }
  });

  app.post("/api/gemini/search", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API anahtarı yapılandırılmamış." });
    }
    const { query } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Kullanıcı şu sorguyu yaptı: "${query}". 
        Bu bir işletim sistemi arayüzü (ApexOS). 
        Kullanıcıya yardımcı ol, kısa ve öz bir cevap ver. 
        Eğer bir ayar veya modül soruyorsa yönlendir.`,
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Search Error:", error);
      res.status(500).json({ error: "AI yanıtı alınırken bir hata oluştu." });
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
    const distPath = path.join(__dirname, 'dist');
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
