import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const geminiService = {
  async searchAI(query: string) {
    if (!process.env.GEMINI_API_KEY) {
      return "Gemini API anahtarı yapılandırılmamış.";
    }

    try {
      const response = await ai.models.generateContent({
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
    if (!process.env.GEMINI_API_KEY) {
      return "Gemini API anahtarı yapılandırılmamış.";
    }

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
      return response.text || "";
    } catch (error) {
      console.error("AI Note Assist Error:", error);
      return "AI yardımı sırasında bir hata oluştu.";
    }
  }
};
