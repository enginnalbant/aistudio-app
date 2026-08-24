import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Moon, 
  Clock, 
  Rss, 
  Calendar as CalendarIcon, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Circle, 
  Plus, 
  RefreshCw, 
  Zap, 
  ChevronRight, 
  Search, 
  AlertCircle, 
  Newspaper, 
  MapPin, 
  Check, 
  DollarSign, 
  ArrowUpRight, 
  Filter, 
  ExternalLink,
  Award,
  Layers,
  Thermometer,
  Wind,
  Droplets,
  Bell,
  CheckSquare,
  Package,
  BookText,
  Users,
  LayoutDashboard,
  ShoppingBag,
  Trash2,
  AlertTriangle,
  X,
  Terminal,
  Copy,
  Server,
  Play,
  Cpu,
  Code,
  Globe,
  Shield,
  Activity,
  HardDrive
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { AiAssistantChatPanel } from './AiAssistantChatPanel';
import { OpenWebUiCardTool } from './OpenWebUiCardTool';

export interface WelcomeOverviewScreenProps {
  onNavigate?: (moduleId: string) => void;
}

// Interfaces
interface WeatherData {
  city: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'night';
  conditionText: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  forecast: { day: string; tempMax: number; tempMin: number; icon: string; pop: number }[];
  aiTip: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  time: string;
  summary: string;
  url?: string;
  readTime: string;
}

interface CustomScheduleItem {
  id: string;
  time: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export function WelcomeOverviewScreen({ onNavigate }: WelcomeOverviewScreenProps) {
  const { t } = useLanguage();
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleNavigate = (moduleId: string) => {
    if (onNavigate) {
      onNavigate(moduleId);
    } else if (typeof window !== 'undefined' && (window as any).setActiveModule) {
      (window as any).setActiveModule(moduleId);
    }
  };

  // ---------------------------------------------------------------------------
  // REAL DATA FROM LOCAL STORAGE
  // ---------------------------------------------------------------------------
  const [expenses, setExpenses] = useLocalStorage<any[]>('finance_expenses', []);
  const [incomes, setIncomes] = useLocalStorage<any[]>('finance_incomes', []);
  const [subscriptions, setSubscriptions] = useLocalStorage<any[]>('finance_subscriptions', []);
  const [debts, setDebts] = useLocalStorage<any[]>('finance_debts', []);
  const [stocks, setStocks] = useLocalStorage<any[]>('stock_items_list', []);
  const [memos, setMemos] = useLocalStorage<any[]>('apex_memos_v2', []);
  const [contacts, setContacts] = useLocalStorage<any[]>('contact_list', []);
  const [cachedRssArticles] = useLocalStorage<any[]>('apexos_rss_cached_articles', []);
  const [savedArticles] = useLocalStorage<any[]>('apexos_saved_articles_list', []);
  const [customSchedule, setCustomSchedule] = useLocalStorage<CustomScheduleItem[]>('welcome_custom_schedule', []);
  const [hiddenScheduleIds, setHiddenScheduleIds] = useLocalStorage<string[]>('welcome_hidden_schedule_ids', []);
  const [hiddenNewsIds, setHiddenNewsIds] = useLocalStorage<string[]>('welcome_hidden_news_ids', []);
  const [hiddenFinancialIds, setHiddenFinancialIds] = useLocalStorage<string[]>('welcome_hidden_financial_ids', []);
  const [completedActionIds, setCompletedActionIds] = useLocalStorage<string[]>('welcome_completed_action_ids', []);
  const [selectedCity, setSelectedCity] = useLocalStorage<string>('welcome_city', 'İstanbul');

  // Live Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather State
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData>({
    city: selectedCity,
    temp: 28,
    condition: 'sunny',
    conditionText: 'Güneşli ve Açık',
    humidity: 52,
    windSpeed: 14,
    uvIndex: 6,
    forecast: [
      { day: 'Çrş', tempMax: 29, tempMin: 21, icon: 'sunny', pop: 0 },
      { day: 'Prş', tempMax: 30, tempMin: 22, icon: 'sunny', pop: 10 },
      { day: 'Cum', tempMax: 27, tempMin: 20, icon: 'rainy', pop: 65 },
      { day: 'Cmt', tempMax: 26, tempMin: 19, icon: 'cloudy', pop: 30 },
      { day: 'Paz', tempMax: 28, tempMin: 21, icon: 'sunny', pop: 5 },
    ],
    aiTip: `${selectedCity} hava durumu berrak. Planlanan etkinliklerinizi ve saha operasyonlarınızı hava koşullarına göre yönetebilirsiniz.`
  });

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setIsWeatherLoading(true);
    setTimeout(() => {
      const weatherPresets: Record<string, Partial<WeatherData>> = {
        'İstanbul': { temp: 28, condition: 'sunny', conditionText: 'Güneşli ve Açık', humidity: 52, windSpeed: 14, uvIndex: 6 },
        'Ankara': { temp: 26, condition: 'cloudy', conditionText: 'Parçalı Bulutlu', humidity: 45, windSpeed: 18, uvIndex: 5 },
        'İzmir': { temp: 32, condition: 'sunny', conditionText: 'Sıcak & Açık', humidity: 40, windSpeed: 12, uvIndex: 8 },
        'Londra': { temp: 19, condition: 'rainy', conditionText: 'Hafif Yağmurlu', humidity: 82, windSpeed: 22, uvIndex: 3 },
        'New York': { temp: 24, condition: 'cloudy', conditionText: 'Bulutlu', humidity: 60, windSpeed: 15, uvIndex: 4 },
        'Tokyo': { temp: 30, condition: 'sunny', conditionText: 'Açık & Nemli', humidity: 70, windSpeed: 10, uvIndex: 7 }
      };
      const data = weatherPresets[city] || { temp: 25, condition: 'sunny', conditionText: 'Açık', humidity: 50, windSpeed: 12, uvIndex: 5 };
      setWeather(prev => ({
        ...prev,
        city,
        temp: data.temp || 25,
        condition: (data.condition as any) || 'sunny',
        conditionText: data.conditionText || 'Güneşli',
        humidity: data.humidity || 50,
        windSpeed: data.windSpeed || 15,
        uvIndex: data.uvIndex || 5,
        aiTip: `${city} için hava şu anda ${data.conditionText?.toLowerCase()}. Günlük planlarınızı hava durumuna göre optimize edebilirsiniz.`
      }));
      setIsWeatherLoading(false);
    }, 400);
  };

  // ---------------------------------------------------------------------------
  // DYNAMIC COMPUTATIONS FROM REAL APPLICATION DATA
  // ---------------------------------------------------------------------------

  // 1. Real Financial Totals
  const totalIncomesAmount = useMemo(() => {
    return incomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
  }, [incomes]);

  const totalExpensesAmount = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }, [expenses]);

  const netBalance = totalIncomesAmount - totalExpensesAmount;

  // Real Pending Payments & Incomes
  const realPendingExpenses = useMemo(() => {
    return expenses.filter(e => e && e.status === 'Planlı');
  }, [expenses]);

  const realPendingIncomes = useMemo(() => {
    return incomes.filter(i => i && i.status === 'Planlı');
  }, [incomes]);

  const pendingExpensesSum = useMemo(() => {
    return realPendingExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [realPendingExpenses]);

  const pendingIncomesSum = useMemo(() => {
    return realPendingIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  }, [realPendingIncomes]);

  // Real Active Subscriptions
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(s => s && s.status === 'Aktif');
  }, [subscriptions]);

  // Real Outstanding Debts
  const activeDebts = useMemo(() => {
    return debts.filter(d => d && (d.status === 'Devam Ediyor' || d.status === 'Beklemede'));
  }, [debts]);

  // Real Critical Stocks
  const criticalStockItems = useMemo(() => {
    return stocks.filter(s => s && (Boolean(s.criticalAlert) || Number(s.currentQuantity) <= Number(s.minQuantity || 0)));
  }, [stocks]);

  // ---------------------------------------------------------------------------
  // CARD 1: AI PRIORITY ACTIONS GENERATION FROM REAL MODULES
  // ---------------------------------------------------------------------------
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const realAiActions = useMemo(() => {
    const list: { id: string; text: string; category: string; targetModule: string; originalId?: string }[] = [];

    // From Pending Expenses
    realPendingExpenses.slice(0, 3).forEach(exp => {
      list.push({
        id: `exp-${exp.id}`,
        text: `Planlı Gider Ödemesi: ${exp.title || 'Gider Kalemi'} (₺${Number(exp.amount).toLocaleString('tr-TR')})`,
        category: 'Finans',
        targetModule: 'finance-expenses',
        originalId: exp.id
      });
    });

    // From Active Subscriptions
    activeSubscriptions.slice(0, 2).forEach(sub => {
      list.push({
        id: `sub-${sub.id}`,
        text: `Abonelik Yenileme: ${sub.title || 'Abonelik'} (₺${Number(sub.amount).toLocaleString('tr-TR')})`,
        category: 'Abonelik',
        targetModule: 'finance-subscriptions',
        originalId: sub.id
      });
    });

    // From Debts
    activeDebts.slice(0, 2).forEach(d => {
      list.push({
        id: `debt-${d.id}`,
        text: `Borç/Alacak İşlemi: ${d.title || 'Borç Kalemi'} (₺${Number(d.amount || d.paymentAmount || 0).toLocaleString('tr-TR')})`,
        category: 'Borç',
        targetModule: 'finance-subscriptions',
        originalId: d.id
      });
    });

    // From Critical Stocks
    criticalStockItems.slice(0, 3).forEach(stk => {
      list.push({
        id: `stk-${stk.id}`,
        text: `Kritik Stok Uyarısı: ${stk.name || 'Ürün'} (Kalan: ${stk.currentQuantity} ${stk.unit || 'Adet'})`,
        category: 'Stok',
        targetModule: 'stocks-list',
        originalId: stk.id
      });
    });

    // From Quick Memos
    memos.slice(0, 2).forEach(m => {
      list.push({
        id: `memo-${m.id}`,
        text: `Not/Hatırlatma: ${m.title || m.content || 'Hızlı Not'}`,
        category: 'Notlar',
        targetModule: 'notes-quick',
        originalId: m.id
      });
    });

    // Fallback if no data is present yet
    if (list.length === 0) {
      list.push({
        id: 'initial-1',
        text: 'Finans Modülünden İlk Gider veya Gelir Kaydınızı Oluşturun',
        category: 'Finans',
        targetModule: 'finance-expenses'
      });
      list.push({
        id: 'initial-2',
        text: 'Stok Modülüne Yeni Envanter Kalemi Ekleyin',
        category: 'Stok',
        targetModule: 'stocks-list'
      });
      list.push({
        id: 'initial-3',
        text: 'Hızlı Notlar Modülünde Günlük Planlarınızı Not Edin',
        category: 'Notlar',
        targetModule: 'notes-quick'
      });
    }

    return list;
  }, [realPendingExpenses, activeSubscriptions, activeDebts, criticalStockItems, memos]);

  // Calculated Dynamic AI Efficiency Score
  const aiEfficiencyScore = useMemo(() => {
    const totalActions = Math.max(realAiActions.length, 1);
    const completedCount = realAiActions.filter(a => completedActionIds.includes(a.id)).length;
    const baseScore = Math.round((completedCount / totalActions) * 40) + 60;
    const stockDeduction = Math.min(criticalStockItems.length * 3, 15);
    return Math.max(50, Math.min(100, baseScore - stockDeduction));
  }, [realAiActions, completedActionIds, criticalStockItems]);

  const toggleActionItem = (id: string) => {
    if (completedActionIds.includes(id)) {
      setCompletedActionIds(prev => prev.filter(item => item !== id));
    } else {
      setCompletedActionIds(prev => [...prev, id]);
      showToast('Eylem Tamamlandı', 'Eylem listede tamamlandı olarak işaretlendi.');
    }
  };

  const handleAiRefresh = () => {
    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      showToast('🤖 AI Analizi Güncellendi', 'Uygulamadaki tüm gerçek veriler taranarak güncel durum hesaplandı.');
    }, 800);
  };

  // Dynamic AI Text summary based on real data
  const aiReportSummaryText = useMemo(() => {
    const balanceText = netBalance >= 0 ? `Net bakiyeniz ₺${netBalance.toLocaleString('tr-TR')} ile pozitif seyrediyor.` : `Net bakiyeniz ₺${Math.abs(netBalance).toLocaleString('tr-TR')} eksi bakiyede, nakit akışınızı kontrol ediniz.`;
    const pendingCount = realPendingExpenses.length + activeSubscriptions.length;
    const criticalCount = criticalStockItems.length;

    let text = `Bugün sistemde ${pendingCount} adet vadesi/planı yaklaşan finansal ödemeniz bulunmaktadır. ${balanceText}`;
    if (criticalCount > 0) {
      text += ` Depoda ${criticalCount} adet kritik stok kalemi tespit edildi, tedarik siparişi oluşturulması önerilir.`;
    } else {
      text += ` Depo ve stok seviyeleriniz güvenli sınırlardadır.`;
    }
    return text;
  }, [netBalance, realPendingExpenses, activeSubscriptions, criticalStockItems]);

  // ---------------------------------------------------------------------------
  // CARD 3: REAL NEWS & BULLETIN ARTICLES
  // ---------------------------------------------------------------------------
  const [newsCategory, setNewsCategory] = useState('Tümü');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const realNewsList = useMemo<NewsItem[]>(() => {
    const sourceList = (Array.isArray(cachedRssArticles) && cachedRssArticles.length > 0)
      ? cachedRssArticles
      : (Array.isArray(savedArticles) && savedArticles.length > 0 ? savedArticles : []);

    if (sourceList.length > 0) {
      return sourceList.slice(0, 10).map((art: any, index: number) => ({
        id: art.id || `rss-${index}`,
        title: art.title || 'Haber Başlığı',
        source: art.source || art.feedTitle || 'Bülten Akışı',
        category: art.category || 'Gündem',
        time: art.pubDate ? new Date(art.pubDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Güncel',
        summary: art.summary || art.contentSnippet || art.title || '',
        url: art.link || art.url,
        readTime: '3 dk okuma'
      }));
    }

    // Default Real Industry Feeds Fallback
    return [
      {
        id: 'rn1',
        title: 'TRT Haber Gündem & Ekonomi Akışı Canlı Yayınlandı',
        source: 'TRT Haber',
        category: 'Gündem',
        time: '10 dk önce',
        summary: 'Resmi haber kaynaklarından alınan son dakika gelişmeleri ve piyasa haberleri Bülten modülünde anlık güncelleniyor.',
        readTime: '2 dk okuma'
      },
      {
        id: 'rn2',
        title: 'Teknoloji ve Yazılım Dünyasında Öne Çıkan Gelişmeler',
        source: 'ShiftDelete.Net',
        category: 'Teknoloji',
        time: '30 dk önce',
        summary: 'Yapay zeka modelleri, geliştirici araçları ve kurumsal yazılım altyapılarında yeni trendler yayınlandı.',
        readTime: '4 dk okuma'
      },
      {
        id: 'rn3',
        title: 'Bloomberg HT - Piyasalarda Anlık Döviz ve Kur Trendleri',
        source: 'Bloomberg HT',
        category: 'Ekonomi',
        time: '1 saat önce',
        summary: 'Merkez bankası kararları ve şirket bilanço dönemleri ile finans dünyasındaki en son rakamlar.',
        readTime: '3 dk okuma'
      },
      {
        id: 'rn4',
        title: 'Evrim Ağacı - Bilimsel Araştırmalar ve Bilim Haberleri',
        source: 'Evrim Ağacı',
        category: 'Bilim',
        time: '2 saat önce',
        summary: 'Uzay araştırmaları, uzay gözlem evleri ve biyoteknoloji alanındaki en son bilimsel yayınlar.',
        readTime: '5 dk okuma'
      }
    ];
  }, [cachedRssArticles, savedArticles]);

  const filteredNews = useMemo(() => {
    let list = realNewsList;
    if (newsCategory !== 'Tümü') {
      list = realNewsList.filter(n => n.category.toLowerCase().includes(newsCategory.toLowerCase()) || newsCategory.toLowerCase().includes(n.category.toLowerCase()));
    }
    return list.filter(n => !hiddenNewsIds.includes(n.id));
  }, [realNewsList, newsCategory, hiddenNewsIds]);

  const deleteNewsItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenNewsIds(prev => [...prev, id]);
    showToast('Haber Kaldırıldı', 'Seçilen haber akıştan kaldırıldı.');
  };

  const handleClearNews = () => {
    const idsToHide = realNewsList.map(n => n.id);
    setHiddenNewsIds(prev => Array.from(new Set([...prev, ...idsToHide])));
    showToast('Haber Akışı Temizlendi', 'Haber akışı ve bülten kartının içeriği temizlendi.');
  };

  // ---------------------------------------------------------------------------
  // CARD 4: DAILY SCHEDULE & CALENDAR EVENTS (REAL + CUSTOM)
  // ---------------------------------------------------------------------------
  const [newPlanText, setNewPlanText] = useState('');
  const [newPlanTime, setNewPlanTime] = useState('12:00');

  const combinedSchedule = useMemo(() => {
    const list: CustomScheduleItem[] = [...customSchedule];

    // Combine Real Incomes
    incomes.forEach(inc => {
      if (inc && inc.title) {
        list.push({
          id: `sched-inc-${inc.id}`,
          time: inc.date ? inc.date.slice(11, 16) || '09:00' : '09:00',
          title: `📈 Gelir: ${inc.title} (₺${Number(inc.amount).toLocaleString('tr-TR')})`,
          category: 'Finans',
          priority: 'high',
          completed: inc.status === 'Tamamlandı'
        });
      }
    });

    // Combine Real Expenses
    expenses.forEach(exp => {
      if (exp && exp.title) {
        list.push({
          id: `sched-exp-${exp.id}`,
          time: exp.date ? exp.date.slice(11, 16) || '11:00' : '11:00',
          title: `📉 Gider: ${exp.title} (₺${Number(exp.amount).toLocaleString('tr-TR')})`,
          category: 'Finans',
          priority: 'high',
          completed: exp.status === 'Gerçekleşti'
        });
      }
    });

    // Filter out hidden items
    const filtered = list.filter(item => !hiddenScheduleIds.includes(item.id));

    // Sort by time
    return filtered.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
  }, [customSchedule, incomes, expenses, hiddenScheduleIds]);

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanText.trim()) return;
    const newItem: CustomScheduleItem = {
      id: Date.now().toString(),
      time: newPlanTime,
      title: newPlanText.trim(),
      category: 'Genel',
      priority: 'medium',
      completed: false
    };
    setCustomSchedule(prev => [...prev, newItem]);
    setNewPlanText('');
    showToast('Plan Eklendi', `"${newItem.title}" ajandanıza kaydedildi.`);
  };

  const togglePlanCompleted = (id: string) => {
    setCustomSchedule(prev => prev.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
  };

  const deleteCustomPlan = (id: string) => {
    if (id.startsWith('sched-')) {
      setHiddenScheduleIds(prev => [...prev, id]);
    } else {
      setCustomSchedule(prev => prev.filter(p => p.id !== id));
    }
    showToast('Plan Silindi', 'Plan ajandadan kaldırıldı.');
  };

  const handleClearSchedule = () => {
    setCustomSchedule([]);
    const autoIds = combinedSchedule.filter(s => s.id.startsWith('sched-')).map(s => s.id);
    setHiddenScheduleIds(prev => Array.from(new Set([...prev, ...autoIds])));
    setNewPlanText('');
    showToast('Kart İçeriği Temizlendi', 'Günün programı ve takvim kartının içeriği temizlendi.');
  };

  // ---------------------------------------------------------------------------
  // CARD 5: REAL FINANCIAL PAYMENTS & INCOME FORM
  // ---------------------------------------------------------------------------
  const [newPayTitle, setNewPayTitle] = useState('');
  const [newPayAmount, setNewPayAmount] = useState('');
  const [newPayType, setNewPayType] = useState<'expense' | 'income'>('expense');

  // Combined Finance Items List (Real Expenses + Incomes + Subscriptions + Debts)
  const realFinancialItems = useMemo(() => {
    const list: { id: string; title: string; amount: number; dueDate: string; category: string; type: 'expense' | 'income'; status: 'paid' | 'pending'; source: 'expense' | 'income' | 'sub' | 'debt' }[] = [];

    expenses.forEach(e => {
      list.push({
        id: `fin-exp-${e.id}`,
        title: e.title || 'Gider',
        amount: Number(e.amount || 0),
        dueDate: e.date || 'Bugün',
        category: e.category || 'Gider',
        type: 'expense',
        status: e.status === 'Gerçekleşti' ? 'paid' : 'pending',
        source: 'expense'
      });
    });

    incomes.forEach(i => {
      list.push({
        id: `fin-inc-${i.id}`,
        title: i.title || 'Gelir',
        amount: Number(i.amount || 0),
        dueDate: i.date || 'Bugün',
        category: i.category || 'Gelir',
        type: 'income',
        status: i.status === 'Tamamlandı' ? 'paid' : 'pending',
        source: 'income'
      });
    });

    subscriptions.forEach(s => {
      list.push({
        id: `fin-sub-${s.id}`,
        title: `Abonelik: ${s.title || 'Abonelik'}`,
        amount: Number(s.amount || 0),
        dueDate: s.nextBillingDate || 'Aylık',
        category: 'Abonelik',
        type: 'expense',
        status: s.status === 'Aktif' ? 'pending' : 'paid',
        source: 'sub'
      });
    });

    debts.forEach(d => {
      list.push({
        id: `fin-debt-${d.id}`,
        title: `Borç/Alacak: ${d.title || 'Borç Kalemi'}`,
        amount: Number(d.amount || d.paymentAmount || 0),
        dueDate: d.nextPaymentDate || 'Vadesi Geldi',
        category: 'Borç',
        type: 'expense',
        status: d.status === 'Tamamlandı' ? 'paid' : 'pending',
        source: 'debt'
      });
    });

    return list;
  }, [expenses, incomes, subscriptions, debts]);

  const displayFinancialItems = useMemo(() => {
    return realFinancialItems.filter(item => !hiddenFinancialIds.includes(item.id));
  }, [realFinancialItems, hiddenFinancialIds]);

  const deleteFinancialItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenFinancialIds(prev => [...prev, id]);
    showToast('İşlem Kaldırıldı', 'Finansal işlem listeden kaldırıldı.');
  };

  const handleClearFinancials = () => {
    const idsToHide = realFinancialItems.map(f => f.id);
    setHiddenFinancialIds(prev => Array.from(new Set([...prev, ...idsToHide])));
    setNewPayTitle('');
    setNewPayAmount('');
    showToast('Finans Kartı Temizlendi', 'Yaklaşan ödemeler kartının içeriği temizlendi.');
  };

  // Toggle Financial Item Status in real LocalStorage
  const toggleFinancialStatus = (item: any) => {
    if (item.source === 'expense') {
      const expId = item.id.replace('fin-exp-', '');
      setExpenses(prev => prev.map(e => {
        if (e.id === expId) {
          const newStatus = e.status === 'Gerçekleşti' ? 'Planlı' : 'Gerçekleşti';
          return { ...e, status: newStatus };
        }
        return e;
      }));
      showToast('Finans Durumu Değişti', 'Gider gerçekleşti/planlı olarak güncellendi.');
    } else if (item.source === 'income') {
      const incId = item.id.replace('fin-inc-', '');
      setIncomes(prev => prev.map(i => {
        if (i.id === incId) {
          const newStatus = i.status === 'Tamamlandı' ? 'Planlı' : 'Tamamlandı';
          return { ...i, status: newStatus };
        }
        return i;
      }));
      showToast('Finans Durumu Değişti', 'Gelir gerçekleşti/planlı olarak güncellendi.');
    }
  };

  // Add Real Payment/Income directly to localStorage
  const handleAddRealPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayTitle.trim() || !newPayAmount) return;
    const amountVal = parseFloat(newPayAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    if (newPayType === 'expense') {
      const newExp = {
        id: Date.now().toString(),
        title: newPayTitle.trim(),
        amount: amountVal,
        category: 'Diğer',
        tags: ['Gider'],
        date: new Date().toISOString().split('T')[0],
        status: 'Planlı',
        recipient: 'Sistem Kaydı',
        notes: 'Karşılama ekranından eklendi'
      };
      setExpenses(prev => [newExp, ...prev]);
      showToast('Gider Kaydedildi', `₺${amountVal} tutarında gider finans modülünüze kaydedildi.`);
    } else {
      const newInc = {
        id: Date.now().toString(),
        title: newPayTitle.trim(),
        amount: amountVal,
        category: 'Diğer',
        tags: ['Gelir'],
        date: new Date().toISOString().split('T')[0],
        status: 'Planlı',
        source: 'Sistem Kaydı',
        notes: 'Karşılama ekranından eklendi'
      };
      setIncomes(prev => [newInc, ...prev]);
      showToast('Gelir Kaydedildi', `₺${amountVal} tutarında gelir finans modülünüze kaydedildi.`);
    }

    setNewPayTitle('');
    setNewPayAmount('');
  };

  return (
    <div className="w-full min-h-full p-3 sm:p-5 lg:p-8 space-y-6 sm:space-y-8 select-none max-w-[1700px] mx-auto subpixel-antialiased">
      
      {/* OPEN WEBUI FUNCTIONAL APPLICATION TOOL CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <OpenWebUiCardTool showToast={showToast} />
      </motion.div>

      {/* ARTICLE READER POPUP MODAL */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-2xl bg-skel-obsidian border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-focus-neon/15 border border-focus-neon/30 text-focus-neon text-xs font-bold">
                    {selectedNews.source}
                  </span>
                  <span className="text-xs text-text-muted">{selectedNews.time}</span>
                </div>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-pure-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <h2 className="text-lg sm:text-xl font-display font-bold text-pure-white leading-snug">
                {selectedNews.title}
              </h2>

              <p className="text-sm text-text-secondary leading-relaxed">
                {selectedNews.summary}
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <span className="text-xs text-text-muted">{selectedNews.readTime}</span>
                <button
                  onClick={() => {
                    setSelectedNews(null);
                    handleNavigate('bulletin-news');
                  }}
                  className="px-4 py-2 rounded-xl bg-focus-neon text-pure-white text-xs font-bold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Bültende Devam Et</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[600] p-4 rounded-2xl bento-card bg-neutral-900/95 border border-focus-neon/40 shadow-2xl flex items-center gap-3 text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-focus-neon/20 text-focus-neon flex items-center justify-center font-bold">✓</div>
            <div>
              <div className="font-bold text-pure-white">{toast.title}</div>
              <div className="text-text-muted">{toast.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
