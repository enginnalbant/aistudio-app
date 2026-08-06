import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Bot,
  User,
  Send,
  Sparkles,
  Settings,
  Plus,
  Trash2,
  Paperclip,
  Cpu,
  Terminal,
  RefreshCw,
  Sliders,
  FileText,
  MessageSquare,
  BookOpen,
  Check,
  Zap,
  Globe,
  Database,
  Layers,
  ChevronDown,
  Copy,
  ExternalLink
} from 'lucide-react';

interface OpenWebUiCardToolProps {
  showToast: (title: string, message: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model: string;
}

interface ModelPreset {
  id: string;
  name: string;
  size: string;
  tag: string;
  provider: 'Ollama' | 'OpenAI' | 'Gemini' | 'Custom';
  status: 'Ready' | 'Loading' | 'Downloaded';
}

const AVAILABLE_MODELS: ModelPreset[] = [
  { id: 'llama3.2:latest', name: 'Llama 3.2 8B', size: '4.7 GB', tag: 'Meta AI', provider: 'Ollama', status: 'Ready' },
  { id: 'deepseek-r1:7b', name: 'DeepSeek R1 7B', size: '4.1 GB', tag: 'Reasoning', provider: 'Ollama', status: 'Ready' },
  { id: 'mistral:7b-instruct', name: 'Mistral 7B Instruct', size: '4.1 GB', tag: 'Fast', provider: 'Ollama', status: 'Ready' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', size: 'Cloud API', tag: 'Multimodal', provider: 'Gemini', status: 'Ready' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', size: 'Cloud API', tag: 'OpenAI', provider: 'OpenAI', status: 'Ready' },
];

export const OpenWebUiCardTool: React.FC<OpenWebUiCardToolProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'models' | 'documents' | 'settings'>('chat');
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:latest');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('Sen Open WebUI üzerinde çalışan yardımsever bir yapay zeka asistanısın.');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:8080');
  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);
  const [documents, setDocuments] = useState<{ id: string; name: string; size: string; date: string }[]>([
    { id: 'doc-1', name: 'APEX_OS_Sistem_Mimarisi.pdf', size: '1.2 MB', date: 'Bugün 10:30' },
    { id: 'doc-2', name: 'Finansal_Raporlar_2026.xlsx', size: '840 KB', date: 'Dün 16:45' }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Merhaba! Ben **Open WebUI** entegre yapay zeka istemciniz. Yerel modelleriniz (Ollama, Llama, DeepSeek) veya bulut API\'leriniz ile sorunsuz çalışmaya hazırım. Size nasıl yardımcı olabilirim?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'llama3.2:latest'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userText = inputMessage.trim();
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: selectedModel
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setIsGenerating(true);

    // Simulated AI response from Open WebUI
    setTimeout(() => {
      let aiText = '';
      if (userText.toLowerCase().includes('merhaba') || userText.toLowerCase().includes('selam')) {
        aiText = `Selamlar! **Open WebUI (${selectedModel})** aktif. Yerel sunucu yanıt süresi: ~12ms. Hangi görevi yürütmek istersiniz?`;
      } else if (userText.toLowerCase().includes('kod') || userText.toLowerCase().includes('python') || userText.toLowerCase().includes('js')) {
        aiText = `İşte talep ettiğiniz kod örneği:\n\`\`\`python\n# Open WebUI API Client\nimport requests\n\nresponse = requests.post('${serverUrl}/api/chat',\n    json={'model': '${selectedModel}', 'messages': [{'role': 'user', 'content': '${userText}'}]}\n)\nprint(response.json())\n\`\`\`\nBaşarıyla derlendi ve test edildi!`;
      } else if (userText.toLowerCase().includes('model')) {
        aiText = `Şu anda varsayılan model **${selectedModel}** olarak ayarlandı. Dilerseniz modeller sekmesinden DeepSeek R1, Mistral 7B veya Gemini 2.5 Flash ile değiştirebilirsiniz.`;
      } else {
        aiText = `**[Open WebUI Core - ${selectedModel}]**\n\n"${userText}" sorunuz işlendi. Bağlam belleği (%24 bellek kullanımı) optimize edildi. Sistem çalışma süresi kesintisiz devam ediyor.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleAddDocument = () => {
    const name = prompt('Belge adı girin:', 'Yeni_Dokuman.txt');
    if (name) {
      setDocuments(prev => [
        { id: `doc-${Date.now()}`, name, size: '256 KB', date: 'Şimdi' },
        ...prev
      ]);
      showToast('Belge Eklendi', `${name} Open WebUI Vektör Hafızasına eklendi.`);
    }
  };

  return (
    <div className="w-full bento-card layer-4 bg-gradient-to-b from-skel-obsidian/90 via-black/85 to-skel-obsidian/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/20 overflow-hidden shadow-[0_30px_75px_-15px_rgba(0,0,0,0.85)] text-pure-white transition-all duration-300 hover:border-white/30 subpixel-antialiased relative group" data-layer="4">
      {/* Specular Edge Top Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      
      {/* Open WebUI Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-black/70 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-focus-neon via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-focus-neon/25 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-black/90 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-focus-neon" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-display font-bold tracking-wide text-white drop-shadow-sm">Open WebUI</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isServerOnline ? 'Çalışıyor (Active)' : 'Offline'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-300">Yerel AI Modelleri & LLM Yönetim İstemcisi</p>
          </div>
        </div>

        {/* Model Dropdown & Server URL */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs shadow-inner hover:border-focus-neon/40 transition-colors">
            <Cpu className="w-3.5 h-3.5 text-focus-neon shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                showToast('Model Değiştirildi', `Aktif model: ${e.target.value}`);
              }}
              className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none cursor-pointer pr-1"
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id} className="bg-neutral-900 text-white font-mono">
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 shadow-inner">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>{serverUrl}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-black/50 border-b border-white/10 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
            activeTab === 'chat'
              ? 'bg-focus-neon/20 text-focus-neon border border-focus-neon/50 font-bold shadow-md shadow-focus-neon/10'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Sohbet (Chat)</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
            activeTab === 'models'
              ? 'bg-focus-neon/20 text-focus-neon border border-focus-neon/50 font-bold shadow-md shadow-focus-neon/10'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Modeller ({AVAILABLE_MODELS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
            activeTab === 'documents'
              ? 'bg-focus-neon/20 text-focus-neon border border-focus-neon/50 font-bold shadow-md shadow-focus-neon/10'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Vektör Hafızası ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
            activeTab === 'settings'
              ? 'bg-focus-neon/20 text-focus-neon border border-focus-neon/50 font-bold shadow-md shadow-focus-neon/10'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Ayarlar & İstem (Prompt)</span>
        </button>
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="p-3.5 sm:p-4 min-h-[320px] max-h-[480px] flex flex-col justify-between overflow-y-auto no-scrollbar bg-black/30">
        
        {/* TAB 1: CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full space-y-3 justify-between">
            {/* Chat Messages */}
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-focus-neon/20 border border-focus-neon/40 text-focus-neon flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-focus-neon/25 to-indigo-600/30 text-white border border-focus-neon/40 rounded-tr-none'
                      : 'bg-black/60 text-white border border-white/15 rounded-tl-none backdrop-blur-md'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] text-zinc-300 border-b border-white/10 pb-1">
                      <span className="font-mono font-bold text-focus-neon">
                        {msg.role === 'user' ? 'Kullanıcı' : msg.model}
                      </span>
                      <span className="text-zinc-400 font-mono">{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-zinc-100 font-normal">
                      {msg.content}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-2.5 items-center text-xs text-focus-neon font-mono animate-pulse">
                  <Bot className="w-4 h-4 animate-spin text-focus-neon" />
                  <span>Open WebUI ({selectedModel}) yanıt üretiyor...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Controls */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`${selectedModel} modeline bir mesaj veya komut yazın...`}
                  className="flex-1 bg-black/70 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-focus-neon transition-all font-sans shadow-inner"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isGenerating}
                  className="bg-focus-neon hover:bg-focus-neon/80 disabled:opacity-40 text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-focus-neon/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Gönder</span>
                </button>
              </div>

              {/* Quick Prompts */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[10px] text-zinc-300 font-medium shrink-0">Hızlı İstekler:</span>
                {[
                  'Bana bir Python örneği yaz',
                  'Sistem özetini oluştur',
                  'Model performans testi yap'
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(promptText)}
                    className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 rounded-lg text-zinc-200 hover:text-white whitespace-nowrap transition-colors cursor-pointer font-medium"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MODELS */}
        {activeTab === 'models' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-focus-neon" />
                Yüklü LLM Modelleri & API Entegrasyonları
              </h4>
              <button
                onClick={() => showToast('Model Taraması', 'Ollama yerel modelleri tarandı.')}
                className="text-[11px] bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 rounded-lg text-zinc-200 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Yenile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setActiveTab('chat');
                    showToast('Model Seçildi', `${model.name} sohbet için aktif edildi.`);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedModel === model.id
                      ? 'bg-focus-neon/20 border-focus-neon text-white shadow-lg shadow-focus-neon/15 backdrop-blur-md'
                      : 'bg-black/40 border-white/10 hover:border-white/30 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-display text-white">{model.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-focus-neon font-bold">
                        {model.provider}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-300 flex items-center gap-2 font-mono">
                      <span>{model.size}</span>
                      <span>•</span>
                      <span>{model.tag}</span>
                    </div>
                  </div>

                  {selectedModel === model.id ? (
                    <div className="w-5 h-5 rounded-full bg-focus-neon text-black flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-focus-neon font-bold hover:underline">Seç</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTS / RAG */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-focus-neon" />
                Vektör Veritabanı & Bilgi Bitişikleri (RAG)
              </h4>
              <button
                onClick={handleAddDocument}
                className="text-[11px] bg-focus-neon/20 hover:bg-focus-neon/30 border border-focus-neon/40 text-focus-neon px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Belge Ekle</span>
              </button>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/15 flex items-center justify-between text-xs hover:border-white/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-bold text-white">{doc.name}</div>
                      <div className="text-[10px] text-zinc-300 font-mono">{doc.size} • {doc.date}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDocuments(prev => prev.filter(d => d.id !== doc.id));
                      showToast('Silindi', `${doc.name} hafızadan kaldırıldı.`);
                    }}
                    className="p-1 rounded text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-3 text-xs">
            <div className="pb-2 border-b border-white/10 font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-focus-neon" />
              Open WebUI Sistem & Model Parametreleri
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">Sistem İstem Metni (System Prompt):</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-black/70 border border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-focus-neon font-sans"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-300 mb-1 font-mono">
                  <span>Sıcaklık (Temperature):</span>
                  <span className="text-focus-neon font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-focus-neon cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">Open WebUI Sunucu Adresi:</label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-focus-neon font-mono"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
