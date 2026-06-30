import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
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
  const [incomes] = useLocalStorage<Income[]>('finance_incomes', []);
  const [expenses] = useLocalStorage<Expense[]>('finance_expenses', []);
  const [investments] = useLocalStorage<Investment[]>('finance_investments', []);
  const [debts] = useLocalStorage<Debt[]>('finance_debts', []);
  const [subscriptions] = useLocalStorage<Subscription[]>('finance_subscriptions', []);
  const [savings] = useLocalStorage<SavingGoal[]>('finance_savings', []);
  const [reports] = useLocalStorage<FinanceReport[]>('finance_reports', []);

  // UI States
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
  const handleLoadDemoData = () => {
    const demoIncomes = [
      { id: 'inc-1', title: 'Aylık Maaş Ödemesi', amount: 38000, category: 'Maaş', date: '2026-06-30', status: 'Tamamlandı' },
      { id: 'inc-2', title: 'Serbest Çalışma Geliri', amount: 10000, category: 'Serbest Çalışma', date: '2026-06-24', status: 'Tamamlandı' },
      { id: 'inc-3', title: 'Yatırım Temettü Getirisi', amount: 4000, category: 'Yatırım', date: '2026-06-18', status: 'Tamamlandı' }
    ];

    const demoExpenses = [
      { id: 'exp-1', title: 'Ev Kirası', amount: 12000, category: 'Barınma', date: '2026-06-01', status: 'Gerçekleşti' },
      { id: 'exp-2', title: 'Aylık Market Alışverişi', amount: 7500, category: 'Gıda', date: '2026-06-15', status: 'Gerçekleşti' },
      { id: 'exp-3', title: 'Doğalgaz & Elektrik', amount: 4200, category: 'Fatura', date: '2026-06-10', status: 'Gerçekleşti' },
      { id: 'exp-4', title: 'Dışarıda Sosyal Yemek', amount: 3500, category: 'Eğlence', date: '2026-06-20', status: 'Gerçekleşti' },
      { id: 'exp-5', title: 'Akaryakıt & Ulaşım Kartı', amount: 2800, category: 'Ulaşım', date: '2026-06-12', status: 'Gerçekleşti' },
      { id: 'exp-6', title: 'Özel Sağlık Sigortası', amount: 1500, category: 'Sağlık', date: '2026-06-18', status: 'Gerçekleşti' }
    ];

    const demoInvestments = [
      { id: 'inv-1', title: 'BIST100 Endeks Fonu', type: 'Hisse Senedi', initialAmount: 40000, currentAmount: 48500, purchaseDate: '2026-01-10', platform: 'Garanti BBVA', status: 'Aktif' },
      { id: 'inv-2', title: 'Altın Gram Hesabı', type: 'Altın', initialAmount: 20000, currentAmount: 22400, purchaseDate: '2026-02-15', platform: 'Vakıfbank', status: 'Aktif' },
      { id: 'inv-3', title: 'Eurobond Tahvili', type: 'Tahvil', initialAmount: 30000, currentAmount: 31200, purchaseDate: '2026-03-20', platform: 'Midas', status: 'Aktif' }
    ];

    const demoDebts = [
      { id: 'deb-1', title: 'İhtiyaç Kredisi', totalAmount: 60000, remainingAmount: 42000, paymentAmount: 3500, paymentFrequency: 'Aylık', nextPaymentDate: '2026-07-15', category: 'Banka Kredisi', status: 'Devam Ediyor', lender: 'İş Bankası' },
      { id: 'deb-2', title: 'Kredi Kartı Taksiti', totalAmount: 15000, remainingAmount: 3000, paymentAmount: 1500, paymentFrequency: 'Aylık', nextPaymentDate: '2026-07-20', category: 'Kredi Kartı', status: 'Devam Ediyor', lender: 'Akbank' }
    ];

    const demoSubscriptions = [
      { id: 'sub-1', title: 'Netflix Premium', amount: 200, billingCycle: 'Aylık', category: 'Eğlence', nextBillingDate: '2026-07-05', status: 'Aktif', platform: 'Netflix' },
      { id: 'sub-2', title: 'Spotify Premium', amount: 60, billingCycle: 'Aylık', category: 'Eğlence', nextBillingDate: '2026-07-18', status: 'Aktif', platform: 'Spotify' },
      { id: 'sub-3', title: 'YouTube Premium', amount: 58, billingCycle: 'Aylık', category: 'Eğlence', nextBillingDate: '2026-07-22', status: 'Aktif', platform: 'YouTube' },
      { id: 'sub-4', title: 'Amazon Prime', amount: 40, billingCycle: 'Aylık', category: 'Alışveriş', nextBillingDate: '2026-07-25', status: 'Aktif', platform: 'Amazon' }
    ];

    const demoSavings = [
      { id: 'sav-1', title: 'Acil Durum Fonu', targetAmount: 50000, currentAmount: 40000, deadline: '2026-12-31', category: 'Güvenlik', status: 'Devam Ediyor' },
      { id: 'sav-2', title: 'Yeni Araba Peşinatı', targetAmount: 200000, currentAmount: 85000, deadline: '2027-06-30', category: 'Araç', status: 'Devam Ediyor' }
    ];

    window.localStorage.setItem('finance_incomes', JSON.stringify(demoIncomes));
    window.localStorage.setItem('finance_expenses', JSON.stringify(demoExpenses));
    window.localStorage.setItem('finance_investments', JSON.stringify(demoInvestments));
    window.localStorage.setItem('finance_debts', JSON.stringify(demoDebts));
    window.localStorage.setItem('finance_subscriptions', JSON.stringify(demoSubscriptions));
    window.localStorage.setItem('finance_savings', JSON.stringify(demoSavings));

    triggerToast('Örnek bütçe veritabanı başarıyla yüklendi!');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // --- MATHEMATICAL COMPILATIONS ---
  const calculateMonthly = (amount: number, freq: string) => {
    if (freq === 'Haftalık') return amount * 4;
    if (freq === 'Yıllık') return amount / 12;
    return amount;
  };

  // Active metrics
  const monthlyIncome = useMemo(() => {
    const compl = incomes.filter(i => i.status === 'Tamamlandı');
    if (compl.length > 0) return compl.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    return isDatabaseEmpty ? 52000 : 0;
  }, [incomes, isDatabaseEmpty]);

  const monthlyExpense = useMemo(() => {
    const compl = expenses.filter(e => e.status === 'Gerçekleşti');
    if (compl.length > 0) return compl.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return isDatabaseEmpty ? 31500 : 0;
  }, [expenses, isDatabaseEmpty]);

  const totalInvestments = useMemo(() => {
    const active = investments.filter(i => i.status === 'Aktif');
    if (active.length > 0) return active.reduce((sum, i) => sum + Number(i.currentAmount || i.initialAmount || 0), 0);
    return isDatabaseEmpty ? 102100 : 0;
  }, [investments, isDatabaseEmpty]);

  const totalSavings = useMemo(() => {
    if (savings.length > 0) return savings.reduce((sum, s) => sum + Number(s.currentAmount || 0), 0);
    return isDatabaseEmpty ? 125000 : 0;
  }, [savings, isDatabaseEmpty]);

  const totalDebts = useMemo(() => {
    const active = debts.filter(d => d.status === 'Devam Ediyor');
    if (active.length > 0) return active.reduce((sum, d) => sum + Number(d.remainingAmount || d.totalAmount || 0), 0);
    return isDatabaseEmpty ? 45000 : 0;
  }, [debts, isDatabaseEmpty]);

  const netWorth = useMemo(() => {
    return totalInvestments + totalSavings - totalDebts;
  }, [totalInvestments, totalSavings, totalDebts]);

  const savingsRate = useMemo(() => {
    if (monthlyIncome > 0) {
      return Number((((monthlyIncome - monthlyExpense) / monthlyIncome) * 100).toFixed(1));
    }
    return 0;
  }, [monthlyIncome, monthlyExpense]);

  // Interactive financial health score dynamic engine
  const healthScore = useMemo(() => {
    let score = 50;
    
    // 1. Savings rate evaluation (+30 max)
    if (savingsRate >= 35) score += 30;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;
    else if (savingsRate < 0) score -= 15;

    // 2. Debt-to-Income evaluation (+20 max)
    if (monthlyIncome > 0) {
      const debtRatio = totalDebts / monthlyIncome;
      if (debtRatio === 0) score += 20;
      else if (debtRatio < 1) score += 15;
      else if (debtRatio < 3) score += 10;
      else score -= 10;
    }

    // 3. Asset backup evaluation (+30 max)
    const liquidAssets = totalInvestments + totalSavings;
    if (monthlyExpense > 0) {
      const coverMonths = liquidAssets / monthlyExpense;
      if (coverMonths >= 6) score += 30;
      else if (coverMonths >= 3) score += 20;
      else if (coverMonths >= 1) score += 10;
    } else {
      score += 15;
    }

    // 4. Subscriptions optimization (+20 max)
    const activeSubs = subscriptions.filter(s => s.status === 'Aktif');
    const subCost = activeSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    if (subCost === 0) score += 20;
    else if (subCost < 500) score += 15;
    else if (subCost < 1500) score += 10;
    else score -= 5;

    return Math.min(100, Math.max(0, score));
  }, [savingsRate, monthlyIncome, totalDebts, totalInvestments, totalSavings, monthlyExpense, subscriptions]);

  // --- INTERACTIVE SIMULATOR MATH (Finansal Stres Testi) ---
  const simulatorResult = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'Aktif');
    const subCostMonthly = activeSubs.reduce((sum, s) => sum + calculateMonthly(Number(s.amount || 0), s.billingCycle), 0);
    
    const activeDebtsList = debts.filter(d => d.status === 'Devam Ediyor');
    const debtCostMonthly = activeDebtsList.reduce((sum, d) => sum + calculateMonthly(Number(d.paymentAmount || 0), d.paymentFrequency), 0);

    // Adjusted Outflow
    const baseOutflow = monthlyExpense > 0 ? monthlyExpense : (isDatabaseEmpty ? 31500 : 15000);
    const adjustedOutflow = baseOutflow + (isDatabaseEmpty && subscriptions.length === 0 ? 358 : subCostMonthly) + (isDatabaseEmpty && debts.length === 0 ? 5000 : debtCostMonthly);
    
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
  }, [monthlyIncome, monthlyExpense, subscriptions, debts, simJobLoss, simEmergencyExpense, totalInvestments, totalSavings, isDatabaseEmpty]);

  // --- CHARTS & TREND DATA ---
  const chartData = useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentMonthIndex = new Date().getMonth();
    const result = [];

    // Realistic historical baseline points
    const mockIncomes = [45000, 46000, 44000, 48000, 52000, monthlyIncome || 48000];
    const mockExpenses = [29000, 31000, 33000, 30000, 34500, monthlyExpense || 32000];

    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      const monthLabel = monthNames[idx];
      
      const yearMonth = `2026-${String(idx + 1).padStart(2, '0')}`;
      const actualMonthIncomes = incomes.filter(inc => inc.date && inc.date.startsWith(yearMonth) && inc.status === 'Tamamlandı');
      const actualMonthExpenses = expenses.filter(exp => exp.date && exp.date.startsWith(yearMonth) && exp.status === 'Gerçekleşti');

      const gelir = actualMonthIncomes.length > 0 
        ? actualMonthIncomes.reduce((sum, x) => sum + Number(x.amount || 0), 0)
        : mockIncomes[5 - i];

      const gider = actualMonthExpenses.length > 0
        ? actualMonthExpenses.reduce((sum, x) => sum + Number(x.amount || 0), 0)
        : mockExpenses[5 - i];

      const birikim = Math.max(0, gelir - gider);

      result.push({
        name: monthLabel,
        gelir,
        gider,
        birikim
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
    const savedForEmergency = emergencyGoal ? Number(emergencyGoal.currentAmount || 0) : (isDatabaseEmpty ? 40000 : 0);
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
      return [
        { id: 'up-f1', title: 'Netflix Premium Üyeliği', amount: 200, date: '2026-07-05', type: 'subscription' },
        { id: 'up-f2', title: 'Banka İhtiyaç Kredisi Taksiti', amount: 3500, date: '2026-07-15', type: 'debt' },
        { id: 'up-f3', title: 'Spotify Premium Aile Paketi', amount: 60, date: '2026-07-18', type: 'subscription' }
      ];
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
      return [
        { id: 'tx-f1', title: 'Aylık Maaş Ödemesi', category: 'Maaş', date: '2026-06-30', amount: 38000, type: 'income' },
        { id: 'tx-f2', title: 'Aylık Ev Kirası', category: 'Barınma', date: '2026-06-01', amount: -12000, type: 'expense' },
        { id: 'tx-f3', title: 'Aylık Market Alışverişi', category: 'Gıda', date: '2026-06-15', amount: -7500, type: 'expense' },
        { id: 'tx-f4', title: 'Serbest Çalışma Proje Geliri', category: 'Serbest Çalışma', date: '2026-06-24', amount: 10000, type: 'income' },
        { id: 'tx-f5', title: 'Fatura Doğalgaz & Elektrik', category: 'Fatura', date: '2026-06-10', amount: -4200, type: 'expense' }
      ];
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
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 pb-24 text-text-primary">
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
              Kişisel finans bütçe veritabanınız şu anda boş görünüyor. Dashboard\'u tüm dinamik grafikleri, akıllı stres testlerini ve finansal sağlık skorlarını deneyimlemek için örnek simülasyon verileriyle hemen doldurabilirsiniz.
            </p>
          </div>
          <button
            onClick={handleLoadDemoData}
            className="shrink-0 bg-white hover:bg-neutral-100 text-black px-4.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg"
          >
            <Coins size={14} /> Örnek Bütçe Verisi Yükle
          </button>
        </motion.div>
      )}

      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight flex items-center gap-2">
            Finansal Durum Paneli
          </h1>
          <p className="text-xs md:text-sm text-text-secondary">
            Gelir, gider, yatırım ve borç kalemlerinin akıllı yapay zeka entegrasyonu ve stres analizi.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-2xl">
          <Activity size={18} className="text-ai-bright animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Yapay Zeka Sağlık Skoru</span>
            <span className="text-base font-mono font-black text-white">{healthScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Main KPI metrics (4 Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Worth */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={64} className="text-focus-neon" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Net Varlık (Net Worth)</span>
          <span className={`text-xl md:text-2xl font-mono font-black block mt-1 ${netWorth >= 0 ? 'text-white' : 'text-crit-vivid'}`}>
            ₺{netWorth.toLocaleString('tr-TR')}
          </span>
          <span className="text-[10px] text-text-secondary mt-1.5 block">Varlıklar - Borçlar Dengesi</span>
        </motion.div>

        {/* Card 2: Income */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-black/30 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowDownRight size={64} className="text-focus-neon" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Aylık Nakit Girişi</span>
          <span className="text-xl md:text-2xl font-mono font-black text-focus-neon block mt-1">
            ₺{monthlyIncome.toLocaleString('tr-TR')}
          </span>
          <span className="text-[10px] text-text-secondary mt-1.5 block">Tamamlanan nakit akışları</span>
        </motion.div>

        {/* Card 3: Expenses */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/30 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowUpRight size={64} className="text-crit-vivid" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Aylık Harcamalar</span>
          <span className="text-xl md:text-2xl font-mono font-black text-white block mt-1">
            ₺{monthlyExpense.toLocaleString('tr-TR')}
          </span>
          <span className="text-[10px] text-text-secondary mt-1.5 block">
            Gelirin %{monthlyIncome > 0 ? Math.round((monthlyExpense / monthlyIncome) * 100) : 0}\'i
          </span>
        </motion.div>

        {/* Card 4: Savings Rate */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-black/30 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target size={64} className="text-ai-bright" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Tasarruf Oranı</span>
          <span className="text-xl md:text-2xl font-mono font-black text-ai-bright block mt-1">
            %{savingsRate}
          </span>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-ai-bright" style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }} />
          </div>
        </motion.div>
      </div>

      {/* Interactive Quick Actions Panel */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5">
        <h3 className="text-xs font-bold text-text-secondary mb-4 uppercase tracking-wider px-2">Hızlı Sayfa Geçişleri</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

      {/* INTERACTIVE STRESS-TEST SIMULATOR WIDGET */}
      <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-ai-bright/5 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 mb-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-ai-bright animate-spin-slow" />
              Finansal Stres Testi & Dayanıklılık Simülatörü
            </h3>
            <p className="text-xs text-text-secondary">
              Acil durumlarda (iş kaybı, büyük kaza masrafları vb.) likit varlıklarınızın sizi kaç ay hayatta tutacağını simüle edin.
            </p>
          </div>
          <span className="text-[10px] bg-white/5 border border-white/5 text-text-secondary font-mono px-2.5 py-1 rounded-lg">
            İnteraktif Kontroller
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (LHS) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Toggle 1: Job Loss */}
            <div className="flex justify-between items-center bg-black/25 p-4 rounded-2xl border border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">İş / Gelir Kaybı Durumu</span>
                <span className="text-[10px] text-text-secondary block">Aktif aylık nakit girişi sıfırlanır.</span>
              </div>
              <button
                onClick={() => setSimJobLoss(!simJobLoss)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 ${
                  simJobLoss ? 'bg-crit-vivid' : 'bg-white/10'
                }`}
              >
                <div className={`w-4.5 h-4.5 bg-black rounded-full transition-transform duration-300 ${
                  simJobLoss ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Slider 2: Emergency Expense */}
            <div className="bg-black/25 p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">Beklenmedik Tek Seferlik Gider</span>
                  <span className="text-[10px] text-text-secondary block">Mevcut nakit rezervlerinden düşer.</span>
                </div>
                <span className="font-mono font-black text-crit-vivid">₺{simEmergencyExpense.toLocaleString('tr-TR')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={simEmergencyExpense}
                onChange={(e) => setSimEmergencyExpense(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ai-bright focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-text-secondary font-mono">
                <span>₺0</span>
                <span>₺50,000</span>
                <span>₺100,000</span>
              </div>
            </div>
          </div>

          {/* Outputs Column (RHS) */}
          <div className="lg:col-span-7 bg-white/[0.01] border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-black/20 border border-white/5 rounded-xl text-center">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">Kalan Rezerv</span>
                <span className="text-sm font-mono font-black text-white block mt-1">
                  ₺{simulatorResult.availableReserves.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="p-3.5 bg-black/20 border border-white/5 rounded-xl text-center">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">Aylık Net Harcama</span>
                <span className="text-sm font-mono font-black text-white block mt-1">
                  ₺{simulatorResult.adjustedOutflow.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="p-3.5 bg-black/20 border border-white/5 rounded-xl text-center">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">Aylık Nakit Açığı</span>
                <span className="text-sm font-mono font-black text-crit-vivid block mt-1">
                  ₺{simulatorResult.monthlyDeficit.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Survivor Output Badge */}
            <div className="bg-black/35 border border-white/10 rounded-xl p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">Güvenli Dayanma Süresi (Runway)</span>
                <h4 className="text-lg font-black text-white leading-tight">
                  {simulatorResult.monthlyDeficit === 0 
                    ? 'Bütçeniz Fazla Veriyor (Sonsuz Güvende)' 
                    : `${simulatorResult.runwayMonths} Ay Dayanabilir`}
                </h4>
                <p className="text-[11px] text-text-secondary leading-normal max-w-md pt-1">
                  {simulatorResult.monthlyDeficit === 0 
                    ? 'Geliriniz, aylık tüm giderlerinizi ve aboneliklerinizi rahatça karşılıyor. Rezervlere dokunmanız gerekmiyor.'
                    : simulatorResult.runwayMonths >= 6 
                    ? 'Tebrikler, 6 aylık ideal asgari dayanma eşiğini geçtiniz. Güvenli bölgedesiniz.' 
                    : 'Uyarı: Likit varlıklarınız kriz durumunda sizi 6 aydan daha kısa sürede koruyabilir. Birikimlerinizi artırın.'}
                </p>
              </div>

              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                simulatorResult.monthlyDeficit === 0 
                  ? 'bg-focus-neon/10 border border-focus-neon/30 text-focus-neon'
                  : simulatorResult.runwayMonths >= 6 
                  ? 'bg-ai-bright/10 border border-ai-bright/30 text-ai-bright' 
                  : 'bg-crit-vivid/10 border border-crit-vivid/30 text-crit-vivid'
              }`}>
                {simulatorResult.monthlyDeficit === 0 ? '∞' : `${simulatorResult.runwayMonths}A`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Area Chart */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={16} className="text-focus-neon" /> Altı Aylık Nakit Akış Trendi
            </h3>
            <span className="text-[10px] text-text-secondary">Gelir vs Gider</span>
          </div>
          <div className="h-[250px] w-full">
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
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val/1000}k`} />
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

        {/* Categories Bar & Limit Progress Chart */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target size={16} className="text-ai-bright" /> Kategori Harcamaları & Limitler
            </h3>
            <span className="text-[10px] text-text-secondary">Eşik Sınır Takibi</span>
          </div>
          
          <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
            {categoryData.map((item, index) => {
              const spentPercent = Math.min(100, Math.round((item.value / item.limit) * 100));
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-white font-bold">{item.name}</span>
                    </div>
                    <span className="text-text-secondary">
                      <strong className="text-white font-mono">₺{item.value.toLocaleString('tr-TR')}</strong> / ₺{item.limit.toLocaleString('tr-TR')} ({spentPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
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

        {/* RHS: Latest Report Summary Card (New Cohesive Connection) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-ai-bright" /> Dönemlik Finansal Değerlendirme Raporu
            </h3>
            
            {reports && reports.length > 0 ? (
              // If reports exist, show the summary card
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4.5 space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white line-clamp-1">{reports[0].title}</h4>
                    <span className="text-[10px] text-text-secondary block">Dönem: {reports[0].period}</span>
                  </div>
                  <span className="w-8 h-8 rounded-xl bg-ai-bright/10 border border-ai-bright/20 flex items-center justify-center font-black text-xs text-ai-bright shadow-lg">
                    {reports[0].grade}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center border-t border-b border-white/5 py-3">
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase">Tasarruf Oranı</span>
                    <span className="text-sm font-mono font-black text-white block mt-0.5">
                      %{reports[0].savingsRate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase">Net Birikim</span>
                    <span className="text-sm font-mono font-black text-focus-neon block mt-0.5">
                      ₺{reports[0].netSavings.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-text-secondary italic line-clamp-2 leading-relaxed">
                  "{reports[0].personalNotes || 'Kişisel değerlendirme notu bulunmuyor.'}"
                </p>
              </div>
            ) : (
              // If no reports exist, show onboarding call-to-action
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-center space-y-4">
                <div className="w-10 h-10 rounded-xl bg-ai-bright/10 border border-ai-bright/20 flex items-center justify-center text-ai-bright mx-auto">
                  <FileText size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white">Hazırda Rapor Bulunmuyor</h4>
                  <p className="text-[11px] text-text-secondary leading-normal">
                    Son bütçe verilerinizden finansal sağlık durumunuzu puanlayan ve detaylı analizler sunan bir dönemlik rapor oluşturup indirin.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavigation('finance-reports')}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-black text-xs rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            {reports && reports.length > 0 ? 'Tüm Raporları Yönet' : 'Rapor Oluşturmaya Başla'}
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
};
