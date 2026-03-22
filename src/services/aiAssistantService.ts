import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { getDatabaseService } from "./dbService";
import { v4 as uuidv4 } from "uuid";
import { getAI } from "./aiConfig";

const db = getDatabaseService();

// Function Declarations for AI Tools
const tools: { functionDeclarations: FunctionDeclaration[] } = {
  functionDeclarations: [
    {
      name: "create_task",
      description: "Sistem içinde yeni bir görev oluşturur.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Görevin başlığı" },
          description: { type: Type.STRING, description: "Görevin detayı" },
          due_at: { type: Type.STRING, description: "Bitiş tarihi (ISO format)" },
          priority: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] }
        },
        required: ["title"]
      }
    },
    {
      name: "send_notification",
      description: "Kullanıcıya sistem bildirimi gönderir.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Bildirim başlığı" },
          message: { type: Type.STRING, description: "Bildirim mesajı" },
          type: { type: Type.STRING, enum: ["info", "success", "warning", "error", "ai"] }
        },
        required: ["title", "message"]
      }
    },
    {
      name: "update_stock_level",
      description: "Bir ürünün stok seviyesini veya bilgilerini günceller.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          stock_id: { type: Type.STRING, description: "Stok ID'si" },
          current_balance: { type: Type.NUMBER, description: "Yeni stok miktarı" },
          critical_level: { type: Type.NUMBER, description: "Yeni kritik seviye" }
        },
        required: ["stock_id"]
      }
    },
    {
      name: "add_memory",
      description: "Kullanıcı hakkında önemli bir bilgiyi veya tercihi hatırlar.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          key: { type: Type.STRING, description: "Bilgi anahtarı (örn: user_preference_theme)" },
          value: { type: Type.STRING, description: "Hatırlanacak değer" },
          category: { type: Type.STRING, description: "Kategori (preference, fact, pattern)" }
        },
        required: ["key", "value"]
      }
    },
    {
      name: "create_note",
      description: "Yeni bir not oluşturur.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Not başlığı" },
          content: { type: Type.STRING, description: "Not içeriği" },
          color: { type: Type.STRING, description: "Not rengi (hex)" }
        },
        required: ["title", "content"]
      }
    },
    {
      name: "get_system_data",
      description: "Sistemdeki belirli bir tablodan veri çeker.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          table: { 
            type: Type.STRING, 
            enum: ["accounts", "stocks", "jobs", "invoices", "payments", "shipments", "events", "notes", "notifications"],
            description: "Veri çekilecek tablo adı"
          },
          filter: { type: Type.OBJECT, description: "Filtreleme kriterleri (opsiyonel)" }
        },
        required: ["table"]
      }
    },
    {
      name: "web_search",
      description: "İnternette güncel bilgi araması yapar (Perplexity AI kullanarak).",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING, description: "Arama terimi veya soru" }
        },
        required: ["query"]
      }
    }
  ]
};

export class NexusAI {
  private model = "gemini-3.1-pro-preview";

  /**
   * Main entry point for user interaction.
   * Learns from context, updates memory, and acts on the system.
   */
  async processMessage(userId: string, conversationId: string, userMessage: string, modelType: 'gemini' | 'perplexity' | 'local' = 'local') {
    // 1. Fetch Context
    const [profile, history, memories, systemSummary] = await Promise.all([
      db.getAIProfile(),
      db.getAIMessages(conversationId),
      db.getAIMemories(),
      this.getSystemSummary()
    ]);

    // 2. Build AI Personality & Knowledge
    const personality = profile?.personality || "Professional, helpful, and proactive";
    const memoryContext = memories.map(m => `[Memory: ${m.category}] ${m.key}: ${m.value}`).join('\n');

    let assistantMessage = "";
    let finalModel = this.model;

    if (modelType === 'perplexity') {
      const { perplexityService } = await import('./perplexityService');
      assistantMessage = await perplexityService.search(userMessage);
    } else {
      // 3. Prepare Prompt for Gemini or Local AI
      const systemInstruction = `
        You are ${profile?.name || 'Nexus AI'}, the autonomous brain of Nexus OS.
        Personality: ${personality}
        Learning Level: ${profile?.learning_level || 1}/100
        Mode: ${modelType === 'local' ? 'Autonomous Local AI (Self-Improving)' : 'Standard Gemini Mode'}

        LONG-TERM MEMORIES:
        ${memoryContext}

        CURRENT SYSTEM STATE:
        ${systemSummary}

        YOUR CAPABILITIES:
        - Analyze any data in the system (accounts, stocks, jobs, finance, etc.)
        - Perform actions using the provided tools (create tasks, send notifications, update stocks, add memories, create notes, get system data, web_search)
        - Search the web for real-time information using 'web_search' (Perplexity AI)
        - Learn from user preferences and store them in memory
        - Provide summaries, reports, and proactive suggestions

        ${modelType === 'local' ? 'LOCAL AI SPECIAL INSTRUCTIONS:\n- You are in autonomous mode. Your goal is to optimize the system and learn from every interaction.\n- If you encounter a complex query, use web_search to augment your knowledge.\n- If the user provides feedback, use add_memory to remember it.' : ''}

        IMPORTANT:
        - When the user asks to "remember" or "don't forget" something, use 'add_memory'.
        - When the user asks to "remind" or "notify", use 'send_notification' or 'create_task'.
        - Always respond in Turkish unless requested otherwise.
      `;

      // 4. Generate Response with Tools
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: this.model,
        contents: [{ parts: [{ text: userMessage }] }],
        config: {
          systemInstruction,
          tools: [tools]
        }
      });

      const functionCalls = response.functionCalls;

      if (functionCalls) {
        for (const call of functionCalls) {
          const result = await this.executeFunction(userId, call.name, call.args);
          assistantMessage += `[Sistem İşlemi Gerçekleştirildi: ${call.name}]\n`;
          
          if (call.name === 'get_system_data') {
            assistantMessage += `(Veri Özeti: ${Array.isArray(result) ? result.length : 1} kayıt bulundu)\n`;
          }
        }
      }

      assistantMessage += response.text || (functionCalls ? "İsteğinizi yerine getirdim." : "Üzgünüm, bir hata oluştu.");
      
      // 5. Local AI Learning Logic
      if (modelType === 'local') {
        await this.learnFromInteraction(userId, userMessage, assistantMessage);
      }
    }

    // 6. Post-Processing: Logging
    await this.logAction(userId, 'query', 'ai_messages', { conversationId, modelType, messageLength: userMessage.length });

    // 7. Save to DB
    await db.insert('ai_messages', {
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
      model: modelType
    });

    await db.insert('ai_messages', {
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantMessage,
      model: modelType
    });

    await db.update('ai_conversations', conversationId, { updated_at: new Date().toISOString() });

    return assistantMessage;
  }

  /**
   * Autonomous learning logic for Local AI.
   * Analyzes the interaction to extract patterns or facts.
   */
  private async learnFromInteraction(userId: string, userMessage: string, assistantMessage: string) {
    // Simple heuristic-based learning for now
    // In a more advanced version, we could use a separate LLM call to extract insights
    
    if (userMessage.toLowerCase().includes('tercihim') || userMessage.toLowerCase().includes('sevmem')) {
      await this.learn(userId, `preference_${Date.now()}`, userMessage, 'preference');
    }
    
    if (userMessage.toLowerCase().includes('hatırla')) {
      const fact = userMessage.replace(/hatırla/gi, '').trim();
      await this.learn(userId, `fact_${Date.now()}`, fact, 'fact');
    }

    // Increment learning level in profile
    const profile = await db.getAIProfile();
    if (profile) {
      const newLevel = Math.min((profile.learning_level || 0) + 0.1, 100);
      await db.update('ai_profiles', profile.id, { learning_level: newLevel });
    }
  }

  /**
   * Executes the function requested by the AI.
   */
  private async executeFunction(userId: string, name: string, args: any) {
    console.log(`Nexus AI executing function: ${name}`, args);
    
    try {
      switch (name) {
        case 'create_task':
          return await db.insert('ai_tasks', {
            user_id: userId,
            title: args.title,
            description: args.description,
            due_at: args.due_at,
            status: 'pending',
            action_type: 'task',
            action_payload: args
          });

        case 'send_notification':
          return await db.insert('notifications', {
            user_id: userId,
            title: args.title,
            message: args.message,
            type: args.type || 'ai'
          });

        case 'update_stock_level':
          return await db.update('stocks', args.stock_id, {
            current_balance: args.current_balance,
            critical_level: args.critical_level
          });

        case 'add_memory':
          return await this.learn(userId, args.key, args.value, args.category);

        case 'create_note':
          return await db.insert('notes', {
            user_id: userId,
            title: args.title,
            content: args.content,
            color: args.color
          });

        case 'get_system_data':
          return await db.query(args.table, args.filter);

        case 'web_search':
          const { perplexityService } = await import('./perplexityService');
          return await perplexityService.search(args.query);

        default:
          throw new Error(`Unknown function: ${name}`);
      }
    } catch (error) {
      console.error(`Error executing AI function ${name}:`, error);
      return { error: String(error) };
    }
  }

  /**
   * Periodically called to scan the system and generate proactive insights.
   */
  async generateInsight(userId: string) {
    console.log('Nexus AI Heartbeat: Analyzing system state...');
    
    const [stocks, jobs, payments] = await Promise.all([
      db.getStocks(),
      db.getJobs(),
      db.getPayments()
    ]);

    const insights = [];

    // 1. Stock Check
    const criticalStocks = stocks.filter(s => s.current_balance <= s.critical_level);
    if (criticalStocks.length > 0) {
      insights.push({
        type: 'alert',
        title: 'Kritik Stok Uyarısı',
        content: `${criticalStocks.length} ürün kritik seviyenin altında. Tedarik planlaması önerilir.`,
        data: { criticalStocks },
        priority: 'high'
      });
    }

    // 2. Job Delay Check
    const overdueJobs = jobs.filter(j => j.status !== 'Tamamlandı' && new Date(j.date) < new Date());
    if (overdueJobs.length > 0) {
      insights.push({
        type: 'prediction',
        title: 'Geciken İşler Analizi',
        content: `${overdueJobs.length} iş planlanan tarihin gerisinde kalmış görünüyor.`,
        data: { overdueJobs },
        priority: 'medium'
      });
    }

    // Save insights and notify
    for (const insight of insights) {
      await db.insert('ai_insights', { ...insight, user_id: userId });
      await db.insert('notifications', {
        user_id: userId,
        title: `Nexus AI: ${insight.title}`,
        message: insight.content,
        type: 'ai'
      });
    }

    // Take a system snapshot
    await db.insert('ai_system_snapshots', {
      user_id: userId,
      snapshot_data: {
        total_stocks: stocks.length,
        total_jobs: jobs.length,
        total_payments: payments.length,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Helper to get a text summary of the entire system for the AI's prompt.
   */
  private async getSystemSummary() {
    const [accounts, stocks, jobs, payments] = await Promise.all([
      db.getAccounts(),
      db.getStocks(),
      db.getJobs(),
      db.getPayments()
    ]);

    return `
      - Accounts: ${accounts.length} total.
      - Stocks: ${stocks.length} items. ${stocks.filter(s => s.current_balance <= s.critical_level).length} critical.
      - Jobs: ${jobs.length} total. ${jobs.filter(j => j.status === 'Açık').length} open.
      - Payments: ${payments.length} transactions recorded.
    `;
  }

  async learn(userId: string, key: string, value: string, category: string = 'general') {
    await db.insert('ai_memories', {
      user_id: userId,
      key,
      value,
      category,
      last_accessed: new Date().toISOString()
    });
    await this.logAction(userId, 'learn', 'ai_memories', { key, category });
  }

  async logAction(userId: string, action: string, targetTable: string, details: any) {
    await db.insert('ai_action_history', {
      user_id: userId,
      action,
      target_table: targetTable,
      details
    });
  }
}

export const nexusAI = new NexusAI();
