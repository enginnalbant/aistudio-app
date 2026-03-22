
export class PerplexityService {
  private getApiKey() {
    const key = process.env.PERPLEXITY_API_KEY?.replace(/['"]/g, '').trim() || null;
    const blocked = ['MY_PERPLEXITY_API_KEY', 'TODO_KEYHERE', 'YOUR_KEY', 'placeholder'];
    if (key && (blocked.includes(key) || key.length < 10)) {
      return null;
    }
    return key;
  }

  async search(query: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Perplexity API anahtarı eksik veya geçersiz. Lütfen Secrets panelinden PERPLEXITY_API_KEY değerini ayarlayın.");
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-reasoning-pro',
          messages: [
            { role: 'system', content: 'Be precise and concise.' },
            { role: 'user', content: query }
          ]
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Perplexity API Yetkilendirme Hatası: Geçersiz API anahtarı. Lütfen anahtarınızı kontrol edin.");
        }
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Perplexity API Hatası: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err: any) {
      console.error('Perplexity Search Error:', err);
      throw err;
    }
  }
}

export const perplexityService = new PerplexityService();
