import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Terminal,
  Cpu,
  CornerDownLeft,
  X,
  Package,
  BookText,
  Calendar as CalendarIcon,
  Trash2,
  Clock,
  ShieldCheck,
  Plus,
  BookOpen,
  FileText,
  FolderPlus,
  FilePlus,
  ArrowRight,
  Search,
  Check
} from 'lucide-react';
const FALLBACK_NOTEBOOKS = [
  {
    id: 'nb-1',
    title: 'Genel Notlar',
    category: 'Genel',
    pages: [{ id: 'pg-1', title: 'Hoşgeldiniz' }]
  }
];

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  intent?: string;
  pipelineSteps?: string[];
  actionReceipt?: {
    type: 'expense' | 'income' | 'note' | 'notebook' | 'schedule' | 'stock';
    title: string;
    subTitle?: string;
    amount?: number;
    quantity?: number;
    unit?: string;
    time?: string;
    targetModule: string;
    originalId?: string;
  };
}

export interface SlashCommand {
  id: string;
  command: string;
  aliases: string[];
  label: string;
  description: string;
  category: 'not' | 'finans' | 'stok' | 'ajanda' | 'sistem';
  example: string;
  icon: React.ReactNode;
}

interface AiAssistantChatPanelProps {
  expenses: any[];
  incomes: any[];
  stocks: any[];
  memos: any[];
  customSchedule: any[];
  setExpenses: React.Dispatch<React.SetStateAction<any[]>>;
  setIncomes: React.Dispatch<React.SetStateAction<any[]>>;
  setStocks: React.Dispatch<React.SetStateAction<any[]>>;
  setMemos: React.Dispatch<React.SetStateAction<any[]>>;
  setCustomSchedule: React.Dispatch<React.SetStateAction<any[]>>;
  onNavigate?: (moduleId: string) => void;
  showToast: (title: string, message: string) => void;
  currentTime?: Date;
}

export function AiAssistantChatPanel({
  expenses,
  incomes,
  stocks,
  memos,
  customSchedule,
  setExpenses,
  setIncomes,
  setStocks,
  setMemos,
  setCustomSchedule,
  onNavigate,
  showToast,
  currentTime = new Date()
}: AiAssistantChatPanelProps) {
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Merhaba ${userName}! APEX OS AI Komut Merkezi aktif.\n\nYazarak komut çalıştırmak için metin alanına "/" (slash) girin. Örn: \`/not\`, \`/notdefteri\`, \`/gider\`, \`/gelir\`, \`/stok\`, \`/ajanda\`.`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      intent: 'system_welcome',
      pipelineSteps: [
        '1. APEX OS Slash Command Engine v4.0 Aktif',
        '2. Hızlı Notlar & Not Defterleri Entegrasyonu Bağlandı',
        '3. Akıllı Dropdown & Otomatik Tamamlama Hazır'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPipelineTrace, setShowPipelineTrace] = useState(false);
  const [currentPipelineSteps, setCurrentPipelineSteps] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Slash Commands Autocomplete States
  const [showSlashDropdown, setShowSlashDropdown] = useState(false);
  const [selectedCmdIndex, setSelectedCmdIndex] = useState(0);

  // Notebook Wizard Modal States
  const [isNotebookWizardOpen, setIsNotebookWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [notebookList, setNotebookList] = useState<any[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [isCreatingNewNotebook, setIsCreatingNewNotebook] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookCategory, setNewNotebookCategory] = useState('Yazılım & AI');

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isCreatingNewPage, setIsCreatingNewPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const [wizardNoteContent, setWizardNoteContent] = useState('');

  // Define Slash Commands List
  const slashCommands: SlashCommand[] = useMemo(() => [
    {
      id: 'cmd-hizlinot',
      command: '/hizlinot',
      aliases: ['/not', '/hizlinot', '/notlar', '/not-ekle'],
      label: '📝 Hızlı Not Ekle',
      description: 'Hızlı Notlar modülüne anında yeni micro-note ekler',
      category: 'not',
      example: '/hizlinot [Not içeriği]',
      icon: <BookText className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'cmd-notdefteri',
      command: '/notdefteri',
      aliases: ['/notdefteri', '/defter', '/not-defteri', '/deftere-ekle'],
      label: '📖 Not Defterine Ekle',
      description: 'Defter ve sayfa seçerek detaylı ders/araştırma notu ekler',
      category: 'not',
      example: '/notdefteri',
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />
    },
    {
      id: 'cmd-gider',
      command: '/gider',
      aliases: ['/gider', '/harcama', '/odeme'],
      label: '💸 Gider Kaydı Oluştur',
      description: 'Finans modülüne planlı gider harcaması ekler',
      category: 'finans',
      example: '/gider 450 TL Ofis Malzemesi',
      icon: <TrendingDown className="w-4 h-4 text-rose-400" />
    },
    {
      id: 'cmd-gelir',
      command: '/gelir',
      aliases: ['/gelir', '/kazanc', '/tahsilat'],
      label: '📈 Gelir Kaydı Oluştur',
      description: 'Finans modülüne planlı gelir tahsilatı ekler',
      category: 'finans',
      example: '/gelir 15000 TL Proje Hakedişi',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'cmd-stok',
      command: '/stok',
      aliases: ['/stok', '/urun', '/envanter'],
      label: '📦 Stok Kalemi Ekle',
      description: 'Stok listenize yeni ürün veya miktar tanımı yapar',
      category: 'stok',
      example: '/stok 20 Adet Lazer Yazıcı',
      icon: <Package className="w-4 h-4 text-sky-400" />
    },
    {
      id: 'cmd-ajanda',
      command: '/ajanda',
      aliases: ['/ajanda', '/toplanti', '/plan'],
      label: '📅 Günün Programına Ekle',
      description: 'Takvim ve ajandanıza saatli etkinlik planlar',
      category: 'ajanda',
      example: '/ajanda 15:30 Yönetim Toplantısı',
      icon: <CalendarIcon className="w-4 h-4 text-sky-400" />
    },
    {
      id: 'cmd-durum',
      command: '/durum',
      aliases: ['/durum', '/ozet', '/butce', '/sistem'],
      label: '🔍 Bütçe & Stok Analiz Raporu',
      description: 'Finansal bakiye, stok ve notların canlı özetini sunar',
      category: 'sistem',
      example: '/durum',
      icon: <Zap className="w-4 h-4 text-focus-neon" />
    },
    {
      id: 'cmd-temizle',
      command: '/temizle',
      aliases: ['/temizle', '/reset', '/sifirla'],
      label: '🧹 Sohbeti Temizle',
      description: 'Ekrandaki sohbet geçmişini sıfırlar',
      category: 'sistem',
      example: '/temizle',
      icon: <Trash2 className="w-4 h-4 text-rose-400" />
    }
  ], []);

  // Filter Slash Commands dynamically based on input query after "/"
  const filteredCommands = useMemo(() => {
    if (!inputQuery.includes('/')) return [];

    const slashIndex = inputQuery.lastIndexOf('/');
    const queryAfterSlash = inputQuery.slice(slashIndex + 1).toLowerCase().trim();

    if (!queryAfterSlash) return slashCommands;

    return slashCommands.filter(cmd => {
      const matchCommand = cmd.command.toLowerCase().includes(queryAfterSlash);
      const matchAliases = cmd.aliases.some(a => a.toLowerCase().includes(queryAfterSlash));
      const matchLabel = cmd.label.toLowerCase().includes(queryAfterSlash);
      const matchDesc = cmd.description.toLowerCase().includes(queryAfterSlash);
      return matchCommand || matchAliases || matchLabel || matchDesc;
    });
  }, [inputQuery, slashCommands]);

  // Handle Input Changes & Trigger Slash Dropdown
  useEffect(() => {
    if (inputQuery.includes('/')) {
      setShowSlashDropdown(true);
      setSelectedCmdIndex(0);
    } else {
      setShowSlashDropdown(false);
    }
  }, [inputQuery]);

  // Load Notebooks from localStorage for Wizard
  const loadNotebooks = () => {
    const saved = localStorage.getItem('apex_notebooks_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotebookList(parsed);
          return parsed;
        }
      } catch (e) { /* fallback */ }
    }
    setNotebookList(FALLBACK_NOTEBOOKS);
    return FALLBACK_NOTEBOOKS;
  };

  // Open Notebook Wizard
  const openNotebookWizard = (prefilledContent = '') => {
    const list = loadNotebooks();
    setWizardNoteContent(prefilledContent);
    setWizardStep(1);
    setIsCreatingNewNotebook(false);
    setIsCreatingNewPage(false);
    setNewNotebookTitle('');
    setNewPageTitle('');
    if (list.length > 0) {
      setSelectedNotebookId(list[0].id);
      if (list[0].pages && list[0].pages.length > 0) {
        setSelectedPageId(list[0].pages[0].id);
      }
    }
    setIsNotebookWizardOpen(true);
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // System calculations
  const totalIncomes = useMemo(() => incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0), [incomes]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), [expenses]);
  const netBalance = totalIncomes - totalExpenses;
  const criticalStocksCount = useMemo(() => stocks.filter(s => Boolean(s.criticalAlert) || Number(s.currentQuantity) <= Number(s.minQuantity || 0)).length, [stocks]);

  // Execute Slash Command Selection
  const selectSlashCommand = (cmd: SlashCommand) => {
    setShowSlashDropdown(false);

    if (cmd.command === '/notdefteri' || cmd.command === '/defter') {
      setInputQuery('');
      openNotebookWizard('');
      return;
    }

    if (cmd.command === '/temizle') {
      setInputQuery('');
      clearChat();
      return;
    }

    if (cmd.command === '/durum') {
      setInputQuery('');
      executeAiCommand('/durum');
      return;
    }

    // Otherwise place command prefix in input for user to type args
    setInputQuery(`${cmd.command} `);
    inputRef.current?.focus();
  };

  // Handle Keyboard Navigation for Slash Dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSlashDropdown && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCmdIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCmdIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = filteredCommands[selectedCmdIndex];
        if (selected) {
          selectSlashCommand(selected);
        }
        return;
      }
      if (e.key === 'Escape') {
        setShowSlashDropdown(false);
        return;
      }
    }
  };

  // Quick Command Chips
  const handleChipClick = (cmdText: string) => {
    setInputQuery(cmdText);
    executeAiCommand(cmdText);
  };

  // Main Command Execution Pipeline
  const executeAiCommand = async (userText: string) => {
    if (!userText.trim() || isProcessing) return;

    const trimmedMsg = userText.trim();
    setInputQuery('');
    setShowSlashDropdown(false);

    const userMsgId = Date.now().toString();
    const userTimestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const userMsgObj: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: trimmedMsg,
      timestamp: userTimestamp
    };

    setMessages(prev => [...prev, userMsgObj]);
    setIsProcessing(true);

    const steps: string[] = [];
    steps.push(`1. Komut Analizi: "${trimmedMsg}"`);

    const lower = trimmedMsg.toLowerCase();
    let actionDone = false;
    let aiResponseText = '';
    let detectedIntent = 'general_chat';
    let receiptObj: ChatMessage['actionReceipt'] = undefined;

    const amountMatch = trimmedMsg.match(/(\d+[\d.,]*)\s*(tl|₺|lira)?/i);
    const parsedAmount = amountMatch ? parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.')) : null;

    // 1. NOTEBOOK NOTE COMMAND DETECTED (/notdefteri or /defter or notebook request)
    if (lower.startsWith('/notdefteri') || lower.startsWith('/defter') || lower.includes('not defterine ekle')) {
      detectedIntent = 'add_notebook_note';
      steps.push('2. Intent: [Not Defteri Kaydı]');

      // Extract text after /notdefteri or /defter
      const contentPart = trimmedMsg
        .replace(/^\/(notdefteri|defter|not-defteri)/gi, '')
        .replace(/not defterine ekle(:)?/gi, '')
        .trim();

      setIsProcessing(false);
      openNotebookWizard(contentPart);
      return;
    }

    // 2. QUICK NOTE COMMAND (/hizlinot or /not or /notlar)
    else if (lower.startsWith('/hizlinot') || lower.startsWith('/not') || lower.includes('not al') || lower.includes('not ekle') || lower.startsWith('not:')) {
      detectedIntent = 'add_note';
      steps.push('2. Intent: [Hızlı Not Kaydı]');

      let cleanNote = trimmedMsg
        .replace(/^\/(hizlinot|not|notlar|not-ekle)/gi, '')
        .replace(/not\s*(al|ekle|et)?(:)?/gi, '')
        .replace(/hatırlat(:)?/gi, '')
        .trim();

      if (!cleanNote) cleanNote = 'AI Hızlı Not Kaydı';

      const newMemo = {
        id: `memo-${Date.now()}`,
        title: cleanNote.length > 35 ? cleanNote.slice(0, 35) + '...' : cleanNote,
        content: cleanNote,
        category: 'AI Asistan',
        color: 'amber',
        tags: ['asistan', 'hızlı-not'],
        visibility: 'public' as const,
        isPinned: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: { likes: 0, bookmarks: 0 }
      };

      setMemos(prev => [newMemo, ...prev]);

      // Sync to localStorage
      try {
        const currentSaved = localStorage.getItem('apex_memos_v2');
        const parsed = currentSaved ? JSON.parse(currentSaved) : [];
        localStorage.setItem('apex_memos_v2', JSON.stringify([newMemo, ...parsed]));
      } catch (e) { /* silent */ }

      steps.push(`3. Hızlı Notlar Veri Tabanı Güncellendi: "${newMemo.title}"`);

      actionDone = true;
      aiResponseText = `"${cleanNote}" hızlı notunuz Hızlı Notlar modülünüze kaydedildi.`;
      receiptObj = {
        type: 'note',
        title: newMemo.title,
        targetModule: 'notes-quick',
        originalId: newMemo.id
      };
      showToast('📝 Hızlı Not Kaydedildi', `"${newMemo.title}"`);
    }

    // 3. EXPENSE COMMAND (/gider)
    else if (lower.startsWith('/gider') || lower.includes('gider kaydet') || lower.includes('harcama ekle')) {
      detectedIntent = 'add_expense';
      steps.push('2. Intent: [Gider Kaydı]');

      const amt = parsedAmount || 250;
      let cleanTitle = trimmedMsg
        .replace(/^\/gider/gi, '')
        .replace(/gider(i)?\s*(kaydet|ekle)?/gi, '')
        .replace(/\d+[\d.,]*\s*(tl|₺|lira)?/gi, '')
        .replace(/ekle|kaydet|tl|₺/gi, '')
        .trim();

      if (!cleanTitle || cleanTitle.length < 2) cleanTitle = 'Hızlı Gider Kaydı';

      const newExp = {
        id: Date.now().toString(),
        title: cleanTitle,
        amount: amt,
        category: lower.includes('ofis') ? 'Ofis' : lower.includes('fatura') ? 'Fatura' : 'Diğer',
        tags: ['AI-Asistan'],
        date: new Date().toISOString().split('T')[0],
        status: 'Planlı',
        recipient: 'AI Asistan Kaydı',
        notes: `AI Komut ile eklendi: "${trimmedMsg}"`
      };

      setExpenses(prev => [newExp, ...prev]);
      steps.push(`3. Veri Tabanı Güncellendi: ₺${amt} - ${cleanTitle}`);

      actionDone = true;
      aiResponseText = `₺${amt.toLocaleString('tr-TR')} tutarındaki "${cleanTitle}" gider kaydı Finans modülünüze eklendi.`;
      receiptObj = {
        type: 'expense',
        title: cleanTitle,
        amount: amt,
        targetModule: 'finance-expenses',
        originalId: newExp.id
      };
      showToast('💸 Gider Kaydedildi', `₺${amt} - ${cleanTitle}`);
    }

    // 4. INCOME COMMAND (/gelir)
    else if (lower.startsWith('/gelir') || lower.includes('gelir kaydet') || lower.includes('kazanç ekle')) {
      detectedIntent = 'add_income';
      steps.push('2. Intent: [Gelir Kaydı]');

      const amt = parsedAmount || 1000;
      let cleanTitle = trimmedMsg
        .replace(/^\/gelir/gi, '')
        .replace(/gelir(i)?\s*(kaydet|ekle)?/gi, '')
        .replace(/\d+[\d.,]*\s*(tl|₺|lira)?/gi, '')
        .replace(/ekle|kaydet|tl|₺/gi, '')
        .trim();

      if (!cleanTitle || cleanTitle.length < 2) cleanTitle = 'Hızlı Gelir Kaydı';

      const newInc = {
        id: Date.now().toString(),
        title: cleanTitle,
        amount: amt,
        category: lower.includes('satış') ? 'Satış' : lower.includes('proje') ? 'Proje' : 'Diğer',
        tags: ['AI-Asistan'],
        date: new Date().toISOString().split('T')[0],
        status: 'Planlı',
        source: 'AI Asistan Kaydı',
        notes: `AI Komut ile eklendi: "${trimmedMsg}"`
      };

      setIncomes(prev => [newInc, ...prev]);
      steps.push(`3. Veri Tabanı Güncellendi: ₺${amt} - ${cleanTitle}`);

      actionDone = true;
      aiResponseText = `₺${amt.toLocaleString('tr-TR')} tutarındaki "${cleanTitle}" gelir kaydı Finans modülünüze eklendi.`;
      receiptObj = {
        type: 'income',
        title: cleanTitle,
        amount: amt,
        targetModule: 'finance-incomes',
        originalId: newInc.id
      };
      showToast('📈 Gelir Kaydedildi', `₺${amt} - ${cleanTitle}`);
    }

    // 5. STOCK COMMAND (/stok)
    else if (lower.startsWith('/stok') || lower.includes('stok ekle') || lower.includes('ürün ekle')) {
      detectedIntent = 'add_stock';
      steps.push('2. Intent: [Stok Kaydı]');

      const qtyMatch = trimmedMsg.match(/(\d+)\s*(adet|tane|kutu|kg|metre)?/i);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;
      const unit = qtyMatch && qtyMatch[2] ? qtyMatch[2] : 'Adet';

      let cleanName = trimmedMsg
        .replace(/^\/stok/gi, '')
        .replace(/stok(u)?\s*(ekle|kaydet)?/gi, '')
        .replace(/ürün(ü)?\s*(ekle|kaydet)?/gi, '')
        .replace(/\d+\s*(adet|tane|kutu|kg|metre)?/gi, '')
        .replace(/ekle|kaydet/gi, '')
        .trim();

      if (!cleanName) cleanName = 'Yeni Stok Kalemi';

      const newStock = {
        id: Date.now().toString(),
        name: cleanName,
        code: `STK-${Math.floor(1000 + Math.random() * 9000)}`,
        currentQuantity: qty,
        minQuantity: 5,
        unit,
        category: 'Genel',
        unitPrice: 100,
        criticalAlert: false
      };

      setStocks(prev => [newStock, ...prev]);
      steps.push(`3. Veri Tabanı Güncellendi: ${cleanName} (${qty} ${unit})`);

      actionDone = true;
      aiResponseText = `${qty} ${unit} "${cleanName}" stok listenize başarıyla eklendi.`;
      receiptObj = {
        type: 'stock',
        title: cleanName,
        quantity: qty,
        unit,
        targetModule: 'stocks-list',
        originalId: newStock.id
      };
      showToast('📦 Stok Eklendi', `${cleanName} (${qty} ${unit})`);
    }

    // 6. SCHEDULE COMMAND (/ajanda)
    else if (lower.startsWith('/ajanda') || lower.includes('plan ekle') || lower.includes('toplantı')) {
      detectedIntent = 'add_schedule';
      steps.push('2. Intent: [Ajanda Kaydı]');

      const timeMatch = trimmedMsg.match(/(\d{1,2}[:.]\d{2})/);
      const extractedTime = timeMatch ? timeMatch[1].replace('.', ':') : '14:00';

      let cleanPlan = trimmedMsg
        .replace(/^\/ajanda/gi, '')
        .replace(/plan\s*(ekle|kaydet)?/gi, '')
        .replace(/saat\s*\d{1,2}[:.]\d{2}/gi, '')
        .replace(/ekle|kaydet/gi, '')
        .trim();

      if (!cleanPlan) cleanPlan = 'Yönetim Görüşmesi';

      const newPlanObj = {
        id: Date.now().toString(),
        time: extractedTime,
        title: cleanPlan,
        category: 'AI Ajanda',
        priority: 'high' as const,
        completed: false
      };

      setCustomSchedule(prev => [...prev, newPlanObj]);
      steps.push(`3. Veri Tabanı Güncellendi: ${extractedTime} - ${cleanPlan}`);

      actionDone = true;
      aiResponseText = `Saat ${extractedTime} için "${cleanPlan}" ajandanıza kaydedildi.`;
      receiptObj = {
        type: 'schedule',
        title: cleanPlan,
        time: extractedTime,
        targetModule: 'calendar-page',
        originalId: newPlanObj.id
      };
      showToast('📅 Plan Eklendi', `Saat ${extractedTime} - ${cleanPlan}`);
    }

    // 7. SYSTEM STATUS COMMAND (/durum)
    else if (lower.startsWith('/durum') || lower.includes('bütçe') || lower.includes('bakiye') || lower.includes('durum') || lower.includes('özet')) {
      detectedIntent = 'query_system';
      steps.push('2. Intent: [Sistem Taraması]');

      actionDone = true;
      aiResponseText = `Net Bakiye: ₺${netBalance.toLocaleString('tr-TR')} | Gelir: ₺${totalIncomes.toLocaleString('tr-TR')} | Gider: ₺${totalExpenses.toLocaleString('tr-TR')} | Kritik Stok: ${criticalStocksCount} ürün | Hızlı Notlar: ${memos.length} adet`;
      steps.push('3. Özet Sunuldu');
    }

    // SERVER GEMINI FALLBACK IF NOT MATCHED LOCALLY
    if (!actionDone) {
      try {
        steps.push('2. Gemini AI Engine bağlandı...');
        const res = await fetch('/api/welcome/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmedMsg,
            systemContext: {
              netBalance,
              totalIncomes,
              totalExpenses,
              expensesCount: expenses.length,
              stocksCount: stocks.length,
              criticalStocksCount,
              memosCount: memos.length,
              scheduleCount: customSchedule.length
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          aiResponseText = data.responseText || 'İşleminiz başarıyla tamamlandı.';
          detectedIntent = data.intent || 'general_chat';
          if (Array.isArray(data.pipelineSteps)) {
            data.pipelineSteps.forEach((s: string) => steps.push(s));
          }
        } else {
          aiResponseText = `Sayın Engin Bey, komutunuz alındı. Net bakiyeniz: ₺${netBalance.toLocaleString('tr-TR')}.`;
          steps.push('3. Standart Yanıt Üretildi');
        }
      } catch (err) {
        aiResponseText = `Komutunuz işlendi. Net bakiyeniz: ₺${netBalance.toLocaleString('tr-TR')}.`;
        steps.push('3. Standart Yanıt Üretildi');
      }
    }

    setCurrentPipelineSteps(steps);

    setTimeout(() => {
      const aiMsgObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        intent: detectedIntent,
        pipelineSteps: steps,
        actionReceipt: receiptObj
      };

      setMessages(prev => [...prev, aiMsgObj]);
      setIsProcessing(false);
    }, 300);
  };

  // Complete Notebook Wizard Action
  const handleCompleteNotebookWizard = () => {
    if (!wizardNoteContent.trim()) {
      showToast('⚠️ Uyarı', 'Lütfen eklenecek not içeriğini girin.');
      return;
    }

    let currentNotebooks = loadNotebooks();
    let targetNotebookId = selectedNotebookId;
    let targetNotebookTitle = '';

    // Handle New Notebook Creation
    if (isCreatingNewNotebook || !targetNotebookId) {
      if (!newNotebookTitle.trim()) {
        showToast('⚠️ Uyarı', 'Lütfen yeni defter adını girin.');
        return;
      }

      const newNb = {
        id: `nb-${Date.now()}`,
        title: newNotebookTitle.trim(),
        description: 'AI Komut Merkezi ile oluşturulan not defteri.',
        category: newNotebookCategory,
        coverColor: 'from-indigo-600 to-purple-900',
        icon: 'BookOpen',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pages: [],
        sources: [],
        syntheses: []
      };

      currentNotebooks = [newNb, ...currentNotebooks];
      targetNotebookId = newNb.id;
      targetNotebookTitle = newNb.title;
    } else {
      const foundNb = currentNotebooks.find(n => n.id === targetNotebookId);
      targetNotebookTitle = foundNb ? foundNb.title : 'Not Defteri';
    }

    // Handle Page Selection or New Page Creation
    let targetPageTitle = '';
    const updatedNotebooks = currentNotebooks.map(nb => {
      if (nb.id === targetNotebookId) {
        let pages = Array.isArray(nb.pages) ? [...nb.pages] : [];

        if (isCreatingNewPage || pages.length === 0 || !selectedPageId) {
          const pTitle = newPageTitle.trim() || `Not Sayfası (${new Date().toLocaleDateString('tr-TR')})`;
          targetPageTitle = pTitle;

          const newPage = {
            id: `page-${Date.now()}`,
            title: pTitle,
            content: `### ${pTitle}\n\n${wizardNoteContent.trim()}`,
            tags: ['ai-komut', 'defter-notu'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            readTimeMinutes: 2
          };

          pages.push(newPage);
        } else {
          pages = pages.map(p => {
            if (p.id === selectedPageId) {
              targetPageTitle = p.title;
              return {
                ...p,
                content: `${p.content}\n\n---\n**[${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} AI Eklentisi]:**\n${wizardNoteContent.trim()}`,
                updatedAt: new Date().toISOString()
              };
            }
            return p;
          });
        }

        return {
          ...nb,
          pages,
          updatedAt: new Date().toISOString()
        };
      }
      return nb;
    });

    // Save to LocalStorage
    localStorage.setItem('apex_notebooks_v2', JSON.stringify(updatedNotebooks));
    setNotebookList(updatedNotebooks);

    setIsNotebookWizardOpen(false);

    // Create Chat Message Notification
    const userTimestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const aiMsgObj: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: `Not içeriğiniz "${targetNotebookTitle}" defterinin "${targetPageTitle}" sayfasına kaydedildi.`,
      timestamp: userTimestamp,
      intent: 'add_notebook_note',
      actionReceipt: {
        type: 'notebook',
        title: targetNotebookTitle,
        subTitle: targetPageTitle,
        targetModule: 'notes-notebook'
      }
    };

    setMessages(prev => [...prev, aiMsgObj]);
    showToast('📖 Not Defterine Eklendi', `Defter: ${targetNotebookTitle} | Sayfa: ${targetPageTitle}`);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: 'Sohbet geçmişi temizlendi. APEX AI Komut Merkezi hazır.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        intent: 'system_welcome'
      }
    ]);
    showToast('Sohbet Temizlendi', 'Sohbet geçmişi sıfırlandı.');
  };

  const activeNotebookObj = useMemo(() => {
    return notebookList.find(n => n.id === selectedNotebookId);
  }, [notebookList, selectedNotebookId]);

  return (
    <div className="w-full flex flex-col justify-between space-y-3 relative">
      
      {/* INTEGRATED WELCOME HERO HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-focus-neon/15 border border-focus-neon/30 text-focus-neon text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>APEX OS • Akıllı Komut Merkezi</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Slash `/` Komut Motoru Aktif</span>
            </span>
          </div>

          <h1 className="text-lg sm:text-xl lg:text-2xl font-display font-black tracking-tight text-pure-white flex items-center gap-2">
            <span>Hoş Geldiniz,</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-focus-neon via-sky-300 to-indigo-400">Engin Bey</span>
          </h1>
          <p className="text-[11px] text-text-muted truncate">
            Yazarak komut çalıştırmak için <code className="px-1 py-0.2 rounded bg-focus-neon/20 text-focus-neon font-mono font-bold">/</code> girin veya hızlı not/defteri seçin.
          </p>
        </div>

        {/* RIGHT SIDE: CLOCK & PIPELINE TRACE BUTTON */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2.5 shadow-md">
            <Clock className="w-3.5 h-3.5 text-focus-neon animate-spin-slow" />
            <div>
              <div className="text-sm sm:text-base font-mono font-black text-pure-white tracking-wider leading-none">
                {currentTime.toLocaleTimeString('tr-TR')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                {currentTime.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPipelineTrace(!showPipelineTrace)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-300 flex items-center gap-1 cursor-pointer ${
              showPipelineTrace
                ? 'bg-focus-neon text-pure-white border-focus-neon shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-text-muted hover:text-pure-white'
            }`}
            title="Pipeline Trace Inspector"
          >
            <Cpu className="w-3 h-3" />
            <span className="hidden sm:inline">Pipeline Trace</span>
          </button>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-rose-400 transition-all cursor-pointer"
            title="Sohbeti Temizle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SYSTEM LIVE STATS COUNTERS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Net Bakiye</div>
            <div className={`text-xs font-mono font-black ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₺{netBalance.toLocaleString('tr-TR')}
            </div>
          </div>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400/70" />
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Kritik Stok</div>
            <div className={`text-xs font-mono font-black ${criticalStocksCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {criticalStocksCount > 0 ? `${criticalStocksCount} Ürün` : 'Güvenli'}
            </div>
          </div>
          <Package className="w-3.5 h-3.5 text-amber-400/70" />
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Bugünkü Ajanda</div>
            <div className="text-xs font-mono font-black text-sky-400">
              {customSchedule.length} Etkinlik
            </div>
          </div>
          <CalendarIcon className="w-3.5 h-3.5 text-sky-400/70" />
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Hızlı Notlar</div>
            <div className="text-xs font-mono font-black text-indigo-400">
              {memos.length} Kayıt
            </div>
          </div>
          <BookText className="w-3.5 h-3.5 text-indigo-400/70" />
        </div>
      </div>

      {/* PIPELINE TRACE OVERLAY */}
      <AnimatePresence>
        {showPipelineTrace && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-2xl bg-black/80 border border-focus-neon/30 space-y-1.5 text-xs font-mono backdrop-blur-md overflow-hidden"
          >
            <div className="flex items-center justify-between text-focus-neon font-bold">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>AI Pipeline Execution Trace Log</span>
              </div>
              <button
                onClick={() => setShowPipelineTrace(false)}
                className="text-text-muted hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-text-secondary max-h-28 overflow-y-auto no-scrollbar pt-1">
              {currentPipelineSteps.length === 0 ? (
                <div className="text-text-muted italic">İşlem bekleniyor. Aşağıdan bir komut verin...</div>
              ) : (
                currentPipelineSteps.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 text-emerald-400/90">
                    <span className="text-focus-neon">›</span>
                    <span>{st}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT MESSAGES STREAM CONTAINER */}
      <div className="min-h-[130px] max-h-[180px] overflow-y-auto space-y-2 pr-2 no-scrollbar p-0.5">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-focus-neon/30 to-indigo-900 border border-focus-neon/40 flex items-center justify-center text-focus-neon shrink-0 shadow-md">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`space-y-1.5 max-w-[90%] sm:max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-focus-neon to-indigo-600 text-pure-white rounded-tr-none shadow-md font-medium'
                    : 'bg-white/5 border border-white/10 text-pure-white rounded-tl-none shadow-md backdrop-blur-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>

              {/* ACTION RECEIPT CARD IF A RECORD WAS CREATED */}
              {msg.actionReceipt && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-skel-matte/60 to-skel-obsidian border border-emerald-500/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sistem Kaydı Oluşturuldu</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20">
                      {msg.actionReceipt.type}
                    </span>
                  </div>

                  <div className="text-pure-white font-medium space-y-0.5">
                    <div className="font-bold flex items-center justify-between">
                      <span>{msg.actionReceipt.title}</span>
                      {msg.actionReceipt.amount && (
                        <span className="font-mono text-emerald-400 font-bold">
                          ₺{msg.actionReceipt.amount.toLocaleString('tr-TR')}
                        </span>
                      )}
                      {msg.actionReceipt.quantity && (
                        <span className="font-mono text-amber-400 font-bold">
                          {msg.actionReceipt.quantity} {msg.actionReceipt.unit}
                        </span>
                      )}
                      {msg.actionReceipt.time && (
                        <span className="font-mono text-sky-400 font-bold">
                          Saat {msg.actionReceipt.time}
                        </span>
                      )}
                    </div>
                    {msg.actionReceipt.subTitle && (
                      <div className="text-xs text-text-muted flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-400" />
                        <span>Sayfa: {msg.actionReceipt.subTitle}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onNavigate && onNavigate(msg.actionReceipt!.targetModule)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-pure-white border border-emerald-500/30 text-[11px] font-bold transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>İlgili Modülde Görüntüle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              <div className="text-[9px] text-text-muted px-1 font-mono">{msg.timestamp}</div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-pure-white shrink-0 shadow-md">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </motion.div>
        ))}

        {isProcessing && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-7 h-7 rounded-xl bg-focus-neon/20 border border-focus-neon/40 flex items-center justify-center text-focus-neon shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-text-muted flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-focus-neon animate-ping" />
              <span>Komut işleniyor ve kaydınız senkronize ediliyor...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* QUICK ACTION COMMAND CHIPS */}
      <div className="space-y-1 pt-1.5 border-t border-white/10">
        <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
          <span>Önerilen Komut Kısayolları</span>
          <span className="text-focus-neon font-mono text-[9px]">`/` Girerek Ara</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => handleChipClick('/hizlinot ')}
            className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
          >
            <BookText className="w-3 h-3 text-amber-400" />
            <span>📝 /hizlinot Ekle</span>
          </button>

          <button
            onClick={() => openNotebookWizard('')}
            className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span>📖 /notdefteri Ekle</span>
          </button>

          <button
            onClick={() => handleChipClick('/gider 450 TL Ofis Malzemesi')}
            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
          >
            <TrendingDown className="w-3 h-3 text-rose-400" />
            <span>💸 /gider Kaydet</span>
          </button>

          <button
            onClick={() => handleChipClick('/gelir 15000 TL Proje Satışı')}
            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>📈 /gelir Kaydet</span>
          </button>

          <button
            onClick={() => handleChipClick('/stok 20 adet Lazer Yazıcı')}
            className="px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
          >
            <Package className="w-3 h-3 text-sky-400" />
            <span>📦 /stok Ekle</span>
          </button>

          <button
            onClick={() => handleChipClick('/durum')}
            className="px-2 py-1 rounded-lg bg-focus-neon/10 hover:bg-focus-neon/20 text-focus-neon border border-focus-neon/30 text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
          >
            <Zap className="w-3 h-3" />
            <span>🔍 /durum Analizi</span>
          </button>
        </div>
      </div>

      {/* INPUT FORM WITH SLASH COMMAND AUTOCOMPLETE DROPDOWN */}
      <div className="relative pt-0.5">

        {/* FLOATING SLASH COMMAND DROPDOWN MENU */}
        <AnimatePresence>
          {showSlashDropdown && filteredCommands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl bg-black/95 border border-focus-neon/40 shadow-2xl backdrop-blur-xl z-50 overflow-hidden divide-y divide-white/10"
            >
              <div className="px-3 py-2 bg-gradient-to-r from-focus-neon/15 via-indigo-900/20 to-black flex items-center justify-between text-xs font-bold text-focus-neon">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Komut Önerileri (Filtrelendi)</span>
                </span>
                <span className="text-[10px] text-text-muted font-mono">
                  ↑↓ Yön Tuşları • Enter Seçer
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 no-scrollbar">
                {filteredCommands.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => selectSlashCommand(cmd)}
                    onMouseEnter={() => setSelectedCmdIndex(idx)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      idx === selectedCmdIndex
                        ? 'bg-focus-neon/20 border border-focus-neon/50 text-pure-white shadow-md'
                        : 'hover:bg-white/5 border border-transparent text-text-secondary hover:text-pure-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                        {cmd.icon}
                      </div>
                      <div className="truncate space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-pure-white">{cmd.command}</span>
                          <span className="text-[11px] font-bold text-text-primary">{cmd.label}</span>
                        </div>
                        <div className="text-[10px] text-text-muted truncate">{cmd.description}</div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2 text-right hidden sm:block">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-text-muted border border-white/10">
                        {cmd.example}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeAiCommand(inputQuery);
          }}
          className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0"
        >
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Komut veya istek yazın... (Örn: /gider 500 TL)"
              disabled={isProcessing}
              className="w-full bg-black/60 border border-white/20 focus:border-focus-neon rounded-xl pl-3 pr-8 py-2 text-[11px] sm:text-xs text-pure-white placeholder-text-muted focus:outline-none transition-all shadow-inner disabled:opacity-50"
            />
            <CornerDownLeft className="w-3.5 h-3.5 text-text-muted absolute right-3 top-2.5 pointer-events-none hidden sm:block" />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-focus-neon to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-pure-white font-bold text-[11px] transition-all duration-300 flex items-center gap-1 sm:gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">Çalıştır</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* NOTEBOOK & PAGE SELECTION STEP WIZARD MODAL */}
      <AnimatePresence>
        {isNotebookWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-skel-obsidian border border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-pure-white">Not Defterine Kayıt Sihirbazı</h3>
                    <p className="text-xs text-text-muted">Defter ve sayfa seçip notunuzu kaydedin</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNotebookWizardOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STEP PROGRESS INDICATOR */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  onClick={() => setWizardStep(1)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    wizardStep === 1
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-white/5 border-white/10 text-text-muted'
                  }`}
                >
                  <span>1. Defter Seç/Aç</span>
                </div>

                <div
                  onClick={() => setWizardStep(2)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    wizardStep === 2
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-white/5 border-white/10 text-text-muted'
                  }`}
                >
                  <span>2. Sayfa Seç/Aç</span>
                </div>

                <div
                  onClick={() => setWizardStep(3)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    wizardStep === 3
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-white/5 border-white/10 text-text-muted'
                  }`}
                >
                  <span>3. Not İçeriği</span>
                </div>
              </div>

              {/* STEP 1: SELECT OR CREATE NOTEBOOK */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="font-bold">Mevcut Defterleriniz ({notebookList.length})</span>
                    <button
                      onClick={() => setIsCreatingNewNotebook(!isCreatingNewNotebook)}
                      className="text-focus-neon hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isCreatingNewNotebook ? 'Mevcut Defterlerden Seç' : '+ Yeni Defter Oluştur'}</span>
                    </button>
                  </div>

                  {isCreatingNewNotebook ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-focus-neon/30 space-y-3">
                      <div className="text-xs font-bold text-focus-neon flex items-center gap-1.5">
                        <FolderPlus className="w-4 h-4" />
                        <span>Yeni Not Defteri Detayları</span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] text-text-muted font-bold block mb-1">Defter Başlığı</label>
                          <input
                            type="text"
                            value={newNotebookTitle}
                            onChange={(e) => setNewNotebookTitle(e.target.value)}
                            placeholder="Örn: 2026 Müşteri & Proje Stratejileri"
                            className="w-full bg-black/60 border border-white/20 focus:border-focus-neon rounded-xl px-3 py-2 text-xs text-pure-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-text-muted font-bold block mb-1">Kategori</label>
                          <select
                            value={newNotebookCategory}
                            onChange={(e) => setNewNotebookCategory(e.target.value)}
                            className="w-full bg-black/60 border border-white/20 focus:border-focus-neon rounded-xl px-3 py-2 text-xs text-pure-white focus:outline-none"
                          >
                            <option value="Yazılım & AI">Yazılım & AI</option>
                            <option value="İş & Projeler">İş & Projeler</option>
                            <option value="Kişisel & Günlük">Kişisel & Günlük</option>
                            <option value="Finans & Strateji">Finans & Strateji</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 no-scrollbar pr-1">
                      {notebookList.map((nb) => {
                        const isSelected = selectedNotebookId === nb.id;
                        return (
                          <div
                            key={nb.id}
                            onClick={() => {
                              setSelectedNotebookId(nb.id);
                              if (nb.pages && nb.pages.length > 0) {
                                setSelectedPageId(nb.pages[0].id);
                              } else {
                                setSelectedPageId(null);
                              }
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-900/40 via-skel-matte/60 to-black border-indigo-500 shadow-md'
                                : 'bg-white/5 hover:bg-white/10 border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${nb.coverColor || 'from-indigo-600 to-purple-800'} flex items-center justify-center text-white shrink-0 shadow`}>
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-pure-white">{nb.title}</div>
                                <div className="text-[10px] text-text-muted">
                                  {nb.category} • {nb.pages ? nb.pages.length : 0} Sayfa
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-pure-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>İlerle: Sayfa Seçimi</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT OR CREATE PAGE */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
                    <span className="text-text-muted">Seçili Defter:</span>
                    <span className="font-bold text-indigo-400">
                      {isCreatingNewNotebook ? newNotebookTitle || 'Yeni Defter' : activeNotebookObj?.title || 'Defter Seçilmedi'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="font-bold">Mevcut Sayfalar</span>
                    <button
                      onClick={() => setIsCreatingNewPage(!isCreatingNewPage)}
                      className="text-focus-neon hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isCreatingNewPage ? 'Mevcut Sayfalardan Seç' : '+ Yeni Sayfa Oluştur'}</span>
                    </button>
                  </div>

                  {isCreatingNewPage ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-focus-neon/30 space-y-3">
                      <div className="text-xs font-bold text-focus-neon flex items-center gap-1.5">
                        <FilePlus className="w-4 h-4" />
                        <span>Yeni Defter Sayfası Başlığı</span>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={newPageTitle}
                          onChange={(e) => setNewPageTitle(e.target.value)}
                          placeholder="Örn: Hafta 3 Mimari Kararları & Notlar"
                          className="w-full bg-black/60 border border-white/20 focus:border-focus-neon rounded-xl px-3 py-2 text-xs text-pure-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto space-y-2 no-scrollbar pr-1">
                      {activeNotebookObj && activeNotebookObj.pages && activeNotebookObj.pages.length > 0 ? (
                        activeNotebookObj.pages.map((p: any) => {
                          const isSelected = selectedPageId === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPageId(p.id)}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-gradient-to-r from-indigo-900/40 via-skel-matte/60 to-black border-indigo-500 shadow-md'
                                  : 'bg-white/5 hover:bg-white/10 border-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <FileText className="w-4 h-4 text-indigo-400" />
                                <div className="text-xs font-bold text-pure-white">{p.title}</div>
                              </div>

                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-text-muted">
                          Bu defterde henüz sayfa yok. Otomatik yeni sayfa açılacaktır.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted text-xs font-bold transition-all cursor-pointer"
                    >
                      Geri
                    </button>

                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-pure-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>İlerle: Not İçeriği</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: NOTE CONTENT INPUT */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-text-muted font-bold block">Defter Notu İçeriği</label>
                    <textarea
                      rows={5}
                      value={wizardNoteContent}
                      onChange={(e) => setWizardNoteContent(e.target.value)}
                      placeholder="Defter sayfanıza eklenecek not detaylarını girin..."
                      className="w-full bg-black/60 border border-white/20 focus:border-focus-neon rounded-2xl p-3 text-xs text-pure-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted text-xs font-bold transition-all cursor-pointer"
                    >
                      Geri
                    </button>

                    <button
                      type="button"
                      onClick={handleCompleteNotebookWizard}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-pure-white font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Notu Deftere Kaydet</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
