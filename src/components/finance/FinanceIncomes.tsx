import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { getRollovers } from './financeUtils';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Calendar,
  X,
  Tag,
  CheckCircle2,
  Clock,
  ArrowRight,
  PieChart as PieChartIcon,
  Activity,
  ChevronRight,
  ChevronLeft,
  Edit3,
  Trash2,
  Briefcase,
  BarChart3,
  RefreshCw,
  Globe,
  Info,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { 
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

interface Income {
  id: string;
  title: string;
  amount: number; // Final TRY amount
  category: string;
  tags: string[];
  date: string;
  status: 'Tamamlandı' | 'Beklemede';
  recurrence?: 'Tek Seferlik' | 'Haftalık' | 'Aylık' | 'Yıllık';
  source: string;
  notes?: string;
  isDynamic?: boolean;
  currency?: 'TRY' | 'USD' | 'EUR' | 'GBP';
  originalAmount?: number;
  exchangeRate?: number;
}

const CATEGORIES = ['Maaş', 'Serbest Çalışma', 'Yatırım', 'Kira', 'Ödül/Bonus', 'Pasif Gelir', 'Diğer'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

const DEFAULT_RATES: Record<string, number> = {
  TRY: 1.0,
  USD: 34.25,
  EUR: 36.85,
  GBP: 43.60,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const FinanceIncomes = () => {
  const [incomes, setIncomes] = useLocalStorage<Income[]>('finance_incomes', []);
  const [expenses] = useLocalStorage<any[]>('finance_expenses', []);
  
  // Dashboard state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [displayCurrency, setDisplayCurrency] = useState<'TRY' | 'USD' | 'EUR' | 'GBP'>('TRY');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [rateFetchTime, setRateFetchTime] = useState<string | null>(null);

  // Smart Income Goal and Milestone Tracker state
  const [incomeTarget, setIncomeTarget] = useLocalStorage<number>('finance_income_monthly_target', 50000);
  const [showTargetEdit, setShowTargetEdit] = useState(false);
  const [tempTargetInput, setTempTargetInput] = useState<string>('50000');

  // Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isEditingWizard, setIsEditingWizard] = useState(false);
  
  // View/Edit Modal States
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [summaryModal, setSummaryModal] = useState<{title: string; value: string; type: string} | null>(null);

  // New Interactive Chart States
  const [donutHovered, setDonutHovered] = useState<{ name: string; value: number } | null>(null);
  const [donutTab, setDonutTab] = useState<'kategori' | 'aylik'>('kategori');
  const [activeChartTab, setActiveChartTab] = useState<'donut' | 'trend' | 'sources' | 'cumulative'>('donut');

  // Wizard Form States
  const defaultFormState: Partial<Income> = {
    title: '',
    amount: 0,
    category: 'Maaş',
    tags: [],
    date: new Date().toISOString().split('T')[0],
    status: 'Tamamlandı',
    source: '',
    notes: '',
    recurrence: 'Tek Seferlik',
    currency: 'TRY',
    originalAmount: 0,
    exchangeRate: 1.0
  };
  const [formData, setFormData] = useState<Partial<Income>>(defaultFormState);
  const [newTag, setNewTag] = useState('');

  // Fetch live exchange rates from public API
  const fetchRates = async () => {
    setIsFetchingRates(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('API hatası');
      const data = await res.json();
      if (data && data.rates && data.rates.TRY) {
        const tryRate = data.rates.TRY;
        const eurRateInUsd = data.rates.EUR || 0.93;
        const gbpRateInUsd = data.rates.GBP || 0.79;
        
        const newRates = {
          TRY: 1.0,
          USD: Number(tryRate.toFixed(2)),
          EUR: Number((tryRate / eurRateInUsd).toFixed(2)),
          GBP: Number((tryRate / gbpRateInUsd).toFixed(2)),
        };
        setExchangeRates(newRates);
        
        const now = new Date();
        setRateFetchTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (error) {
      console.warn('Canlı kurlar çekilemedi, varsayılan kurlar kullanılıyor:', error);
    } finally {
      setIsFetchingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Sync exchange rate in Wizard form when currency changes
  useEffect(() => {
    if (formData.currency && formData.currency !== 'TRY') {
      const rate = exchangeRates[formData.currency] || DEFAULT_RATES[formData.currency];
      setFormData(prev => ({
        ...prev,
        exchangeRate: rate,
        amount: Number(((prev.originalAmount || 0) * rate).toFixed(2))
      }));
    } else if (formData.currency === 'TRY') {
      setFormData(prev => ({
        ...prev,
        exchangeRate: 1.0,
        amount: prev.originalAmount || 0
      }));
    }
  }, [formData.currency, exchangeRates]);

  // Recalculate TRY amount when original amount or rate changes in Wizard
  const handleOriginalAmountChange = (val: number) => {
    const rate = formData.exchangeRate || 1.0;
    setFormData(prev => ({
      ...prev,
      originalAmount: val,
      amount: Number((val * rate).toFixed(2))
    }));
  };

  const handleExchangeRateChange = (rate: number) => {
    setFormData(prev => ({
      ...prev,
      exchangeRate: rate,
      amount: Number(((prev.originalAmount || 0) * rate).toFixed(2))
    }));
  };

  // Compute dynamic rollovers
  const { rolloverIncomes } = useMemo(() => {
    return getRollovers(incomes, expenses);
  }, [incomes, expenses]);

  // Combine actual and dynamic rollover incomes
  const allIncomes = useMemo(() => {
    const activeRollovers = (rolloverIncomes || []).filter(r => r && !r.isFuture);
    return [...incomes, ...activeRollovers];
  }, [incomes, rolloverIncomes]);

  // Global Currency Formatting helper
  const formatValue = (valueInTry: number) => {
    if (displayCurrency === 'TRY') {
      return `₺${valueInTry.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    const converted = valueInTry / rate;
    return `${CURRENCY_SYMBOLS[displayCurrency]}${converted.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Filtered Incomes List
  const filteredIncomes = useMemo(() => {
    return allIncomes.filter(inc => {
      const titleMatch = (inc.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const sourceMatch = (inc.source || '').toLowerCase().includes(searchTerm.toLowerCase());
      const notesMatch = (inc.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      const tagsMatch = (inc.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSearch = titleMatch || sourceMatch || notesMatch || tagsMatch;
      const matchesCategory = selectedCategory === 'Tümü' || inc.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allIncomes, searchTerm, selectedCategory]);

  // Financial Stats (Calculated in TRY first, then formatted on screen)
  const stats = useMemo(() => {
    let total = 0, pending = 0, currMonth = 0, lastMonth = 0;
    const now = new Date(2026, 6, 3); // Current system date context
    const currentMonthNum = now.getMonth();
    const currentYearNum = now.getFullYear();
    const lastMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
    const lastMonthYearNum = currentMonthNum === 0 ? currentYearNum - 1 : currentYearNum;

    allIncomes.forEach(i => {
      const d = new Date(i.date);
      const isFuture = d > now;

      if (i.status === 'Tamamlandı' && !isFuture) {
        total += i.amount;
        if (d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum) {
          currMonth += i.amount;
        }
        if (d.getMonth() === lastMonthNum && d.getFullYear() === lastMonthYearNum) {
          lastMonth += i.amount;
        }
      } else {
        pending += i.amount;
      }
    });

    const growth = lastMonth === 0 ? (currMonth > 0 ? 100 : 0) : (((currMonth - lastMonth) / lastMonth) * 100);
    return {
      totalIncome: total,
      pendingIncome: pending,
      currentMonthIncome: currMonth,
      growth: growth.toFixed(1)
    };
  }, [allIncomes]);

  // Recharts Category Pie Chart data
  const categoryData = useMemo(() => {
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    return CATEGORIES.map(cat => ({
      name: cat,
      value: Number((allIncomes.filter(i => i.category === cat && i.status === 'Tamamlandı').reduce((sum, i) => sum + i.amount, 0) / rate).toFixed(2))
    })).filter(c => c.value > 0);
  }, [allIncomes, displayCurrency, exchangeRates]);

  // 6 Months trend chart data (converted to selected display currency)
  const monthlyTrendData = useMemo(() => {
    const data = [];
    const now = new Date(2026, 6, 3);
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('tr-TR', { month: 'short' });
      const yearStr = d.getFullYear().toString().slice(-2);
      
      const monthIncomes = allIncomes.filter(inc => {
        const incDate = new Date(inc.date);
        return incDate.getMonth() === d.getMonth() && incDate.getFullYear() === d.getFullYear() && inc.status === 'Tamamlandı';
      });
      const monthPending = allIncomes.filter(inc => {
        const incDate = new Date(inc.date);
        return incDate.getMonth() === d.getMonth() && incDate.getFullYear() === d.getFullYear() && inc.status === 'Beklemede';
      });

      data.push({
        name: `${monthStr} '${yearStr}`,
        Gerçekleşen: Number((monthIncomes.reduce((acc, curr) => acc + curr.amount, 0) / rate).toFixed(0)),
        Bekleyen: Number((monthPending.reduce((acc, curr) => acc + curr.amount, 0) / rate).toFixed(0))
      });
    }
    return data;
  }, [allIncomes, displayCurrency, exchangeRates]);

  const topSource = useMemo(() => {
    const sourceMap: Record<string, number> = {};
    allIncomes.filter(i => i.status === 'Tamamlandı').forEach(i => {
      if (i.source) {
        sourceMap[i.source] = (sourceMap[i.source] || 0) + i.amount;
      }
    });
    const entries = Object.entries(sourceMap);
    if (entries.length === 0) return '-';
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [allIncomes]);

  // Monthly distribution of completed incomes for Donut Chart
  const monthlyData = useMemo(() => {
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    const monthsMap: Record<string, number> = {};
    
    allIncomes.filter(i => i.status === 'Tamamlandı').forEach(i => {
      const d = new Date(i.date);
      const monthName = d.toLocaleDateString('tr-TR', { month: 'long' });
      monthsMap[monthName] = (monthsMap[monthName] || 0) + i.amount;
    });

    return Object.entries(monthsMap).map(([name, value]) => ({
      name,
      value: Number((value / rate).toFixed(2))
    })).sort((a, b) => b.value - a.value);
  }, [allIncomes, displayCurrency, exchangeRates]);

  // Top sources data for horizontal bar chart
  const sourcesChartData = useMemo(() => {
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    const sourceMap: Record<string, number> = {};
    
    allIncomes.filter(i => i.status === 'Tamamlandı').forEach(i => {
      const src = i.source || 'Diğer/Doğrudan';
      sourceMap[src] = (sourceMap[src] || 0) + i.amount;
    });

    return Object.entries(sourceMap)
      .map(([name, value]) => ({
        name,
        Tutar: Number((value / rate).toFixed(2))
      }))
      .sort((a, b) => b.Tutar - a.Tutar)
      .slice(0, 5);
  }, [allIncomes, displayCurrency, exchangeRates]);

  // Cumulative Growth Area Chart Data
  const cumulativeGrowthData = useMemo(() => {
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    const sortedIncomes = [...allIncomes]
      .filter(i => i.status === 'Tamamlandı')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalCumulative = 0;
    const data = sortedIncomes.map(inc => {
      totalCumulative += inc.amount;
      return {
        date: new Date(inc.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        "Birikimli Gelir": Number((totalCumulative / rate).toFixed(2)),
        "Tekil Gelir": Number((inc.amount / rate).toFixed(2)),
        title: inc.title
      };
    });

    return data.slice(-12); // Limit to last 12 points for visual density
  }, [allIncomes, displayCurrency, exchangeRates]);

  // Combined Donut Chart data helper
  const activeDonutData = useMemo(() => {
    return donutTab === 'kategori' ? categoryData : monthlyData;
  }, [donutTab, categoryData, monthlyData]);

  // Sum of donut values for calculating percentage
  const totalDonutValue = useMemo(() => {
    return activeDonutData.reduce((acc, curr) => acc + curr.value, 0);
  }, [activeDonutData]);

  // ACTIONS
  const handleOpenWizard = (incomeToEdit?: Income) => {
    if (incomeToEdit) {
      setFormData({
        ...incomeToEdit,
        currency: incomeToEdit.currency || 'TRY',
        originalAmount: incomeToEdit.originalAmount || incomeToEdit.amount,
        exchangeRate: incomeToEdit.exchangeRate || 1.0
      });
      setIsEditingWizard(true);
    } else {
      setFormData(defaultFormState);
      setIsEditingWizard(false);
    }
    setWizardStep(1);
    setIsWizardOpen(true);
    setSelectedIncome(null);
  };

  const handleSaveIncome = () => {
    if (!formData.title || !formData.amount) return;
    
    if (isEditingWizard && formData.id) {
      setIncomes(incomes.map(inc => inc.id === formData.id ? { ...formData } as Income : inc));
    } else {
      const newIncome: Income = {
        ...(formData as any),
        id: Date.now().toString(),
        category: formData.category || 'Diğer',
        tags: formData.tags || [],
        date: formData.date || new Date().toISOString().split('T')[0],
        status: formData.status as 'Tamamlandı' | 'Beklemede',
        recurrence: formData.recurrence as 'Tek Seferlik' | 'Haftalık' | 'Aylık' | 'Yıllık',
        source: formData.source || '',
        currency: formData.currency || 'TRY',
        originalAmount: formData.originalAmount || formData.amount,
        exchangeRate: formData.exchangeRate || 1.0
      };
      setIncomes([newIncome, ...incomes]);
    }
    
    setIsWizardOpen(false);
    setFormData(defaultFormState);
  };

  const handleDeleteIncome = (id: string) => {
    if (confirm('Bu gelir kaydını silmek istediğinize emin misiniz?')) {
      setIncomes(incomes.filter(i => i.id !== id));
      setSelectedIncome(null);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(newTag.trim())) {
        setFormData({ ...formData, tags: [...(formData.tags || []), newTag.trim()] });
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(tag => tag !== tagToRemove) });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Top Interactive Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-black tracking-tight text-text-primary">
              Gelir Merkezi
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-text-secondary">
              <Globe size={11} className="text-focus-neon animate-pulse" />
              <span>Döviz Modülü Aktif</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            Çoklu para birimi hakediş takibi ve canlı kur entegrasyonlu finansal raporlama.
          </p>
        </div>

        {/* Currency & Actions Control Pane */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Rate status indicator */}
          <div className="text-[11px] font-mono text-text-secondary bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-focus-main animate-ping" />
            <span>USD: {exchangeRates.USD} ₺</span>
            <span className="text-white/20">|</span>
            <span>EUR: {exchangeRates.EUR} ₺</span>
            <button 
              onClick={fetchRates} 
              disabled={isFetchingRates}
              className="text-focus-neon hover:text-focus-neon/80 p-0.5 ml-1 transition-transform active:rotate-180 disabled:opacity-40"
              title="Kurları Güncelle"
            >
              <RefreshCw size={11} className={isFetchingRates ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Global Dashboard Currency Switcher */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            {(['TRY', 'USD', 'EUR', 'GBP'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setDisplayCurrency(curr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  displayCurrency === curr 
                    ? 'bg-focus-neon text-pure-black shadow-md' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {curr === 'TRY' ? '₺' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : '£'}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleOpenWizard()}
            className="flex items-center gap-2 bg-focus-neon text-pure-black font-bold px-4 py-2.5 rounded-xl hover:bg-focus-neon/90 transition-all shadow-lg shadow-focus-neon/15 active:scale-95 ml-auto lg:ml-0"
          >
            <Plus size={16} />
            <span>Gelir Ekle</span>
          </button>
        </div>
      </div>

      {/* Modern Compact Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => setSummaryModal({ title: 'Toplam Gerçekleşen', value: formatValue(stats.totalIncome), type: 'completed' })}
          className="bg-white/[0.01] border border-white/5 p-5 rounded-xl cursor-pointer hover:bg-white/[0.03] hover:border-focus-neon/30 transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Toplam Gerçekleşen</span>
            <div className="p-2 bg-focus-neon/10 rounded-lg text-focus-neon group-hover:scale-105 transition-transform">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-text-primary">
            {formatValue(stats.totalIncome)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-text-secondary">Eldeki Net Nakit Akışı</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => setSummaryModal({ title: 'Bekleyen Alacaklar', value: formatValue(stats.pendingIncome), type: 'pending' })}
          className="bg-white/[0.01] border border-white/5 p-5 rounded-xl cursor-pointer hover:bg-white/[0.03] hover:border-nrg-sun/30 transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Bekleyen Alacaklar</span>
            <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun group-hover:scale-105 transition-transform">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-text-primary">
            {formatValue(stats.pendingIncome)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-text-secondary">Gelecek Vadeli Ödemeler</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => setSummaryModal({ title: 'Aylık Büyüme Oranı', value: `${Number(stats.growth) >= 0 ? '+' : ''}${stats.growth}%`, type: 'trend' })}
          className="bg-white/[0.01] border border-white/5 p-5 rounded-xl cursor-pointer hover:bg-white/[0.03] hover:border-ai-bright/30 transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Aylık Büyüme Oranı</span>
            <div className={`p-2 rounded-lg group-hover:scale-105 transition-transform ${Number(stats.growth) >= 0 ? 'bg-focus-main/10 text-focus-main' : 'bg-crit-vivid/10 text-crit-vivid'}`}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-black text-text-primary">
              {Number(stats.growth) >= 0 ? '+' : ''}{stats.growth}%
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {Number(stats.growth) >= 0 ? (
              <ArrowUpRight size={12} className="text-focus-main" />
            ) : (
              <ArrowDownRight size={12} className="text-crit-vivid" />
            )}
            <span className="text-[10px] text-text-secondary">Geçen aya kıyasla</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => setSummaryModal({ title: 'En Güçlü Gelir Kaynağı', value: topSource, type: 'source' })}
          className="bg-white/[0.01] border border-white/5 p-5 rounded-xl cursor-pointer hover:bg-white/[0.03] hover:border-focus-main/30 transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">En Güçlü Kaynak</span>
            <div className="p-2 bg-focus-main/10 rounded-lg text-focus-main group-hover:scale-105 transition-transform">
              <Briefcase size={16} />
            </div>
          </div>
          <p className="text-lg font-display font-black text-text-primary truncate">
            {topSource}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="text-[10px] text-text-secondary">Hacim bazlı lider kanal</span>
          </div>
        </div>
      </div>

      {/* Main Split Interface Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3 Area: Filter & Compact Smart List */}
        <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-focus-neon" />
              <h2 className="text-sm font-bold text-text-primary">Gelir Akışı & Hareketleri</h2>
            </div>

            {/* Quick compact category filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
              {['Tümü', ...CATEGORIES.slice(0, 3), 'Diğer'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-white/10 text-text-primary border border-white/15' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text"
              placeholder="Hızlı Arama: Başlık, Müşteri, Kaynak veya Etiket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-text-primary focus:outline-none focus:border-focus-neon/40 transition-colors"
            />
          </div>

          {/* Interactive Compact List Container */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {filteredIncomes.length === 0 ? (
              <div className="py-16 text-center bg-white/[0.005] rounded-xl border border-dashed border-white/5">
                <Search size={28} className="mx-auto opacity-20 mb-2" />
                <p className="text-xs text-text-secondary">Filtrelerle eşleşen bir gelir hareketi bulunamadı.</p>
              </div>
            ) : (
              filteredIncomes.map((income) => {
                const isForeign = income.currency && income.currency !== 'TRY';
                return (
                  <div 
                    key={income.id} 
                    onClick={() => setSelectedIncome(income)}
                    className="flex items-center justify-between p-3.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Category specific color dot */}
                      <span className="w-1.5 h-8 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[CATEGORIES.indexOf(income.category) % COLORS.length] || '#ccc' }} 
                      />
                      
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-primary group-hover:text-focus-neon transition-colors truncate">
                            {income.title}
                          </span>
                          
                          {/* Currency badge if foreign */}
                          {isForeign && (
                            <span className="text-[9px] font-bold text-focus-main bg-focus-main/15 border border-focus-main/20 px-1.5 py-0.5 rounded-md leading-none uppercase">
                              {income.originalAmount} {income.currency}
                            </span>
                          )}

                          {income.isDynamic && (
                            <span className="text-[9px] font-bold text-focus-neon bg-focus-neon/15 border border-focus-neon/25 px-1.5 py-0.5 rounded-md leading-none uppercase">
                              Bakiye Devri
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                          <span>{income.source || 'Bilinmeyen Kaynak'}</span>
                          <span>•</span>
                          <span>{income.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        {/* Final formatted display value */}
                        <div className="text-xs font-mono font-bold text-text-primary group-hover:text-focus-neon transition-colors">
                          {formatValue(income.amount)}
                        </div>
                        {/* Date */}
                        <div className="text-[10px] font-mono text-text-secondary">
                          {new Date(income.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>

                      {/* Simple visual status checkmark */}
                      <span className={`p-1.5 rounded-lg border ${
                        income.status === 'Tamamlandı' 
                          ? 'bg-focus-main/10 text-focus-main border-focus-main/20' 
                          : 'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'
                      }`}>
                        {income.status === 'Tamamlandı' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chart & Smart Rate Calculator */}
        <div className="space-y-6">
          
          {/* Chart Card */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <PieChartIcon size={14} className="text-focus-neon" />
                Grafik & Analiz Paneli
              </h3>
            </div>

            {/* Chart Tabs Bar */}
            <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveChartTab('donut')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  activeChartTab === 'donut' 
                    ? 'bg-focus-neon/15 text-focus-neon border border-focus-neon/10 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <PieChartIcon size={12} />
                <span className="hidden sm:inline">Dairesel</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('trend')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  activeChartTab === 'trend' 
                    ? 'bg-focus-neon/15 text-focus-neon border border-focus-neon/10 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <TrendingUp size={12} />
                <span className="hidden sm:inline">Trend</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('sources')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  activeChartTab === 'sources' 
                    ? 'bg-focus-neon/15 text-focus-neon border border-focus-neon/10 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Briefcase size={12} />
                <span className="hidden sm:inline">Kaynaklar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('cumulative')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  activeChartTab === 'cumulative' 
                    ? 'bg-focus-neon/15 text-focus-neon border border-focus-neon/10 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Activity size={12} />
                <span className="hidden sm:inline">Kümülatif</span>
              </button>
            </div>

            {/* CHART VIEWPORTS */}
            
            {/* Tab 1: Donut Chart (Category & Month distribution) */}
            {activeChartTab === 'donut' && (
              <div className="space-y-4">
                {/* Sub-tabs for Donut content */}
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => { setDonutTab('kategori'); setDonutHovered(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      donutTab === 'kategori' ? 'bg-white/10 text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Kategorik Kırılım
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setDonutTab('aylik'); setDonutHovered(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      donutTab === 'aylik' ? 'bg-white/10 text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Aylık Dağılım
                  </button>
                </div>

                <div className="relative h-[180px] w-full flex items-center justify-center">
                  {activeDonutData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activeDonutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            onMouseEnter={(e) => {
                              if (e && e.payload) {
                                setDonutHovered({ name: e.name, value: Number(e.value) });
                              }
                            }}
                            onMouseLeave={() => {
                              setDonutHovered(null);
                            }}
                          >
                            {activeDonutData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                                className="transition-all duration-300 hover:opacity-80 outline-none cursor-pointer"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#121212', borderColor: '#ffffff10', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff', fontSize: '11px' }}
                            formatter={(value: number) => `${CURRENCY_SYMBOLS[displayCurrency]}${value.toLocaleString('tr-TR')}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Centered details block */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                        <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest text-center max-w-[80px] truncate">
                          {donutHovered ? donutHovered.name : (donutTab === 'kategori' ? 'Kategoriler' : 'Tüm Aylar')}
                        </span>
                        <span className="text-sm font-mono font-black text-text-primary mt-1">
                          {CURRENCY_SYMBOLS[displayCurrency]}{(donutHovered ? donutHovered.value : totalDonutValue).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-focus-neon bg-focus-neon/10 border border-focus-neon/20 px-2 py-0.5 rounded-full mt-2">
                          {donutHovered 
                            ? `${((donutHovered.value / (totalDonutValue || 1)) * 100).toFixed(1)}%` 
                            : '100%'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-[11px] text-text-secondary opacity-50 space-y-1">
                      <PieChartIcon size={24} className="mx-auto" />
                      <span>Kayıtlı veri bulunamadı</span>
                    </div>
                  )}
                </div>

                {/* Scrollable Legend list */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 max-h-[120px] overflow-y-auto custom-scrollbar">
                  {activeDonutData.map((d, idx) => {
                    const percent = ((d.value / (totalDonutValue || 1)) * 100).toFixed(0);
                    return (
                      <div 
                        key={d.name} 
                        className="flex items-center gap-2 text-[10px] text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg"
                        onMouseEnter={() => setDonutHovered({ name: d.name, value: d.value })}
                        onMouseLeave={() => setDonutHovered(null)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="truncate flex-1">{d.name}</span>
                        <span className="font-mono text-text-primary font-bold">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Monthly Trend (Actual vs Pending Bar Chart) */}
            {activeChartTab === 'trend' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="h-[210px] w-full">
                  {monthlyTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', borderColor: '#ffffff10', borderRadius: '10px' }}
                          itemStyle={{ fontSize: '11px' }}
                          formatter={(value: number) => `${CURRENCY_SYMBOLS[displayCurrency]}${value.toLocaleString('tr-TR')}`}
                        />
                        <Bar dataKey="Gerçekleşen" fill="#10b981" radius={[4, 4, 0, 0]} name="Gerçekleşen" />
                        <Bar dataKey="Bekleyen" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Bekleyen" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-secondary italic">
                      Trend verisi bulunmuyor
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-4 text-[10px] border-t border-white/5 pt-3">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <span className="w-2.5 h-1 rounded-full bg-[#10b981]" />
                    <span>Gerçekleşen</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <span className="w-2.5 h-1 rounded-full bg-[#f59e0b]" />
                    <span>Bekleyen</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Sources / Client Horizontal Bar Chart */}
            {activeChartTab === 'sources' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="h-[210px] w-full">
                  {sourcesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={sourcesChartData} 
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={75} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', borderColor: '#ffffff10', borderRadius: '10px' }}
                          itemStyle={{ fontSize: '11px' }}
                          formatter={(value: number) => `${CURRENCY_SYMBOLS[displayCurrency]}${value.toLocaleString('tr-TR')}`}
                        />
                        <Bar dataKey="Tutar" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-secondary italic">
                      Kaynak verisi bulunmuyor
                    </div>
                  )}
                </div>
                
                <p className="text-[9px] text-text-secondary text-center italic border-t border-white/5 pt-3">
                  İşlem hacmine göre en yüksek katkıyı sağlayan ilk 5 gelir kanalı.
                </p>
              </div>
            )}

            {/* Tab 4: Cumulative Trajectory Area Chart */}
            {activeChartTab === 'cumulative' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="h-[210px] w-full">
                  {cumulativeGrowthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cumulativeGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', borderColor: '#ffffff10', borderRadius: '10px' }}
                          itemStyle={{ fontSize: '11px' }}
                          formatter={(value: number) => `${CURRENCY_SYMBOLS[displayCurrency]}${value.toLocaleString('tr-TR')}`}
                        />
                        <Area type="monotone" dataKey="Birikimli Gelir" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-secondary italic">
                      Büyüme verisi bulunmuyor
                    </div>
                  )}
                </div>
                
                <p className="text-[9px] text-text-secondary text-center italic border-t border-white/5 pt-3">
                  Tarihsel akışta tamamlanan gelirlerinizin kümülatif büyüme eğrisi.
                </p>
              </div>
            )}
          </div>

          {/* Smart Income Goal & Milestone Tracker Widget */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-focus-neon animate-pulse" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Aylık Gelir Hedefi</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showTargetEdit) {
                    const parsed = parseFloat(tempTargetInput);
                    if (!isNaN(parsed) && parsed > 0) {
                      setIncomeTarget(parsed);
                    }
                  } else {
                    setTempTargetInput(incomeTarget.toString());
                  }
                  setShowTargetEdit(!showTargetEdit);
                }}
                className="text-[10px] text-focus-neon hover:underline font-bold transition-all"
              >
                {showTargetEdit ? 'Kaydet' : 'Düzenle'}
              </button>
            </div>

            {showTargetEdit ? (
              <div className="flex gap-2 animate-fadeIn">
                <input
                  type="number"
                  min="1"
                  value={tempTargetInput}
                  onChange={(e) => setTempTargetInput(e.target.value)}
                  className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs text-text-primary focus:outline-none focus:border-focus-neon/30"
                  placeholder="Hedef Tutar (₺)"
                />
                <button
                  type="button"
                  onClick={() => setShowTargetEdit(false)}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-text-secondary transition-colors"
                >
                  İptal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Metrics */}
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-text-secondary block">BU AYKİ TOPLAM GELİR</span>
                    <span className="text-base font-mono font-black text-white">
                      ₺{stats.currentMonthIncome.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] text-text-secondary block">HEDEF (₺)</span>
                    <span className="text-sm font-mono font-bold text-text-primary">
                      ₺{incomeTarget.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-text-secondary">
                    <span>Aylık Hedef İlerlemesi</span>
                    <span className="font-mono font-bold text-focus-neon">
                      %{Math.min(100, Math.round((stats.currentMonthIncome / incomeTarget) * 100)) || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-focus-neon to-ai-bright rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, Math.round((stats.currentMonthIncome / incomeTarget) * 100)) || 0}%` }}
                    />
                  </div>
                </div>

                {/* Milestones status */}
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl space-y-2">
                  <span className="text-[9px] text-text-secondary font-black uppercase tracking-wider block">Kazanılan Rozetler & Milestones</span>
                  
                  <div className="space-y-2">
                    {/* Badge 1: 15K */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${stats.currentMonthIncome >= 15000 ? 'grayscale-0 opacity-100' : 'grayscale opacity-30'}`}>🥉</span>
                        <span className={`font-bold ${stats.currentMonthIncome >= 15000 ? 'text-white/90' : 'text-text-secondary'}`}>
                          Bronz (Tasarruf Güvencesi)
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-text-secondary">₺15.000</span>
                    </div>

                    {/* Badge 2: 35K */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${stats.currentMonthIncome >= 35000 ? 'grayscale-0 opacity-100' : 'grayscale opacity-30'}`}>🥈</span>
                        <span className={`font-bold ${stats.currentMonthIncome >= 35000 ? 'text-white/90' : 'text-text-secondary'}`}>
                          Gümüş (Ekonomik Bağımsızlık)
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-text-secondary">₺35.000</span>
                    </div>

                    {/* Badge 3: Target */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${stats.currentMonthIncome >= incomeTarget ? 'grayscale-0 opacity-100' : 'grayscale opacity-30'}`}>🥇</span>
                        <span className={`font-bold ${stats.currentMonthIncome >= incomeTarget ? 'text-white/90' : 'text-text-secondary'}`}>
                          Altın (Finansal Özgürlük)
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-text-secondary">₺{incomeTarget.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                {/* Projections Tip */}
                <div className="text-[9px] text-text-secondary flex items-start gap-1.5 bg-focus-neon/5 border border-focus-neon/10 p-2.5 rounded-lg">
                  <Info size={11} className="text-focus-neon shrink-0 mt-0.5" />
                  <span>
                    {stats.currentMonthIncome >= incomeTarget 
                      ? 'Tebrikler! Bu ayki gelir hedefinizi başarıyla aşarak Finansal Özgürlük seviyesine ulaştınız.'
                      : `Mevcut hedefiniz için kalan miktar ₺${Math.max(0, incomeTarget - stats.currentMonthIncome).toLocaleString('tr-TR')}. Faturalarınızı ve ek işlerinizi takip ederek hızlanın.`}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* NEW SMART LAYERED WIZARD */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-pure-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: 'calc(100vh - 40px)' }}
            >
              {/* Wizard Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.01]">
                <div>
                  <h2 className="text-lg font-display font-black text-text-primary flex items-center gap-2">
                    <Plus size={18} className="text-focus-neon animate-pulse" />
                    {isEditingWizard ? 'Gelir Kaydını Düzenle' : 'Akıllı Gelir Ekleme Sihirbazı'}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">Adım {wizardStep} / 3: {wizardStep === 1 ? 'Tutar ve Para Birimi' : wizardStep === 2 ? 'Kategori & Kaynak' : 'İşlem Detayları'}</p>
                </div>
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Seamless Step Progress Bar */}
              <div className="flex h-1 bg-white/5">
                <div className="bg-focus-neon transition-all duration-300" style={{ width: `${(wizardStep / 3) * 100}%` }} />
              </div>

              {/* Wizard Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-[320px]">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                  
                  <AnimatePresence mode="wait">
                    {/* STEP 1: VALUE & CURRENCY CONVERSION */}
                    {wizardStep === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5"
                      >
                        {/* Currency Selector Grid */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">İşlem Para Birimi</label>
                          <div className="grid grid-cols-4 gap-2">
                            {(['TRY', 'USD', 'EUR', 'GBP'] as const).map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, currency: c }))}
                                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                                  formData.currency === c 
                                    ? 'bg-focus-neon/15 border-focus-neon text-focus-neon shadow-[0_0_15px_rgba(11,216,170,0.1)]' 
                                    : 'bg-white/[0.01] border-white/5 text-text-secondary hover:border-white/10 hover:text-text-primary'
                                }`}
                              >
                                {c === 'TRY' ? '₺ TRY (Lira)' : c === 'USD' ? '$ USD (Dolar)' : c === 'EUR' ? '€ EUR (Euro)' : '£ GBP (Sterlin)'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Original Amount Input */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Tutar ({formData.currency})</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary font-mono text-sm">
                                {CURRENCY_SYMBOLS[formData.currency || 'TRY']}
                              </span>
                              <input 
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.originalAmount || ''}
                                onChange={(e) => handleOriginalAmountChange(Number(e.target.value))}
                                placeholder="0.00"
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-9 pr-4 py-3.5 text-base font-mono font-bold text-text-primary focus:outline-none focus:border-focus-neon/30"
                              />
                            </div>
                          </div>

                          {/* Exchange Rate Input (Conditional) */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Döviz Kuru (₺)</label>
                            <input 
                              disabled={formData.currency === 'TRY'}
                              type="number"
                              min="0"
                              step="0.0001"
                              value={formData.exchangeRate || 1.0}
                              onChange={(e) => handleExchangeRateChange(Number(e.target.value))}
                              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3.5 text-base font-mono font-bold text-text-primary focus:outline-none focus:border-focus-neon/30 disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Interactive TL conversion check screen */}
                        {formData.currency !== 'TRY' && (
                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-bold">Hesaplanan Ana Para Birimi Karşılığı</span>
                              <span className="text-xs text-text-secondary font-mono">
                                {formData.originalAmount || 0} {formData.currency} × {formData.exchangeRate || 1} ₺
                              </span>
                            </div>
                            <span className="text-base font-mono font-black text-focus-neon">
                              ₺{(formData.amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}

                        {/* Date & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Hakediş / Ödeme Tarihi</label>
                            <input 
                              required
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData({...formData, date: e.target.value})}
                              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-text-primary focus:outline-none focus:border-focus-neon/30 [color-scheme:dark]"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Gerçekleşme Durumu</label>
                            <div className="grid grid-cols-2 gap-2">
                              {(['Tamamlandı', 'Beklemede'] as const).map(status => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setFormData({...formData, status})}
                                  className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold border transition-all ${
                                    formData.status === status 
                                      ? (status === 'Tamamlandı' ? 'bg-focus-main/15 text-focus-main border-focus-main/30' : 'bg-nrg-sun/15 text-nrg-sun border-nrg-sun/30')
                                      : 'bg-white/[0.01] border-white/5 text-text-secondary hover:bg-white/5'
                                  }`}
                                >
                                  {status === 'Tamamlandı' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: CATEGORY & SOURCE */}
                    {wizardStep === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Başlık / Tanım</label>
                          <input 
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Örn: Haziran Hakedişi, Kira Geliri, Yatırım Temettü..."
                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-text-primary focus:outline-none focus:border-focus-neon/30"
                            autoFocus
                          />
                        </div>

                        {/* Beautiful category grids with dots */}
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Kategori Grubu</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {CATEGORIES.map((cat, idx) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setFormData({...formData, category: cat})}
                                className={`flex items-center gap-2 py-3 px-3.5 rounded-xl text-xs font-medium border transition-all ${
                                  formData.category === cat 
                                    ? 'bg-focus-neon/15 border-focus-neon text-focus-neon' 
                                    : 'bg-white/[0.01] border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="truncate">{cat}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Müşteri / Kurum / Kaynak</label>
                          <div className="relative">
                            <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input 
                              type="text"
                              value={formData.source}
                              onChange={(e) => setFormData({...formData, source: e.target.value})}
                              placeholder="Örn: Global Soft Ltd, Ahmet Bey, Kira Yatırımı..."
                              className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-xs text-text-primary focus:outline-none focus:border-focus-neon/30"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: ADVANCED CONFIGURATION */}
                    {wizardStep === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Tekrarlanma Periyodu</label>
                          <div className="grid grid-cols-4 gap-2">
                            {['Tek Seferlik', 'Haftalık', 'Aylık', 'Yıllık'].map(rec => (
                              <button
                                key={rec}
                                type="button"
                                onClick={() => setFormData({...formData, recurrence: rec as any})}
                                className={`py-3 rounded-xl text-[11px] font-bold border transition-all ${
                                  formData.recurrence === rec 
                                    ? 'bg-focus-main/15 border-focus-main text-focus-main' 
                                    : 'bg-white/[0.01] border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10'
                                }`}
                              >
                                {rec}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Raporlama Etiketleri (Pills)</label>
                          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl focus-within:border-focus-neon/30 transition-colors">
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              {formData.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-medium text-text-primary">
                                  <Tag size={10} className="text-focus-neon" />
                                  {tag}
                                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-crit-vivid ml-1"><X size={10}/></button>
                                </span>
                              ))}
                              {(!formData.tags || formData.tags.length === 0) && (
                                <span className="text-[10px] text-text-secondary italic">Henüz etiket eklenmedi. (örn: avans, yurtdisi, bonus)</span>
                              )}
                            </div>
                            <input 
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={addTag}
                              placeholder="Etiket ekle ve Enter'a bas..."
                              className="w-full bg-transparent border-t border-white/5 pt-2.5 text-xs text-text-primary focus:outline-none placeholder:text-text-secondary/40"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider font-semibold">Operasyonel Notlar</label>
                          <textarea 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="İşlem detayları, hakediş oranları, gecikme durumları vb..."
                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-text-primary focus:outline-none focus:border-focus-neon/30 min-h-[90px] resize-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </form>
              </div>

              {/* Wizard Footer Controls */}
              <div className="p-6 border-t border-white/5 bg-[#121212] flex justify-between items-center z-10">
                <button 
                  onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setIsWizardOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-1.5 transition-colors"
                >
                  {wizardStep > 1 ? <><ChevronLeft size={14}/> Geri</> : 'İptal'}
                </button>
                
                {wizardStep < 3 ? (
                  <button 
                    onClick={() => {
                      if (wizardStep === 1 && (!formData.originalAmount)) {
                        alert('Lütfen işlem tutarını giriniz.');
                        return;
                      }
                      setWizardStep(wizardStep + 1);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-white hover:bg-white/10 flex items-center gap-1 transition-colors"
                  >
                    Devam <ChevronRight size={14}/>
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveIncome}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-focus-neon text-pure-black hover:bg-focus-neon/90 shadow-[0_0_15px_rgba(11,216,170,0.2)] transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14}/> Kaydet
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Income Detail Modal */}
      <AnimatePresence>
        {selectedIncome && !isWizardOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              {/* Modal Actions */}
              <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                {!selectedIncome.isDynamic && (
                  <>
                    <button 
                      onClick={() => handleOpenWizard(selectedIncome)}
                      className="p-2 text-text-secondary hover:text-focus-neon bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                      title="Düzenle"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      onClick={() => handleDeleteIncome(selectedIncome.id)}
                      className="p-2 text-text-secondary hover:text-crit-vivid bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
                <div className="w-px h-5 bg-white/10 mx-1 self-center" />
                <button 
                  onClick={() => setSelectedIncome(null)}
                  className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Core Content */}
              <div className="p-6 pt-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedIncome.status === 'Tamamlandı' ? 'bg-focus-main/10 text-focus-main border-focus-main/20' : 'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'}`}>
                    {selectedIncome.status === 'Tamamlandı' ? <Wallet size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <span className={`text-[9px] uppercase tracking-wider font-bold ${selectedIncome.status === 'Tamamlandı' ? 'text-focus-main' : 'text-nrg-sun'}`}>
                      {selectedIncome.status}
                    </span>
                    <span className="text-xs text-text-secondary block font-mono">{new Date(selectedIncome.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                
                <h2 className="text-lg font-display font-black text-text-primary leading-tight pr-14">
                  {selectedIncome.title}
                </h2>

                <div className="mt-3.5 bg-white/[0.01] border border-white/5 p-4 rounded-xl flex justify-between items-baseline">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">İşlem Tutarı</span>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-black text-focus-neon">
                      {formatValue(selectedIncome.amount)}
                    </p>
                    {selectedIncome.currency && selectedIncome.currency !== 'TRY' && (
                      <span className="text-[10px] font-mono text-text-secondary block">
                        Döviz: {selectedIncome.originalAmount} {selectedIncome.currency} (Kur: {selectedIncome.exchangeRate} ₺)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider block mb-0.5">Kategori</span>
                    <span className="text-xs font-semibold text-text-primary">{selectedIncome.category}</span>
                  </div>
                  <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider block mb-0.5">Tekrarlama</span>
                    <span className="text-xs font-semibold text-text-primary">{selectedIncome.recurrence || 'Tek Seferlik'}</span>
                  </div>
                  <div className="col-span-2 bg-white/[0.01] p-3 rounded-xl border border-white/5 flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/5 rounded-lg text-text-secondary"><Briefcase size={14}/></div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider block">Kaynak / Müşteri</span>
                      <span className="text-xs font-semibold text-text-primary">{selectedIncome.source || '-'}</span>
                    </div>
                  </div>
                </div>

                {selectedIncome.tags && selectedIncome.tags.length > 0 && (
                  <div className="mt-4">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider block mb-2">Etiketler</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIncome.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-medium text-text-primary">
                          <Tag size={10} className="text-focus-neon opacity-70" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedIncome.notes && (
                  <div className="mt-4">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider block mb-1.5">Açıklama</span>
                    <div className="text-xs text-text-secondary leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-white/5">
                      {selectedIncome.notes}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Stat Breakdown Modal */}
      <AnimatePresence>
        {summaryModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6"
            >
              <button 
                onClick={() => setSummaryModal(null)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors z-10"
              >
                <X size={15} />
              </button>
              <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                {summaryModal.title}
              </h2>
              <p className="text-3xl font-display font-black text-text-primary mb-5">
                {summaryModal.value}
              </p>
              
              <div className="bg-white/[0.01] rounded-xl border border-white/5 max-h-[220px] overflow-y-auto custom-scrollbar">
                 {summaryModal.type === 'completed' || summaryModal.type === 'pending' ? (
                   <div className="p-3.5 space-y-2.5">
                     {incomes
                       .filter(inc => summaryModal.type === 'completed' ? inc.status === 'Tamamlandı' : inc.status === 'Beklemede')
                       .slice(0, 5)
                       .map(inc => (
                         <div key={inc.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                           <div className="truncate pr-2">
                             <p className="text-xs font-bold text-text-primary truncate">{inc.title}</p>
                             <p className="text-[9px] text-text-secondary">{new Date(inc.date).toLocaleDateString('tr-TR')}</p>
                           </div>
                           <span className="text-xs font-mono font-bold text-focus-neon shrink-0">
                             {formatValue(inc.amount)}
                           </span>
                         </div>
                       ))}
                     {incomes.filter(inc => summaryModal.type === 'completed' ? inc.status === 'Tamamlandı' : inc.status === 'Beklemede').length === 0 && (
                       <p className="text-[10px] text-text-secondary text-center py-2 italic">Herhangi bir kayıt bulunamadı.</p>
                     )}
                   </div>
                 ) : (
                   <div className="p-4">
                     <p className="text-xs text-text-secondary leading-relaxed">Bu metrik, hakediş ve ödeme verilerinizi gerçek zamanlı olarak derleyen akıllı analiz motoru tarafından raporlanmıştır.</p>
                   </div>
                 )}
              </div>

              <div className="mt-5 flex justify-end">
                 <button onClick={() => setSummaryModal(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors">
                   Kapat
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
export default FinanceIncomes;
