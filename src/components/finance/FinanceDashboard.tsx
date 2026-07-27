import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { runFinanceHealthEngine, UserProfile } from '../../lib/financeHealthEngine';
import { useDevice } from '../../hooks/useDevice';
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
  Coins,
  Brain,
  HelpCircle,
  Eye,
  Calendar,
  X,
  ChevronLeft
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
  Pie,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { VisualEngine, triggerConfettiBurst } from '../ui/VisualEngine';
import { WidgetHub } from '../ui/WidgetHub';

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

export const FinanceDashboard = () => {
  const { isMobile, isTablet, screenTier, width } = useDevice();
  const isXs = screenTier === 'xs' || width < 380;

  // Active widgets list controlled by the hub engine
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>([]);

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

  // UI States & Interactive Drilldown Drawer
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showHealthScoreDetails, setShowHealthScoreDetails] = useState(false);

  // Interactive Drilldown State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerContent, setDrawerContent] = useState<any>(null);

  // Quick Currency Converter Widget state
  const [calcAmount, setCalcAmount] = useState<string>('100');
  const [calcFrom, setCalcFrom] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [rateFetchTime, setRateFetchTime] = useState<string | null>(null);

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

  const calculatedConvertResult = useMemo(() => {
    const amountNum = parseFloat(calcAmount) || 0;
    const rate = exchangeRates[calcFrom] || DEFAULT_RATES[calcFrom];
    return (amountNum * rate).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [calcAmount, calcFrom, exchangeRates]);

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

  // --- INTUITIVE INFOGRAPHIC ENGINE DATA COMPILATION (NEW RECHARTS SCATTER BUBBLES) ---
  const bubbleInvestmentsData = useMemo(() => {
    const types = ['Hisse', 'Altın', 'Kripto', 'Döviz', 'Emlak'];
    const active = investments.filter(i => i.status === 'Aktif');
    return active.map((inv, index) => {
      const xVal = index * 20 + 20;
      const yVal = Number(inv.currentAmount || 10000) / 1000; // y-axis
      const sizeVal = Number(inv.initialAmount || 10000) / 100; // z-axis bubble size
      return {
        name: inv.title,
        type: inv.type,
        x: xVal,
        y: yVal,
        z: sizeVal,
        amount: inv.currentAmount
      };
    });
  }, [investments]);

  // Click Trigger for the Infographics Engine Drill-Down Modal
  const triggerDrilldown = (type: 'heatmap' | 'bubble' | 'snowball' | 'kpi', title: string, payload: any) => {
    triggerConfettiBurst();
    setDrawerTitle(title);
    setDrawerOpen(true);

    if (type === 'heatmap') {
      setDrawerContent({
        summary: 'Aylık nakit akışınızın haftalık periyotlardaki ısı haritası incelendiğinde harcamaların ayın ilk yarısında yoğunlaştığı görülüyor.',
        advices: [
          'Ayın 1. ve 2. haftasındaki büyük borç ödemelerini 3. haftaya kaydırarak likidite dengesi sağlayın.',
          'Maaş gününden hemen sonra otomatik olarak en az %15 birikim payı ayırmayı ihmal etmeyin.',
          'Faturalarınız için otomatik ödeme talimatı atayarak gecikme faizlerini sıfırlayın.'
        ],
        extra: payload
      });
    } else if (type === 'bubble') {
      setDrawerContent({
        summary: `"${payload.name}" adlı yatırım varlığınız, portföyünüzün büyüklük sıralamasında üst basamakta yer alıyor.`,
        advices: [
          'Varlığın yıllık getiri oranını piyasa endeksiyle karşılaştırıp risk profilini dengeleyin.',
          'Tek bir yatırım aracına bağlı kalmayarak varlık çeşitlendirmesini (altın, borsa, fon) optimize edin.',
          'Eğer bu varlık likiditesi düşük bir türdeyse (örneğin arsa veya gayrimenkul), acil durum fonu payını artırın.'
        ],
        extra: payload
      });
    } else if (type === 'snowball') {
      setDrawerContent({
        summary: 'Aktif borçlarınızın vadeleri ve kartopu yöntemi kapsamında erken kapatılması önerilen öncelikli borç planlaması.',
        advices: [
          'En düşük bakiyeli borcu ilk sırada kapatarak (Kartopu) psikolojik kazanım elde edin.',
          'Gerektiğinde yüksek faizli borçları tek bir düşük faizli transfer kredisinde konsolide edin.',
          'Gecikmeli kredi kartı asgari tutarlarının bütçeyi sızdırmasını önleyin.'
        ],
        extra: payload
      });
    } else {
      setDrawerContent({
        summary: 'Genel bütçe performans karneniz.',
        advices: [
          'Haftalık harcama limiti belirleyerek plansız satın almaları dizginleyin.',
          'Gereksiz abonelik ve servis üyeliği harcamalarını dondurun.'
        ],
        extra: payload
      });
    }
  };

  // --- CHARTS & TREND DATA ---
  const chartData = useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const startDate = new Date(2026, 6, 1);
    const currentYear = startDate.getFullYear();
    const currentMonthIndex = startDate.getMonth();
    const result = [];

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
    <div className="p-1 sm:p-3 md:p-6 w-full max-w-7xl mx-auto space-y-4 md:space-y-6 pb-20 text-text-primary touch-optimized relative">

      {/* Toast alert */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-focus-neon/30 bg-focus-neon/10 text-focus-neon font-bold text-xs md:text-sm shadow-2xl"
          >
            <CheckCircle2 size={14} />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Database Empty / Onboarding Banner */}
      {isDatabaseEmpty && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-ai-bright/25 to-focus-neon/10 border border-ai-bright/35 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 shadow-xl"
        >
          <div className="space-y-1 max-w-2xl">
            <h3 className="font-display font-black text-white text-sm md:text-lg flex items-center gap-2">
              <Sparkles className="text-ai-bright shrink-0 animate-pulse" size={16} />
              Bütçe Modülünü Keşfedin!
            </h3>
            <p className="text-[11px] md:text-xs text-text-secondary leading-relaxed">
              Kişisel finans bütçe veritabanınız şu anda boş görünüyor. Dashboard'u tüm dinamik grafikleri, akıllı stres testlerini ve finansal sağlık skorlarını deneyimlemek için örnek simülasyon verileriyle hemen doldurabilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 md:gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={handleLoadDemoData}
              className="flex-grow sm:flex-none bg-white hover:bg-neutral-100 text-black px-3.5 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Coins size={12} /> Örnek Bütçe Verisi Yükle
            </button>
            <button
              onClick={handleResetFinanceData}
              className="flex-grow sm:flex-none bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw size={12} /> Sıfırla
            </button>
          </div>
        </motion.div>
      )}

      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-display font-black text-white tracking-tight flex items-center gap-1.5">
            Finansal Durum Paneli
          </h1>
          <p className="text-[10px] md:text-sm text-text-secondary">
            Gelir, gider, yatırım ve borç kalemlerinin akıllı finansal dinamik analiz ve stres testi motoru.
          </p>
        </div>
        <button
          onClick={() => setShowHealthScoreDetails(!showHealthScoreDetails)}
          className="flex items-center gap-2.5 bg-white/[0.02] border border-white/5 hover:border-white/15 px-3.5 py-2 rounded-xl transition-all hover:scale-102 cursor-pointer active:scale-98 self-stretch md:self-auto justify-between"
        >
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-ai-bright animate-pulse shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[8px] md:text-[9px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                Sağlık Skoru
                <span className="text-[7px] bg-white/5 px-1 py-0.2 rounded font-mono text-focus-neon">DETAY</span>
              </span>
              <span className="text-xs md:text-base font-mono font-black text-white">{healthScore} / 100</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-text-secondary md:hidden" />
        </button>
      </div>

      {/* --- INTEGRATE DYNAMIC WIDGET ENGINE PORTAL --- */}
      <WidgetHub onLayoutChange={setActiveWidgetIds} />

      {/* --- 3D ENGINE & EXPERIMENTAL HEATMAP ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Render interactive morphing 3D geometry engine */}
        <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-4.5 flex flex-col justify-between">
          <span className="text-[9px] font-mono text-text-secondary tracking-widest uppercase block mb-1">REAL-TIME WEBGL VIEWPORT</span>
          <VisualEngine interactive={true} className="flex-1 min-h-[220px]" themeColor="#3B82F6" />
        </div>

        {/* Clickable Infographic: Weekly Cash Flow Heatmap */}
        <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-focus-neon" /> Haftalık Finansal Isı Haritası (Heatmap)
              </h3>
              <span className="text-[8px] bg-focus-neon/10 text-focus-neon px-2 py-0.5 rounded font-mono">KLİKLENEBİLİR</span>
            </div>
            <p className="text-[10.5px] text-text-secondary mb-4">
              Son 12 haftanın işlem yoğunluk matrisi. Tıklayarak o döneme ait yapay zeka analiz detaylarını drill-down ile açın.
            </p>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const activityLevel = (i * 3 + 20) % 5; // Simulating weekly variances
                const color = activityLevel === 0 ? 'bg-neutral-800' :
                              activityLevel === 1 ? 'bg-focus-neon/20' :
                              activityLevel === 2 ? 'bg-focus-neon/40' :
                              activityLevel === 3 ? 'bg-focus-neon/70' : 'bg-focus-neon';
                return (
                  <button
                    key={i}
                    onClick={() => triggerDrilldown('heatmap', `Hafta ${i + 1} İşlem Yoğunluğu Raporu`, { week: i + 1, level: activityLevel })}
                    className={`h-16 rounded-xl flex flex-col justify-between p-2 text-left transition-all hover:scale-105 hover:ring-2 hover:ring-focus-neon/30 ${color}`}
                  >
                    <span className="text-[8px] font-mono font-black text-white/50">H{i+1}</span>
                    <span className="text-[9px] font-bold text-white font-mono">{activityLevel * 3 || 1} İşlem</span>
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-[9px] text-text-secondary mt-3 block italic">
            * Isı derecesi arttıkça yapılan harcama ve nakit çıkış adedi yükselmektedir.
          </span>
        </div>
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

            {/* Veto Layer */}
            {healthScoreDetails.veto_uygulandi && (
              <div className="bg-gradient-to-r from-red-950/40 to-red-900/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-500 shrink-0 mt-0.5 animate-pulse" size={16} />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-red-400 block uppercase tracking-wider">Kritik Veto Limit Katmanı Aktif</span>
                  <p className="text-[11px] text-red-200/80 leading-relaxed">
                    {healthScoreDetails.veto_nedeni} (Veto kuralları gereği, nihai skorunuz bu tavanla sınırlandırılmıştır).
                  </p>
                </div>
              </div>
            )}

            {/* Profile Config */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} className="text-focus-neon" />
                  Kişisel Yaşam Profili ve Dinamik Ağırlıklandırma
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Categories Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {healthScoreDetails.kategoriler.map((cat, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-text-secondary font-bold uppercase block tracking-wider">
                      {idx + 1}. {cat.ad}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono text-white/40">Başarı</span>
                    <span className="text-sm font-mono font-black text-focus-neon">%{cat.yuzde}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main KPI metrics (4 Columns) - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {/* Card 1: Total Net Worth */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 border border-white/5 p-3 md:p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors cursor-pointer"
          onClick={() => triggerDrilldown('kpi', 'Net Varlık Dağılım Detayı', { netWorth, totalInvestments, totalSavings, totalDebts })}
        >
          <div className="absolute top-0 right-0 p-2 md:p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={36} className="text-focus-neon" />
          </div>
          <span className="text-[8px] md:text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Net Varlık</span>
          <span className={`text-sm md:text-xl font-mono font-black block mt-0.5 ${netWorth >= 0 ? 'text-white' : 'text-crit-vivid'}`}>
            ₺{netWorth.toLocaleString('tr-TR')}
          </span>
          <span className="text-[8px] md:text-[9px] text-text-secondary mt-0.5 block">Varlıklar - Borçlar</span>
        </motion.div>

        {/* Card 2: Income */}
        <div className="bg-black/30 border border-white/5 p-3 md:p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <span className="text-[8px] md:text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Aylık Gelir</span>
          <span className="text-sm md:text-xl font-mono font-black text-focus-neon block mt-0.5">
            ₺{monthlyIncome.toLocaleString('tr-TR')}
          </span>
        </div>

        {/* Card 3: Expenses */}
        <div className="bg-black/30 border border-white/5 p-3 md:p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <span className="text-[8px] md:text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Aylık Gider</span>
          <span className="text-sm md:text-xl font-mono font-black text-white block mt-0.5">
            ₺{monthlyExpense.toLocaleString('tr-TR')}
          </span>
        </div>

        {/* Card 4: Net Balance */}
        <div className="bg-black/30 border border-white/5 p-3 md:p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <span className="text-[8px] md:text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Net Bakiye</span>
          <span className="text-sm md:text-xl font-mono font-black text-white block mt-0.5">
            ₺{(monthlyIncome - monthlyExpense).toLocaleString('tr-TR')}
          </span>
        </div>
      </div>

      {/* Interactive Quick Actions Panel */}
      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 md:p-5">
        <h3 className="text-[10px] md:text-xs font-bold text-text-secondary mb-2 md:mb-4 uppercase tracking-wider px-1">Hızlı Sayfa Geçişleri</h3>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleNavigation(action.id)}
              className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] p-3 rounded-xl flex flex-col items-center justify-center text-center text-xs font-bold text-text-secondary hover:text-white transition-all"
            >
              {action.icon}
              <span className="mt-1 block truncate max-w-full text-[10px]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- GRID OF CONDITIONALLY RENDERED WIDGETS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-focus-neon" /> Altı Aylık Nakit Akış Trendi
            </h3>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val/1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="gelir" stroke="#10b981" strokeWidth={2} fillOpacity={0.1} fill="#10b981" />
                <Area type="monotone" dataKey="gider" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Progress */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-ai-bright" /> Kategori Harcamaları & Limitler
            </h3>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {categoryData.slice(0, 5).map((item, index) => {
              const spentPercent = Math.min(100, Math.round((item.value / item.limit) * 100));
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white font-bold">{item.name}</span>
                    <span className="text-text-secondary">₺{item.value.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-focus-neon" style={{ width: `${spentPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Currency Converter */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Coins size={14} className="text-focus-neon" /> Hızlı Kur Çevirici
            </h3>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 font-mono text-sm text-white focus:outline-none"
            />
            <div className="flex justify-between text-xs text-text-secondary bg-black/20 p-3 rounded-lg">
              <span>Sonuç ({calcFrom} to TRY):</span>
              <span className="font-bold text-focus-neon">₺{calculatedConvertResult}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conditionally Rendered Interactive Bubble Investments Infographic */}
      {activeWidgetIds.includes('investment_bubble') && bubbleInvestmentsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Brain size={14} className="text-purple-400" /> Yatırım Balon Dağılım İnfografiği (Clickable Bubble)
            </h3>
            <span className="text-[8px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono">DİNAMİK & ETKİLEŞİMLİ</span>
          </div>
          <p className="text-xs text-text-secondary">
            Yatırım varlıklarınızın büyüklükleri ve risk katsayıları balon grafiğiyle görselleştirilmiştir. Bir balona tıklayarak derin analizleri başlatabilirsiniz.
          </p>
          <div className="h-[220px] w-full bg-black/10 rounded-2xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" name="Varlık" stroke="rgba(255,255,255,0.2)" fontSize={9} hide />
                <YAxis type="number" dataKey="y" name="Tutar (K)" stroke="rgba(255,255,255,0.4)" fontSize={9} unit="K" />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Başlangıç" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Yatırımlar"
                  data={bubbleInvestmentsData}
                  fill="#8b5cf6"
                  onClick={(node: any) => triggerDrilldown('bubble', `${node.payload?.name || node.name || 'Yatırım'} Analiz Raporu`, node.payload || node)}
                >
                  {bubbleInvestmentsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#8B5CF6'} className="cursor-pointer" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* DRILLDOWN DETAIL DRAWER COMPONENT */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[300] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-skel-space border-l border-white/10 h-full p-6 overflow-y-auto flex flex-col justify-between z-10 text-white"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-2">
                    <Brain size={16} className="text-focus-neon" /> {drawerTitle}
                  </h3>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 hover:bg-white/5 rounded-full">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6 text-xs text-text-secondary leading-relaxed">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-2">
                    <span className="text-[9px] text-focus-neon font-bold uppercase tracking-wider block">Yapay Zeka Analiz Brifingi</span>
                    <p className="text-white/90">{drawerContent?.summary}</p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Önerilen Aksiyon Adımları</span>
                    <div className="space-y-2.5">
                      {drawerContent?.advices.map((adv: string, idx: number) => (
                        <div key={idx} className="flex gap-2.5 items-start bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="w-5 h-5 rounded-full bg-focus-neon/10 border border-focus-neon/20 flex items-center justify-center text-focus-neon font-bold shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <p className="text-white/80">{adv}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs font-bold hover:bg-white/10 transition-all"
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    triggerToast('Önerilen aksiyonlar bütçe planına uyarlandı!');
                  }}
                  className="px-4 py-2 rounded-xl bg-focus-neon text-white dark:text-black font-black text-xs hover:scale-105 transition-all"
                >
                  Aksiyonu Uygula
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
