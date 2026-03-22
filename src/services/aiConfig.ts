import { GoogleGenAI } from "@google/genai";

export const getAI = () => {
  const key1 = process.env.GEMINI_API_KEY?.replace(/['"]/g, '').trim();
  const key2 = process.env.API_KEY?.replace(/['"]/g, '').trim();
  const key3 = process.env.GOOGLE_API_KEY?.replace(/['"]/g, '').trim();
  
  console.log("[Nexus AI] Gemini API Key Status:", {
    GEMINI_API_KEY: key1 ? `Found (${key1.length} chars)` : 'Missing',
    API_KEY: key2 ? `Found (${key2.length} chars)` : 'Missing',
    GOOGLE_API_KEY: key3 ? `Found (${key3.length} chars)` : 'Missing'
  });

  let apiKey = (key1 && key1 !== 'undefined' && key1 !== 'null' && key1 !== '') ? key1 : 
                 (key2 && key2 !== 'undefined' && key2 !== 'null' && key2 !== '') ? key2 :
                 (key3 && key3 !== 'undefined' && key3 !== 'null' && key3 !== '') ? key3 : null;

  // Only block obvious template placeholders
  const blockedPlaceholders = [
    'MY_GEMINI_API_KEY', 
    'YOUR_GEMINI_API_KEY', 
    'TODO_KEYHERE', 
    'ENTER_YOUR_KEY',
    'PASTE_YOUR_KEY_HERE',
    'placeholder'
  ];
  
  if (apiKey && (blockedPlaceholders.includes(apiKey) || apiKey.length < 10)) {
    console.warn(`[Nexus AI] Invalid or placeholder Gemini key detected: "${apiKey}". Blocking.`);
    apiKey = null;
  }

  if (!apiKey) {
    throw new Error("Gemini API key is missing. Lütfen Secrets panelinden GEMINI_API_KEY değerini ayarlayın ve 'Apply changes' butonuna basın.");
  }
  
  return new GoogleGenAI({ apiKey });
};
