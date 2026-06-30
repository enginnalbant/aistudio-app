import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!ai) {
    ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
};

export const geminiService = {
  async searchAI(query: string) {
    const client = getAi();
    if (!client) {
      return "Gemini API anahtarı yapılandırılmamış.";
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Kullanıcı şu sorguyu yaptı: "${query}". 
        Bu bir işletim sistemi arayüzü (ApexOS). 
        Kullanıcıya yardımcı ol, kısa ve öz bir cevap ver. 
        Eğer bir ayar veya modül soruyorsa yönlendir.`,
      });
      return response.text;
    } catch (error) {
      console.error("AI Search Error:", error);
      return "AI yanıtı alınırken bir hata oluştu.";
    }
  },

  async assistNote(task: string, content: string) {
    const client = getAi();
    if (!client) {
      return "Gemini API anahtarı yapılandırılmamış.";
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Aşağıdaki metin için şu görevi yerine getir: "${task}".
        
        Metin:
        """
        ${content}
        """
        
        Lütfen sadece talep edilen değişikliği yapılmış metni döndür. Ek açıklama, giriş veya çıkış cümleleri ekleme. Doğrudan sonucu ver.`,
      });
      return response.text || "";
    } catch (error) {
      console.error("AI Note Assist Error:", error);
      return "AI yardımı sırasında bir hata oluştu.";
    }
  }
};
