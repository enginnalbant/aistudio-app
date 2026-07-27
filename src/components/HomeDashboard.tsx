import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckSquare,
  Wallet,
  TrendingUp,
  TrendingDown,
  Rss,
  BookOpen,
  Settings,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  X,
  SlidersHorizontal,
  Lightbulb,
  Activity,
  Maximize2,
  RefreshCw,
  ArrowRight,
  Info,
  Lock,
  Send,
  HelpCircle,
  Clock,
  HeartPulse,
  BrainCircuit,
  MessageCircle,
  LayoutGrid,
  FileText,
  Sliders
} from 'lucide-react';
import { triggerHaptic } from './dock/DockItem';

// Local storage key for dashboard widget config
const WIDGETS_CONFIG_KEY = 'apex_dashboard_widgets_v1';

interface Widget {
  id: string;
  title: string;
  category: 'finance' | 'notes' | 'bulletin' | 'library';
  visible: boolean;
  size: 'small' | 'medium' | 'large';
  description: string;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'fin-summary', title: 'Finansal Durum & Bütçe', category: 'finance', visible: true, size: 'medium', description: 'Gelir, gider, güncel bakiye ve anlık sağlık skoru özeti.' },
  { id: 'fin-quick-actions', title: 'Hızlı Finansal Eylem Sihirbazı', category: 'finance', visible: true, size: 'medium', description: 'Doğrudan ana sayfadan hızlı gelir, gider ve abonelik ekleme.' },
  { id: 'fin-mini-chart', title: 'Mini Bütçe Dağılım Grafiği', category: 'finance', visible: true, size: 'small', description: 'Gelir/gider ve birikim oranlarını gösteren etkileşimli bar grafiği.' },
  { id: 'notes-todo', title: 'Aktif Görevler & Todo', category: 'notes', visible: true, size: 'medium', description: 'Yapılacaklar listeniz, görev tamamlama ve yeni görev ekleme.' },
  { id: 'notes-memos', title: 'Hızlı Karalama Defteri (Memos)', category: 'notes', visible: true, size: 'medium', description: 'Anlık düşüncelerinizi, şifrelerinizi ve fikirlerinizi kaydetme.' },
  { id: 'bulletin-rss', title: 'Canlı RSS Haber Akışı', category: 'bulletin', visible: true, size: 'large', description: 'Akıllı duygu analizi ve yapay zeka sentiment pilleriyle haber akışı.' },
  { id: 'library-progress', title: 'Okuma Listesi & İlerleme', category: 'library', visible: true, size: 'small', description: 'Kitap okuma ilerleme durumunuz ve sürükleyerek güncelleme çubuğu.' }
];

export const HomeDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [aiMood, setAiMood] = useState<'profesyonel' | 'sarkastik' | 'motivasyonel' | 'minimalist'>('profesyonel');
  const [financeForm, setFinanceForm] = useState({ type: 'expense', label: '', amount: '', category: 'Genel' });
  const [todoInput, setTodoInput] = useState('');
  const [memoInput, setMemoInput] = useState('');

  // States from databases
  const [finData, setFinData] = useState({ incomes: [], expenses: [], subs: [], healthScore: 78 });
  const [todos, setTodos] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [memos, setMemos] = useState<{ id: string; text: string; time: string }[]>([]);
  const [books, setBooks] = useState<{ id: string; title: string; progress: number; author: string }[]>([]);
  const [rssArticles, setRssArticles] = useState<{ title: string; feed: string; sentiment: string; priority: string }[]>([]);

  // Inspector Modal states
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Load configuration and module states
  useEffect(() => {
    // Widgets layout config
    const saved = localStorage.getItem(WIDGETS_CONFIG_KEY);
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        setWidgets(DEFAULT_WIDGETS);
      }
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }

    // Finance Data
    const storedIncomes = JSON.parse(localStorage.getItem('finance_incomes') || '[]');
    const storedExpenses = JSON.parse(localStorage.getItem('finance_expenses') || '[]');
    const storedSubs = JSON.parse(localStorage.getItem('finance_subscriptions') || '[]');

    // Calculate custom financial health score
    let health = 78;
    const totalIn = storedIncomes.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
    const totalOut = storedExpenses.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
    if (totalIn > 0) {
      const ratio = totalOut / totalIn;
      if (ratio > 0.9) health = 42;
      else if (ratio > 0.7) health = 65;
      else if (ratio > 0.4) health = 85;
      else health = 95;
    }

    setFinData({
      incomes: storedIncomes,
      expenses: storedExpenses,
      subs: storedSubs,
      healthScore: health
    });

    // Notes / Todos
    const storedTodos = JSON.parse(localStorage.getItem('apex_todos_v2') || '[]');
    if (storedTodos.length > 0) {
      setTodos(storedTodos);
    } else {
      const initialTodos = [
        { id: '1', text: 'Kişisel finans bütçe kontrolü yap', completed: false },
        { id: '2', text: 'Bülten üzerindeki AI makalesini oku', completed: true },
        { id: '3', text: 'Kütüphanede yeni kitaba başla', completed: false }
      ];
      setTodos(initialTodos);
      localStorage.setItem('apex_todos_v2', JSON.stringify(initialTodos));
    }

    // Quick Memos
    const storedMemos = JSON.parse(localStorage.getItem('apex_memos_v2') || '[]');
    if (storedMemos.length > 0) {
      setMemos(storedMemos);
    } else {
      const initialMemos = [
        { id: '1', text: 'Alınacak kitap listesi: "Sapiens", "Dune Mesihi"', time: 'Bugün 10:30' },
        { id: '2', text: 'Akıllı ev projesi yedek şifre: APEX_SECURE_99!', time: 'Dün 18:15' }
      ];
      setMemos(initialMemos);
      localStorage.setItem('apex_memos_v2', JSON.stringify(initialMemos));
    }

    // Books/Library
    const storedBooks = JSON.parse(localStorage.getItem('apex_library_books_v1') || '[]');
    if (storedBooks.length > 0) {
      setBooks(storedBooks);
    } else {
      const initialBooks = [
        { id: '1', title: 'Dune', author: 'Frank Herbert', progress: 65 },
        { id: '2', title: 'Sapiens', author: 'Yuval Noah Harari', progress: 40 },
        { id: '3', title: 'Yapay Zeka Devrimi', author: 'Kai-Fu Lee', progress: 15 }
      ];
      setBooks(initialBooks);
      localStorage.setItem('apex_library_books_v1', JSON.stringify(initialBooks));
    }

    // RSS Bulletin News (Heuristics mock)
    setRssArticles([
      { title: 'Yapay Zeka Modellerinde Çığır Açan Yeni ' + (activeLangText('transformer', 'Transformer') as string) + ' Teknolojisi', feed: 'Teknoloji Günlüğü', sentiment: 'Pozitif', priority: 'Kritik' },
      { title: 'Küresel Finans Piyasalarında Enflasyon Beklentileri Artıyor', feed: 'Finansal Akışlar', sentiment: 'Negatif', priority: 'Yüksek' },
      { title: 'Sağlıklı Yaşam ve Akıllı Beslenme Rehberi', feed: 'Biyo-Yaşam', sentiment: 'Nötr', priority: 'Düşük' },
      { title: 'Mars Keşif Aracı Yeni Su Kaynakları Buldu', feed: 'Uzay & Bilim', sentiment: 'Pozitif', priority: 'Yüksek' }
    ]);

  }, []);

  // Helper translations context
  const currentLang = localStorage.getItem('apex_language') || 'tr';
  const activeLangText = (en: string, tr: string) => {
    return currentLang === 'tr' ? tr : en;
  };

  const saveWidgetsConfig = (updated: Widget[]) => {
    setWidgets(updated);
    localStorage.setItem(WIDGETS_CONFIG_KEY, JSON.stringify(updated));
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (id: string) => {
    triggerHaptic('medium');
    const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveWidgetsConfig(updated);
  };

  // Central calculations
  const totalIn = useMemo(() => finData.incomes.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0), [finData.incomes]);
  const totalOut = useMemo(() => finData.expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0), [finData.expenses]);
  const netBalance = totalIn - totalOut;

  // Unified Smart AI Assistant Executive Summary
  const aiSummary = useMemo(() => {
    const hours = new Date().getHours();
    let greeting = '';
    if (hours >= 5 && hours < 12) greeting = activeLangText('Good morning!', 'Harika bir sabah!') as string;
    else if (hours >= 12 && hours < 18) greeting = activeLangText('Good afternoon!', 'Mutlu ve verimli günler!') as string;
    else greeting = activeLangText('Good evening!', 'Sakin ve dinlendirici bir akşam!') as string;

    const notesSummary = memos.length > 0
      ? activeLangText(`You have ${memos.length} quick scratchpad memos locked in your vault.`, `Kasanızda kayıtlı ${memos.length} adet hızlı not ve şifre bulunuyor.`)
      : activeLangText("Your notes archive is currently clean.", "Not haneniz şu an boş ve sakin.");

    const budgetSummary = netBalance >= 0
      ? activeLangText(`Your budget is in dynamic positive surplus (+₺${netBalance}). Health Score: ${finData.healthScore}%`, `Bütçe nakit akışınız pozitif dengede (+₺${netBalance}). Finansal Sağlık Skorunuz: %${finData.healthScore}.`)
      : activeLangText(`Warning: Expenses exceed incomes by ₺${Math.abs(netBalance)}. Optimize your subscriptions.`, `Uyarı: Giderleriniz gelirlerinizi geçmiş durumda (₺${Math.abs(netBalance)} açık). Aboneliklerinizi gözden geçirin.`);

    const todoSummary = todos.filter(t => !t.completed).length > 0
      ? activeLangText(`There are ${todos.filter(t => !t.completed).length} pending mission items waiting for execution.`, `${todos.filter(t => !t.completed).length} adet tamamlanmamış göreviniz yürütülmeyi bekliyor.`)
      : activeLangText("All critical tasks have been completed. Excellent work!", "Tüm kritik misyonlar başarıyla tamamlandı. Harika gidiyorsunuz!");

    // Custom system prompt personalities
    switch (aiMood) {
      case 'sarkastik':
        return {
          header: activeLangText('APEX BRAIN - SARCASTIC MODE', 'APEX BEYİN - SARKASTİK MOD') as string,
          text: `${greeting} ${budgetSummary} ${todoSummary} ${notesSummary} ` +
                (netBalance < 0
                  ? "Para harcamak en büyük hobiniz galiba, cüzdanınıza bir kilit vurma zamanı gelmiş olabilir mi?"
                  : "Şaşırtıcı ama bütçeniz batmamış. Kendinize hemen bir ödül kahvesi ısmarlayıp bu dengeli hali bozabilirsiniz!")
        };
      case 'motivasyonel':
        return {
          header: activeLangText('APEX BRAIN - INSIGHT & DRIVE', 'APEX BEYİN - MOTİVASYON MODU') as string,
          text: `${greeting} Her gün kendinizi geliştirmek için yeni bir şans! ${budgetSummary} Unutmayın, finansal disiplin özgürlüğe açılan kapıdır. ${todoSummary} Küçük adımlar, büyük hedeflere ulaştırır. Bugün bir adım daha atın!`
        };
      case 'minimalist':
        return {
          header: activeLangText('APEX BRAIN - MINIMAL', 'APEX BEYİN - MİNİMALİST') as string,
          text: `Bakiye: ₺${netBalance} | Görevler: ${todos.filter(t => !t.completed).length} bekleyen | Sağlık: %${finData.healthScore}. Kararlı, verimli ve optimize durumdasınız.`
        };
      case 'profesyonel':
      default:
        return {
          header: activeLangText('APEX BRAIN - SYSTEM BRIEFING', 'APEX BEYİN - SİSTEM ANALİZİ') as string,
          text: `${greeting} APEXOS veritabanı aktif şekilde taranıyor. ${budgetSummary} ${todoSummary} Kütüphanenizdeki kitapların ilerleme durumunu güncel tutmanızı ve canlı RSS akışındaki duygu analizi haberleri okumanızı öneririm.`
        };
    }
  }, [finData, todos, memos, aiMood, netBalance]);

  // Handle adding quick transaction
  const handleQuickFinanceAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!financeForm.label || !financeForm.amount) return;

    triggerHaptic('success');
    const newTx = {
      id: Date.now().toString(),
      label: financeForm.label,
      amount: Number(financeForm.amount),
      category: financeForm.category,
      date: new Date().toISOString().split('T')[0]
    };

    if (financeForm.type === 'income') {
      const updated = [newTx, ...finData.incomes];
      setFinData(prev => ({ ...prev, incomes: updated }));
      localStorage.setItem('finance_incomes', JSON.stringify(updated));
    } else {
      const updated = [newTx, ...finData.expenses];
      setFinData(prev => ({ ...prev, expenses: updated }));
      localStorage.setItem('finance_expenses', JSON.stringify(updated));
    }

    setFinanceForm({ type: 'expense', label: '', amount: '', category: 'Genel' });
  };

  // Complete/Toggle Task
  const handleToggleTodo = (id: string) => {
    triggerHaptic('light');
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updated);
    localStorage.setItem('apex_todos_v2', JSON.stringify(updated));
  };

  // Add Task
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim()) return;

    triggerHaptic('medium');
    const newTodo = {
      id: Date.now().toString(),
      text: todoInput,
      completed: false
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    localStorage.setItem('apex_todos_v2', JSON.stringify(updated));
    setTodoInput('');
  };

  // Add Memo
  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoInput.trim()) return;

    triggerHaptic('medium');
    const newMemo = {
      id: Date.now().toString(),
      text: memoInput,
      time: 'Bugün ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newMemo, ...memos];
    setMemos(updated);
    localStorage.setItem('apex_memos_v2', JSON.stringify(updated));
    setMemoInput('');
  };

  // Delete Memo
  const handleDeleteMemo = (id: string) => {
    triggerHaptic('medium');
    const updated = memos.filter(m => m.id !== id);
    setMemos(updated);
    localStorage.setItem('apex_memos_v2', JSON.stringify(updated));
  };

  // Update Library Book progress slider
  const handleBookProgressChange = (id: string, newProg: number) => {
    const updated = books.map(b => b.id === id ? { ...b, progress: newProg } : b);
    setBooks(updated);
    localStorage.setItem('apex_library_books_v1', JSON.stringify(updated));
  };

  // Transition helper
  const navigateToModule = (moduleId: string) => {
    triggerHaptic('heavy');
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule(moduleId);
    }
    setIsInspectorOpen(false);
  };

  // Open inspector modal for a widget
  const handleInspectWidget = (widget: Widget) => {
    triggerHaptic('medium');
    setSelectedWidget(widget);
    setIsInspectorOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <LayoutGrid className="text-focus-neon" size={26} />
            APEX <span className="text-focus-neon">DASHBOARD</span>
          </h1>
          <p className="text-xs text-text-secondary">Tüm modüllerden anlık entegre canlı veri çeken akıllı yönetim paneli</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              triggerHaptic('medium');
              setIsEditMode(!isEditMode);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isEditMode
                ? 'bg-focus-neon/20 border-focus-neon text-focus-neon shadow-[0_0_15px_rgba(30,144,255,0.2)]'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            <Sliders size={13} className={isEditMode ? 'animate-pulse' : ''} />
            {isEditMode ? 'Düzenlemeyi Bitir' : 'Sayfayı Özelleştir'}
          </button>

          {isEditMode && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsGalleryOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-focus-main text-white hover:bg-focus-main/90 transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            >
              <Plus size={13} />
              Bileşen Galerisi
            </button>
          )}
        </div>
      </div>

      {/* Unified AI Assistant Module Center (Always visible, responsive) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-neutral-900/90 to-neutral-950 p-5 shadow-[0_15px_50px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-focus-neon/10 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-focus-neon/15 border border-focus-neon/35 text-focus-neon">
              <Sparkles className="animate-spin" style={{ animationDuration: '6s' }} size={18} />
            </div>
            <div>
              <h2 className="text-sm font-display font-black text-white uppercase tracking-wider">{aiSummary.header}</h2>
              <p className="text-[10px] text-text-secondary font-mono">Dinamik AI Durum Analiz Motoru</p>
            </div>
          </div>

          {/* AI Personality Selector */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl self-start md:self-auto border border-white/5">
            {(['profesyonel', 'sarkastik', 'motivasyonel', 'minimalist'] as const).map(mood => (
              <button
                key={mood}
                onClick={() => {
                  triggerHaptic('light');
                  setAiMood(mood);
                }}
                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  aiMood === mood
                    ? 'bg-focus-neon text-black font-extrabold shadow-[0_2px_8px_rgba(112,161,255,0.3)]'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/90 leading-relaxed font-medium italic select-none">
          "{aiSummary.text}"
        </p>
      </div>

      {/* Grid of Dynamic Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {widgets.filter(w => w.visible).map(widget => {
          return (
            <motion.div
              key={widget.id}
              layoutId={widget.id}
              className={`relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl p-5 shadow-lg group flex flex-col justify-between transition-all ${
                isEditMode ? 'ring-2 ring-focus-neon ring-offset-2 ring-offset-neutral-950 scale-[0.98]' : ''
              } ${
                widget.size === 'large' ? 'md:col-span-2 lg:col-span-3' :
                widget.size === 'medium' ? 'lg:col-span-2' : ''
              }`}
            >
              {/* Header inside widget */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg text-white ${
                    widget.category === 'finance' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    widget.category === 'notes' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    widget.category === 'bulletin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {widget.category === 'finance' && <Wallet size={14} />}
                    {widget.category === 'notes' && <CheckSquare size={14} />}
                    {widget.category === 'bulletin' && <Rss size={14} />}
                    {widget.category === 'library' && <BookOpen size={14} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{widget.title}</h3>
                    <p className="text-[9px] text-text-secondary capitalize font-mono">{widget.category}</p>
                  </div>
                </div>

                {/* Inspect / Delete buttons */}
                <div className="flex items-center gap-1.5">
                  {isEditMode ? (
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className="p-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Gizle"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInspectWidget(widget)}
                      className="p-1 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:text-white transition-colors"
                      title="Detayları İncele"
                    >
                      <Maximize2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Content Rendering based on widget ID */}
              <div className="flex-1 min-h-[140px] flex flex-col justify-center">
                {widget.id === 'fin-summary' && (
                  <div className="space-y-4 w-full">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
                        <span className="text-[8px] font-black text-text-secondary uppercase block">NET BAKİYE</span>
                        <span className={`text-xs font-extrabold ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ₺{netBalance}
                        </span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
                        <span className="text-[8px] font-black text-text-secondary uppercase block">AYLIK GELİR</span>
                        <span className="text-xs font-extrabold text-blue-400">
                          +₺{totalIn}
                        </span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
                        <span className="text-[8px] font-black text-text-secondary uppercase block">AYLIK GİDER</span>
                        <span className="text-xs font-extrabold text-orange-400">
                          -₺{totalOut}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <HeartPulse size={16} className="text-emerald-400 animate-pulse" />
                        <div>
                          <span className="text-[9px] font-black text-text-secondary uppercase block">SAĞLIK SKORU</span>
                          <span className="text-xs font-extrabold text-white">%{finData.healthScore} Sağlıklı</span>
                        </div>
                      </div>
                      <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            finData.healthScore > 80 ? 'bg-emerald-400' :
                            finData.healthScore > 60 ? 'bg-yellow-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${finData.healthScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {widget.id === 'fin-quick-actions' && (
                  <form onSubmit={handleQuickFinanceAdd} className="space-y-2.5 w-full">
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setFinanceForm(prev => ({ ...prev, type: 'expense' }))}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                          financeForm.type === 'expense' ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'text-text-secondary'
                        }`}
                      >
                        GİDER EKLE
                      </button>
                      <button
                        type="button"
                        onClick={() => setFinanceForm(prev => ({ ...prev, type: 'income' }))}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                          financeForm.type === 'income' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'text-text-secondary'
                        }`}
                      >
                        GELİR EKLE
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Açıklama (Örn: Kahve)"
                        value={financeForm.label}
                        onChange={e => setFinanceForm(prev => ({ ...prev, label: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-focus-neon transition-colors"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Miktar (₺)"
                        value={financeForm.amount}
                        onChange={e => setFinanceForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-focus-neon transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-white text-black font-black text-xs py-2 rounded-xl hover:bg-focus-neon hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      <Plus size={13} />
                      Sisteme Kaydet
                    </button>
                  </form>
                )}

                {widget.id === 'fin-mini-chart' && (
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-between text-[10px] text-text-secondary">
                      <span>Bütçe Dağılım Oranı</span>
                      <span className="font-mono text-white">Toplam: ₺{totalIn + totalOut}</span>
                    </div>

                    <div className="h-12 flex items-end gap-2 px-2 border-b border-white/10 pb-1">
                      {/* Gelir Bar */}
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-emerald-500 rounded-t-md transition-all duration-700 min-h-[4px]"
                          style={{ height: `${totalIn > 0 ? Math.min((totalIn / (totalIn + totalOut || 1)) * 40, 40) : 4}px` }}
                        />
                        <span className="text-[8px] text-text-secondary font-mono">Gelir</span>
                      </div>
                      {/* Gider Bar */}
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-orange-500 rounded-t-md transition-all duration-700 min-h-[4px]"
                          style={{ height: `${totalOut > 0 ? Math.min((totalOut / (totalIn + totalOut || 1)) * 40, 40) : 4}px` }}
                        />
                        <span className="text-[8px] text-text-secondary font-mono">Gider</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-text-secondary uppercase">
                      <span>Sinyal: {netBalance >= 0 ? 'Pozitif Nakit Akışı' : 'Bütçe Aşımı Riski'}</span>
                      <span className={`h-2 w-2 rounded-full ${netBalance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                )}

                {widget.id === 'notes-todo' && (
                  <div className="space-y-3 w-full">
                    <form onSubmit={handleAddTodo} className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Yeni hedef ekle..."
                        value={todoInput}
                        onChange={e => setTodoInput(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-focus-neon transition-colors"
                      />
                      <button
                        type="submit"
                        className="p-1.5 rounded-xl bg-focus-main text-white hover:bg-focus-main/80 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </form>

                    <div className="max-h-[110px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                      {todos.slice(0, 3).map(todo => (
                        <div
                          key={todo.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleTodo(todo.id)}
                            className="flex items-center gap-2 text-left min-w-0 flex-1"
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              todo.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/20'
                            }`}>
                              {todo.completed && <Check size={10} />}
                            </div>
                            <span className={`text-xs truncate ${todo.completed ? 'line-through text-text-secondary opacity-60' : 'text-white'}`}>
                              {todo.text}
                            </span>
                          </button>
                        </div>
                      ))}
                      {todos.length === 0 && (
                        <div className="text-center py-4 text-[10px] text-text-secondary">Tüm hedefler tamamlandı!</div>
                      )}
                    </div>
                  </div>
                )}

                {widget.id === 'notes-memos' && (
                  <div className="space-y-3 w-full">
                    <form onSubmit={handleAddMemo} className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Anlık düşünce, şifre vb..."
                        value={memoInput}
                        onChange={e => setMemoInput(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-focus-neon transition-colors"
                      />
                      <button
                        type="submit"
                        className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </form>

                    <div className="max-h-[110px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                      {memos.slice(0, 2).map(memo => (
                        <div
                          key={memo.id}
                          className="p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all relative group"
                        >
                          <div className="flex justify-between items-start pr-5">
                            <p className="text-xs text-white/95 font-medium break-all">{memo.text}</p>
                            <button
                              onClick={() => handleDeleteMemo(memo.id)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-opacity p-0.5"
                              title="Sil"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                          <span className="text-[8px] text-text-secondary/60 font-mono mt-1 block">{memo.time}</span>
                        </div>
                      ))}
                      {memos.length === 0 && (
                        <div className="text-center py-4 text-[10px] text-text-secondary">Karalama kasanız sakin.</div>
                      )}
                    </div>
                  </div>
                )}

                {widget.id === 'bulletin-rss' && (
                  <div className="space-y-3 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rssArticles.slice(0, 2).map((article, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col justify-between h-full min-h-[90px]"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded-full font-mono">
                                {article.feed}
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 rounded-full ${
                                article.sentiment === 'Pozitif' ? 'text-emerald-400 bg-emerald-500/10' :
                                article.sentiment === 'Negatif' ? 'text-red-400 bg-red-500/10' : 'text-yellow-400 bg-yellow-500/10'
                              }`}>
                                {article.sentiment}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-white line-clamp-2 leading-relaxed">
                              {article.title}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[8px] text-text-secondary font-mono mt-2 pt-1 border-t border-white/5">
                            <span>Önem: {article.priority}</span>
                            <span>Yapay Zeka Analizi Hazır</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {widget.id === 'library-progress' && (
                  <div className="space-y-3.5 w-full">
                    {books.slice(0, 2).map(book => (
                      <div
                        key={book.id}
                        className="bg-white/[0.02] border border-white/5 p-2.5 rounded-2xl space-y-2"
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <div>
                            <span className="font-extrabold text-white block truncate max-w-[120px]">{book.title}</span>
                            <span className="text-text-secondary text-[8px] truncate">{book.author}</span>
                          </div>
                          <span className="font-mono text-indigo-400 font-extrabold">%{book.progress}</span>
                        </div>

                        <div className="space-y-1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={book.progress}
                            onChange={e => handleBookProgressChange(book.id, Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1 rounded-lg cursor-pointer bg-white/10"
                          />
                          <div className="flex justify-between text-[7px] text-text-secondary uppercase">
                            <span>Başla</span>
                            <span>Tamamlandı</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action/Shortcut footer */}
              <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between shrink-0">
                <span className="text-[9px] text-text-secondary font-mono">Otomatik Senkronize</span>
                <button
                  onClick={() => {
                    const mappings: Record<string, string> = {
                      'fin-summary': 'finance-dashboard',
                      'fin-quick-actions': 'finance-incomes',
                      'fin-mini-chart': 'finance-analytics',
                      'notes-todo': 'notes-todo',
                      'notes-memos': 'notes-quick',
                      'bulletin-rss': 'bulletin-news',
                      'library-progress': 'notes-books'
                    };
                    navigateToModule(mappings[widget.id] || 'finance-dashboard');
                  }}
                  className="text-[10px] font-black text-focus-neon hover:text-white flex items-center gap-0.5 transition-colors group"
                >
                  <span>Modüle Git</span>
                  <ChevronRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sliding Widget Gallery Sidebar Drawer */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGalleryOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[90vw] h-full bg-neutral-950 border-l border-white/10 p-5 shadow-2xl flex flex-col justify-between z-10"
            >
              <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid size={18} className="text-focus-neon" />
                    <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">Bileşen Havuzu</h3>
                  </div>
                  <button
                    onClick={() => setIsGalleryOpen(false)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <p className="text-[10px] text-text-secondary leading-relaxed">
                  İhtiyacınız olan modüllere ait dinamik widget'ları seçerek ana sayfanıza ekleyin.
                </p>

                <div className="space-y-2.5">
                  {widgets.map(w => (
                    <div
                      key={w.id}
                      className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-3 justify-between ${
                        w.visible
                          ? 'bg-focus-neon/5 border-focus-neon/30'
                          : 'bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className={`text-[8px] font-bold px-1.5 rounded-full uppercase ${
                          w.category === 'finance' ? 'text-emerald-400 bg-emerald-500/10' :
                          w.category === 'notes' ? 'text-amber-400 bg-amber-500/10' :
                          w.category === 'bulletin' ? 'text-rose-400 bg-rose-500/10' : 'text-indigo-400 bg-indigo-500/10'
                        }`}>
                          {w.category}
                        </span>
                        <h4 className="text-xs font-black text-white mt-1">{w.title}</h4>
                        <p className="text-[9px] text-text-secondary leading-normal mt-0.5">{w.description}</p>
                      </div>

                      <button
                        onClick={() => toggleWidgetVisibility(w.id)}
                        className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                          w.visible
                            ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                            : 'bg-focus-neon/20 border-focus-neon/40 text-focus-neon hover:bg-focus-neon/30'
                        }`}
                      >
                        {w.visible ? <Trash2 size={12} /> : <Plus size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsGalleryOpen(false)}
                className="w-full bg-white text-black font-black text-xs py-2.5 rounded-xl hover:bg-focus-neon hover:text-black transition-all mt-4"
              >
                Değişiklikleri Kaydet
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Pop-up Inspector Modal ("Bileşen Merceği") */}
      <AnimatePresence>
        {isInspectorOpen && selectedWidget && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInspectorOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-neutral-950 border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-4 overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-focus-neon/10 blur-[40px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-focus-neon" />
                  <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">BİLEŞEN MERCEĞİ</h3>
                </div>
                <button
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white">{selectedWidget.title}</h2>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedWidget.category === 'finance' ? 'text-emerald-400 bg-emerald-500/10' :
                    selectedWidget.category === 'notes' ? 'text-amber-400 bg-amber-500/10' :
                    selectedWidget.category === 'bulletin' ? 'text-rose-400 bg-rose-500/10' : 'text-indigo-400 bg-indigo-500/10'
                  }`}>
                    {selectedWidget.category}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {selectedWidget.description}
                </p>

                {/* Micro-insights based on categories */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-black text-text-secondary uppercase">
                    <Sparkles size={12} className="text-focus-neon" />
                    <span>Yapay Zeka Mikro-Öngörüsü</span>
                  </div>

                  <p className="text-xs text-white/90 leading-relaxed italic">
                    {selectedWidget.category === 'finance' && 'Cüzdanınızdaki nakit çıkışlarını anlık olarak izleyerek kasanızı optimize tutun. AI bütçe limitlerini aşmamanızı öneriyor.'}
                    {selectedWidget.category === 'notes' && 'Görevlerinizi önem sırasına göre hizalayın. Pomodoro seansı başlatmak verimliliğinizi %25 oranında artıracaktır.'}
                    {selectedWidget.category === 'bulletin' && 'Duygu analizi pozitif seyreden haber başlıklarını okumak motivasyonunuzu yüksek tutmanıza katkı sağlar.'}
                    {selectedWidget.category === 'library' && 'Haftalık 20 dakikalık okuma rutini kütüphane ilerleme skorunuzu dengede tutar.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setIsInspectorOpen(false)}
                  className="w-full bg-white/5 text-white hover:bg-white/10 font-black text-xs py-3 rounded-xl transition-all border border-white/10"
                >
                  Kapat
                </button>

                <button
                  onClick={() => {
                    const mappings: Record<string, string> = {
                      'fin-summary': 'finance-dashboard',
                      'fin-quick-actions': 'finance-incomes',
                      'fin-mini-chart': 'finance-analytics',
                      'notes-todo': 'notes-todo',
                      'notes-memos': 'notes-quick',
                      'bulletin-rss': 'bulletin-news',
                      'library-progress': 'notes-books'
                    };
                    navigateToModule(mappings[selectedWidget.id] || 'finance-dashboard');
                  }}
                  className="w-full bg-focus-neon text-black font-black text-xs py-3 rounded-xl hover:bg-white transition-all shadow-[0_4px_16px_rgba(112,161,255,0.3)] flex items-center justify-center gap-1.5"
                >
                  <span>Modüle Git</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeDashboard;
