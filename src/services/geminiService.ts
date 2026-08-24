export const geminiService = {
  async searchAI(query: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/quick-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.result) return data.result;
      }
    } catch (e) {
      console.warn('Backend AI search error:', e);
    }
    return "Hava şartlarına uygun kıyafet seçimi yapmanız ve günün planını güncellemeniz önerilir.";
  },

  async assistNote(task: string, content: string): Promise<string> {
    try {
      const response = await fetch('/api/notes/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: task, text: content })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.result) return data.result;
      }
    } catch (e) {
      console.warn('Backend Note Assistant error:', e);
    }
    return content;
  }
};
