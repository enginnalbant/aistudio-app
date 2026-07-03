import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { runFinanceHealthEngine, UserProfile } from '../../lib/financeHealthEngine';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  Bell, 
  ArrowRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Info,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Sliders,
  Download,
  Sparkles,
  ChevronRight,
  Coins
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface Income {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: 'Tamamlandı' | 'Beklemede';
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: 'Gerçekleşti' | 'Planlı';
}

interface Investment {
  id: string;
  title: string;
  type: string;
  initialAmount: number;
  currentAmount: number;
  purchaseDate: string;
  platform: string;
  status: 'Aktif' | 'Satıldı';
}

interface Debt {
  id: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  paymentAmount: number;
  paymentFrequency: 'Haftalık' | 'Aylık' | 'Yıllık';
  nextPaymentDate: string;
  category: string;
  status: 'Devam Ediyor' | 'Ödendi';
  lender: string;
}

interface Subscription {
  id: string;
  title: string;
  amount: number;
  billingCycle: 'Haftalık' | 'Aylık' | 'Yıllık';
  category: string;
  nextBillingDate: string;
  status: 'Aktif' | 'İptal Edildi';
  platform: string;
}

interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: 'Devam Ediyor' | 'Tamamlandı';
}

interface FinanceReport {
  id: string;
  title: string;
  period: string;
  createdAt: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  personalNotes: string;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
  netSavings: number;
}

export const FinanceDashboard = () => {
  // Pull data from local storages
  const [incomes, setIncomes] = useLocalStorage<Income[]>('finance_incomes', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('finance_expenses', []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('finance_investments', []);
  const [debts, setDebts] = useLocalStorage<Debt[]>('finance_debts', []);
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('finance_subscriptions', []);
  const [savings, setSavings] = useLocalStorage<SavingGoal[]>('finance_savings', []);
  const [reports, setReports] = useLocalStorage<FinanceReport[]>('finance_reports', []);

  // User Profile state for dynamic weighting
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('finance_user_profile', {
    yas: 28,
    yasam_evresi: 'bekar_calisan',
    hane_buyuklugu: 1,
    sehir_yasam_maliyeti_endeksi: 'orta'
  });

  // UI States
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showHealthScoreDetails, setShowHealthScoreDetails] = useState(false);

  // Interactive Stress-Test Simulator state
  const [simJobLoss, setSimJobLoss] = useState(false);
  const [simEmergencyExpense, setSimEmergencyExpense] = useState(0);

  const isDatabaseEmpty = useMemo(() => {
    return incomes.length === 0 && expenses.length === 0;
  }, [incomes, expenses]);

  // Toast helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Onboarding Data Injector
  useEffect(() => {
    const isReset = localStorage.getItem('is_reset_v2');
    if (!isReset) {
      const keys = [
        'finance_investments', 
        'finance_savings', 
        'finance_expenses', 
        'finance_incomes', 
        'finance_debts', 
        'finance_subscriptions', 
        'finance_reports', 
        'finance_purchases'
      ];
      keys.forEach(key => window.localStorage.removeItem(key));
      localStorage.setItem('is_reset_v2', 'true');
      window.location.reload();
    }
  }, []);

  const handleResetFinanceData = () => {
    if (confirm("Tüm finans verilerini sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      setIncomes([]);
      setExpenses([]);
      setInvestments([]);
      setDebts([]);
      setSubscriptions([]);
      setSavings([]);
      setReports([]);
      window.localStorage.removeItem('finance_purchases');

      triggerToast('Finans verileri başarıyla sıfırlandı.');
    }
  };

  const handleLoadDemoData = () => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const demoIncomes = [
      { id: 'inc-1', title: 'Aylık Maaş Ödemesi', amount: 38000, category: 'Maaş', date: formatDate(today), status: 'Tamamlandı' },
      { id: 'inc-2', title: 'Serbest Çalışma Geliri', amount: 10000, category: 'Serbest Çalışma', date: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), status: 'Tamamlandı' },
      { id: 'inc-3', title: 'Yatırım Temettü Getirisi', amount: 4000, category: 'Yatırım', date: formatDate(new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)), status: 'Tamamlandı' }
    ];

    const demoExpenses = [
      { id: 'exp-1', title: 'Ev Kirası', amount: 12000, category: 'Barınma', date: formatDate(today), status: 'Gerçekleşti' },
      { id: 'exp-2', title: 'Market Alışverişi', amount: 7500, category: 'Gıda', date: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)), status: 'Gerçekleşti' },
      { id: 'exp-3', title: 'Faturalar', amount: 4200, category: 'Fatura', date: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)), status: 'Gerçekleşti' },
      { id: 'exp-4', title: 'Sosyal Harcama', amount: 3500, category: 'Eğlence', date: formatDate(new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000)), status: 'Gerçekleşti' },
      { id: 'exp-5', title: 'Ulaşım Masrafları', amount: 2800, category: 'Ulaşım', date: formatDate(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)), status: 'Gerçekleşti' }
    ];

    const demoInvestments = [
      { id: 'inv-1', title: 'Hisse Senedi Portföyü', type: 'Hisse Senedi', initialAmount: 40000, currentAmount: 48500, purchaseDate: formatDate(today), platform: 'Yatırım Hesabı', status: 'Aktif' },
      { id: 'inv-2', title: 'Altın Birikimi', type: 'Altın', initialAmount: 20000, currentAmount: 22400, purchaseDate: formatDate(today), platform: 'Altın Hesabı', status: 'Aktif' }
    ];

    const demoDebts = [
      { id: 'deb-1', title: 'Kredi Ödemesi', totalAmount: 60000, remainingAmount: 42000, paymentAmount: 3500, paymentFrequency: 'Aylık', nextPaymentDate: formatDate(new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)), category: 'Banka Kredisi', status: 'Devam Ediyor', lender: 'Banka' }
    ];

    const demoSubscriptions = [
      { id: 'sub-1', title: 'Premium Servisler', amount: 200, billingCycle: 'Aylık', category: 'Eğlence', nextBillingDate: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)), status: 'Aktif', platform: 'Online' }
    ];

    const demoSavings = [
      { id: 'sav-1', title: 'Acil Durum Fonu', targetAmount: 50000, currentAmount: 40000, deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 6, 1)), category: 'Güvenlik', status: 'Devam Ediyor' }
    ];

    setIncomes(demoIncomes as any[]);
    setExpenses(demoExpenses as any[]);
    setInvestments(demoInvestments as any[]);
    setDebts(demoDebts as any[]);
    setSubscriptions(demoSubscriptions as any[]);
    setSavings(demoSavings as any[]);

    triggerToast('Örnek bütçe veritabanı başarıyla yüklendi!');
  };

  // --- MATHEMATICAL COMPILATIONS ---
  const calculateMonthly = (amount: number, freq: string) => {
    if (freq === 'Haftalık') return amount * 4;
    if (freq === 'Yıllık') return amount / 12;
    return amount;
  };

  // Active metrics (calculates realized balance up to the current date)
  const monthlyIncome = useMemo(() => {
    const today = new Date();
    const compl = incomes.filter(i => i.status === 'Tamamlandı' && new Date(i.date) <= today);
    if (compl.length > 0) return compl.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    return 0;
  }, [incomes]);

  const monthlyExpense = useMemo(() => {
    const today = new Date();
    const compl = expenses.filter(e => e.status === 'Gerçekleşti' && new Date(e.date) <= today);
    if (compl.length > 0) return compl.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return 0;
  }, [expenses]);

  const totalInvestments = useMemo(() => {
    const active = investments.filter(i => i.status === 'Aktif');
    if (active.length > 0) return active.reduce((sum, i) => sum + Number(i.currentAmount || i.initialAmount || 0), 0);
    return 0;
  }, [investments]);

  const totalSavings = useMemo(() => {
    if (savings.length > 0) return savings.reduce((sum, s) => sum + Number(s.currentAmount || 0), 0);
    return 0;
  }, [savings]);

  const totalDebts = useMemo(() => {
    const active = debts.filter(d => d.status === 'Devam Ediyor');
    if (active.length > 0) return active.reduce((sum, d) => sum + Number(d.remainingAmount || d.totalAmount || 0), 0);
    return 0;
  }, [debts]);

  const netWorth = useMemo(() => {
    return totalInvestments + totalSavings - totalDebts;
  }, [totalInvestments, totalSavings, totalDebts]);

  const savingsRate = useMemo(() => {
    if (monthlyIncome > 0) {
      return Number((((monthlyIncome - monthlyExpense) / monthlyIncome) * 100).toFixed(1));
    }
    return 0;
  }, [monthlyIncome, monthlyExpense]);

  // --- DYNAMIC INPUTS FOR FINANCAL HEALTH ENGINE V3 ---
  const dynamicGelirGecmisi = useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentYear = 2026;
    const currentMonthIndex = 6;
    const history = [];
    const baseline = monthlyIncome > 0 ? monthlyIncome : 38000;
    const safeIncomes = Array.isArray(incomes) ? incomes : [];
    // Start from today and go forward (Projections)
    for (let i = 0; i <= 5; i++) {
      const idx = (currentMonthIndex + i) % 12;
      const year = currentYear + Math.floor((currentMonthIndex + i) / 12);
      const yearMonth = `${year}-${String(idx + 1).padStart(2, '0')}`;
      const actualMonthIncomes = safeIncomes.filter(inc => inc && inc.date && inc.date.startsWith(yearMonth) && inc.status === 'Tamamlandı');
      const tutar = actualMonthIncomes.length > 0
        ? actualMonthIncomes.reduce((sum, x) => sum + Number(x.amount || 0), 0)
        : baseline + (i * 1000);
      history.push({ ay: yearMonth, tutar });
    }
    return history;
  }, [incomes, monthlyIncome]);

  const dynamicGiderGecmisi = useMemo(() => {
    const currentYear = 2026;
    const currentMonthIndex = 6;
    const history = [];
    const baseline = monthlyExpense > 0 ? monthlyExpense : 22000;
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    // Start from today and go forward (Projections)
    for (let i = 0; i <= 5; i++) {
      const idx = (currentMonthIndex + i) % 12;
      const year = currentYear + Math.floor((currentMonthIndex + i) / 12);
      const yearMonth = `${year}-${String(idx + 1).padStart(2, '0')}`;
      const actualMonthExpenses = safeExpenses.filter(exp => exp && exp.date && exp.date.startsWith(yearMonth) && exp.status === 'Gerçekleşti');
      const total = actualMonthExpenses.length > 0
        ? actualMonthExpenses.reduce((sum, x) => sum + Number(x.amount || 0), 0)
        : baseline + (i * 500);
      history.push({
        ay: yearMonth,
        sabit: Math.round(total * 0.6),
        degisken: Math.round(total * 0.4)
      });
    }
    return history;
  }, [expenses, monthlyExpense]);

  const dynamicDigerGelirler = useMemo(() => {
    const safeIncomes = Array.isArray(incomes) ? incomes : [];
    const otherIncomes = safeIncomes.filter(i => i && i.status === 'Tamamlandı' && i.category !== 'Maaş');
    return otherIncomes.map(i => ({
      kaynak: i.title || 'Diğer',
      tutar: Number(i.amount || 0),
      duzenlilik: 'sabit' as const
    }));
  }, [incomes]);

  const dynamicAylikSabitGiderler = useMemo(() => {
    const sabitCats = ['Barınma', 'Fatura', 'Sağlık', 'Ulaşım'];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const active = safeExpenses.filter(e => e && e.status === 'Gerçekleşti');
    if (active.length === 0) return Math.round(monthlyExpense * 0.6) || 12000;
    const val = active.filter(e => e && sabitCats.includes(e.category)).reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return val || Math.round(monthlyExpense * 0.6);
  }, [expenses, monthlyExpense]);

  const dynamicAylikDegiskenGiderler = useMemo(() => {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const active = safeExpenses.filter(e => e && e.status === 'Gerçekleşti');
    if (active.length === 0) return Math.round(monthlyExpense * 0.4) || 8000;
    const val = active.filter(e => e && !['Barınma', 'Fatura', 'Sağlık', 'Ulaşım'].includes(e.category)).reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return val || Math.round(monthlyExpense * 0.4);
  }, [expenses, monthlyExpense]);

  const dynamicAbonelikler = useMemo(() => {
    const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];
    return safeSubscriptions.map(s => ({
      ad: s.title || 'Abonelik',
      tutar: Number(s.amount || 0),
      periyot: s.billingCycle === 'Yıllık' ? 'yillik' as const : 'aylik' as const,
      son_30gun_kullanim: (s.status === 'Aktif' ? 'aktif' : 'kullanilmiyor') as 'aktif' | 'dusuk' | 'kullanilmiyor'
    }));
  }, [subscriptions]);

  const dynamicBorclar = useMemo(() => {
    const safeDebts = Array.isArray(debts) ? debts : [];
    return safeDebts.map(d => {
      let tur: 'kredi_karti' | 'ihtiyac_kredisi' | 'konut_kredisi' | 'tasit_kredisi' | 'diger' = 'diger';
      const cat = (d.category || '').toLowerCase();
      if (cat.includes('kart')) tur = 'kredi_karti';
      else if (cat.includes('ihtiyaç')) tur = 'ihtiyac_kredisi';
      else if (cat.includes('konut') || cat.includes('ev')) tur = 'konut_kredisi';
      else if (cat.includes('araç') || cat.includes('taşıt')) tur = 'tasit_kredisi';

      return {
        ad: d.title || 'Borç',
        tur,
        toplam_bakiye: Number(d.remainingAmount || d.totalAmount || 0),
        aylik_taksit: Number(d.paymentAmount || 0),
        faiz_orani: 4.5,
        kalan_vade_ay: d.paymentAmount > 0 ? Math.ceil(Number(d.remainingAmount || 0) / Number(d.paymentAmount)) : 12
      };
    });
  }, [debts]);

  const dynamicYatirimlarVeBirikimler = useMemo(() => {
    const list: any[] = [];
    const safeInvestments = Array.isArray(investments) ? investments : [];
    const safeSavings = Array.isArray(savings) ? savings : [];
    safeInvestments.forEach(inv => {
      if (inv) {
        list.push({
          ad: inv.title || 'Yatırım',
          tutar: Number(inv.currentAmount || inv.initialAmount || 0),
          likidite: (inv.type === 'Altın' || inv.type === 'Döviz' ? 'yuksek' : 'orta') as 'yuksek' | 'orta' | 'dusuk',
          getiri_orani_yillik: 55
        });
      }
    });
    safeSavings.forEach(sav => {
      if (sav) {
        list.push({
          ad: `Birikim: ${sav.title || 'Hedef'}`,
          tutar: Number(sav.currentAmount || 0),
          likidite: 'yuksek' as const,
          getiri_orani_yillik: 42
        });
      }
    });
    return list;
  }, [investments, savings]);

  const dynamicPlanlananSatinalmalar = useMemo(() => {
    try {
      const purchases = JSON.parse(localStorage.getItem('finance_purchases') || '[]');
      if (!Array.isArray(purchases)) return [];
      return purchases.map((p: any) => ({
        ad: p.title || 'Planlanan Ürün',
        tutar: Number(p.price || p.amount || 0),
        aciliyet: 'istege_bagli' as const,
        tarih: '2026-07'
      }));
    } catch {
      return [];
    }
  }, []);

  // Interactive financial health score dynamic engine v3
  const healthScoreDetails = useMemo(() => {
    const input = {
      profil: userProfile,
      gelir_gecmisi: dynamicGelirGecmisi,
      gider_gecmisi: dynamicGiderGecmisi,
      aylik_net_gelir: monthlyIncome,
      diger_gelirler: dynamicDigerGelirler,
      aylik_sabit_giderler: dynamicAylikSabitGiderler,
      aylik_degisken_giderler: dynamicAylikDegiskenGiderler,
      abonelikler: dynamicAbonelikler,
      borclar: dynamicBorclar,
      yatirimlar_ve_birikimler: dynamicYatirimlarVeBirikimler,
      planlanan_satinalmalar: dynamicPlanlananSatinalmalar,
    };
    return runFinanceHealthEngine(input);
  }, [
    userProfile,
    dynamicGelirGecmisi,
    dynamicGiderGecmisi,
    monthlyIncome,
    dynamicDigerGelirler,
    dynamicAylikSabitGiderler,
    dynamicAylikDegiskenGiderler,
    dynamicAbonelikler,
    dynamicBorclar,
    dynamicYatirimlarVeBirikimler,
    dynamicPlanlananSatinalmalar,
  ]);

  const healthScore = healthScoreDetails.nihai_skor;

  // --- INTERACTIVE SIMULATOR MATH (Finansal Stres Testi) ---
  const simulatorResult = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'Aktif');
    const subCostMonthly = activeSubs.reduce((sum, s) => sum + calculateMonthly(Number(s.amount || 0), s.billingCycle), 0);
    
    const activeDebtsList = debts.filter(d => d.status === 'Devam Ediyor');
    const debtCostMonthly = activeDebtsList.reduce((sum, d) => sum + calculateMonthly(Number(d.paymentAmount || 0), d.paymentFrequency), 0);

    // Adjusted Outflow
    const baseOutflow = monthlyExpense > 0 ? monthlyExpense : 0;
    const adjustedOutflow = baseOutflow + subCostMonthly + debtCostMonthly;
    
    // Adjusted Inflow
    const adjustedInflow = simJobLoss ? 0 : monthlyIncome;
    
    // Monthly Deficit
    const monthlyDeficit = Math.max(0, adjustedOutflow - adjustedInflow);

    // Available reserves
    const baseReserves = totalInvestments + totalSavings;
    const availableReserves = Math.max(0, baseReserves - simEmergencyExpense);

    let runwayMonths = 999;
    if (monthlyDeficit > 0) {
      runwayMonths = Number((availableReserves / monthlyDeficit).toFixed(1));
    }

    return {
      runwayMonths,
      monthlyDeficit,
      availableReserves,
      adjustedOutflow
    };
  }, [monthlyIncome, monthlyExpense, subscriptions, debts, simJobLoss, simEmergencyExpense, totalInvestments, totalSavings]);

  // --- CHARTS & TREND DATA ---
  const chartData = useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const startDate = new Date(2026, 6, 1);
    const currentYear = startDate.getFullYear();
    const currentMonthIndex = startDate.getMonth();
    const result = [];

    // Realistic baseline points starting from today and going forward
    const mockIncomes = [monthlyIncome || 48000, 52000, 50000, 55000, 58000, 60000];
    const mockExpenses = [monthlyExpense || 32000, 31000, 33000, 30000, 34500, 32000];

    for (let i = 0; i <= 5; i++) {
      const idx = (currentMonthIndex + i) % 12;
      const year = currentYear + Math.floor((currentMonthIndex + i) / 12);
      const monthLabel = monthNames[idx];
      
      const yearMonth = `${year}-${String(idx + 1).padStart(2, '0')}`;
      const actualMonthIncomes = incomes.filter(inc => inc.date && inc.date.startsWith(yearMonth) && inc.status === 'Tamamlandı');
      const actualMonthExpenses = expenses.filter(exp => exp.date && exp.date.startsWith(yearMonth) && exp.status === 'Gerçekleşti');

      const gelir = actualMonthIncomes.length > 0 
        ? actualMonthIncomes.reduce((sum, x) => sum + Number(x.amount || 0), 0)
        : mockIncomes[i];

      const gider = actualMonthExpenses.length > 0
        ? actualMonthExpenses.reduce((sum, x) => sum + Number(x.amount || 0), 0)
        : mockExpenses[i];

      const birikim = gelir - gider;

      result.push({
        name: monthLabel,
        gelir: gelir || 0,
        gider: gider || 0,
        birikim: birikim || 0
      });
    }
    return result;
  }, [incomes, expenses, monthlyIncome, monthlyExpense]);

  // Category split
  const categoryData = useMemo(() => {
    const categoriesList = ['Barınma', 'Gıda', 'Fatura', 'Seyahat', 'Eğlence', 'Sağlık', 'Ulaşım', 'Diğer'];
    const colorsList = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#64748b'];
    
    const catMap: { [key: string]: number } = {};
    expenses.filter(e => e.status === 'Gerçekleşti').forEach(exp => {
      const cat = exp.category || 'Diğer';
      catMap[cat] = (catMap[cat] || 0) + Number(exp.amount || 0);
    });

    if (Object.keys(catMap).length === 0) {
      // Return high-quality defaults
      return [
        { name: 'Barınma', value: 12000, color: '#ef4444', limit: 15000 },
        { name: 'Gıda', value: 7500, color: '#f97316', limit: 10000 },
        { name: 'Fatura', value: 4200, color: '#f59e0b', limit: 5000 },
        { name: 'Eğlence', value: 3500, color: '#ec4899', limit: 6000 },
        { name: 'Ulaşım', value: 2800, color: '#3b82f6', limit: 4000 },
        { name: 'Diğer', value: 1500, color: '#64748b', limit: 5000 }
      ];
    }

    return Object.entries(catMap).map(([name, value]) => {
      const idx = categoriesList.indexOf(name);
      const color = idx !== -1 ? colorsList[idx] : '#64748b';
      const limits: Record<string, number> = {
        'Barınma': 15000, 'Gıda': 10000, 'Fatura': 5000, 'Seyahat': 15000,
        'Eğlence': 6000, 'Sağlık': 8000, 'Ulaşım': 4000, 'Diğer': 5000
      };
      return { name, value, color, limit: limits[name] || 5000 };
    });
  }, [expenses]);

  // --- SMART CRITICAL ALERTS ---
  const smartAlerts = useMemo(() => {
    const alertsList = [];
    
    if (monthlyIncome > 0 && (monthlyExpense / monthlyIncome) > 0.8) {
      alertsList.push({
        id: 'alt-1',
        title: 'Kritik Bütçe Daralması',
        message: 'Aylık giderleriniz, gelirinizin %80\'ini aşmış durumda. Bütçe sızıntısı tespiti önerilir.',
        type: 'critical',
        icon: <AlertTriangle size={15} />
      });
    }

    const subCost = subscriptions.filter(s => s.status === 'Aktif').reduce((sum, s) => sum + Number(s.amount || 0), 0);
    if (subCost > 1500) {
      alertsList.push({
        id: 'alt-2',
        title: 'Yüksek Abonelik Gideri',
        message: `Toplam aylık ₺${subCost.toLocaleString('tr-TR')} abonelik ödemesi yapıyorsunuz. Kullanmadıklarınızı durdurun.`,
        type: 'warning',
        icon: <RefreshCw size={15} />
      });
    }

    const emergencyGoal = savings.find(s => (s.title || '').toLowerCase().includes('acil') || (s.category || '').toLowerCase().includes('acil'));
    const savedForEmergency = emergencyGoal ? Number(emergencyGoal.currentAmount || 0) : 0;
    if (savedForEmergency < (monthlyExpense * 3)) {
      alertsList.push({
        id: 'alt-3',
        title: 'Yetersiz Acil Durum Fonu',
        message: `Acil durum birikiminiz (₺${savedForEmergency.toLocaleString('tr-TR')}) 3 aylık harcamanızı karşılayacak güçte değil.`,
        type: 'warning',
        icon: <PiggyBank size={15} />
      });
    }

    if (savingsRate >= 30) {
      alertsList.push({
        id: 'alt-4',
        title: 'Mükemmel Tasarruf Oranı',
        message: `Aylık tasarruf oranınız %${savingsRate}! Finansal özgürlük planlarınız tıkırında.`,
        type: 'success',
        icon: <ShieldCheck size={15} />
      });
    }

    if (alertsList.length === 0) {
      alertsList.push({
        id: 'alt-def-1',
        title: 'Finansal Durum Kararlı',
        message: 'Bütçe dengeniz yeşil bölgede. Gelir ve gider oranınız bütçe kurallarına tam uyum gösteriyor.',
        type: 'success',
        icon: <ShieldCheck size={15} />
      });
    }

    return alertsList;
  }, [monthlyIncome, monthlyExpense, subscriptions, savings, savingsRate, isDatabaseEmpty]);

  // --- UPCOMING PAYMENTS ---
  const upcomingPayments = useMemo(() => {
    const list: any[] = [];
    
    subscriptions.filter(s => s.status === 'Aktif').forEach(sub => {
      list.push({
        id: 'up-sub-' + sub.id,
        title: sub.title,
        amount: Number(sub.amount || 0),
        date: sub.nextBillingDate || 'Gelecek Ay',
        type: 'subscription'
      });
    });

    debts.filter(d => d.status === 'Devam Ediyor').forEach(debt => {
      list.push({
        id: 'up-debt-' + debt.id,
        title: `${debt.title} Taksiti`,
        amount: Number(debt.paymentAmount || 0),
        date: debt.nextPaymentDate || 'Gelecek Ay',
        type: 'debt'
      });
    });

    if (list.length === 0) {
      return [];
    }

    return list.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  }, [subscriptions, debts]);

  // --- RECENT TRANSACTIONS ---
  const recentTransactions = useMemo(() => {
    const combined: any[] = [];
    
    incomes.forEach(inc => {
      combined.push({
        id: 'tx-inc-' + inc.id,
        title: inc.title,
        category: inc.category || 'Gelir',
        date: inc.date || 'Bugün',
        amount: Number(inc.amount || 0),
        type: 'income'
      });
    });

    expenses.forEach(exp => {
      combined.push({
        id: 'tx-exp-' + exp.id,
        title: exp.title,
        category: exp.category || 'Gider',
        date: exp.date || 'Bugün',
        amount: -Number(exp.amount || 0),
        type: 'expense'
      });
    });

    if (combined.length === 0) {
      return [];
    }

    return combined.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [incomes, expenses]);

  // Navigator helper
  const handleNavigation = (moduleId: string) => {
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule(moduleId);
    }
  };

  const quickActions = [
    { id: 'finance-incomes', label: 'Gelir Ekle', icon: <ArrowDownRight size={18} />, bgClass: 'bg-focus-neon/10', borderClass: 'border-focus-neon/30', textClass: 'text-focus-neon' },
    { id: 'finance-expenses', label: 'Gider Ekle', icon: <ArrowUpRight size={18} />, bgClass: 'bg-crit-vivid/10', borderClass: 'border-crit-vivid/30', textClass: 'text-crit-vivid' },
    { id: 'finance-investments', label: 'Yatırım & Tasarruf', icon: <PiggyBank size={18} />, bgClass: 'bg-purple-500/10', borderClass: 'border-purple-400/30', textClass: 'text-purple-400' },
    { id: 'finance-subscriptions', label: 'Borç & Abonelik', icon: <CreditCard size={18} />, bgClass: 'bg-nrg-sun/10', borderClass: 'border-nrg-sun/30', textClass: 'text-nrg-sun' },
    { id: 'finance-reports', label: 'Dönem Raporları', icon: <FileText size={18} />, bgClass: 'bg-ai-bright/10', borderClass: 'border-ai-bright/30', textClass: 'text-ai-bright' },
  ];

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto space-y-6 pb-24 text-text-primary">
      {/* Toast alert */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl border border-focus-neon/30 bg-focus-neon/10 text-focus-neon font-bold text-sm shadow-2xl"
          >
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Database Empty / Onboarding Banner */}
      {isDatabaseEmpty && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-ai-bright/25 to-focus-neon/10 border border-ai-bright/35 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl"
        >
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="font-display font-black text-white text-base md:text-lg flex items-center gap-2">
              <Sparkles className="text-ai-bright shrink-0 animate-pulse" size={20} />
              Bütçe Modülünü Keşfedin!
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Kişisel finans bütçe veritabanınız şu anda boş görünüyor. Dashboard'u tüm dinamik grafikleri, akıllı stres testlerini ve finansal sağlık skorlarını deneyimlemek için örnek simülasyon verileriyle hemen doldurabilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={handleLoadDemoData}
              className="flex-1 sm:flex-none bg-white hover:bg-neutral-100 text-black px-4.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Coins size={14} /> Örnek Bütçe Verisi Yükle
            </button>
            <button
              onClick={handleResetFinanceData}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw size={14} /> Finans Verilerini Sıfırla
            </button>
          </div>
        </motion.div>
      )}

      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight flex items-center gap-2">
            Finansal Durum Paneli
          </h1>
          <p className="text-xs md:text-sm text-text-secondary">
            Gelir, gider, yatırım ve borç kalemlerinin akıllı finansal dinamik analiz ve stres testi motoru.
          </p>
        </div>
        <button
          onClick={() => setShowHealthScoreDetails(!showHealthScoreDetails)}
          className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-white/15 px-4.5 py-2.5 rounded-2xl transition-all hover:scale-102 cursor-pointer active:scale-98"
        >
          <Activity size={18} className="text-ai-bright animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
              Finansal Sağlık Skoru
              <span className="text-[8px] bg-white/5 px-1 py-0.2 rounded font-mono text-focus-neon">DETAYLAR</span>
            </span>
            <span className="text-base font-mono font-black text-white">{healthScore} / 100</span>
          </div>
        </button>
      </div>

      {/* Dynamic Health Score Breakdown Panel */}
      <AnimatePresence>
        {showHealthScoreDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-black/40 border border-white/10 rounded-3xl p-5 md:p-6 space-y-6"
          >
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-4 gap-3">
              <div>
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} className="text-focus-neon animate-pulse" />
                  Gelişmiş Finansal Sağlık Motoru (v3 / Akıllı)
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Dinamik ağırlıklandırma, 18 alt metrik, veto katmanları ve nedensellik zinciri analiz motoru.
                </p>
              </div>
              <span className="text-[10px] self-start sm:self-center font-mono text-focus-neon bg-focus-neon/10 px-3 py-1 rounded-full border border-focus-neon/20">
                %100 Çevrimdışı / Yerel Motor
              </span>
            </div>

            {/* Veto Layer Notification */}
            {healthScoreDetails.veto_uygulandi && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-red-950/40 to-red-900/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"
              >
                <AlertTriangle className="text-red-500 shrink-0 mt-0.5 animate-pulse" size={16} />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-red-400 block uppercase tracking-wider">Kritik Veto Limit Katmanı Aktif</span>
                  <p className="text-[11px] text-red-200/80 leading-relaxed">
                    {healthScoreDetails.veto_nedeni} (Veto kuralları gereği, diğer metrikleriniz yüksek olsa dahi nihai skorunuz bu tavanla sınırlandırılmıştır).
                  </p>
                </div>
              </motion.div>
            )}

            {/* 1. Dynamic Weighting Profile Selector Panel */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} className="text-focus-neon" />
                  Kişisel Yaşam Profili ve Dinamik Ağırlıklandırma
                </span>
                <span className="text-[10px] font-mono text-text-secondary">
                  Yaşam evreniz değiştiğinde önem sırası otomatik değişir
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Age selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-secondary font-bold block">YAŞ ({userProfile.yas})</label>
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={userProfile.yas}
                    onChange={(e) => setUserProfile({ ...userProfile, yas: Number(e.target.value) })}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-focus-neon"
                  />
                </div>

                {/* Life Stage selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-secondary font-bold block">YAŞAM EVRESİ</label>
                  <select
                    value={userProfile.yasam_evresi}
                    onChange={(e) => setUserProfile({ ...userProfile, yasam_evresi: e.target.value as any })}
                    className="w-full bg-neutral-900/80 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-focus-neon"
                  >
                    <option value="ogrenci">Öğrenci</option>
                    <option value="bekar_calisan">Bekar Çalışan</option>
                    <option value="evli_cocuksuz">Evli Çocuksuz</option>
                    <option value="evli_cocuklu">Evli Çocuklu</option>
                    <option value="emekliligeYakin">Emekliliğe Yakın</option>
                    <option value="emekli">Emekli</option>
                  </select>
                </div>

                {/* Household Size */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-secondary font-bold block">HANE BÜYÜKLÜĞÜ ({userProfile.hane_buyuklugu} Kişi)</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={userProfile.hane_buyuklugu}
                    onChange={(e) => setUserProfile({ ...userProfile, hane_buyuklugu: Number(e.target.value) })}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-focus-neon"
                  />
                </div>

                {/* City Index */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-secondary font-bold block">ŞEHİR MALİYET ENDEKSİ</label>
                  <select
                    value={userProfile.sehir_yasam_maliyeti_endeksi}
                    onChange={(e) => setUserProfile({ ...userProfile, sehir_yasam_maliyeti_endeksi: e.target.value as any })}
                    className="w-full bg-neutral-900/80 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-focus-neon"
                  >
                    <option value="dusuk">Düşük</option>
                    <option value="orta">Orta</option>
                    <option value="yuksek">Yüksek</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Categories Normalized Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {healthScoreDetails.kategoriler.map((cat, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-text-secondary font-bold uppercase block tracking-wider">
                      {idx + 1}. {cat.ad}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-mono text-focus-neon bg-focus-neon/5">
                      Ağırlık: {cat.max}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono text-white/40">Başarı</span>
                    <span className={`text-base font-mono font-black ${cat.yuzde >= 70 ? 'text-focus-neon' : cat.yuzde >= 40 ? 'text-nrg-sun' : 'text-crit-vivid'}`}>
                      %{cat.yuzde}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.yuzde >= 70 ? 'bg-focus-neon' : cat.yuzde >= 40 ? 'bg-nrg-sun' : 'bg-crit-vivid'}`}
                      style={{ width: `${cat.yuzde}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] text-text-secondary font-bold block">EN ZAYIF METRİK</span>
                    <span className="text-[9px] font-mono text-white/70 truncate">{cat.en_zayif_metrik}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Stress Test & Causality Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Stress Test */}
              <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={12} className="text-ai-bright animate-bounce" />
                    Finansal Stres Testi & Dayanıklılık Simülasyonu
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-text-secondary">Dayanıklılık Endeksi</span>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded bg-white/5 ${healthScoreDetails.dayaniklilik_testi.dayaniklilik_indeksi >= 70 ? 'text-focus-neon' : healthScoreDetails.dayaniklilik_testi.dayaniklilik_indeksi >= 40 ? 'text-nrg-sun' : 'text-crit-vivid'}`}>
                      {healthScoreDetails.dayaniklilik_testi.dayaniklilik_indeksi} / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Scenario A */}
                  <div className="bg-black/20 border border-white/5 p-3 rounded-xl space-y-2">
                    <span className="text-[8px] text-text-secondary font-black uppercase block tracking-wider">A) Gelir %20 Azalırsa</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[9px] text-text-secondary font-mono">Y. Tasarruf Oranı</span>
                      <span className="text-[11px] font-mono font-bold text-white">
                        %{Math.round(healthScoreDetails.dayaniklilik_testi.senaryo_gelir_sok.yeni_tasarruf_orani * 100)}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${
                      healthScoreDetails.dayaniklilik_testi.senaryo_gelir_sok.durum === 'guvenli' ? 'bg-focus-neon/10 text-focus-neon' :
                      healthScoreDetails.dayaniklilik_testi.senaryo_gelir_sok.durum === 'riskli' ? 'bg-nrg-sun/10 text-nrg-sun' : 'bg-crit-vivid/10 text-crit-vivid'
                    }`}>
                      {healthScoreDetails.dayaniklilik_testi.senaryo_gelir_sok.durum === 'guvenli' ? 'Güvenli' :
                       healthScoreDetails.dayaniklilik_testi.senaryo_gelir_sok.durum === 'riskli' ? 'Riskli' : 'Kritik'}
                    </span>
                  </div>

                  {/* Scenario B */}
                  <div className="bg-black/20 border border-white/5 p-3 rounded-xl space-y-2">
                    <span className="text-[8px] text-text-secondary font-black uppercase block tracking-wider">B) Faiz Oranları Artarsa</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[9px] text-text-secondary font-mono">Tahmini DSR</span>
                      <span className="text-[11px] font-mono font-bold text-white">
                        %{Math.round(healthScoreDetails.dayaniklilik_testi.senaryo_faiz_artisi.yeni_dsr * 100)}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${
                      healthScoreDetails.dayaniklilik_testi.senaryo_faiz_artisi.durum === 'guvenli' ? 'bg-focus-neon/10 text-focus-neon' :
                      healthScoreDetails.dayaniklilik_testi.senaryo_faiz_artisi.durum === 'riskli' ? 'bg-nrg-sun/10 text-nrg-sun' : 'bg-crit-vivid/10 text-crit-vivid'
                    }`}>
                      {healthScoreDetails.dayaniklilik_testi.senaryo_faiz_artisi.durum === 'guvenli' ? 'Güvenli' :
                       healthScoreDetails.dayaniklilik_testi.senaryo_faiz_artisi.durum === 'riskli' ? 'Riskli' : 'Kritik'}
                    </span>
                  </div>

                  {/* Scenario C */}
                  <div className="bg-black/20 border border-white/5 p-3 rounded-xl space-y-2">
                    <span className="text-[8px] text-text-secondary font-black uppercase block tracking-wider">C) Ani Gider (+1 Aylık)</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[9px] text-text-secondary font-mono">Kalan Koruma</span>
                      <span className="text-[11px] font-mono font-bold text-white">
                        {healthScoreDetails.dayaniklilik_testi.senaryo_beklenmedik_gider.kalan_runway_ay} Ay
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${
                      healthScoreDetails.dayaniklilik_testi.senaryo_beklenmedik_gider.durum === 'guvenli' ? 'bg-focus-neon/10 text-focus-neon' :
                      healthScoreDetails.dayaniklilik_testi.senaryo_beklenmedik_gider.durum === 'riskli' ? 'bg-nrg-sun/10 text-nrg-sun' : 'bg-crit-vivid/10 text-crit-vivid'
                    }`}>
                      {healthScoreDetails.dayaniklilik_testi.senaryo_beklenmedik_gider.durum === 'guvenli' ? 'Güvenli' :
                       healthScoreDetails.dayaniklilik_testi.senaryo_beklenmedik_gider.durum === 'riskli' ? 'Riskli' : 'Kritik'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Causality Narrative & Trend */}
              <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={12} className="text-ai-bright" />
                    Nedensellik Ve Trend Analizi
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed bg-black/20 border border-white/5 p-3 rounded-xl">
                    {healthScoreDetails.nedensellik_analizi}
                  </p>
                </div>

                <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary font-bold uppercase">BİRİKİM MOMENTUMU</span>
                    <span className="text-[9px] font-mono text-white/50">Eğim: {healthScoreDetails.trend.egim_aylik}/Ay</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    healthScoreDetails.trend.yorum === 'iyileşiyor' ? 'bg-focus-neon/15 text-focus-neon border border-focus-neon/20' :
                    healthScoreDetails.trend.yorum === 'kötüleşiyor' ? 'bg-crit-vivid/15 text-crit-vivid border border-crit-vivid/20' : 'bg-neutral-800 text-text-secondary'
                  }`}>
                    {healthScoreDetails.trend.yorum === 'iyileşiyor' ? 'İyileşiyor' :
                     healthScoreDetails.trend.yorum === 'kötüleşiyor' ? 'Kötüleşiyor' : 'Stabil'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Action recommendations */}
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4.5 space-y-3.5">
              <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">
                Öncelik Etki Matrisi Tabanlı Akıllı Aksiyon Planı
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthScoreDetails.oneriler_oncelik_sirali.map((one, idx) => (
                  <div key={idx} className="bg-black/20 border border-white/5 p-3.5 rounded-xl space-y-1.5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        one.seviye.startsWith('KOLAY') ? 'bg-focus-neon/10 text-focus-neon' :
                        one.seviye.startsWith('ORTA') ? 'bg-nrg-sun/10 text-nrg-sun' :
                        one.seviye.startsWith('ZOR') ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-400 animate-pulse'
                      }`}>
                        {one.seviye}
                      </span>
                      {one.etki_puani && (
                        <span className="text-[9px] font-mono text-focus-neon bg-focus-neon/5 px-2 py-0.5 rounded">
                          Potansiyel: +{one.etki_puani} Puan
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {one.metin}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main KPI metrics (4 Columns) - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Net Worth */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 border border-white/5 p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={48} className="text-focus-neon" />
          </div>
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Net Varlık</span>
          <span className={`text-lg md:text-xl font-mono font-black block mt-0.5 ${netWorth >= 0 ? 'text-white' : 'text-crit-vivid'}`}>
            ₺{netWorth.toLocaleString('tr-TR')}
          </span>
          <span className="text-[9px] text-text-secondary mt-1 block">Varlıklar - Borçlar</span>
        </motion.div>

        {/* Card 2: Income */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-black/30 border border-white/5 p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowDownRight size={48} className="text-focus-neon" />
          </div>
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Aylık Gelir</span>
          <span className="text-lg md:text-xl font-mono font-black text-focus-neon block mt-0.5">
            ₺{monthlyIncome.toLocaleString('tr-TR')}
          </span>
          <span className="text-[9px] text-text-secondary mt-1 block">Tamamlanan nakit akışı</span>
        </motion.div>

        {/* Card 3: Expenses */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/30 border border-white/5 p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowUpRight size={48} className="text-crit-vivid" />
          </div>
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Aylık Gider</span>
          <span className="text-lg md:text-xl font-mono font-black text-white block mt-0.5">
            ₺{monthlyExpense.toLocaleString('tr-TR')}
          </span>
          <span className="text-[9px] text-text-secondary mt-1 block">
            Gelirin %{monthlyIncome > 0 ? Math.round((monthlyExpense / monthlyIncome) * 100) : 0}\'i
          </span>
        </motion.div>

        {/* Card 4: Net Balance */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-black/30 border border-white/5 p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target size={48} className="text-nrg-sun" />
          </div>
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Net Bakiye</span>
          <span className={`text-lg md:text-xl font-mono font-black block mt-0.5 ${(monthlyIncome - monthlyExpense) >= 0 ? 'text-focus-neon' : 'text-crit-vivid'}`}>
            ₺{(monthlyIncome - monthlyExpense).toLocaleString('tr-TR')}
          </span>
          <div className="w-full bg-white/5 h-0.5 rounded-full mt-1.5 overflow-hidden">
            <div className={`h-full ${(monthlyIncome - monthlyExpense) >= 0 ? 'bg-focus-neon' : 'bg-crit-vivid'}`} style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }} />
          </div>
        </motion.div>
      </div>

      {/* Interactive Quick Actions Panel */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5">
        <h3 className="text-xs font-bold text-text-secondary mb-4 uppercase tracking-wider px-2">Hızlı Sayfa Geçişleri</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleNavigation(action.id)}
              onMouseEnter={() => setActiveQuickAction(action.id)}
              onMouseLeave={() => setActiveQuickAction(null)}
              className={`relative overflow-hidden flex flex-col items-center justify-center p-4.5 h-22 rounded-2xl border transition-all duration-300 ${
                activeQuickAction === action.id 
                  ? `${action.bgClass} ${action.borderClass} -translate-y-1 shadow-lg` 
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
            >
              <div className={`mb-2 transition-colors ${activeQuickAction === action.id ? action.textClass : 'text-text-secondary'}`}>
                {action.icon}
              </div>
              <span className={`text-[11px] font-black transition-colors ${activeQuickAction === action.id ? 'text-white' : 'text-text-secondary'}`}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Area Chart - Compact */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-focus-neon" /> Altı Aylık Nakit Akış Trendi
            </h3>
            <span className="text-[9px] text-text-secondary">Gelir vs Gider</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="gelir" name="Gelir" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGelir)" />
                <Area type="monotone" dataKey="gider" name="Gider" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorGider)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar & Limit Progress Chart - Compact */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-ai-bright" /> Kategori Harcamaları & Limitler
            </h3>
            <span className="text-[9px] text-text-secondary">Eşik Sınır Takibi</span>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
            {categoryData.slice(0, 5).map((item, index) => {
              const spentPercent = Math.min(100, Math.round((item.value / item.limit) * 100));
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-white font-bold">{item.name}</span>
                    </div>
                    <span className="text-text-secondary">
                      <strong className="text-white font-mono">₺{item.value.toLocaleString('tr-TR')}</strong> ({spentPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500`}
                      style={{ 
                        width: `${spentPercent}%`,
                        backgroundColor: spentPercent > 90 ? '#ef4444' : spentPercent > 70 ? '#f59e0b' : item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Alerts (LHS) & Upcoming Bills (RHS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts and Insights */}
        <div className="lg:col-span-1 bg-black/20 border border-white/5 rounded-3xl p-6 space-y-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Bell size={14} className="text-crit-vivid" /> Akıllı Bütçe Uyarıları
          </h3>

          <div className="space-y-3.5">
            {smartAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  alert.type === 'critical' ? 'bg-crit-vivid/10 border-crit-vivid/20 text-crit-vivid' :
                  alert.type === 'warning' ? 'bg-nrg-sun/10 border-nrg-sun/20 text-nrg-sun' :
                  'bg-focus-neon/10 border-focus-neon/20 text-focus-neon'
                }`}
              >
                <div className="mt-0.5 shrink-0">{alert.icon}</div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider">{alert.title}</h4>
                  <p className="text-[11px] text-text-secondary leading-normal">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bill Planner */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw size={14} className="text-nrg-sun" /> Yaklaşan Otomatik Ödemeler & Faturalar
          </h3>
          <p className="text-xs text-text-secondary">
            Önümüzdeki günlerde gerçekleşecek olan aktif abonelik veya borç taksitlerinizin planı:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingPayments.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-black/35 border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    item.type === 'subscription' ? 'bg-purple-500/10 text-purple-400' : 'bg-crit-vivid/10 text-crit-vivid'
                  }`}>
                    {item.type === 'subscription' ? <CreditCard size={15} /> : <ArrowUpRight size={15} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white line-clamp-1">{item.title}</h4>
                    <span className="text-[10px] text-text-secondary font-mono">{item.date}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-white shrink-0 pl-2">
                  ₺{item.amount.toLocaleString('tr-TR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Son İşlemler & En Son Rapor Dashboard connection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LHS: Recent Transactions */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Son Yapılan Hareketler</h3>
            <button 
              onClick={() => handleNavigation('finance-analytics')}
              className="text-[10px] text-focus-neon hover:underline font-bold flex items-center gap-0.5"
            >
              Tümünü Gör <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="p-3 bg-black/25 border border-white/5 rounded-xl flex justify-between items-center hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    tx.type === 'income' ? 'bg-focus-neon shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-crit-vivid'
                  }`} />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{tx.title}</h4>
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider">{tx.category} • {tx.date}</span>
                  </div>
                </div>
                <span className={`text-xs font-mono font-black shrink-0 ${
                  tx.type === 'income' ? 'text-focus-neon' : 'text-white'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}₺{Math.abs(tx.amount).toLocaleString('tr-TR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RHS: Recent Reports Quick Links */}
        <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-ai-bright" /> Finansal Raporlar
            </h3>
            <button onClick={() => handleNavigation('finance-reports')} className="text-[9px] text-ai-bright hover:underline font-bold">Yönet</button>
          </div>
          
          <div className="space-y-2">
            {reports && reports.length > 0 ? (
              reports.slice(0, 2).map(report => (
                <div key={report.id} className="p-3 bg-black/25 border border-white/5 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-ai-bright/10 flex items-center justify-center text-ai-bright font-black text-xs">
                      {report.grade}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white truncate w-32">{report.title}</h4>
                      <p className="text-[9px] text-text-secondary">{report.period}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-text-secondary" />
                </div>
              ))
            ) : (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                <p className="text-[10px] text-text-secondary">Henüz oluşturulmuş rapor bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
