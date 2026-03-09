import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  X, 
  Loader2, 
  ChevronDown,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: FileInfo[];
}

interface FileInfo {
  name: string;
  type: string;
  size: number;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Merhaba! Ben Nexus AI. Sistemdeki işleri, stokları veya carileri yönetmenize yardımcı olabilirim. Ne yapmak istersiniz?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileInfo[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContext = async () => {
    const [stocksRes, accountsRes] = await Promise.all([
      fetch('/api/stocks/summary'),
      fetch('/api/accounts/summary')
    ]);
    const stocks = await stocksRes.json();
    const accounts = await accountsRes.json();
    return { stocks, accounts };
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const { stocks, accounts } = await fetchContext();
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";

      const createOutgoingJobTool: FunctionDeclaration = {
        name: "createOutgoingJob",
        parameters: {
          type: Type.OBJECT,
          description: "Cariye ürün göndermek için iş emri oluşturur.",
          properties: {
            accountId: { type: Type.STRING, description: "Cari ID'si" },
            receiptNo: { type: Type.STRING, description: "Fiş/İrsaliye No" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stockId: { type: Type.STRING, description: "Stok ID'si" },
                  qty: { type: Type.NUMBER, description: "Miktar" },
                  price: { type: Type.NUMBER, description: "Birim Fiyat" }
                },
                required: ["stockId", "qty"]
              }
            }
          },
          required: ["accountId", "receiptNo", "items"]
        }
      };

      const createIncomingJobTool: FunctionDeclaration = {
        name: "createIncomingJob",
        parameters: {
          type: Type.OBJECT,
          description: "Cariden ürün gelmesi (iade veya işleme sonrası) için kayıt oluşturur.",
          properties: {
            accountId: { type: Type.STRING, description: "Cari ID'si" },
            receiptNo: { type: Type.STRING, description: "Fiş/İrsaliye No" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stockId: { type: Type.STRING, description: "Stok ID'si" },
                  qty: { type: Type.NUMBER, description: "Miktar" },
                  originalJobId: { type: Type.STRING, description: "Eğer bir iş emrine istinaden geliyorsa o işin ID'si" },
                  originalJobItemId: { type: Type.STRING, description: "O iş emrindeki satırın ID'si" }
                },
                required: ["stockId", "qty"]
              }
            }
          },
          required: ["accountId", "receiptNo", "items"]
        }
      };

      const addStockTool: FunctionDeclaration = {
        name: "addStock",
        parameters: {
          type: Type.OBJECT,
          description: "Yeni bir stok kartı oluşturur.",
          properties: {
            name: { type: Type.STRING, description: "Stok Adı" },
            code: { type: Type.STRING, description: "Stok Kodu" },
            unit: { type: Type.STRING, description: "Birim (Adet, Kg vb.)" },
            category: { type: Type.STRING, description: "Kategori" },
            criticalLevel: { type: Type.NUMBER, description: "Kritik Seviye" }
          },
          required: ["name", "code", "unit"]
        }
      };

      const addAccountTool: FunctionDeclaration = {
        name: "addAccount",
        parameters: {
          type: Type.OBJECT,
          description: "Yeni bir cari kartı oluşturur.",
          properties: {
            name: { type: Type.STRING, description: "Cari Adı" },
            type: { type: Type.STRING, description: "Cari Tipi (Tedarikçi, Müşteri vb.)" },
            phone: { type: Type.STRING, description: "Telefon" },
            email: { type: Type.STRING, description: "E-posta" }
          },
          required: ["name", "type"]
        }
      };

      const generateWidgetTool: FunctionDeclaration = {
        name: "generateWidget",
        parameters: {
          type: Type.OBJECT,
          description: "Kullanıcının isteğine göre dinamik bir arayüz bileşeni (widget) oluşturur.",
          properties: {
            title: { type: Type.STRING, description: "Widget Başlığı" },
            type: { type: Type.STRING, enum: ["chart", "list", "stat"], description: "Widget Tipi" },
            gridSpan: { type: Type.STRING, enum: ["md:col-span-3", "md:col-span-4", "md:col-span-6", "md:col-span-8", "md:col-span-12"], description: "Genişlik" },
            data: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  status: { type: Type.STRING }
                }
              }
            },
            config: {
              type: Type.OBJECT,
              properties: {
                chartType: { type: Type.STRING, enum: ["bar", "line", "pie"] },
                icon: { type: Type.STRING, description: "Lucide ikon adı (örn: Activity, Zap, TrendingUp)" },
                color: { type: Type.STRING, description: "Hex renk kodu" }
              }
            }
          },
          required: ["title", "type", "data", "config"]
        }
      };

      const systemInstruction = `
        Sen Nexus AI adında bir kurumsal ERP asistanısın. 
        Sistemdeki mevcut veriler:
        Stoklar: ${JSON.stringify(stocks.map((s: any) => ({ id: s.id, name: s.name, code: s.code })))}
        Cariler: ${JSON.stringify(accounts.map((a: any) => ({ id: a.id, name: a.name })))}
        
        Kullanıcının doğal dildeki isteklerini anla ve uygun fonksiyonları çağırarak işlemleri gerçekleştir.
        
        ÖNEMLİ: Eğer kullanıcı bir veri analizi, özet veya görselleştirme istiyorsa (örn: "stok dağılımını göster", "en çok borcum olanları listele", "satış trendini çiz"), 'generateWidget' fonksiyonunu kullanarak dinamik bir arayüz oluştur.
        
        Kullanıcıya nazik ve profesyonel davran.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: input,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [createOutgoingJobTool, createIncomingJobTool, addStockTool, addAccountTool, generateWidgetTool] }]
        }
      });

      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          let apiPath = '';
          let payload = call.args;

          if (call.name === 'createOutgoingJob') apiPath = '/api/jobs/outgoing';
          else if (call.name === 'createIncomingJob') apiPath = '/api/jobs/incoming';
          else if (call.name === 'addStock') apiPath = '/api/stocks';
          else if (call.name === 'addAccount') apiPath = '/api/accounts';
          else if (call.name === 'generateWidget') {
            const newWidget = {
              id: `gen-${Date.now()}`,
              type: 'generative',
              title: payload.title,
              description: 'AI tarafından anlık üretilen modül',
              gridSpan: payload.gridSpan || 'md:col-span-4',
              generativeConfig: {
                type: payload.type,
                data: payload.data,
                config: payload.config
              }
            };
            window.dispatchEvent(new CustomEvent('apex:add-widget', { detail: newWidget }));
          }

          if (apiPath) {
            // Add current date if missing for jobs
            if (call.name.includes('Job') && !payload.date) {
              payload.date = new Date().toISOString();
            }
            
            await fetch(apiPath, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        }

        // Generate a confirmation message
        const confirmationResponse = await ai.models.generateContent({
          model,
          contents: `Kullanıcı "${input}" dedi ve ben şu fonksiyonları başarıyla çalıştırdım: ${JSON.stringify(functionCalls)}. Şimdi kullanıcıya işlemin tamamlandığını bildiren kısa ve profesyonel bir yanıt ver.`,
          config: { systemInstruction }
        });

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: confirmationResponse.text || 'İşleminiz başarıyla gerçekleştirildi.',
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.text || 'Anlayamadım, lütfen tekrar eder misiniz?',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'İşlemi gerçekleştirirken bir hata oluştu. Lütfen verileri kontrol edip tekrar deneyin.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((f: File) => ({
        name: f.name,
        type: f.type,
        size: f.size
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
            <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            className="w-[420px] h-[600px] bento-card mb-6 flex flex-col overflow-hidden shadow-2xl border-border-strong bg-bg-card/95 backdrop-blur-xl"
            style={{ 
              borderRadius: '24px',
            }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-bg-app/50 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-bg-card shadow-lg shadow-accent/10">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-text-primary font-black text-base tracking-tight">Nexus AI</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">Sistem Aktif</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl hover:bg-border text-text-secondary hover:text-text-primary transition-all"
              >
                <ChevronDown size={24} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-bg-app/20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-border ${
                      msg.role === 'user' 
                        ? 'bg-bg-card text-text-primary' 
                        : 'bg-accent text-bg-card'
                    }`}>
                      {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-bg-card text-text-primary border border-border rounded-tr-none' 
                        : 'bg-bg-app text-text-primary border border-border rounded-tl-none'
                    }`}>
                      <div className="font-medium">{msg.content}</div>
                      {msg.files && msg.files.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                          {msg.files.map((f, fi) => (
                            <div key={fi} className="flex items-center gap-2 text-[10px] font-bold opacity-80 bg-bg-app px-2 py-1 rounded-lg">
                              <Paperclip size={12} />
                              <span className="truncate">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-4 items-center text-text-secondary text-xs font-bold uppercase tracking-widest">
                    <div className="w-10 h-10 rounded-xl bg-bg-app border border-border flex items-center justify-center text-accent">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                    <span className="animate-pulse">İşleniyor...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-border bg-bg-card">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-app border border-border text-[10px] font-bold text-text-secondary shadow-sm">
                      <Paperclip size={12} />
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(i)} className="hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-bg-app text-text-secondary hover:text-text-primary hover:bg-border transition-all border border-border"
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  multiple 
                />
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Mesajınızı yazın..."
                    className="w-full bg-bg-app border border-border rounded-2xl px-5 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:bg-bg-card transition-all font-medium"
                  />
                </div>
                <button 
                  onClick={handleSend}
                  disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                  className="p-3 rounded-2xl bg-accent text-bg-card hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/10"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-xl group relative ${
          isOpen 
            ? 'bg-accent text-bg-card rotate-180' 
            : 'bg-bg-card text-accent hover:scale-110 hover:shadow-2xl border border-border'
        }`}
      >
        {isOpen ? <ChevronDown size={32} /> : <Sparkles size={32} />}
        {!isOpen && (
          <>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-bg-card animate-bounce shadow-lg" />
            <div className="absolute inset-0 rounded-[1.5rem] bg-accent/5 animate-ping pointer-events-none" />
          </>
        )}
      </button>
    </div>
  );
}
