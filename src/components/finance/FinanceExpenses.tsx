import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { getRollovers } from './financeUtils';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  Calendar,
  X,
  Tag,
  CheckCircle2,
  Clock,
  ArrowRight,
  PieChart as PieChartIcon,
  Activity,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  ShoppingBag,
  BarChart3,
  Globe,
  RefreshCw,
  Info,
  Target,
  ArrowDownRight,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  tags: string[];
  date: string;
  status: 'Gerçekleşti' | 'Planlı';
  recurrence?: 'Tek Seferlik' | 'Haftalık' | 'Aylık' | 'Yıllık';
  recipient: string;
  notes?: string;
  isDynamic?: boolean;
  currency?: 'TRY' | 'USD' | 'EUR' | 'GBP';
  originalAmount?: number;
  exchangeRate?: number;
}

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

const CATEGORIES = ['Barınma', 'Gıda', 'Fatura', 'Seyahat', 'Eğlence', 'Sağlık', 'Ulaşım', 'Diğer'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#64748b'];

export const FinanceExpenses = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('finance_expenses', []);
  const [incomes] = useLocalStorage<any[]>('finance_incomes', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [displayCurrency, setDisplayCurrency] = useLocalStorage<'TRY' | 'USD' | 'EUR' | 'GBP'>('finance_display_currency', 'TRY');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [rateFetchTime, setRateFetchTime] = useState<string | null>(null);

  // Smart Monthly Expense Goal & Limit Tracker state
  const [expenseLimit, setExpenseLimit] = useLocalStorage<number>('finance_expense_monthly_limit', 30000);
  const [showLimitEdit, setShowLimitEdit] = useState(false);
  const [tempLimitInput, setTempLimitInput] = useState<string>('30000');

  // Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isEditingWizard, setIsEditingWizard] = useState(false);
  
  // View/Edit Modal States
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [summaryModal, setSummaryModal] = useState<{title: string; value: string; type: string} | null>(null);

  // New Interactive Chart States
  const [donutHovered, setDonutHovered] = useState<{ name: string; value: number } | null>(null);
  const [donutTab, setDonutTab] = useState<'kategori' | 'aylik'>('kategori');
  const [activeChartTab, setActiveChartTab] = useState<'donut' | 'trend' | 'sources' | 'cumulative'>('donut');

  // Form States
  const defaultFormState: Partial<Expense> = {
    title: '', 
    amount: 0, 
    category: 'Gıda', 
    tags: [], 
    date: '2026-07-03', 
    status: 'Gerçekleşti', 
    recipient: '', 
    notes: '', 
    recurrence: 'Tek Seferlik',
    currency: 'TRY',
    originalAmount: 0,
    exchangeRate: 1.0
  };
  const [formData, setFormData] = useState<Partial<Expense>>(defaultFormState);
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
  const { rolloverExpenses } = useMemo(() => {
    return getRollovers(incomes, expenses);
  }, [incomes, expenses]);

  // Combine actual and dynamic rollover expenses (excluding future ones from the transaction list)
  const allExpenses = useMemo(() => {
    const activeRollovers = (rolloverExpenses || []).filter(r => r && !r.isFuture);
    return [...expenses, ...activeRollovers];
  }, [expenses, rolloverExpenses]);

  // Global Currency Formatting helper
  const formatValue = (valueInTry: number) => {
    if (displayCurrency === 'TRY') {
      return `₺${valueInTry.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    const converted = valueInTry / rate;
    return `${CURRENCY_SYMBOLS[displayCurrency]}${converted.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // --- DERIVED DATA ---
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      const matchesSearch = (exp.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                            (exp.recipient || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                            (exp.notes || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                            (exp.tags || []).some(t => t.toLowerCase().includes((searchTerm || '').toLowerCase()));
      const matchesCategory = selectedCategory === 'Tümü' || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allExpenses, searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    let total = 0, planned = 0, currMonth = 0, lastMonth = 0;
    const now = new Date(2026, 6, 3); // Today is 3 July 2026 (based on system context)
    const currentMonthNum = now.getMonth();
    const currentYearNum = now.getFullYear();
    const lastMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
    const lastMonthYearNum = currentMonthNum === 0 ? currentYearNum - 1 : currentYearNum;

    allExpenses.forEach(e => {
      const d = new Date(e.date);
      const isFuture = d > now;

      if (e.status === 'Gerçekleşti' && !isFuture) {
        total += e.amount;
        if (d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum) currMonth += e.amount;
        if (d.getMonth() === lastMonthNum && d.getFullYear() === lastMonthYearNum) lastMonth += e.amount;
      } else {
        planned += e.amount;
      }
    });

    const growth = lastMonth === 0 ? (currMonth > 0 ? 100 : 0) : (((currMonth - lastMonth) / lastMonth) * 100);
    return { 
      totalExpense: total, 
      plannedExpense: planned, 
      currentMonthExpense: currMonth, 
      lastMonthExpense: lastMonth,
      growth: growth.toFixed(1)
    };
  }, [allExpenses]);

  const categoryData = useMemo(() => {
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    return CATEGORIES.map(cat => ({
      name: cat,
      value: Number((allExpenses.filter(e => e.category === cat && e.status === 'Gerçekleşti').reduce((sum, e) => sum + e.amount, 0) / rate).toFixed(2))
    })).filter(c => c.value > 0);
  }, [allExpenses, displayCurrency, exchangeRates]);

  // Monthly distribution of completed/realized expenses for Donut Chart
  const monthlyData = useMemo(() => {
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    const monthsMap: Record<string, number> = {};
    
    allExpenses.filter(e => e.status === 'Gerçekleşti').forEach(e => {
      const d = new Date(e.date);
      const monthName = d.toLocaleDateString('tr-TR', { month: 'long' });
      monthsMap[monthName] = (monthsMap[monthName] || 0) + e.amount;
    });

    return Object.entries(monthsMap).map(([name, value]) => ({
      name,
      value: Number((value / rate).toFixed(2))
    })).sort((a, b) => b.value - a.value);
  }, [allExpenses, displayCurrency, exchangeRates]);

  // Generate 6 months data for charts (converted to selected display currency)
  const monthlyTrendData = useMemo(() => {
    const data = [];
    const now = new Date(2026, 6, 3);
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('tr-TR', { month: 'short' });
      const yearStr = d.getFullYear().toString().slice(-2);
      
      const monthExpenses = allExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear() && exp.status === 'Gerçekleşti';
      });
      const monthPlanned = allExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear() && exp.status === 'Planlı';
      });

      data.push({
        name: `${monthStr} '${yearStr}`,
        Gerçekleşen: Number((monthExpenses.reduce((acc, curr) => acc + curr.amount, 0) / rate).toFixed(0)),
        Planlı: Number((monthPlanned.reduce((acc, curr) => acc + curr.amount, 0) / rate).toFixed(0))
      });
    }
    return data;
  }, [allExpenses, displayCurrency, exchangeRates]);

  const topRecipient = useMemo(() => {
    const recipientMap: Record<string, number> = {};
    allExpenses.filter(e => e.status === 'Gerçekleşti').forEach(e => {
      if (e.recipient) {
        recipientMap[e.recipient] = (recipientMap[e.recipient] || 0) + e.amount;
      }
    });
    const entries = Object.entries(recipientMap);
    if (entries.length === 0) return '-';
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [allExpenses]);

  // Top recipients/institutions for horizontal bar chart
  const recipientsChartData = useMemo(() => {
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    const recipientMap: Record<string, number> = {};
    
    allExpenses.filter(e => e.status === 'Gerçekleşti').forEach(e => {
      const rc = e.recipient || 'Diğer/Belirtilmemiş';
      recipientMap[rc] = (recipientMap[rc] || 0) + e.amount;
    });

    return Object.entries(recipientMap)
      .map(([name, value]) => ({
        name,
        Tutar: Number((value / rate).toFixed(2))
      }))
      .sort((a, b) => b.Tutar - a.Tutar)
      .slice(0, 5);
  }, [allExpenses, displayCurrency, exchangeRates]);

  // Cumulative Trajectory Area Chart Data
  const cumulativeExpensesData = useMemo(() => {
    const rate = exchangeRates[displayCurrency] || DEFAULT_RATES[displayCurrency];
    const sortedExpenses = [...allExpenses]
      .filter(e => e.status === 'Gerçekleşti')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalCumulative = 0;
    const data = sortedExpenses.map(exp => {
      totalCumulative += exp.amount;
      return {
        date: new Date(exp.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        "Birikimli Gider": Number((totalCumulative / rate).toFixed(2)),
        "Tekil Gider": Number((exp.amount / rate).toFixed(2)),
        title: exp.title
      };
    });

    return data.slice(-12); // Limit to last 12 points
  }, [allExpenses, displayCurrency, exchangeRates]);

  // Combined Donut Chart data helper
  const activeDonutData = useMemo(() => {
    return donutTab === 'kategori' ? categoryData : monthlyData;
  }, [donutTab, categoryData, monthlyData]);

  // Sum of donut values for calculating percentage
  const totalDonutValue = useMemo(() => {
    return activeDonutData.reduce((acc, curr) => acc + curr.value, 0);
  }, [activeDonutData]);

  // --- ACTIONS ---
  const handleOpenWizard = (expenseToEdit?: Expense) => {
    if (expenseToEdit) {
      setFormData({
        ...expenseToEdit,
        currency: expenseToEdit.currency || 'TRY',
        originalAmount: expenseToEdit.originalAmount || expenseToEdit.amount,
        exchangeRate: expenseToEdit.exchangeRate || 1.0
      });
      setIsEditingWizard(true);
    } else {
      setFormData(defaultFormState);
      setIsEditingWizard(false);
    }
    setWizardStep(1);
    setIsWizardOpen(true);
    setSelectedExpense(null);
  };

  const handleSaveExpense = () => {
    if (!formData.title || !formData.amount) return;
    
    if (isEditingWizard && formData.id) {
      setExpenses(expenses.map(exp => exp.id === formData.id ? { ...formData } as Expense : exp));
    } else {
      const newExpense: Expense = {
        ...(formData as any),
        id: Date.now().toString(),
        category: formData.category || 'Diğer',
        tags: formData.tags || [],
        date: formData.date || new Date().toISOString().split('T')[0],
        status: formData.status as 'Gerçekleşti' | 'Planlı',
        recurrence: formData.recurrence as 'Tek Seferlik' | 'Haftalık' | 'Aylık' | 'Yıllık',
        recipient: formData.recipient || '',
        currency: formData.currency || 'TRY',
        originalAmount: formData.originalAmount || formData.amount,
        exchangeRate: formData.exchangeRate || 1.0
      };
      setExpenses([newExpense, ...expenses]);
    }
    
    setIsWizardOpen(false);
    setFormData(defaultFormState);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Bu gider kaydını silmek istediğinize emin misiniz?')) {
      setExpenses(expenses.filter(e => e.id !== id));
      setSelectedExpense(null);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-display font-black tracking-tight text-text-primary flex items-center gap-2">
            <span className="p-1.5 bg-crit-vivid/10 text-crit-vivid rounded-lg">
              <TrendingDown size={20} />
            </span>
            Gider Merkezi & Bütçe
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Canlı döviz kurları ile entegre bütçe denetimi, gider izleme ve görsel analiz paneli.
          </p>
        </div>

        {/* Currency Selectors & Wizard Trigger */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Currency Selector Buttons */}
          <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1 shrink-0">
            {(['TRY', 'USD', 'EUR', 'GBP'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setDisplayCurrency(curr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  displayCurrency === curr 
                    ? 'bg-crit-vivid/10 text-crit-vivid border border-crit-vivid/20 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Live Rate Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.01] border border-white/5 rounded-xl text-[10px] text-text-secondary">
            <Globe size={11} className={isFetchingRates ? 'animate-spin text-crit-vivid' : 'text-crit-vivid'} />
            <span className="font-mono">
              {isFetchingRates ? 'Kurlar güncelleniyor...' : `Canlı Kur (USD: ₺${exchangeRates.USD})`}
            </span>
            <button 
              onClick={fetchRates} 
              type="button"
              className="p-1 hover:bg-white/5 rounded-md transition-all text-text-secondary hover:text-text-primary"
              title="Kurları Yenile"
            >
              <RefreshCw size={10} />
            </button>
          </div>

          <button 
            onClick={() => handleOpenWizard()}
            className="flex items-center gap-2 bg-crit-vivid text-pure-white font-bold px-4 py-2.5 rounded-xl hover:bg-crit-vivid/90 transition-all shadow-lg shadow-crit-vivid/20 active:scale-95 text-xs ml-auto xl:ml-0"
          >
            <Plus size={15} />
            <span>Gider Ekle</span>
          </button>
        </div>
      </div>

      {/* Modern Compact Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => setSummaryModal({ title: 'Toplam Gerçekleşen', value: formatValue(stats.totalExpense), type: 'completed' })}
          className="bg-white/[0.01] border border-white/5 p-5 rounded-xl cursor-pointer hover:bg-white/[0.03] hover:border-crit-vivid/30 transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Toplam Gider</span>
            <div className="p-2 bg-crit-vivid/10 rounded-lg text-crit-vivid group-hover:scale-105 transition-transform">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-text-primary">
            {formatValue(stats.totalExpense)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-text-secondary">Gerçekleşen Toplam Harcama</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => setSummaryModal({ title: 'Planlı Ödemeler', value: formatValue(stats.plannedExpense), type: 'planned' })}
          className="bg-white/[0.01] border border-white/5 p-5 rounded-xl cursor-pointer hover:bg-white/[0.03] hover:border-nrg-sun/30 transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Planlı Ödemeler</span>
            <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun group-hover:scale-105 transition-transform">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-text-primary">
            {formatValue(stats.plannedExpense)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-text-secondary">Gelecek Dönem Giderleri</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => setSummaryModal({ title: 'Aylık Değişim', value: `${Number(stats.growth) >= 0 ? '+' : ''}${stats.growth}%`, type: 'trend' })}
          className="bg-white/[0.01] border border-white/5 p-5 rounded-xl cursor-pointer hover:bg-white/[0.03] hover:border-ai-bright/30 transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Aylık Değişim</span>
            <div className={`p-2 rounded-lg group-hover:scale-105 transition-transform ${Number(stats.growth) <= 0 ? 'bg-focus-main/10 text-focus-main' : 'bg-crit-vivid/10 text-crit-vivid'}`}>
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-text-primary">
            {Number(stats.growth) >= 0 ? '+' : ''}{stats.growth}%
          </p>
          <div className="mt-2 flex items-center gap-1">
            {Number(stats.growth) >= 0 ? (
              <ArrowUpRight size={12} className="text-crit-vivid" />
            ) : (
              <ArrowDownRight size={12} className="text-focus-main" />
            )}
            <span className="text-[10px] text-text-secondary">Geçen aya kıyasla</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => setSummaryModal({ title: 'En Fazla Ödenen', value: topRecipient, type: 'recipient' })}
          className="bg-white/[0.01] border border-white/5 p-5 rounded-xl cursor-pointer hover:bg-white/[0.03] hover:border-focus-main/30 transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">En Fazla Ödenen</span>
            <div className="p-2 bg-focus-main/10 rounded-lg text-focus-main group-hover:scale-105 transition-transform">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-lg font-display font-black text-text-primary truncate">
            {topRecipient}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="text-[10px] text-text-secondary">En büyük harcama muhatabı</span>
          </div>
        </div>
      </div>

      {/* Main Split Interface Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3 Area: Filter & Compact Smart List */}
        <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-crit-vivid" />
              <h2 className="text-sm font-bold text-text-primary">Gider Akışı & Hareketleri</h2>
            </div>

            {/* Quick compact category filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
              {['Tümü', ...CATEGORIES.slice(0, 3), 'Diğer'].map(cat => (
                <button
                  key={cat}
                  type="button"
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
              placeholder="Hızlı Arama: Başlık, Alıcı, Not veya Etiket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-text-primary focus:outline-none focus:border-crit-vivid/40 transition-colors"
            />
          </div>

          {/* Interactive Compact List Container */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {filteredExpenses.length === 0 ? (
              <div className="py-16 text-center bg-white/[0.005] rounded-xl border border-dashed border-white/5">
                <Search size={28} className="mx-auto opacity-20 mb-2" />
                <p className="text-xs text-text-secondary">Filtrelerle eşleşen bir gider hareketi bulunamadı.</p>
              </div>
            ) : (
              filteredExpenses.map((expense) => {
                const isForeign = expense.currency && expense.currency !== 'TRY';
                return (
                  <div 
                    key={expense.id} 
                    onClick={() => setSelectedExpense(expense)}
                    className="flex items-center justify-between p-3.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Category specific color dot */}
                      <span className="w-1.5 h-8 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[CATEGORIES.indexOf(expense.category) % COLORS.length] || '#ccc' }} 
                      />
                      
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-primary group-hover:text-crit-vivid transition-colors truncate">
                            {expense.title}
                          </span>
                          
                          {/* Currency badge if foreign */}
                          {isForeign && (
                            <span className="text-[9px] font-bold text-crit-vivid bg-crit-vivid/15 border border-crit-vivid/20 px-1.5 py-0.5 rounded-md leading-none uppercase">
                              {expense.originalAmount} {expense.currency}
                            </span>
                          )}

                          {expense.isDynamic && (
                            <span className="text-[9px] font-bold text-crit-vivid bg-crit-vivid/15 border border-crit-vivid/25 px-1.5 py-0.5 rounded-md leading-none uppercase">
                              Sistem Devri
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                          <span>{expense.recipient || 'Bilinmeyen Alıcı'}</span>
                          <span>•</span>
                          <span>{expense.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        {/* Final formatted display value */}
                        <div className="text-xs font-mono font-bold text-text-primary group-hover:text-crit-vivid transition-colors">
                          {formatValue(expense.amount)}
                        </div>
                        {/* Date */}
                        <div className="text-[10px] font-mono text-text-secondary">
                          {new Date(expense.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>

                      {/* Simple visual status checkmark */}
                      <span className={`p-1.5 rounded-lg border ${
                        expense.status === 'Gerçekleşti' 
                          ? 'bg-crit-vivid/10 text-crit-vivid border-crit-vivid/20' 
                          : 'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'
                      }`}>
                        {expense.status === 'Gerçekleşti' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chart & Smart Budget Tracker */}
        <div className="space-y-6">
          
          {/* Chart Card */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <PieChartIcon size={14} className="text-crit-vivid" />
                Grafik & Analiz Paneli
              </h3>
            </div>

            {/* Chart Tabs Bar */}
            <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1 mb-4">
              <button
                key="donut"
                type="button"
                onClick={() => setActiveChartTab('donut')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  activeChartTab === 'donut' 
                    ? 'bg-crit-vivid/15 text-crit-vivid border border-crit-vivid/10 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <PieChartIcon size={12} />
                <span className="hidden sm:inline">Dairesel</span>
              </button>
              <button
                key="trend"
                type="button"
                onClick={() => setActiveChartTab('trend')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  activeChartTab === 'trend' 
                    ? 'bg-crit-vivid/15 text-crit-vivid border border-crit-vivid/10 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <TrendingDown size={12} />
                <span className="hidden sm:inline">Trend</span>
              </button>
              <button
                key="sources"
                type="button"
                onClick={() => setActiveChartTab('sources')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  activeChartTab === 'sources' 
                    ? 'bg-crit-vivid/15 text-crit-vivid border border-crit-vivid/10 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <ShoppingBag size={12} />
                <span className="hidden sm:inline">Alıcılar</span>
              </button>
              <button
                key="cumulative"
                type="button"
                onClick={() => setActiveChartTab('cumulative')}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  activeChartTab === 'cumulative' 
                    ? 'bg-crit-vivid/15 text-crit-vivid border border-crit-vivid/10 shadow-sm' 
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
                        <span className="text-[9px] font-mono font-bold text-crit-vivid bg-crit-vivid/10 border border-crit-vivid/20 px-2 py-0.5 rounded-full mt-2">
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

            {/* Tab 2: Monthly Trend */}
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
                        <Bar dataKey="Gerçekleşen" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gerçekleşen" />
                        <Bar dataKey="Planlı" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Planlı" />
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
                    <span className="w-2.5 h-1 rounded-full bg-[#ef4444]" />
                    <span>Gerçekleşen</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <span className="w-2.5 h-1 rounded-full bg-[#f59e0b]" />
                    <span>Planlı</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Top Recipients (Horizontal Bar Chart) */}
            {activeChartTab === 'sources' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="h-[210px] w-full">
                  {recipientsChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={recipientsChartData} 
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
                        <Bar dataKey="Tutar" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-secondary italic">
                      Alıcı verisi bulunmuyor
                    </div>
                  )}
                </div>
                
                <p className="text-[9px] text-text-secondary text-center italic border-t border-white/5 pt-3">
                  İşlem hacmine göre en yüksek ödeme yapılan ilk 5 alıcı / kurum.
                </p>
              </div>
            )}

            {/* Tab 4: Cumulative Trajectory Area Chart */}
            {activeChartTab === 'cumulative' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="h-[210px] w-full">
                  {cumulativeExpensesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cumulativeExpensesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                        <Area type="monotone" dataKey="Birikimli Gider" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-secondary italic">
                      Gider birikim verisi bulunmuyor
                    </div>
                  )}
                </div>
                
                <p className="text-[9px] text-text-secondary text-center italic border-t border-white/5 pt-3">
                  Gerçekleşen tüm harcamaların zaman içindeki birikimli gidişat eğrisi.
                </p>
              </div>
            )}
          </div>

          {/* Smart Expense Budget & Milestone Tracker Widget */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-crit-vivid animate-pulse" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Aylık Harcama Limiti</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showLimitEdit) {
                    const parsed = parseFloat(tempLimitInput);
                    if (!isNaN(parsed) && parsed > 0) {
                      setExpenseLimit(parsed);
                    }
                  } else {
                    setTempLimitInput(expenseLimit.toString());
                  }
                  setShowLimitEdit(!showLimitEdit);
                }}
                className="text-[10px] text-crit-vivid hover:underline font-bold transition-all"
              >
                {showLimitEdit ? 'Kaydet' : 'Düzenle'}
              </button>
            </div>

            {showLimitEdit ? (
              <div className="flex gap-2 animate-fadeIn">
                <input
                  type="number"
                  min="1"
                  value={tempLimitInput}
                  onChange={(e) => setTempLimitInput(e.target.value)}
                  className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs text-text-primary focus:outline-none focus:border-crit-vivid/30"
                  placeholder="Limit Tutar (₺)"
                />
                <button
                  type="button"
                  onClick={() => setShowLimitEdit(false)}
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
                    <span className="text-[10px] text-text-secondary block">BU AYKİ TOPLAM GİDER</span>
                    <span className="text-base font-mono font-black text-white">
                      ₺{stats.currentMonthExpense.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] text-text-secondary block">LİMİT (₺)</span>
                    <span className="text-sm font-mono font-bold text-text-primary">
                      ₺{expenseLimit.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-text-secondary">
                    <span>Aylık Bütçe Tüketimi</span>
                    <span className={`font-mono font-bold ${
                      (stats.currentMonthExpense / expenseLimit) >= 1.0 ? 'text-crit-vivid' : 
                      (stats.currentMonthExpense / expenseLimit) >= 0.8 ? 'text-nrg-sun' : 'text-focus-main'
                    }`}>
                      %{Math.round((stats.currentMonthExpense / expenseLimit) * 100) || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        (stats.currentMonthExpense / expenseLimit) >= 1.0 ? 'bg-gradient-to-r from-crit-vivid to-[#f43f5e]' :
                        (stats.currentMonthExpense / expenseLimit) >= 0.8 ? 'bg-gradient-to-r from-nrg-sun to-crit-vivid' : 'bg-gradient-to-r from-focus-main to-nrg-sun'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((stats.currentMonthExpense / expenseLimit) * 100)) || 0}%` }}
                    />
                  </div>
                </div>

                {/* Milestones status */}
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl space-y-2">
                  <span className="text-[9px] text-text-secondary font-black uppercase tracking-wider block">Bütçe Koruma Durumu</span>
                  
                  <div className="space-y-2">
                    {/* Badge 1: Under 100% */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${stats.currentMonthExpense <= expenseLimit ? 'grayscale-0 opacity-100' : 'grayscale opacity-30'}`}>🥉</span>
                        <span className={`font-bold ${stats.currentMonthExpense <= expenseLimit ? 'text-white/90' : 'text-text-secondary'}`}>
                          Bronz (Güvenli Sınır)
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-text-secondary">₺{expenseLimit.toLocaleString('tr-TR')}</span>
                    </div>

                    {/* Badge 2: Under 80% */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${stats.currentMonthExpense <= expenseLimit * 0.80 ? 'grayscale-0 opacity-100' : 'grayscale opacity-30'}`}>🥈</span>
                        <span className={`font-bold ${stats.currentMonthExpense <= expenseLimit * 0.80 ? 'text-white/90' : 'text-text-secondary'}`}>
                          Gümüş (Dengeli Tüketim)
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-text-secondary">₺{(expenseLimit * 0.8).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                    </div>

                    {/* Badge 3: Under 60% */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${stats.currentMonthExpense <= expenseLimit * 0.60 ? 'grayscale-0 opacity-100' : 'grayscale opacity-30'}`}>🥇</span>
                        <span className={`font-bold ${stats.currentMonthExpense <= expenseLimit * 0.60 ? 'text-white/90' : 'text-text-secondary'}`}>
                          Altın (Bütçe Koruyucu)
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-text-secondary">₺{(expenseLimit * 0.6).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                {/* Projections Tip */}
                <div className={`text-[9px] flex items-start gap-1.5 p-2.5 rounded-lg border ${
                  stats.currentMonthExpense > expenseLimit 
                    ? 'bg-crit-vivid/5 border-crit-vivid/10 text-crit-vivid' 
                    : 'bg-focus-main/5 border-focus-main/10 text-focus-main'
                }`}>
                  <Info size={11} className="shrink-0 mt-0.5" />
                  <span>
                    {stats.currentMonthExpense > expenseLimit 
                      ? `Bütçe aşımı gerçekleşti! Limitinizden ₺${(stats.currentMonthExpense - expenseLimit).toLocaleString('tr-TR')} daha fazla harcadınız. Harcamalarınızı acilen kısın.`
                      : `Mevcut bütçe limitinizden geriye kalan miktar: ₺${(expenseLimit - stats.currentMonthExpense).toLocaleString('tr-TR')}. Güvenli bölgedesiniz!`}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: 'calc(100vh - 40px)' }}
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-display font-black text-text-primary flex items-center gap-2">
                    <Plus size={20} className="text-crit-vivid" />
                    {isEditingWizard ? 'Gider Kaydını Düzenle' : 'Akıllı Gider Ekleme Sihirbazı'}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">Adım {wizardStep} / 3: {wizardStep === 1 ? 'Temel Bilgiler' : wizardStep === 2 ? 'Kategori & Alıcı' : 'Gelişmiş Detaylar'}</p>
                </div>
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex h-1 bg-white/5">
                <div className="bg-crit-vivid transition-all duration-300" style={{ width: `${(wizardStep / 3) * 100}%` }} />
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative min-h-[300px]">
                <form id="smart-wizard" onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  
                  <AnimatePresence mode="wait">
                    {/* STEP 1: BASIC INFO */}
                    {wizardStep === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Gider Başlığı <span className="text-crit-vivid">*</span></label>
                          <input 
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Örn: Ofis Kirası"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-base text-text-primary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                            autoFocus
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tutar (₺) <span className="text-crit-vivid">*</span></label>
                            <div className="relative">
                              <Receipt size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                              <input 
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount || ''}
                                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                                placeholder="0.00"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-4 text-lg font-mono font-bold text-text-primary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tarih <span className="text-crit-vivid">*</span></label>
                            <input 
                              required
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData({...formData, date: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-base font-mono text-text-primary focus:outline-none focus:border-crit-vivid/50 [color-scheme:dark] transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Durum</label>
                          <div className="grid grid-cols-2 gap-3">
                            {(['Gerçekleşti', 'Planlı'] as const).map(status => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setFormData({...formData, status})}
                                className={`flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold border transition-all ${
                                  formData.status === status 
                                    ? (status === 'Gerçekleşti' ? 'bg-crit-vivid/20 text-crit-vivid border-crit-vivid/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-nrg-sun/20 text-nrg-sun border-nrg-sun/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]')
                                    : 'bg-white/[0.02] border-white/5 text-text-secondary hover:bg-white/[0.05]'
                                }`}
                              >
                                {status === 'Gerçekleşti' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: CATEGORY & RECIPIENT */}
                    {wizardStep === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Kategori Seçimi</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setFormData({...formData, category: cat})}
                                className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                                  formData.category === cat 
                                    ? 'bg-crit-vivid/10 text-crit-vivid border-crit-vivid/50' 
                                    : 'bg-white/[0.02] border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Alıcı / Kurum / Satıcı</label>
                          <div className="relative">
                            <ShoppingBag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input 
                              type="text"
                              value={formData.recipient}
                              onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                              placeholder="Örn: Ev Sahibi, Market, Havayolu Şirketi"
                              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-4 text-base text-text-primary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                            />
                          </div>
                          <p className="text-xs text-text-secondary mt-2 opacity-70">Giderin alıcısını belirtmek ileride finansal raporlarınızı daha doğru analiz etmenizi sağlar.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: ADVANCED */}
                    {wizardStep === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tekrarlama Sıklığı</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Tek Seferlik', 'Haftalık', 'Aylık', 'Yıllık'].map(rec => (
                              <button
                                key={rec}
                                type="button"
                                onClick={() => setFormData({...formData, recurrence: rec as any})}
                                className={`py-3 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                                  formData.recurrence === rec 
                                    ? 'bg-ai-bright/10 text-ai-bright border-ai-bright/50' 
                                    : 'bg-white/[0.02] border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20'
                                }`}
                              >
                                {rec}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Etiketler (Tags)</label>
                          <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl focus-within:border-crit-vivid/50 transition-colors">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {formData.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-text-primary">
                                  <Tag size={12} className="text-crit-vivid" />
                                  {tag}
                                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-crit-vivid ml-1"><X size={14}/></button>
                                </span>
                              ))}
                              {(!formData.tags || formData.tags.length === 0) && (
                                <span className="text-xs text-text-secondary italic">Etiket eklenmedi. (örn: acil, abonelik, iş-gezisi)</span>
                              )}
                            </div>
                            <input 
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={addTag}
                              placeholder="Etiket yazıp Enter'a basın..."
                              className="w-full bg-transparent border-t border-white/10 pt-3 text-sm text-text-primary focus:outline-none placeholder:text-text-secondary/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Ek Notlar ve Detaylar</label>
                          <textarea 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Örn: Bu faturaya gecikme zammı dahil edilmiştir..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-sm text-text-primary focus:outline-none focus:border-crit-vivid/50 min-h-[100px] resize-none transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </form>
              </div>

              <div className="p-6 border-t border-white/10 bg-[#121212] flex justify-between items-center z-10">
                <button 
                  onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setIsWizardOpen(false)}
                  className="px-5 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-2 transition-colors"
                >
                  {wizardStep > 1 ? <><ChevronLeft size={16}/> Geri</> : 'İptal'}
                </button>
                
                {wizardStep < 3 ? (
                  <button 
                    onClick={() => {
                      if (wizardStep === 1 && (!formData.title || !formData.amount)) {
                        alert('Lütfen başlık ve tutar giriniz.');
                        return;
                      }
                      setWizardStep(wizardStep + 1);
                    }}
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 flex items-center gap-2 transition-colors"
                  >
                    İleri <ChevronRight size={16}/>
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveExpense}
                    className="px-8 py-3 rounded-xl text-sm font-bold bg-crit-vivid text-pure-white hover:bg-crit-vivid/90 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={18}/> Kaydet
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Detail & Action Modal */}
      <AnimatePresence>
        {selectedExpense && !isWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {!selectedExpense.isDynamic && (
                  <>
                    <button 
                      onClick={() => handleOpenWizard(selectedExpense)}
                      className="p-2 text-text-secondary hover:text-crit-vivid bg-white/5 hover:bg-white/10 rounded-xl transition-colors tooltip-trigger"
                      title="Düzenle"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteExpense(selectedExpense.id)}
                      className="p-2 text-text-secondary hover:text-crit-vivid bg-white/5 hover:bg-white/10 rounded-xl transition-colors tooltip-trigger"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                <button 
                  onClick={() => setSelectedExpense(null)}
                  className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 pt-12">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${selectedExpense.status === 'Gerçekleşti' ? 'bg-crit-vivid/10 text-crit-vivid border-crit-vivid/20' : 'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'}`}>
                    {selectedExpense.status === 'Gerçekleşti' ? <Receipt size={24} /> : <Clock size={24} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${selectedExpense.status === 'Gerçekleşti' ? 'text-crit-vivid' : 'text-nrg-sun'}`}>
                      {selectedExpense.status}
                    </span>
                    <span className="text-xs text-text-secondary">{new Date(selectedExpense.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-display font-black text-text-primary mt-4 leading-tight pr-8">
                  {selectedExpense.title}
                </h2>
                <p className="text-4xl font-display font-black text-crit-vivid mt-2 font-mono">
                  ₺{selectedExpense.amount.toLocaleString('tr-TR')}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">Kategori</span>
                    <span className="text-sm font-semibold text-text-primary">{selectedExpense.category}</span>
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">Tekrarlama</span>
                    <span className="text-sm font-semibold text-text-primary">{selectedExpense.recurrence || 'Tek Seferlik'}</span>
                  </div>
                  <div className="col-span-2 bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-text-secondary"><ShoppingBag size={16}/></div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Alıcı / Kurum</span>
                      <span className="text-sm font-semibold text-text-primary">{selectedExpense.recipient || '-'}</span>
                    </div>
                  </div>
                </div>

                {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                  <div className="mt-6">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-3">Etiketler</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpense.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-text-primary">
                          <Tag size={12} className="text-crit-vivid opacity-70" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedExpense.notes && (
                  <div className="mt-6">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-3">Açıklama / Notlar</span>
                    <div className="text-sm text-text-secondary leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      {selectedExpense.notes}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Stat Modal */}
      <AnimatePresence>
        {summaryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-8"
            >
              <button 
                onClick={() => setSummaryModal(null)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors z-10"
              >
                <X size={18} />
              </button>
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-2">
                {summaryModal.title}
              </h2>
              <p className="text-4xl font-display font-black text-text-primary mb-6">
                {summaryModal.value}
              </p>
              
              {/* Optional detail breakdown inside modal */}
              <div className="bg-white/[0.02] rounded-xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                 {summaryModal.type === 'completed' || summaryModal.type === 'planned' ? (
                   <div className="p-4 space-y-3">
                     {expenses
                       .filter(exp => summaryModal.type === 'completed' ? exp.status === 'Gerçekleşti' : exp.status === 'Planlı')
                       .slice(0, 5)
                       .map(exp => (
                         <div key={exp.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                           <div className="truncate pr-2">
                             <p className="text-sm font-bold text-text-primary truncate">{exp.title}</p>
                             <p className="text-[10px] text-text-secondary">{new Date(exp.date).toLocaleDateString('tr-TR')}</p>
                           </div>
                           <span className="text-sm font-mono font-bold text-crit-vivid shrink-0">₺{exp.amount.toLocaleString('tr-TR')}</span>
                         </div>
                       ))}
                     {expenses.filter(exp => summaryModal.type === 'completed' ? exp.status === 'Gerçekleşti' : exp.status === 'Planlı').length === 0 && (
                       <p className="text-xs text-text-secondary text-center py-2">Kayıt yok.</p>
                     )}
                   </div>
                 ) : (
                   <div className="p-4">
                     <p className="text-sm text-text-secondary">Bu metrik, sistemdeki mevcut verileriniz kullanılarak hesaplanmıştır.</p>
                   </div>
                 )}
              </div>

              <div className="mt-6 flex justify-end">
                 <button onClick={() => setSummaryModal(null)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors">
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
