var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/services/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
var supabaseUrl, supabaseKey, supabase;
var init_supabaseClient = __esm({
  "src/services/supabaseClient.ts"() {
    dotenv.config();
    supabaseUrl = process.env.SUPABASE_URL || "";
    supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KE || "";
    supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
    if (supabase) {
      console.log("Supabase client initialized");
    } else {
      console.log("Supabase credentials not found, running with local SQLite only");
    }
  }
});

// src/services/dbService.ts
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
var db, SQLiteDatabaseService, SupabaseDatabaseService, getDatabaseService;
var init_dbService = __esm({
  "src/services/dbService.ts"() {
    init_supabaseClient();
    db = new Database("local.db");
    SQLiteDatabaseService = class {
      // SQLite implementation (minimal for demo, mostly returns empty for new tables)
      async getAccounts() {
        return db.prepare("SELECT * FROM accounts").all();
      }
      async getStocks() {
        return db.prepare("SELECT * FROM stocks").all();
      }
      async getJobs() {
        return db.prepare("SELECT * FROM jobs").all();
      }
      async getInvoices() {
        return [];
      }
      async getPayments() {
        return db.prepare("SELECT * FROM payments").all();
      }
      async getShipments() {
        return db.prepare("SELECT * FROM shipments").all();
      }
      async getBudgets() {
        return [];
      }
      async getPlanner(date) {
        return [];
      }
      async getNotes() {
        return db.prepare("SELECT * FROM notes").all();
      }
      async getEvents() {
        return db.prepare("SELECT * FROM events").all();
      }
      async getNotifications() {
        return db.prepare("SELECT * FROM notifications").all();
      }
      async getMedia() {
        return [];
      }
      async getSettings() {
        return db.prepare("SELECT * FROM settings").all();
      }
      async getAIProfile() {
        return db.prepare("SELECT * FROM ai_profiles LIMIT 1").get() || null;
      }
      async getAIConversations() {
        return db.prepare("SELECT * FROM ai_conversations ORDER BY updated_at DESC").all();
      }
      async getAIMessages(conversationId) {
        return db.prepare("SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC").all(conversationId);
      }
      async getAIMemories(category) {
        if (category) return db.prepare("SELECT * FROM ai_memories WHERE category = ? ORDER BY last_accessed DESC").all(category);
        return db.prepare("SELECT * FROM ai_memories ORDER BY last_accessed DESC").all();
      }
      async getAIInsights() {
        return db.prepare("SELECT * FROM ai_insights ORDER BY created_at DESC").all();
      }
      async getAITasks() {
        return db.prepare("SELECT * FROM ai_tasks ORDER BY due_at ASC").all();
      }
      async getAILearningData() {
        return db.prepare("SELECT * FROM ai_learning_data").all();
      }
      async getAISystemSnapshots() {
        return db.prepare("SELECT * FROM ai_system_snapshots ORDER BY created_at DESC").all();
      }
      async getAIActionHistory() {
        return db.prepare("SELECT * FROM ai_action_history ORDER BY created_at DESC").all();
      }
      from(table) {
        return {
          select: async () => db.prepare(`SELECT * FROM ${table}`).all(),
          insert: async (data) => this.insert(table, data),
          update: async (id, data) => this.update(table, id, data),
          delete: async (id) => this.delete(table, id),
          eq: () => ({})
          // Minimal mock
        };
      }
      async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data).map((v) => typeof v === "object" && v !== null ? JSON.stringify(v) : v);
        const placeholders = keys.map(() => "?").join(", ");
        const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
        return db.prepare(sql).run(...values);
      }
      async update(table, id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data).map((v) => typeof v === "object" && v !== null ? JSON.stringify(v) : v);
        const setClause = keys.map((k) => `${k} = ?`).join(", ");
        const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
        return db.prepare(sql).run(...values, id);
      }
      async delete(table, id) {
        db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
        return true;
      }
      async query(table, filter) {
        let sql = `SELECT * FROM ${table}`;
        const values = [];
        if (filter) {
          sql += ` WHERE ` + Object.keys(filter).map((k) => `${k} = ?`).join(" AND ");
          values.push(...Object.values(filter));
        }
        return db.prepare(sql).all(...values);
      }
      async createAccount(data) {
        const id = data.id || uuidv4();
        await this.insert("accounts", { ...data, id });
        return id;
      }
    };
    SupabaseDatabaseService = class {
      async getAccounts() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("accounts").select("*").order("name");
        if (error) throw error;
        return data;
      }
      async getStocks() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("stocks").select("*, stock_categories(name)").order("name");
        if (error) throw error;
        return data;
      }
      async getJobs() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("jobs").select("*, accounts(name)").order("date", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getInvoices() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("invoices").select("*, accounts(name)").order("date", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getPayments() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("payments").select("*, accounts(name)").order("date", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getShipments() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("shipments").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getBudgets() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("budgets").select("*");
        if (error) throw error;
        return data;
      }
      async getPlanner(date) {
        if (!supabase) return [];
        let query = supabase.from("daily_planners").select("*");
        if (date) query = query.eq("date", date);
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
      async getNotes() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("notes").select("*").order("updated_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getEvents() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("events").select("*").order("start_time");
        if (error) throw error;
        return data;
      }
      async getNotifications() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getMedia() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("media_items").select("*");
        if (error) throw error;
        return data;
      }
      async getSettings() {
        if (!supabase) return null;
        const { data, error } = await supabase.from("system_settings").select("*").single();
        if (error && error.code !== "PGRST116") throw error;
        return data;
      }
      // AI Assistant
      async getAIProfile() {
        if (!supabase) return null;
        const { data, error } = await supabase.from("ai_profiles").select("*").single();
        if (error && error.code !== "PGRST116") throw error;
        return data;
      }
      async getAIConversations() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("ai_conversations").select("*").order("updated_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getAIMessages(conversationId) {
        if (!supabase) return [];
        const { data, error } = await supabase.from("ai_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
        if (error) throw error;
        return data;
      }
      async getAIMemories(category) {
        if (!supabase) return [];
        let query = supabase.from("ai_memories").select("*");
        if (category) query = query.eq("category", category);
        const { data, error } = await query.order("last_accessed", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getAIInsights() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("ai_insights").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getAITasks() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("ai_tasks").select("*").order("due_at");
        if (error) throw error;
        return data;
      }
      async getAILearningData() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("ai_learning_data").select("*");
        if (error) throw error;
        return data;
      }
      async getAISystemSnapshots() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("ai_system_snapshots").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      async getAIActionHistory() {
        if (!supabase) return [];
        const { data, error } = await supabase.from("ai_action_history").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      from(table) {
        if (!supabase) throw new Error("Supabase not initialized");
        return {
          select: async (columns = "*") => {
            const { data, error } = await supabase.from(table).select(columns);
            if (error) throw error;
            return data;
          },
          insert: async (data) => {
            const { data: result, error } = await supabase.from(table).insert(data).select().single();
            if (error) throw error;
            return result;
          },
          update: async (id, data) => {
            const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select().single();
            if (error) throw error;
            return result;
          },
          delete: async (id) => {
            const { error } = await supabase.from(table).delete().eq("id", id);
            if (error) throw error;
            return true;
          },
          eq: (column, value) => supabase.from(table).select("*").eq(column, value)
        };
      }
      async insert(table, data) {
        if (!supabase) return null;
        const { data: result, error } = await supabase.from(table).insert(data).select().single();
        if (error) throw error;
        return result;
      }
      async update(table, id, data) {
        if (!supabase) return null;
        const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select().single();
        if (error) throw error;
        return result;
      }
      async delete(table, id) {
        if (!supabase) return false;
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        return true;
      }
      async query(table, filter) {
        if (!supabase) return [];
        let query = supabase.from(table).select("*");
        if (filter) {
          Object.keys(filter).forEach((key) => {
            query = query.eq(key, filter[key]);
          });
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
      async createAccount(data) {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data: result, error } = await supabase.from("accounts").insert(data).select().single();
        if (error) throw error;
        return result.id;
      }
    };
    getDatabaseService = () => {
      return process.env.USE_SUPABASE === "true" ? new SupabaseDatabaseService() : new SQLiteDatabaseService();
    };
  }
});

// src/services/aiConfig.ts
import { GoogleGenAI } from "@google/genai";
var getAI;
var init_aiConfig = __esm({
  "src/services/aiConfig.ts"() {
    getAI = () => {
      const key1 = process.env.GEMINI_API_KEY?.replace(/['"]/g, "").trim();
      const key2 = process.env.API_KEY?.replace(/['"]/g, "").trim();
      const key3 = process.env.GOOGLE_API_KEY?.replace(/['"]/g, "").trim();
      console.log("[Nexus AI] Gemini API Key Status:", {
        GEMINI_API_KEY: key1 ? `Found (${key1.length} chars)` : "Missing",
        API_KEY: key2 ? `Found (${key2.length} chars)` : "Missing",
        GOOGLE_API_KEY: key3 ? `Found (${key3.length} chars)` : "Missing"
      });
      let apiKey = key1 && key1 !== "undefined" && key1 !== "null" && key1 !== "" ? key1 : key2 && key2 !== "undefined" && key2 !== "null" && key2 !== "" ? key2 : key3 && key3 !== "undefined" && key3 !== "null" && key3 !== "" ? key3 : null;
      const blockedPlaceholders = [
        "MY_GEMINI_API_KEY",
        "YOUR_GEMINI_API_KEY",
        "TODO_KEYHERE",
        "ENTER_YOUR_KEY",
        "PASTE_YOUR_KEY_HERE",
        "placeholder"
      ];
      if (apiKey && (blockedPlaceholders.includes(apiKey) || apiKey.length < 10)) {
        console.warn(`[Nexus AI] Invalid or placeholder Gemini key detected: "${apiKey}". Blocking.`);
        apiKey = null;
      }
      if (!apiKey) {
        throw new Error("Gemini API key is missing. L\xFCtfen Secrets panelinden GEMINI_API_KEY de\u011Ferini ayarlay\u0131n ve 'Apply changes' butonuna bas\u0131n.");
      }
      return new GoogleGenAI({ apiKey });
    };
  }
});

// src/services/perplexityService.ts
var perplexityService_exports = {};
__export(perplexityService_exports, {
  PerplexityService: () => PerplexityService,
  perplexityService: () => perplexityService
});
var PerplexityService, perplexityService;
var init_perplexityService = __esm({
  "src/services/perplexityService.ts"() {
    PerplexityService = class {
      getApiKey() {
        const key = process.env.PERPLEXITY_API_KEY?.replace(/['"]/g, "").trim() || null;
        const blocked = ["MY_PERPLEXITY_API_KEY", "TODO_KEYHERE", "YOUR_KEY", "placeholder"];
        if (key && (blocked.includes(key) || key.length < 10)) {
          return null;
        }
        return key;
      }
      async search(query) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
          throw new Error("Perplexity API anahtar\u0131 eksik veya ge\xE7ersiz. L\xFCtfen Secrets panelinden PERPLEXITY_API_KEY de\u011Ferini ayarlay\u0131n.");
        }
        try {
          const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "sonar-reasoning-pro",
              messages: [
                { role: "system", content: "Be precise and concise." },
                { role: "user", content: query }
              ]
            })
          });
          if (!response.ok) {
            if (response.status === 401) {
              throw new Error("Perplexity API Yetkilendirme Hatas\u0131: Ge\xE7ersiz API anahtar\u0131. L\xFCtfen anahtar\u0131n\u0131z\u0131 kontrol edin.");
            }
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Perplexity API Hatas\u0131: ${error.message || response.statusText}`);
          }
          const data = await response.json();
          return data.choices[0].message.content;
        } catch (err) {
          console.error("Perplexity Search Error:", err);
          throw err;
        }
      }
    };
    perplexityService = new PerplexityService();
  }
});

// src/services/aiAssistantService.ts
var aiAssistantService_exports = {};
__export(aiAssistantService_exports, {
  NexusAI: () => NexusAI,
  nexusAI: () => nexusAI
});
import { Type } from "@google/genai";
var db2, tools, NexusAI, nexusAI;
var init_aiAssistantService = __esm({
  "src/services/aiAssistantService.ts"() {
    init_dbService();
    init_aiConfig();
    db2 = getDatabaseService();
    tools = {
      functionDeclarations: [
        {
          name: "create_task",
          description: "Sistem i\xE7inde yeni bir g\xF6rev olu\u015Fturur.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "G\xF6revin ba\u015Fl\u0131\u011F\u0131" },
              description: { type: Type.STRING, description: "G\xF6revin detay\u0131" },
              due_at: { type: Type.STRING, description: "Biti\u015F tarihi (ISO format)" },
              priority: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] }
            },
            required: ["title"]
          }
        },
        {
          name: "send_notification",
          description: "Kullan\u0131c\u0131ya sistem bildirimi g\xF6nderir.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Bildirim ba\u015Fl\u0131\u011F\u0131" },
              message: { type: Type.STRING, description: "Bildirim mesaj\u0131" },
              type: { type: Type.STRING, enum: ["info", "success", "warning", "error", "ai"] }
            },
            required: ["title", "message"]
          }
        },
        {
          name: "update_stock_level",
          description: "Bir \xFCr\xFCn\xFCn stok seviyesini veya bilgilerini g\xFCnceller.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              stock_id: { type: Type.STRING, description: "Stok ID'si" },
              current_balance: { type: Type.NUMBER, description: "Yeni stok miktar\u0131" },
              critical_level: { type: Type.NUMBER, description: "Yeni kritik seviye" }
            },
            required: ["stock_id"]
          }
        },
        {
          name: "add_memory",
          description: "Kullan\u0131c\u0131 hakk\u0131nda \xF6nemli bir bilgiyi veya tercihi hat\u0131rlar.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING, description: "Bilgi anahtar\u0131 (\xF6rn: user_preference_theme)" },
              value: { type: Type.STRING, description: "Hat\u0131rlanacak de\u011Fer" },
              category: { type: Type.STRING, description: "Kategori (preference, fact, pattern)" }
            },
            required: ["key", "value"]
          }
        },
        {
          name: "create_note",
          description: "Yeni bir not olu\u015Fturur.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Not ba\u015Fl\u0131\u011F\u0131" },
              content: { type: Type.STRING, description: "Not i\xE7eri\u011Fi" },
              color: { type: Type.STRING, description: "Not rengi (hex)" }
            },
            required: ["title", "content"]
          }
        },
        {
          name: "get_system_data",
          description: "Sistemdeki belirli bir tablodan veri \xE7eker.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              table: {
                type: Type.STRING,
                enum: ["accounts", "stocks", "jobs", "invoices", "payments", "shipments", "events", "notes", "notifications"],
                description: "Veri \xE7ekilecek tablo ad\u0131"
              },
              filter: { type: Type.OBJECT, description: "Filtreleme kriterleri (opsiyonel)" }
            },
            required: ["table"]
          }
        },
        {
          name: "web_search",
          description: "\u0130nternette g\xFCncel bilgi aramas\u0131 yapar (Perplexity AI kullanarak).",
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
    NexusAI = class {
      constructor() {
        this.model = "gemini-3.1-pro-preview";
      }
      /**
       * Main entry point for user interaction.
       * Learns from context, updates memory, and acts on the system.
       */
      async processMessage(userId, conversationId, userMessage, modelType = "local") {
        const [profile, history, memories, systemSummary] = await Promise.all([
          db2.getAIProfile(),
          db2.getAIMessages(conversationId),
          db2.getAIMemories(),
          this.getSystemSummary()
        ]);
        const personality = profile?.personality || "Professional, helpful, and proactive";
        const memoryContext = memories.map((m) => `[Memory: ${m.category}] ${m.key}: ${m.value}`).join("\n");
        let assistantMessage = "";
        let finalModel = this.model;
        if (modelType === "perplexity") {
          const { perplexityService: perplexityService2 } = await Promise.resolve().then(() => (init_perplexityService(), perplexityService_exports));
          assistantMessage = await perplexityService2.search(userMessage);
        } else {
          const systemInstruction = `
        You are ${profile?.name || "Nexus AI"}, the autonomous brain of Nexus OS.
        Personality: ${personality}
        Learning Level: ${profile?.learning_level || 1}/100
        Mode: ${modelType === "local" ? "Autonomous Local AI (Self-Improving)" : "Standard Gemini Mode"}

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

        ${modelType === "local" ? "LOCAL AI SPECIAL INSTRUCTIONS:\n- You are in autonomous mode. Your goal is to optimize the system and learn from every interaction.\n- If you encounter a complex query, use web_search to augment your knowledge.\n- If the user provides feedback, use add_memory to remember it." : ""}

        IMPORTANT:
        - When the user asks to "remember" or "don't forget" something, use 'add_memory'.
        - When the user asks to "remind" or "notify", use 'send_notification' or 'create_task'.
        - Always respond in Turkish unless requested otherwise.
      `;
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
              assistantMessage += `[Sistem \u0130\u015Flemi Ger\xE7ekle\u015Ftirildi: ${call.name}]
`;
              if (call.name === "get_system_data") {
                assistantMessage += `(Veri \xD6zeti: ${Array.isArray(result) ? result.length : 1} kay\u0131t bulundu)
`;
              }
            }
          }
          assistantMessage += response.text || (functionCalls ? "\u0130ste\u011Finizi yerine getirdim." : "\xDCzg\xFCn\xFCm, bir hata olu\u015Ftu.");
          if (modelType === "local") {
            await this.learnFromInteraction(userId, userMessage, assistantMessage);
          }
        }
        await this.logAction(userId, "query", "ai_messages", { conversationId, modelType, messageLength: userMessage.length });
        await db2.insert("ai_messages", {
          conversation_id: conversationId,
          role: "user",
          content: userMessage,
          model: modelType
        });
        await db2.insert("ai_messages", {
          conversation_id: conversationId,
          role: "assistant",
          content: assistantMessage,
          model: modelType
        });
        await db2.update("ai_conversations", conversationId, { updated_at: (/* @__PURE__ */ new Date()).toISOString() });
        return assistantMessage;
      }
      /**
       * Autonomous learning logic for Local AI.
       * Analyzes the interaction to extract patterns or facts.
       */
      async learnFromInteraction(userId, userMessage, assistantMessage) {
        if (userMessage.toLowerCase().includes("tercihim") || userMessage.toLowerCase().includes("sevmem")) {
          await this.learn(userId, `preference_${Date.now()}`, userMessage, "preference");
        }
        if (userMessage.toLowerCase().includes("hat\u0131rla")) {
          const fact = userMessage.replace(/hatırla/gi, "").trim();
          await this.learn(userId, `fact_${Date.now()}`, fact, "fact");
        }
        const profile = await db2.getAIProfile();
        if (profile) {
          const newLevel = Math.min((profile.learning_level || 0) + 0.1, 100);
          await db2.update("ai_profiles", profile.id, { learning_level: newLevel });
        }
      }
      /**
       * Executes the function requested by the AI.
       */
      async executeFunction(userId, name, args) {
        console.log(`Nexus AI executing function: ${name}`, args);
        try {
          switch (name) {
            case "create_task":
              return await db2.insert("ai_tasks", {
                user_id: userId,
                title: args.title,
                description: args.description,
                due_at: args.due_at,
                status: "pending",
                action_type: "task",
                action_payload: args
              });
            case "send_notification":
              return await db2.insert("notifications", {
                user_id: userId,
                title: args.title,
                message: args.message,
                type: args.type || "ai"
              });
            case "update_stock_level":
              return await db2.update("stocks", args.stock_id, {
                current_balance: args.current_balance,
                critical_level: args.critical_level
              });
            case "add_memory":
              return await this.learn(userId, args.key, args.value, args.category);
            case "create_note":
              return await db2.insert("notes", {
                user_id: userId,
                title: args.title,
                content: args.content,
                color: args.color
              });
            case "get_system_data":
              return await db2.query(args.table, args.filter);
            case "web_search":
              const { perplexityService: perplexityService2 } = await Promise.resolve().then(() => (init_perplexityService(), perplexityService_exports));
              return await perplexityService2.search(args.query);
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
      async generateInsight(userId) {
        console.log("Nexus AI Heartbeat: Analyzing system state...");
        const [stocks, jobs, payments] = await Promise.all([
          db2.getStocks(),
          db2.getJobs(),
          db2.getPayments()
        ]);
        const insights = [];
        const criticalStocks = stocks.filter((s) => s.current_balance <= s.critical_level);
        if (criticalStocks.length > 0) {
          insights.push({
            type: "alert",
            title: "Kritik Stok Uyar\u0131s\u0131",
            content: `${criticalStocks.length} \xFCr\xFCn kritik seviyenin alt\u0131nda. Tedarik planlamas\u0131 \xF6nerilir.`,
            data: { criticalStocks },
            priority: "high"
          });
        }
        const overdueJobs = jobs.filter((j) => j.status !== "Tamamland\u0131" && new Date(j.date) < /* @__PURE__ */ new Date());
        if (overdueJobs.length > 0) {
          insights.push({
            type: "prediction",
            title: "Geciken \u0130\u015Fler Analizi",
            content: `${overdueJobs.length} i\u015F planlanan tarihin gerisinde kalm\u0131\u015F g\xF6r\xFCn\xFCyor.`,
            data: { overdueJobs },
            priority: "medium"
          });
        }
        for (const insight of insights) {
          await db2.insert("ai_insights", { ...insight, user_id: userId });
          await db2.insert("notifications", {
            user_id: userId,
            title: `Nexus AI: ${insight.title}`,
            message: insight.content,
            type: "ai"
          });
        }
        await db2.insert("ai_system_snapshots", {
          user_id: userId,
          snapshot_data: {
            total_stocks: stocks.length,
            total_jobs: jobs.length,
            total_payments: payments.length,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      }
      /**
       * Helper to get a text summary of the entire system for the AI's prompt.
       */
      async getSystemSummary() {
        const [accounts, stocks, jobs, payments] = await Promise.all([
          db2.getAccounts(),
          db2.getStocks(),
          db2.getJobs(),
          db2.getPayments()
        ]);
        return `
      - Accounts: ${accounts.length} total.
      - Stocks: ${stocks.length} items. ${stocks.filter((s) => s.current_balance <= s.critical_level).length} critical.
      - Jobs: ${jobs.length} total. ${jobs.filter((j) => j.status === "A\xE7\u0131k").length} open.
      - Payments: ${payments.length} transactions recorded.
    `;
      }
      async learn(userId, key, value, category = "general") {
        await db2.insert("ai_memories", {
          user_id: userId,
          key,
          value,
          category,
          last_accessed: (/* @__PURE__ */ new Date()).toISOString()
        });
        await this.logAction(userId, "learn", "ai_memories", { key, category });
      }
      async logAction(userId, action, targetTable, details) {
        await db2.insert("ai_action_history", {
          user_id: userId,
          action,
          target_table: targetTable,
          details
        });
      }
    };
    nexusAI = new NexusAI();
  }
});

// server.ts
init_dbService();
init_supabaseClient();
import dotenv2 from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import Database2 from "better-sqlite3";
import { v4 as uuidv42 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

// src/middleware/api.ts
import rateLimit from "express-rate-limit";
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
  // Trust proxy is handled by Express
});
var errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    status,
    message,
    errors: err.errors || void 0,
    stack: process.env.NODE_ENV === "development" ? err.stack : void 0
  });
};

// src/middleware/validation.ts
import { z } from "zod";
var accountSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["Tedarik\xE7i", "M\xFC\u015Fteri", "Personel", "Ortak", "Di\u011Fer"]),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  tax_number: z.string().optional().nullable(),
  address: z.string().optional().nullable()
});
var stockSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(2).max(100),
  category: z.string().optional().nullable(),
  unit: z.string().min(1),
  purchase_price: z.number().min(0).optional(),
  sale_price: z.number().min(0).optional(),
  critical_level: z.number().min(0).optional()
});
var jobSchema = z.object({
  account_id: z.string().uuid(),
  receipt_no: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.string(),
  status: z.enum(["A\xE7\u0131k", "K\u0131smi", "Tamamland\u0131", "\u0130ptal", "Beklemede"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  description: z.string().optional().nullable()
});

// server.ts
dotenv2.config();
var validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    return next();
  } catch (error) {
    return res.status(400).json({ status: 400, message: "Validation Error", errors: error.errors });
  }
};
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var dbPath = process.env.DB_PATH || "local.db";
var db3 = new Database2(dbPath);
console.log("[System] Checking API Keys...");
console.log("- GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Set" : "Not Set");
console.log("- PERPLEXITY_API_KEY:", process.env.PERPLEXITY_API_KEY ? "Set" : "Not Set");
console.log("- GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Set" : "Not Set");
console.log("- API_KEY:", process.env.API_KEY ? "Set" : "Not Set");
var createNotification = (title, message, type, related_id) => {
  if (!db3) return null;
  const id = uuidv42();
  const date = (/* @__PURE__ */ new Date()).toISOString();
  try {
    db3.prepare("INSERT INTO notifications (id, title, message, date, type, related_id) VALUES (?, ?, ?, ?, ?, ?)").run(id, title, message, date, type, related_id || null);
    return id;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
};
var createEvent = (title, date, type, time, location, description, related_id) => {
  if (!db3) return null;
  const id = uuidv42();
  try {
    db3.prepare(`
      INSERT INTO events (id, title, date, time, location, type, description, related_id, attendees)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, date, time || null, location || null, type, description || null, related_id || null, 0);
    return id;
  } catch (err) {
    console.error("Error creating event:", err);
    return null;
  }
};
async function startServer() {
  console.log("Starting server...");
  try {
    console.log("Database initialized successfully");
    db3.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        series TEXT,
        status TEXT DEFAULT 'Aktif'
      );

      CREATE TABLE IF NOT EXISTS stocks (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        status TEXT DEFAULT 'Aktif'
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        receipt_no TEXT NOT NULL,
        date TEXT NOT NULL,
        account_id TEXT NOT NULL,
        type TEXT NOT NULL, -- 'OUTGOING' or 'INCOMING'
        status TEXT DEFAULT 'A\xE7\u0131k', -- 'A\xE7\u0131k', 'K\u0131smi', 'Tamamland\u0131'
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS job_items (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        qty INTEGER NOT NULL,
        price REAL DEFAULT 0,
        received_qty INTEGER DEFAULT 0,
        FOREIGN KEY(job_id) REFERENCES jobs(id),
        FOREIGN KEY(stock_id) REFERENCES stocks(id)
      );

      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        job_item_id TEXT,
        stock_id TEXT NOT NULL,
        account_id TEXT,
        type TEXT NOT NULL, -- 'OUT' (to supplier) or 'IN' (from supplier)
        qty INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(job_id) REFERENCES jobs(id),
        FOREIGN KEY(job_item_id) REFERENCES job_items(id),
        FOREIGN KEY(stock_id) REFERENCES stocks(id),
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL, -- 'INCOMING' (Tahsilat) or 'OUTGOING' (Tediye)
        description TEXT,
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT,
        location TEXT,
        attendees INTEGER,
        type TEXT NOT NULL, -- 'meeting', 'deadline', 'reminder', 'production'
        description TEXT,
        related_id TEXT, -- ID of related job or account
        is_completed INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        carrier TEXT,
        tracking_no TEXT,
        status TEXT,
        departure_date TEXT,
        delivery_date TEXT,
        FOREIGN KEY(job_id) REFERENCES jobs(id)
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        total_budget REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT,
        role TEXT,
        content TEXT,
        model TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversation_id) REFERENCES ai_conversations(id)
      );

      CREATE TABLE IF NOT EXISTS ai_memories (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        category TEXT,
        last_accessed TEXT
      );

      CREATE TABLE IF NOT EXISTS ai_insights (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT,
        title TEXT,
        content TEXT,
        data TEXT,
        priority TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        description TEXT,
        due_at TEXT,
        status TEXT,
        action_type TEXT,
        action_payload TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_system_snapshots (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        snapshot_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_action_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT,
        target_table TEXT,
        target_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_learning_data (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        data_type TEXT,
        content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        personality TEXT,
        learning_level INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'completed'
        priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
        related_id TEXT,
        sort_order INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        target_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS daily_planner (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        item_key TEXT NOT NULL,
        time_range TEXT,
        morning_status INTEGER DEFAULT 0, -- 0: empty, 1: completed, 2: partial
        evening_status INTEGER DEFAULT 0, -- 0: empty, 1: completed, 2: partial
        description TEXT,
        detail TEXT,
        sort_order INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        related_id TEXT NOT NULL,
        related_type TEXT NOT NULL, -- 'task', 'note', 'planner', 'reminder'
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_data TEXT NOT NULL, -- Base64 data
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_summaries (
        date TEXT PRIMARY KEY,
        summary TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL, -- 'alert', 'success', 'info', 'system'
        is_read INTEGER DEFAULT 0,
        related_id TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS purchase_requests (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, ordered, received, cancelled
        requested_by TEXT,
        department TEXT,
        priority TEXT DEFAULT 'normal',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchase_request_items (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        qty REAL NOT NULL,
        estimated_price REAL,
        supplier_id TEXT,
        FOREIGN KEY (request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stocks(id),
        FOREIGN KEY (supplier_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_plans (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft', -- draft, confirmed, ordered, cancelled
        title TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchase_plan_items (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        request_item_id TEXT, -- Optional, can be linked to a specific request item
        stock_id TEXT NOT NULL,
        qty REAL NOT NULL,
        estimated_price REAL,
        supplier_id TEXT,
        FOREIGN KEY (plan_id) REFERENCES purchase_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (request_item_id) REFERENCES purchase_request_items(id),
        FOREIGN KEY (stock_id) REFERENCES stocks(id),
        FOREIGN KEY (supplier_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_quotes (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        date TEXT NOT NULL,
        supplier_id TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES purchase_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_quote_items (
        id TEXT PRIMARY KEY,
        quote_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        qty REAL NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (quote_id) REFERENCES purchase_quotes(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open', -- open, completed, cancelled
        supplier_id TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        qty REAL NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id TEXT PRIMARY KEY,
        recipient_name TEXT NOT NULL,
        delivery_address TEXT,
        invoice_address TEXT,
        carrier_name TEXT,
        vehicle_info TEXT,
        logistics_cost_amount REAL,
        logistics_cost_currency TEXT,
        departure_date TEXT,
        delivery_date TEXT,
        scheduled_date TEXT,
        priority TEXT,
        status TEXT,
        transport_method TEXT,
        shipment_type TEXT,
        extra_details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shipment_movements (
        id TEXT PRIMARY KEY,
        shipment_id TEXT NOT NULL,
        status TEXT NOT NULL,
        location TEXT,
        description TEXT,
        movement_date TEXT,
        file_paths TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
      );
    `);
    const columns = [
      { name: "address", type: "TEXT" },
      { name: "tax_office", type: "TEXT" },
      { name: "tax_number", type: "TEXT" },
      { name: "authorized_person", type: "TEXT" },
      { name: "website", type: "TEXT" },
      { name: "description", type: "TEXT" },
      { name: "payment_term_days", type: "INTEGER DEFAULT 0" }
    ];
    const tableInfo = db3.prepare("PRAGMA table_info(accounts)").all();
    const existingColumns = tableInfo.map((c) => c.name);
    columns.forEach((col) => {
      if (!existingColumns.includes(col.name)) {
        try {
          db3.exec(`ALTER TABLE accounts ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added column ${col.name} to accounts table`);
        } catch (err) {
          console.error(`Error adding column ${col.name}:`, err);
        }
      }
    });
    const stockColumns = [
      { name: "critical_level", type: "INTEGER DEFAULT 0" },
      { name: "barcode", type: "TEXT" },
      { name: "brand", type: "TEXT" },
      { name: "model", type: "TEXT" },
      { name: "purchase_price", type: "REAL DEFAULT 0" },
      { name: "sale_price", type: "REAL DEFAULT 0" },
      { name: "tax_rate", type: "INTEGER DEFAULT 18" },
      { name: "location", type: "TEXT" },
      { name: "description", type: "TEXT" },
      { name: "status", type: "TEXT DEFAULT 'Aktif'" }
    ];
    const stockTableInfo = db3.prepare("PRAGMA table_info(stocks)").all();
    const existingStockColumns = stockTableInfo.map((c) => c.name);
    stockColumns.forEach((col) => {
      if (!existingStockColumns.includes(col.name)) {
        try {
          db3.exec(`ALTER TABLE stocks ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added column ${col.name} to stocks table`);
        } catch (err) {
          console.error(`Error adding column ${col.name} to stocks:`, err);
        }
      }
    });
    try {
      db3.prepare("ALTER TABLE daily_planner ADD COLUMN time_range TEXT").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE notes ADD COLUMN target_date TEXT").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE tasks ADD COLUMN sort_order INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE tasks ADD COLUMN is_archived INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE notes ADD COLUMN sort_order INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE notes ADD COLUMN is_archived INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE daily_planner ADD COLUMN sort_order INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE daily_planner ADD COLUMN is_archived INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE events ADD COLUMN sort_order INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE events ADD COLUMN is_archived INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    try {
      db3.prepare("ALTER TABLE events ADD COLUMN is_completed INTEGER DEFAULT 0").run();
    } catch (e) {
      if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
    }
    const plannerColumnsToAdd = [
      { name: "priority", type: "INTEGER DEFAULT 0" },
      { name: "category", type: "TEXT" },
      { name: "estimated_time", type: "TEXT" },
      { name: "actual_time", type: "TEXT" },
      { name: "assigned_to", type: "TEXT" },
      { name: "recurrence", type: "TEXT" },
      { name: "color_tag", type: "TEXT" },
      { name: "sub_tasks", type: "TEXT" },
      { name: "comments", type: "TEXT" },
      { name: "url", type: "TEXT" }
    ];
    const plannerTableInfo = db3.prepare("PRAGMA table_info(daily_planner)").all();
    const existingPlannerColumns = plannerTableInfo.map((c) => c.name);
    for (const col of plannerColumnsToAdd) {
      if (!existingPlannerColumns.includes(col.name)) {
        try {
          db3.prepare(`ALTER TABLE daily_planner ADD COLUMN ${col.name} ${col.type}`).run();
        } catch (e) {
          if (!e.message.includes("duplicate column name")) console.error("Migration error:", e.message);
        }
      }
    }
    const countSettings = db3.prepare("SELECT COUNT(*) as count FROM settings").get();
    if (countSettings.count === 0) {
      const defaultSettings = [
        { key: "user_name", value: "Engin Nalbant" },
        { key: "user_email", value: "enginnalbant9@gmail.com" },
        { key: "user_phone", value: "+90 555 000 00 00" },
        { key: "user_dept", value: "Y\xF6netim" },
        { key: "user_bio", value: "Sistem Y\xF6neticisi ve Nexus OS Kurucusu." },
        { key: "theme", value: "dark" },
        { key: "accent_color", value: "#00F2FF" },
        { key: "sidebar_default", value: "expanded" },
        { key: "font_size", value: "medium" },
        { key: "compact_mode", value: "false" },
        { key: "glass_intensity", value: "medium" },
        { key: "notif_email", value: "true" },
        { key: "notif_push", value: "true" },
        { key: "notif_sound", value: "true" },
        { key: "notif_stock", value: "true" },
        { key: "notif_job", value: "true" },
        { key: "notif_payment", value: "true" },
        { key: "security_2fa", value: "false" },
        { key: "security_timeout", value: "30" },
        { key: "security_login_emails", value: "true" },
        { key: "sys_currency", value: "TRY" },
        { key: "sys_date_format", value: "DD.MM.YYYY" },
        { key: "sys_lang", value: "tr" },
        { key: "sys_autosave", value: "60" },
        { key: "border_radius", value: "medium" },
        { key: "sidebar_style", value: "glass" },
        { key: "card_style", value: "glass" },
        { key: "animation_speed", value: "normal" },
        { key: "background_pattern", value: "mesh" },
        { key: "font_family", value: "sans" },
        { key: "high_contrast", value: "false" },
        { key: "sidebar_position", value: "left" },
        { key: "header_style", value: "glass" },
        { key: "content_width", value: "full" },
        { key: "shadow_intensity", value: "soft" },
        { key: "glow_effects", value: "true" }
      ];
      const insertSetting = db3.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
      defaultSettings.forEach((s) => insertSetting.run(s.key, s.value));
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
  console.log("Starting server...");
  const app = express();
  const PORT = 3e3;
  app.set("trust proxy", 1);
  app.use(helmet({
    contentSecurityPolicy: false
    // Disable CSP for development/iframe compatibility
  }));
  app.use(morgan("dev"));
  app.use(express.json());
  app.use("/api/", apiLimiter);
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.get("/api/docs", (req, res) => res.sendFile(path.join(__dirname, "public", "api-docs.json")));
  app.get("/api/schema", (req, res) => {
    try {
      const tables = db3.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const schema = {};
      for (const table of tables) {
        schema[table.name] = db3.prepare(`PRAGMA table_info(${table.name})`).all();
      }
      res.json(schema);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/shipments", (req, res) => {
    try {
      const shipments = db3.prepare("SELECT * FROM shipments").all();
      const shipmentsWithMovements = shipments.map((s) => ({
        ...s,
        recipient: { name: s.recipient_name, deliveryAddress: s.delivery_address, invoiceAddress: s.invoice_address },
        carrier: { name: s.carrier_name, vehicleInfo: s.vehicle_info },
        logisticsCost: { amount: s.logistics_cost_amount, currency: s.logistics_cost_currency },
        movements: db3.prepare("SELECT * FROM shipment_movements WHERE shipment_id = ? ORDER BY created_at DESC").all(s.id)
      }));
      res.json(shipmentsWithMovements);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/shipments", (req, res) => {
    const { id, recipient, carrier, logisticsCost, departureDate, deliveryDate, scheduledDate, priority, status, transportMethod, shipmentType, extraDetails } = req.body;
    const shipmentId = id || uuidv42();
    try {
      db3.prepare(`
        INSERT INTO shipments (
          id, recipient_name, delivery_address, invoice_address, carrier_name, vehicle_info,
          logistics_cost_amount, logistics_cost_currency, departure_date, delivery_date, scheduled_date,
          priority, status, transport_method, shipment_type, extra_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        shipmentId,
        recipient.name,
        recipient.deliveryAddress,
        recipient.invoiceAddress,
        carrier.name,
        carrier.vehicleInfo,
        logisticsCost.amount,
        logisticsCost.currency,
        departureDate,
        deliveryDate,
        scheduledDate,
        priority,
        status,
        transportMethod,
        shipmentType,
        extraDetails
      );
      res.json({ success: true, id: shipmentId });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/shipments/:id/movements", (req, res) => {
    const { status, location, description, movementDate, filePaths } = req.body;
    const id = uuidv42();
    try {
      db3.prepare(`
        INSERT INTO shipment_movements (id, shipment_id, status, location, description, movement_date, file_paths)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, req.params.id, status, location, description, movementDate, JSON.stringify(filePaths || []));
      res.json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.patch("/api/shipments/:id/status", (req, res) => {
    const { status } = req.body;
    try {
      db3.prepare(`UPDATE shipments SET status = ? WHERE id = ?`).run(status, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.all("/api/events/:id", (req, res, next) => {
    console.log(`REQUEST to /api/events/${req.params.id} [${req.method}]`);
    next();
  });
  app.get("/api/events", (req, res) => {
    console.log("Fetching all events");
    try {
      const events = db3.prepare("SELECT * FROM events").all();
      console.log("Fetched events:", events);
      res.json(events);
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/events/:id", (req, res) => {
    try {
      const event = db3.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
      if (event) res.json(event);
      else res.status(404).json({ error: "Event not found" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/events", (req, res) => {
    const { title, date, time, location, attendees, type, description, related_id } = req.body;
    const id = uuidv42();
    try {
      db3.prepare(`
        INSERT INTO events (id, title, date, time, location, attendees, type, description, related_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, date, time || null, location || null, attendees || null, type, description || null, related_id || null);
      res.json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/events/:id", (req, res) => {
    const { title, date, time, location, attendees, type, description, is_completed, sort_order, is_archived } = req.body;
    try {
      db3.prepare(`
        UPDATE events 
        SET title = COALESCE(?, title), 
            date = COALESCE(?, date), 
            time = COALESCE(?, time), 
            location = COALESCE(?, location), 
            attendees = COALESCE(?, attendees), 
            type = COALESCE(?, type), 
            description = COALESCE(?, description),
            is_completed = COALESCE(?, is_completed),
            sort_order = COALESCE(?, sort_order),
            is_archived = COALESCE(?, is_archived)
        WHERE id = ?
      `).run(title, date, time, location, attendees, type, description, is_completed, sort_order, is_archived, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/events/:id", (req, res) => {
    console.log(`DELETE /api/events/${req.params.id}`);
    try {
      db3.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error(`Error deleting event ${req.params.id}:`, err);
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/accounts", async (req, res) => {
    console.log("GET /api/accounts");
    try {
      const service = getDatabaseService();
      const accounts = await service.getAccounts();
      res.json(accounts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/accounts", validate(accountSchema), async (req, res) => {
    try {
      const service = getDatabaseService();
      const id = await service.createAccount(req.body);
      res.status(201).json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/dashboard/summary", (req, res) => {
    console.log("GET /api/dashboard/summary");
    try {
      const accounts = db3.prepare("SELECT id, payment_term_days FROM accounts").all();
      let totalCost = 0;
      let totalPayment = 0;
      let totalOverdue = 0;
      const now = /* @__PURE__ */ new Date();
      for (const a of accounts) {
        const termDays = a.payment_term_days || 0;
        const jobs = db3.prepare(`
          SELECT j.date, COALESCE(SUM(ji.qty * ji.price), 0) as cost
          FROM jobs j
          LEFT JOIN job_items ji ON j.id = ji.job_id
          WHERE j.account_id = ? AND j.type = 'OUTGOING'
          GROUP BY j.id
        `).all(a.id);
        const paymentsRow = db3.prepare(`
          SELECT COALESCE(SUM(CASE WHEN type = 'OUTGOING' THEN amount ELSE -amount END), 0) as total_payment
          FROM payments
          WHERE account_id = ?
        `).get(a.id);
        const accountPayment = paymentsRow ? paymentsRow.total_payment : 0;
        let accountCost = 0;
        let sumOverdueCosts = 0;
        for (const job of jobs) {
          accountCost += job.cost;
          const dueDate = new Date(new Date(job.date).getTime() + termDays * 24 * 60 * 60 * 1e3);
          if (dueDate <= now) sumOverdueCosts += job.cost;
        }
        totalCost += accountCost;
        totalPayment += accountPayment;
        totalOverdue += Math.max(0, sumOverdueCosts - accountPayment);
      }
      const totalStocks = db3.prepare("SELECT COUNT(*) as count FROM stocks").get();
      const criticalStocks = db3.prepare(`
        SELECT COUNT(*) as count FROM (
          SELECT s.id, s.critical_level, COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.qty ELSE -sm.qty END), 0) as balance
          FROM stocks s
          LEFT JOIN stock_movements sm ON s.id = sm.stock_id
          GROUP BY s.id
          HAVING balance <= s.critical_level
        )
      `).get();
      const openJobs = db3.prepare("SELECT COUNT(*) as count FROM jobs WHERE status != 'Tamamland\u0131'").get();
      const completedJobs = db3.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'Tamamland\u0131'").get();
      const recentMovements = db3.prepare(`
        SELECT sm.*, s.name as stock_name, a.name as account_name
        FROM stock_movements sm
        JOIN stocks s ON sm.stock_id = s.id
        LEFT JOIN accounts a ON sm.account_id = a.id
        ORDER BY sm.date DESC LIMIT 5
      `).all();
      const recentPayments = db3.prepare(`
        SELECT p.*, a.name as account_name
        FROM payments p
        JOIN accounts a ON p.account_id = a.id
        ORDER BY p.date DESC LIMIT 5
      `).all();
      const topAccounts = db3.prepare("SELECT id, name, type FROM accounts").all().map((a) => {
        const cost = db3.prepare(`
          SELECT COALESCE(SUM(ji.qty * ji.price), 0) as cost
          FROM jobs j
          LEFT JOIN job_items ji ON j.id = ji.job_id
          WHERE j.account_id = ? AND j.type = 'OUTGOING'
        `).get(a.id);
        const payment = db3.prepare(`
          SELECT COALESCE(SUM(CASE WHEN type = 'OUTGOING' THEN amount ELSE -amount END), 0) as total_payment
          FROM payments
          WHERE account_id = ?
        `).get(a.id);
        return {
          ...a,
          balance: (cost?.cost || 0) - (payment?.total_payment || 0)
        };
      }).sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).slice(0, 5);
      const topStocks = db3.prepare(`
        SELECT s.id, s.name, s.code, COUNT(sm.id) as movement_count
        FROM stocks s
        LEFT JOIN stock_movements sm ON s.id = sm.stock_id
        GROUP BY s.id
        ORDER BY movement_count DESC LIMIT 5
      `).all();
      const categoryDistribution = db3.prepare(`
        SELECT category as name, COUNT(*) as value
        FROM stocks
        GROUP BY category
      `).all();
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const d = /* @__PURE__ */ new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleDateString("tr-TR", { month: "long" });
        const monthYear = d.toISOString().slice(0, 7);
        const completedCount = db3.prepare(`
          SELECT COUNT(*) as count FROM jobs 
          WHERE status = 'Tamamland\u0131' AND date LIKE ?
        `).get(`${monthYear}%`);
        const openCount = db3.prepare(`
          SELECT COUNT(*) as count FROM jobs 
          WHERE status != 'Tamamland\u0131' AND date LIKE ?
        `).get(`${monthYear}%`);
        monthlyTrends.push({
          name: monthName,
          completed: completedCount.count,
          open: openCount.count
        });
      }
      const upcomingDeadlines = db3.prepare(`
        SELECT j.receipt_no, j.date, a.name as supplier_name, j.status
        FROM jobs j
        JOIN accounts a ON j.account_id = a.id
        WHERE j.status != 'Tamamland\u0131'
        ORDER BY j.date ASC LIMIT 5
      `).all();
      const accountTypeDistribution = db3.prepare(`
        SELECT type as name, COUNT(*) as value
        FROM accounts
        GROUP BY type
      `).all();
      const totalStockValue = db3.prepare(`
        SELECT SUM(balance * purchase_price) as value FROM (
          SELECT s.purchase_price, COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.qty ELSE -sm.qty END), 0) as balance
          FROM stocks s
          LEFT JOIN stock_movements sm ON s.id = sm.stock_id
          GROUP BY s.id
        )
      `).get();
      const criticalStockItems = db3.prepare(`
        SELECT s.id, s.name, s.critical_level, COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.qty ELSE -sm.qty END), 0) as balance
        FROM stocks s
        LEFT JOIN stock_movements sm ON s.id = sm.stock_id
        GROUP BY s.id
        HAVING balance <= s.critical_level
      `).all();
      for (const stock of criticalStockItems) {
        const existingNotif = db3.prepare("SELECT id FROM notifications WHERE related_id = ? AND is_read = 0").get(stock.id);
        if (!existingNotif) {
          createNotification(
            "Kritik Stok Uyar\u0131s\u0131",
            `${stock.name} stok miktar\u0131 kritik seviyenin (${stock.critical_level}) alt\u0131na d\xFC\u015Ft\xFC! G\xFCncel: ${stock.balance}`,
            "alert",
            stock.id
          );
        }
      }
      res.json({
        accounts: {
          total: accounts.length,
          totalCost,
          totalPayment,
          netBalance: totalCost - totalPayment,
          totalOverdue,
          top: topAccounts,
          distribution: accountTypeDistribution
        },
        stocks: {
          total: totalStocks.count,
          critical: criticalStocks.count,
          top: topStocks,
          distribution: categoryDistribution,
          totalValue: totalStockValue.value || 0
        },
        jobs: {
          open: openJobs.count,
          completed: completedJobs.count,
          trends: monthlyTrends,
          upcoming: upcomingDeadlines
        },
        recentActivities: {
          movements: recentMovements,
          payments: recentPayments
        }
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/accounts", async (req, res) => {
    const {
      name,
      type,
      phone,
      email,
      series,
      address,
      tax_office,
      tax_number,
      authorized_person,
      website,
      description,
      payment_term_days
    } = req.body;
    const id = uuidv42();
    const paymentTermDays = parseInt(String(payment_term_days)) || 0;
    try {
      db3.prepare(`
        INSERT INTO accounts (
          id, name, type, phone, email, series, 
          address, tax_office, tax_number, authorized_person, 
          website, description, payment_term_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        name,
        type,
        phone,
        email,
        series,
        address || null,
        tax_office || null,
        tax_number || null,
        authorized_person || null,
        website || null,
        description || null,
        paymentTermDays
      );
      if (supabase) {
        try {
          await supabase.from("accounts").insert([{
            id,
            name,
            type,
            phone,
            email,
            series,
            status: "Aktif",
            address,
            tax_office,
            tax_number,
            authorized_person,
            website,
            description,
            payment_term_days: payment_term_days || 0
          }]);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ id, name, type, phone, email, series, status: "Aktif" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/accounts/:id", async (req, res) => {
    const {
      name,
      type,
      phone,
      email,
      series,
      status,
      address,
      tax_office,
      tax_number,
      authorized_person,
      website,
      description,
      payment_term_days
    } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }
    const paymentTermDays = parseInt(String(payment_term_days)) || 0;
    try {
      const info = db3.prepare(`
        UPDATE accounts SET 
          name = ?, type = ?, phone = ?, email = ?, series = ?, status = ?,
          address = ?, tax_office = ?, tax_number = ?, authorized_person = ?, 
          website = ?, description = ?, payment_term_days = ?
        WHERE id = ?
      `).run(
        name,
        type,
        phone || null,
        email || null,
        series || null,
        status || "Aktif",
        address || null,
        tax_office || null,
        tax_number || null,
        authorized_person || null,
        website || null,
        description || null,
        paymentTermDays,
        req.params.id
      );
      if (info.changes === 0) {
        return res.status(404).json({ error: "Account not found or no changes made" });
      }
      if (supabase) {
        try {
          await supabase.from("accounts").update({
            name,
            type,
            phone,
            email,
            series,
            status,
            address,
            tax_office,
            tax_number,
            authorized_person,
            website,
            description,
            payment_term_days: payment_term_days || 0
          }).eq("id", req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const jobsCount = db3.prepare("SELECT COUNT(*) as count FROM jobs WHERE account_id = ?").get(req.params.id);
      const paymentsCount = db3.prepare("SELECT COUNT(*) as count FROM payments WHERE account_id = ?").get(req.params.id);
      if (jobsCount.count > 0 || paymentsCount.count > 0) {
        return res.status(400).json({ error: "Bu cari hesaba ba\u011Fl\u0131 i\u015Flemler (i\u015F emirleri veya \xF6demeler) bulundu\u011Fu i\xE7in silinemez. L\xFCtfen \xF6nce ba\u011Fl\u0131 i\u015Flemleri silin veya cariyi ar\u015Fivleyin." });
      }
      db3.prepare("DELETE FROM accounts WHERE id = ?").run(req.params.id);
      if (supabase) {
        try {
          await supabase.from("accounts").delete().eq("id", req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/accounts/:id/archive", async (req, res) => {
    try {
      db3.prepare("UPDATE accounts SET status = 'Ar\u015Fivlendi' WHERE id = ?").run(req.params.id);
      if (supabase) {
        try {
          await supabase.from("accounts").update({ status: "Ar\u015Fivlendi" }).eq("id", req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/accounts/bulk", async (req, res) => {
    const accounts = req.body;
    const results = [];
    const insert = db3.prepare(`
      INSERT INTO accounts (
        id, name, type, phone, email, series, 
        address, tax_office, tax_number, authorized_person, 
        website, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db3.transaction((items) => {
      for (const item of items) {
        const id = uuidv42();
        insert.run(
          id,
          item.name,
          item.type,
          item.phone,
          item.email,
          item.series,
          item.address || null,
          item.tax_office || null,
          item.tax_number || null,
          item.authorized_person || null,
          item.website || null,
          item.description || null
        );
        results.push({ ...item, id });
      }
    });
    try {
      transaction(accounts);
      if (supabase) {
        try {
          await supabase.from("accounts").insert(results.map((r) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            phone: r.phone,
            email: r.email,
            series: r.series,
            address: r.address,
            tax_office: r.tax_office,
            tax_number: r.tax_number,
            authorized_person: r.authorized_person,
            website: r.website,
            description: r.description
          })));
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true, count: results.length });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/accounts/summary", (req, res) => {
    try {
      const accounts = db3.prepare("SELECT * FROM accounts").all();
      const result = accounts.map((a) => {
        const termDays = a.payment_term_days || 0;
        const jobs = db3.prepare(`
          SELECT j.date, COALESCE(SUM(ji.qty * ji.price), 0) as cost
          FROM jobs j
          LEFT JOIN job_items ji ON j.id = ji.job_id
          WHERE j.account_id = ? AND j.type = 'OUTGOING'
          GROUP BY j.id
        `).all(a.id);
        const paymentsRow = db3.prepare(`
          SELECT COALESCE(SUM(CASE WHEN type = 'OUTGOING' THEN amount ELSE -amount END), 0) as total_payment
          FROM payments
          WHERE account_id = ?
        `).get(a.id);
        const total_payment = paymentsRow ? paymentsRow.total_payment : 0;
        let total_cost = 0;
        let sum_overdue_costs = 0;
        const now = /* @__PURE__ */ new Date();
        for (const job of jobs) {
          total_cost += job.cost;
          const jobDate = new Date(job.date);
          const dueDate = new Date(jobDate.getTime() + termDays * 24 * 60 * 60 * 1e3);
          if (dueDate <= now) {
            sum_overdue_costs += job.cost;
          }
        }
        const balance = total_cost - total_payment;
        const overdue_debt = Math.max(0, sum_overdue_costs - total_payment);
        return {
          ...a,
          total_cost,
          total_payment,
          balance,
          overdue_debt
        };
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/accounts/:id/transactions", (req, res) => {
    try {
      const transactions = db3.prepare(`
        SELECT 
          j.date, 
          j.receipt_no as document_no, 
          'JOB_ITEM' as record_type,
          j.type as job_type,
          s.name as description,
          ji.qty,
          ji.price,
          (ji.qty * ji.price) as amount
        FROM job_items ji
        JOIN jobs j ON ji.job_id = j.id
        JOIN stocks s ON ji.stock_id = s.id
        WHERE j.account_id = ? AND j.type = 'OUTGOING'
        
        UNION ALL
        
        SELECT 
          date,
          id as document_no,
          'PAYMENT' as record_type,
          type as job_type,
          description,
          1 as qty,
          amount as price,
          amount
        FROM payments
        WHERE account_id = ?
        
        ORDER BY date ASC
      `).all(req.params.id, req.params.id);
      let balance = 0;
      const result = transactions.map((t) => {
        if (t.record_type === "JOB_ITEM") {
          balance += t.amount;
        } else if (t.record_type === "PAYMENT") {
          if (t.job_type === "OUTGOING") {
            balance -= t.amount;
          } else {
            balance += t.amount;
          }
        }
        return {
          ...t,
          balance
        };
      });
      res.json(result.reverse());
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/accounts/:id/payments", async (req, res) => {
    const { amount, type, description, date } = req.body;
    const id = uuidv42();
    try {
      db3.prepare(`
        INSERT INTO payments (id, account_id, date, amount, type, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, req.params.id, date || (/* @__PURE__ */ new Date()).toISOString(), amount, type, description || null);
      if (supabase) {
        try {
          await supabase.from("payments").insert([{
            id,
            account_id: req.params.id,
            date: date || (/* @__PURE__ */ new Date()).toISOString(),
            amount,
            type,
            description
          }]);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/stocks", (req, res) => {
    try {
      const stocks = db3.prepare("SELECT * FROM stocks").all();
      res.json(stocks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/stocks", async (req, res) => {
    const {
      code,
      name,
      category,
      unit,
      critical_level,
      barcode,
      brand,
      model,
      purchase_price,
      sale_price,
      tax_rate,
      location,
      description
    } = req.body;
    const id = uuidv42();
    try {
      db3.prepare(`
        INSERT INTO stocks (
          id, code, name, category, unit, critical_level, 
          barcode, brand, model, purchase_price, sale_price, 
          tax_rate, location, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        code,
        name,
        category,
        unit,
        critical_level || 0,
        barcode || null,
        brand || null,
        model || null,
        purchase_price || 0,
        sale_price || 0,
        tax_rate || 18,
        location || null,
        description || null
      );
      if (supabase) {
        try {
          await supabase.from("stocks").insert([{
            id,
            code,
            name,
            category,
            unit,
            critical_level: critical_level || 0,
            barcode,
            brand,
            model,
            purchase_price,
            sale_price,
            tax_rate,
            location,
            description
          }]);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ id, code, name, category, unit, critical_level });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/stocks/bulk", async (req, res) => {
    const stocks = req.body;
    const results = [];
    const insert = db3.prepare(`
      INSERT INTO stocks (
        id, code, name, category, unit, critical_level,
        barcode, brand, model, purchase_price, sale_price,
        tax_rate, location, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db3.transaction((items) => {
      for (const item of items) {
        const id = uuidv42();
        insert.run(
          id,
          item.code,
          item.name,
          item.category,
          item.unit,
          item.minStock || 0,
          item.barcode || null,
          item.brand || null,
          item.model || null,
          item.purchasePrice || 0,
          item.salePrice || 0,
          item.taxRate || 18,
          item.location || null,
          item.description || null
        );
        results.push({ ...item, id });
      }
    });
    try {
      transaction(stocks);
      if (supabase) {
        try {
          await supabase.from("stocks").insert(results.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            category: r.category,
            unit: r.unit,
            critical_level: r.minStock || 0,
            barcode: r.barcode || null,
            brand: r.brand || null,
            model: r.model || null,
            purchase_price: r.purchasePrice || 0,
            sale_price: r.salePrice || 0,
            tax_rate: r.taxRate || 18,
            location: r.location || null,
            description: r.description || null
          })));
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true, count: results.length });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/stocks/:id", async (req, res) => {
    const {
      code,
      name,
      category,
      unit,
      critical_level,
      barcode,
      brand,
      model,
      purchase_price,
      sale_price,
      tax_rate,
      location,
      description
    } = req.body;
    try {
      db3.prepare(`
        UPDATE stocks SET 
          code = ?, name = ?, category = ?, unit = ?, critical_level = ?, 
          barcode = ?, brand = ?, model = ?, purchase_price = ?, sale_price = ?, 
          tax_rate = ?, location = ?, description = ?
        WHERE id = ?
      `).run(
        code,
        name,
        category,
        unit,
        critical_level || 0,
        barcode || null,
        brand || null,
        model || null,
        purchase_price || 0,
        sale_price || 0,
        tax_rate || 18,
        location || null,
        description || null,
        req.params.id
      );
      if (supabase) {
        try {
          await supabase.from("stocks").update({
            code,
            name,
            category,
            unit,
            critical_level: critical_level || 0,
            barcode,
            brand,
            model,
            purchase_price,
            sale_price,
            tax_rate,
            location,
            description
          }).eq("id", req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/stocks/:id", async (req, res) => {
    try {
      const movementsCount = db3.prepare("SELECT COUNT(*) as count FROM stock_movements WHERE stock_id = ?").get(req.params.id);
      if (movementsCount.count > 0) {
        return res.status(400).json({ error: "Bu sto\u011Fa ba\u011Fl\u0131 hareketler bulundu\u011Fu i\xE7in silinemez. L\xFCtfen \xF6nce hareketleri silin veya sto\u011Fu ar\u015Fivleyin." });
      }
      db3.prepare("DELETE FROM stocks WHERE id = ?").run(req.params.id);
      if (supabase) {
        try {
          await supabase.from("stocks").delete().eq("id", req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/stocks/:id/archive", async (req, res) => {
    try {
      db3.prepare("UPDATE stocks SET status = 'Ar\u015Fivlendi' WHERE id = ?").run(req.params.id);
      if (supabase) {
        try {
          await supabase.from("stocks").update({ status: "Ar\u015Fivlendi" }).eq("id", req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/stocks/:id/adjust", async (req, res) => {
    const { qty, type } = req.body;
    const id = uuidv42();
    const date = (/* @__PURE__ */ new Date()).toISOString();
    try {
      db3.prepare(`
        INSERT INTO stock_movements (id, stock_id, type, qty, date)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, req.params.id, type, qty, date);
      if (supabase) {
        try {
          await supabase.from("stock_movements").insert([{
            id,
            stock_id: req.params.id,
            type,
            qty,
            date
          }]);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/jobs", (req, res) => {
    try {
      const jobs = db3.prepare(`
        SELECT j.*, a.name as supplier_name, a.series as supplier_series 
        FROM jobs j 
        JOIN accounts a ON j.account_id = a.id
        ORDER BY j.date DESC
      `).all();
      const items = db3.prepare(`
        SELECT ji.*, s.name as stock_name, s.code as stock_code 
        FROM job_items ji 
        JOIN stocks s ON ji.stock_id = s.id
      `).all();
      const jobsWithItems = jobs.map((j) => ({
        ...j,
        items: items.filter((i) => i.job_id === j.id)
      }));
      res.json(jobsWithItems);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/jobs/open", (req, res) => {
    try {
      const jobs = db3.prepare(`
        SELECT j.*, a.name as supplier_name, a.series as supplier_series 
        FROM jobs j 
        JOIN accounts a ON j.account_id = a.id
        WHERE j.status IN ('A\xE7\u0131k', 'K\u0131smi') AND j.type = 'OUTGOING'
        ORDER BY j.date DESC
      `).all();
      const items = db3.prepare(`
        SELECT ji.*, s.name as stock_name, s.code as stock_code 
        FROM job_items ji 
        JOIN stocks s ON ji.stock_id = s.id
      `).all();
      const jobsWithItems = jobs.map((j) => ({
        ...j,
        items: items.filter((i) => i.job_id === j.id)
      }));
      res.json(jobsWithItems);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const transaction = db3.transaction(() => {
        db3.prepare("DELETE FROM stock_movements WHERE job_id = ?").run(req.params.id);
        db3.prepare("DELETE FROM job_items WHERE job_id = ?").run(req.params.id);
        db3.prepare("DELETE FROM events WHERE related_id = ?").run(req.params.id);
        db3.prepare("DELETE FROM notifications WHERE related_id = ?").run(req.params.id);
        db3.prepare("DELETE FROM jobs WHERE id = ?").run(req.params.id);
      });
      transaction();
      if (supabase) {
        try {
          await supabase.from("stock_movements").delete().eq("job_id", req.params.id);
          await supabase.from("job_items").delete().eq("job_id", req.params.id);
          await supabase.from("jobs").delete().eq("id", req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/jobs/:id/archive", async (req, res) => {
    try {
      db3.prepare("UPDATE jobs SET status = 'Ar\u015Fivlendi' WHERE id = ?").run(req.params.id);
      if (supabase) {
        try {
          await supabase.from("jobs").update({ status: "Ar\u015Fivlendi" }).eq("id", req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/jobs/outgoing", async (req, res) => {
    const { date, receiptNo, accountId, items } = req.body;
    const jobId = uuidv42();
    const insertJob = db3.prepare("INSERT INTO jobs (id, receipt_no, date, account_id, type, status) VALUES (?, ?, ?, ?, ?, ?)");
    const insertItem = db3.prepare("INSERT INTO job_items (id, job_id, stock_id, qty, price, received_qty) VALUES (?, ?, ?, ?, ?, ?)");
    const insertMovement = db3.prepare("INSERT INTO stock_movements (id, job_id, job_item_id, stock_id, account_id, type, qty, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const insertEvent = db3.prepare("INSERT INTO events (id, title, date, time, type, related_id) VALUES (?, ?, ?, ?, ?, ?)");
    const insertNotification = db3.prepare("INSERT INTO notifications (id, title, message, date, type, related_id) VALUES (?, ?, ?, ?, ?, ?)");
    const transaction = db3.transaction(() => {
      insertJob.run(jobId, receiptNo, date, accountId, "OUTGOING", "A\xE7\u0131k");
      for (const item of items) {
        const itemId = uuidv42();
        insertItem.run(itemId, jobId, item.stockId, item.qty, item.price || 0, 0);
        insertMovement.run(uuidv42(), jobId, itemId, item.stockId, accountId, "OUT", item.qty, date);
      }
      const account = db3.prepare("SELECT name, payment_term_days FROM accounts WHERE id = ?").get(accountId);
      const termDays = account?.payment_term_days || 0;
      const dueDate = new Date(new Date(date).getTime() + termDays * 24 * 60 * 60 * 1e3).toISOString();
      insertEvent.run(uuidv42(), `${receiptNo} - Termin`, dueDate, "17:00", "deadline", jobId);
      insertNotification.run(uuidv42(), "Yeni \u0130\u015F Emri", `${receiptNo} numaral\u0131 i\u015F emri olu\u015Fturuldu. Termin: ${dueDate.split("T")[0]}`, (/* @__PURE__ */ new Date()).toISOString(), "info", jobId);
    });
    transaction();
    if (supabase) {
      try {
        await supabase.from("jobs").insert([{ id: jobId, receipt_no: receiptNo, date, account_id: accountId, type: "OUTGOING", status: "A\xE7\u0131k" }]);
        const jobItemsToInsert = items.map((item) => ({
          id: uuidv42(),
          job_id: jobId,
          stock_id: item.stockId,
          qty: item.qty,
          price: item.price || 0,
          received_qty: 0
        }));
        await supabase.from("job_items").insert(jobItemsToInsert);
        const movementsToInsert = jobItemsToInsert.map((item) => ({
          id: uuidv42(),
          job_id: jobId,
          job_item_id: item.id,
          stock_id: item.stock_id,
          account_id: accountId,
          type: "OUT",
          qty: item.qty,
          date
        }));
        await supabase.from("stock_movements").insert(movementsToInsert);
      } catch (err) {
        console.error("Supabase sync error:", err);
      }
    }
    res.json({ success: true, jobId });
  });
  app.post("/api/jobs/incoming", async (req, res) => {
    const { date, receiptNo, accountId, items } = req.body;
    const jobId = uuidv42();
    const insertJob = db3.prepare("INSERT INTO jobs (id, receipt_no, date, account_id, type, status) VALUES (?, ?, ?, ?, ?, ?)");
    const insertMovement = db3.prepare("INSERT INTO stock_movements (id, job_id, job_item_id, stock_id, account_id, type, qty, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const updateJobItem = db3.prepare("UPDATE job_items SET received_qty = received_qty + ? WHERE id = ?");
    const checkJobStatus = db3.prepare("SELECT SUM(qty) as total_qty, SUM(received_qty) as total_received FROM job_items WHERE job_id = ?");
    const updateJobStatus = db3.prepare("UPDATE jobs SET status = ? WHERE id = ?");
    const transaction = db3.transaction(() => {
      insertJob.run(jobId, receiptNo, date, accountId, "INCOMING", "Tamamland\u0131");
      const updatedOriginalJobIds = /* @__PURE__ */ new Set();
      for (const item of items) {
        insertMovement.run(uuidv42(), jobId, null, item.stockId, accountId, "IN", item.qty, date);
        if (item.originalJobItemId) {
          updateJobItem.run(item.qty, item.originalJobItemId);
          updatedOriginalJobIds.add(item.originalJobId);
        }
      }
      for (const origJobId of updatedOriginalJobIds) {
        const statusCheck = checkJobStatus.get(origJobId);
        if (statusCheck.total_received >= statusCheck.total_qty) {
          updateJobStatus.run("Tamamland\u0131", origJobId);
        } else if (statusCheck.total_received > 0) {
          updateJobStatus.run("K\u0131smi", origJobId);
        }
      }
    });
    transaction();
    if (supabase) {
      try {
        await supabase.from("jobs").insert([{ id: jobId, receipt_no: receiptNo, date, account_id: accountId, type: "INCOMING", status: "Tamamland\u0131" }]);
        const movementsToInsert = items.map((item) => ({
          id: uuidv42(),
          job_id: jobId,
          job_item_id: null,
          stock_id: item.stockId,
          account_id: accountId,
          type: "IN",
          qty: item.qty,
          date
        }));
        await supabase.from("stock_movements").insert(movementsToInsert);
        console.log("Incoming job synced to Supabase. Original job updates pending.");
      } catch (err) {
        console.error("Supabase sync error:", err);
      }
    }
    res.json({ success: true, jobId });
  });
  app.get("/api/stocks/summary", (req, res) => {
    try {
      const summary = db3.prepare(`
        SELECT 
          s.id, s.code, s.name, s.category, s.unit, s.critical_level,
          COALESCE(SUM(CASE WHEN sm.type = 'OUT' THEN sm.qty ELSE 0 END), 0) as total_outgoing,
          COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.qty ELSE 0 END), 0) as total_incoming
        FROM stocks s
        LEFT JOIN stock_movements sm ON s.id = sm.stock_id
        GROUP BY s.id
      `).all();
      const result = summary.map((s) => ({
        ...s,
        balance: s.total_incoming - s.total_outgoing
      }));
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/purchase-requests", (req, res) => {
    try {
      const requests = db3.prepare(`
        SELECT pr.*, 
          (SELECT COUNT(*) FROM purchase_request_items pri WHERE pri.request_id = pr.id) as item_count
        FROM purchase_requests pr 
        ORDER BY pr.created_at DESC
      `).all();
      const result = requests.map((req2) => {
        const items = db3.prepare(`
          SELECT pri.*, s.name as stock_name, s.code as stock_code, s.unit, a.name as supplier_name
          FROM purchase_request_items pri
          LEFT JOIN stocks s ON pri.stock_id = s.id
          LEFT JOIN accounts a ON pri.supplier_id = a.id
          WHERE pri.request_id = ?
        `).all(req2.id);
        return { ...req2, items };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/purchase-requests", (req, res) => {
    const { id, date, status, requested_by, department, priority, notes, items } = req.body;
    try {
      db3.transaction(() => {
        db3.prepare(`
          INSERT INTO purchase_requests (id, date, status, requested_by, department, priority, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, date, status || "pending", requested_by, department, priority || "normal", notes);
        const insertItem = db3.prepare(`
          INSERT INTO purchase_request_items (id, request_id, stock_id, qty, estimated_price, supplier_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const item of items) {
          insertItem.run(
            Math.random().toString(36).substr(2, 9),
            id,
            item.stock_id,
            item.qty,
            item.estimated_price || null,
            item.supplier_id || null
          );
        }
      })();
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/purchase-requests/:id/status", (req, res) => {
    const { status } = req.body;
    try {
      db3.prepare("UPDATE purchase_requests SET status = ? WHERE id = ?").run(status, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/purchase-requests/:id", (req, res) => {
    try {
      db3.prepare("DELETE FROM purchase_requests WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/purchase-plans", (req, res) => {
    try {
      const plans = db3.prepare(`
        SELECT pp.*, 
          (SELECT COUNT(*) FROM purchase_plan_items ppi WHERE ppi.plan_id = pp.id) as item_count
        FROM purchase_plans pp 
        ORDER BY pp.created_at DESC
      `).all();
      const result = plans.map((plan) => {
        const items = db3.prepare(`
          SELECT ppi.*, s.name as stock_name, s.code as stock_code, s.unit, a.name as supplier_name,
                 pri.request_id as source_request_id
          FROM purchase_plan_items ppi
          LEFT JOIN stocks s ON ppi.stock_id = s.id
          LEFT JOIN accounts a ON ppi.supplier_id = a.id
          LEFT JOIN purchase_request_items pri ON ppi.request_item_id = pri.id
          WHERE ppi.plan_id = ?
        `).all(plan.id);
        return { ...plan, items };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/purchase-plans", (req, res) => {
    const { id, date, status, title, notes, items } = req.body;
    const planId = id || uuidv42();
    try {
      db3.transaction(() => {
        db3.prepare(`
          INSERT INTO purchase_plans (id, date, status, title, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(planId, date, status || "draft", title, notes);
        const insertItem = db3.prepare(`
          INSERT INTO purchase_plan_items (id, plan_id, request_item_id, stock_id, qty, estimated_price, supplier_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const item of items) {
          insertItem.run(
            uuidv42(),
            planId,
            item.request_item_id || null,
            item.stock_id,
            item.qty,
            item.estimated_price || null,
            item.supplier_id || null
          );
        }
      })();
      res.json({ success: true, id: planId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/purchase-plans/:id/status", (req, res) => {
    const { status } = req.body;
    try {
      db3.prepare("UPDATE purchase_plans SET status = ? WHERE id = ?").run(status, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/purchase-plans/:id", (req, res) => {
    try {
      db3.prepare("DELETE FROM purchase_plans WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/purchase-quotes", (req, res) => {
    try {
      const quotes = db3.prepare(`
        SELECT pq.*, a.name as supplier_name, pp.title as plan_title
        FROM purchase_quotes pq
        LEFT JOIN accounts a ON pq.supplier_id = a.id
        LEFT JOIN purchase_plans pp ON pq.plan_id = pp.id
        ORDER BY pq.created_at DESC
      `).all();
      const result = quotes.map((quote) => {
        const items = db3.prepare(`
          SELECT pqi.*, s.name as stock_name, s.code as stock_code, s.unit
          FROM purchase_quote_items pqi
          LEFT JOIN stocks s ON pqi.stock_id = s.id
          WHERE pqi.quote_id = ?
        `).all(quote.id);
        return { ...quote, items };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/purchase-quotes", (req, res) => {
    const { plan_id, date, supplier_id, notes, items } = req.body;
    const quoteId = uuidv42();
    try {
      db3.transaction(() => {
        db3.prepare(`
          INSERT INTO purchase_quotes (id, plan_id, date, supplier_id, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(quoteId, plan_id, date, supplier_id, notes);
        const insertItem = db3.prepare(`
          INSERT INTO purchase_quote_items (id, quote_id, stock_id, qty, price)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const item of items) {
          insertItem.run(uuidv42(), quoteId, item.stock_id, item.qty, item.price);
        }
      })();
      res.json({ success: true, id: quoteId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/purchase-orders", (req, res) => {
    try {
      const orders = db3.prepare(`
        SELECT po.*, a.name as supplier_name
        FROM purchase_orders po
        LEFT JOIN accounts a ON po.supplier_id = a.id
        ORDER BY po.created_at DESC
      `).all();
      const result = orders.map((order) => {
        const items = db3.prepare(`
          SELECT poi.*, s.name as stock_name, s.code as stock_code, s.unit
          FROM purchase_order_items poi
          LEFT JOIN stocks s ON poi.stock_id = s.id
          WHERE poi.order_id = ?
        `).all(order.id);
        return { ...order, items };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/purchase-orders", (req, res) => {
    const { date, supplier_id, notes, items } = req.body;
    const orderId = uuidv42();
    try {
      db3.transaction(() => {
        db3.prepare(`
          INSERT INTO purchase_orders (id, date, status, supplier_id, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(orderId, date, "open", supplier_id, notes);
        const insertItem = db3.prepare(`
          INSERT INTO purchase_order_items (id, order_id, stock_id, qty, price)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const item of items) {
          insertItem.run(uuidv42(), orderId, item.stock_id, item.qty, item.price);
        }
      })();
      res.json({ success: true, id: orderId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/purchase-orders/generate", (req, res) => {
    const { plan_id, orders } = req.body;
    try {
      db3.transaction(() => {
        for (const order of orders) {
          const orderId = uuidv42();
          db3.prepare(`
            INSERT INTO purchase_orders (id, date, status, supplier_id, notes)
            VALUES (?, ?, ?, ?, ?)
          `).run(orderId, (/* @__PURE__ */ new Date()).toISOString().split("T")[0], "open", order.supplier_id, order.notes || "");
          const insertItem = db3.prepare(`
            INSERT INTO purchase_order_items (id, order_id, stock_id, qty, price)
            VALUES (?, ?, ?, ?, ?)
          `);
          for (const item of order.items) {
            insertItem.run(uuidv42(), orderId, item.stock_id, item.qty, item.price);
          }
        }
        if (plan_id) {
          db3.prepare("UPDATE purchase_plans SET status = ? WHERE id = ?").run("ordered", plan_id);
        }
      })();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/purchase-orders/:id/status", (req, res) => {
    const { status } = req.body;
    try {
      db3.prepare("UPDATE purchase_orders SET status = ? WHERE id = ?").run(status, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/payments", (req, res) => {
    try {
      const payments = db3.prepare("SELECT p.*, a.name as account_name FROM payments p LEFT JOIN accounts a ON p.account_id = a.id ORDER BY p.date DESC").all();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
  app.post("/api/payments", (req, res) => {
    try {
      const { account_id, date, amount, type, description, category } = req.body;
      const id = uuidv42();
      db3.prepare("INSERT INTO payments (id, account_id, date, amount, type, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, account_id, date, amount, type, description, category);
      res.json({ id, account_id, date, amount, type, description, category });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
  app.get("/api/budgets", (req, res) => {
    try {
      const budgets = db3.prepare("SELECT * FROM budgets ORDER BY period_start DESC").all();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
  app.post("/api/budgets", (req, res) => {
    try {
      const { name, period_start, period_end, total_budget } = req.body;
      const id = uuidv42();
      db3.prepare("INSERT INTO budgets (id, name, period_start, period_end, total_budget) VALUES (?, ?, ?, ?, ?)").run(id, name, period_start, period_end, total_budget);
      res.json({ id, name, period_start, period_end, total_budget });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
  app.get("/api/notifications", (req, res) => {
    try {
      const notifications = db3.prepare("SELECT * FROM notifications ORDER BY date DESC").all();
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/notifications/:id/read", (req, res) => {
    try {
      db3.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/notifications/read-all", (req, res) => {
    try {
      db3.prepare("UPDATE notifications SET is_read = 1").run();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/notifications", (req, res) => {
    try {
      db3.prepare("DELETE FROM notifications").run();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/settings", (req, res) => {
    try {
      const settings = db3.prepare("SELECT * FROM settings").all();
      const settingsMap = settings.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {});
      res.json(settingsMap);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/settings", (req, res) => {
    const settings = req.body;
    const upsert = db3.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    const transaction = db3.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        upsert.run(key, String(value));
      }
    });
    try {
      transaction(settings);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/attachments/:related_id", (req, res) => {
    try {
      const attachments = db3.prepare("SELECT id, file_name, file_type, created_at FROM attachments WHERE related_id = ?").all(req.params.related_id);
      res.json(attachments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/attachments/download/:id", (req, res) => {
    try {
      const attachment = db3.prepare("SELECT * FROM attachments WHERE id = ?").get(req.params.id);
      if (!attachment) return res.status(404).json({ error: "Not found" });
      res.json(attachment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/attachments", (req, res) => {
    const { related_id, related_type, file_name, file_type, file_data } = req.body;
    const id = uuidv42();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      db3.prepare(`
        INSERT INTO attachments (id, related_id, related_type, file_name, file_type, file_data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, related_id, related_type, file_name, file_type, file_data, now);
      res.json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/attachments/:id", (req, res) => {
    try {
      db3.prepare("DELETE FROM attachments WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/planner", (req, res) => {
    try {
      const planner = db3.prepare("SELECT * FROM daily_planner WHERE is_archived = 0 ORDER BY sort_order ASC").all();
      res.json(planner);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/planner/summaries", (req, res) => {
    const { start_date, end_date } = req.query;
    try {
      const summaries = db3.prepare("SELECT date, summary FROM daily_summaries WHERE date BETWEEN ? AND ?").all(start_date, end_date);
      res.json(summaries);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/planner/:date", (req, res) => {
    console.log("Fetching planner for date:", req.params.date);
    if (!db3) {
      console.error("Database not initialized");
      return res.status(500).json({ error: "Database not initialized" });
    }
    try {
      const tableExists = db3.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='daily_planner'").get();
      if (!tableExists) {
        console.error("Table daily_planner does not exist");
        return res.status(500).json({ error: "Table daily_planner does not exist" });
      }
      const planner = db3.prepare("SELECT * FROM daily_planner WHERE date = ? AND is_archived = 0 ORDER BY sort_order ASC").all(req.params.date);
      console.log("Fetched planner:", planner);
      res.json(planner);
    } catch (err) {
      console.error("Error fetching planner:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/planner", (req, res) => {
    const { date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url } = req.body;
    try {
      const existing = db3.prepare("SELECT id FROM daily_planner WHERE date = ? AND item_key = ?").get(date, item_key);
      const id = existing ? existing.id : uuidv42();
      if (existing) {
        db3.prepare(`
          UPDATE daily_planner 
          SET time_range = ?, morning_status = ?, evening_status = ?, description = ?, detail = ?, sort_order = ?, priority = ?, category = ?, estimated_time = ?, actual_time = ?, assigned_to = ?, recurrence = ?, color_tag = ?, sub_tasks = ?, comments = ?, url = ?, is_archived = 0
          WHERE id = ?
        `).run(time_range || "", morning_status || 0, evening_status || 0, description || "", detail || "", sort_order || 0, priority || 0, category || "", estimated_time || "", actual_time || "", assigned_to || "", recurrence || "", color_tag || "", sub_tasks || "", comments || "", url || "", existing.id);
      } else {
        db3.prepare(`
          INSERT INTO daily_planner (id, date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, date, item_key, time_range || "", morning_status || 0, evening_status || 0, description || "", detail || "", sort_order || 0, priority || 0, category || "", estimated_time || "", actual_time || "", assigned_to || "", recurrence || "", color_tag || "", sub_tasks || "", comments || "", url || "");
      }
      createEvent(item_key, date, "production", time_range, null, description, id);
      createNotification("Planlay\u0131c\u0131 Kayd\u0131", `${item_key} planlay\u0131c\u0131ya eklendi.`, "info", id);
      res.json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/planner/:id", (req, res) => {
    const { date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, is_archived, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url } = req.body;
    try {
      db3.prepare(`
        UPDATE daily_planner 
        SET date = COALESCE(?, date), 
            item_key = COALESCE(?, item_key), 
            time_range = COALESCE(?, time_range), 
            morning_status = COALESCE(?, morning_status), 
            evening_status = COALESCE(?, evening_status), 
            description = COALESCE(?, description), 
            detail = COALESCE(?, detail), 
            sort_order = COALESCE(?, sort_order), 
            is_archived = COALESCE(?, is_archived),
            priority = COALESCE(?, priority),
            category = COALESCE(?, category),
            estimated_time = COALESCE(?, estimated_time),
            actual_time = COALESCE(?, actual_time),
            assigned_to = COALESCE(?, assigned_to),
            recurrence = COALESCE(?, recurrence),
            color_tag = COALESCE(?, color_tag),
            sub_tasks = COALESCE(?, sub_tasks),
            comments = COALESCE(?, comments),
            url = COALESCE(?, url)
        WHERE id = ?
      `).run(date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, is_archived, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url, req.params.id);
      if (date || item_key || time_range || description) {
        db3.prepare("UPDATE events SET title = COALESCE(?, title), date = COALESCE(?, date), time = COALESCE(?, time), description = COALESCE(?, description) WHERE related_id = ?").run(item_key, date, time_range, description, req.params.id);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/planner/:id", (req, res) => {
    try {
      db3.prepare("DELETE FROM daily_planner WHERE id = ?").run(req.params.id);
      db3.prepare("DELETE FROM events WHERE related_id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/planner/summary/:date", (req, res) => {
    try {
      const summary = db3.prepare("SELECT summary FROM daily_summaries WHERE date = ?").get(req.params.date);
      res.json({ summary: summary ? summary.summary : "" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/planner/summary", (req, res) => {
    const { date, summary } = req.body;
    try {
      db3.prepare(`
        INSERT OR REPLACE INTO daily_summaries (date, summary)
        VALUES (?, ?)
      `).run(date, summary || "");
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/tasks", (req, res) => {
    try {
      const tasks = db3.prepare("SELECT * FROM tasks WHERE is_archived = 0 ORDER BY sort_order ASC, due_date ASC").all();
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/tasks", (req, res) => {
    const { title, description, due_date, priority, related_id, sort_order } = req.body;
    const id = uuidv42();
    try {
      db3.prepare(`
        INSERT INTO tasks (id, title, description, due_date, priority, related_id, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description || null, due_date || null, priority || "medium", related_id || null, sort_order || 0);
      if (due_date) {
        createEvent(title, due_date, "deadline", null, null, description, id);
        createNotification("Yeni G\xF6rev", `${title} g\xF6revi olu\u015Fturuldu.`, "info", id);
      }
      res.json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/tasks/:id", (req, res) => {
    const { title, description, due_date, status, priority, sort_order, is_archived } = req.body;
    try {
      db3.prepare(`
        UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ?, priority = ?, sort_order = ?, is_archived = ?
        WHERE id = ?
      `).run(title, description, due_date, status, priority, sort_order || 0, is_archived || 0, req.params.id);
      db3.prepare("UPDATE events SET title = ?, date = ?, description = ? WHERE related_id = ?").run(title, due_date, description, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/tasks/:id", (req, res) => {
    try {
      db3.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
      db3.prepare("DELETE FROM events WHERE related_id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/notes", (req, res) => {
    try {
      const notes = db3.prepare("SELECT * FROM notes WHERE is_archived = 0 ORDER BY sort_order ASC, updated_at DESC").all();
      res.json(notes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/notes", (req, res) => {
    const { title, content, target_date, sort_order } = req.body;
    const id = uuidv42();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      db3.prepare(`
        INSERT INTO notes (id, title, content, target_date, created_at, updated_at, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, content || null, target_date || null, now, now, sort_order || 0);
      if (target_date) {
        createEvent(title, target_date, "reminder", null, null, content, id);
      }
      res.json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/notes/:id", (req, res) => {
    const { title, content, target_date, sort_order, is_archived } = req.body;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      db3.prepare(`
        UPDATE notes SET title = ?, content = ?, target_date = ?, updated_at = ?, sort_order = ?, is_archived = ?
        WHERE id = ?
      `).run(title, content, target_date || null, now, sort_order || 0, is_archived || 0, req.params.id);
      db3.prepare("UPDATE events SET title = ?, date = ?, description = ? WHERE related_id = ?").run(title, target_date, content, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/notes/:id", (req, res) => {
    const { title, content, target_date, sort_order, is_archived } = req.body;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      db3.prepare(`
        UPDATE notes SET title = ?, content = ?, target_date = ?, updated_at = ?, sort_order = ?, is_archived = ?
        WHERE id = ?
      `).run(title, content, target_date, now, sort_order || 0, is_archived || 0, req.params.id);
      db3.prepare("UPDATE events SET title = ?, date = ?, description = ? WHERE related_id = ?").run(title, target_date, content, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/notes/:id", (req, res) => {
    try {
      db3.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
      db3.prepare("DELETE FROM events WHERE related_id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/ai/conversations", async (req, res) => {
    try {
      const service = getDatabaseService();
      const conversations = await service.getAIConversations();
      res.json(conversations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/ai/conversations/:id/messages", async (req, res) => {
    try {
      const service = getDatabaseService();
      const messages = await service.getAIMessages(req.params.id);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/ai/chat", async (req, res) => {
    const { userId, conversationId, message, modelType } = req.body;
    try {
      const { nexusAI: nexusAI2 } = await Promise.resolve().then(() => (init_aiAssistantService(), aiAssistantService_exports));
      const response = await nexusAI2.processMessage(userId || "default-user", conversationId, message, modelType);
      res.json({ response });
    } catch (err) {
      console.error("AI Chat Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/ai/memories", async (req, res) => {
    try {
      const service = getDatabaseService();
      const memories = await service.getAIMemories();
      res.json(memories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/ai/insights", async (req, res) => {
    try {
      const service = getDatabaseService();
      const insights = await service.getAIInsights();
      res.json(insights);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/ai/insights/generate", async (req, res) => {
    const { userId } = req.body;
    try {
      const { nexusAI: nexusAI2 } = await Promise.resolve().then(() => (init_aiAssistantService(), aiAssistantService_exports));
      await nexusAI2.generateInsight(userId || "default-user");
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/ai/tasks", async (req, res) => {
    try {
      const service = getDatabaseService();
      const tasks = await service.getAITasks();
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.all("/api/*", (req, res) => {
    console.log(`404 - Unknown API Route: ${req.method} ${req.originalUrl || req.url}`);
    res.status(404).json({ error: "API Route Not Found", method: req.method, url: req.originalUrl || req.url });
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const basePath = process.env.APP_PATH || __dirname;
    app.use(express.static(path.join(basePath, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(basePath, "dist", "index.html"));
    });
  }
  app.use(errorHandler);
  setInterval(async () => {
    try {
      const { nexusAI: nexusAI2 } = await Promise.resolve().then(() => (init_aiAssistantService(), aiAssistantService_exports));
      console.log("AI Heartbeat: Generating insights...");
      await nexusAI2.generateInsight("default-user");
    } catch (err) {
      console.error("AI Heartbeat Error:", err);
    }
  }, 1e3 * 60 * 5);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
