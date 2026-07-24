import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  CreditCard,
  Calendar,
  MoreVertical,
  X,
  AlertCircle,
  Repeat,
  PieChart as PieChartIcon,
  Edit3,
  Trash2,
  Wallet,
  Building,
  RefreshCw,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

interface Subscription {
  id: string;
  title: string;
  amount: number;
  billingCycle: 'Haftalık' | 'Aylık' | 'Yıllık';
  category: string;
  nextBillingDate: string;
  status: 'Aktif' | 'İptal Edildi';
  platform: string;
  type?: string; 
  paymentMethod?: string;
  currency?: 'TRY' | 'USD' | 'EUR' | 'GBP';
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
  installments?: number;
  paidInstallments?: number;
  paidThisMonth?: boolean;
  interestRate?: number;
  currency?: 'TRY' | 'USD' | 'EUR' | 'GBP';
}

const POPULAR_SUBSCRIPTIONS = [
  { title: 'Netflix', category: 'Eğlence', amount: 200, platform: 'Netflix', type: 'Premium', currency: 'TRY' as const },
  { title: 'Spotify', category: 'Eğlence', amount: 60, platform: 'Spotify', type: 'Bireysel', currency: 'TRY' as const },
  { title: 'YouTube Premium', category: 'Eğlence', amount: 58, platform: 'YouTube', type: 'Bireysel', currency: 'TRY' as const },
  { title: 'Amazon Prime', category: 'Alışveriş', amount: 40, platform: 'Amazon', type: 'Standart', currency: 'TRY' as const },
  { title: 'Adobe Creative Cloud', category: 'Yazılım', amount: 850, platform: 'Adobe', type: 'Tüm Uygulamalar', currency: 'TRY' as const }
];

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export const FinanceSubscriptions = () => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'debts' | 'smart-analysis'>('subscriptions');
  
  // Local Storage Data Sources
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('finance_subscriptions', []);
  const [debts, setDebts] = useLocalStorage<Debt[]>('finance_debts', []);
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number>('finance_monthly_income', 50000);
  
  // Interactive FAQ / QA State
  const [activeFaqId, setActiveFaqId] = useState<string | null>('debt_amount');
  
  // Multi-Currency & Conversion State
  const [displayCurrency, setDisplayCurrency] = useState<'TRY' | 'USD' | 'EUR' | 'GBP'>('TRY');
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    TRY: 1.0,
    USD: 33.42,
    EUR: 36.35,
    GBP: 43.15
  });

  // Calendar & Detail State
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(new Date().getDate());

  // Search, Filters & Wizards Controls
  const [subSearch, setSubSearch] = useState('');
  const [debtSearch, setDebtSearch] = useState('');
  const [isSubWizardOpen, setIsSubWizardOpen] = useState(false);
  const [isDebtWizardOpen, setIsDebtWizardOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  
  // Smart Debt Snowball vs Avalanche strategy toggle
  const [snowballStrategy, setSnowballStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  // Form states
  const [subFormData, setSubFormData] = useState<Partial<Subscription>>({
    billingCycle: 'Aylık', status: 'Aktif', type: 'Standart', currency: 'TRY'
  });
  const [debtFormData, setDebtFormData] = useState<Partial<Debt>>({
    status: 'Devam Ediyor', paymentFrequency: 'Aylık', category: 'İhtiyaç Kredisi', currency: 'TRY', interestRate: 0
  });
  
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [showSubSuggestions, setShowSubSuggestions] = useState(false);
  const [subSuggestions, setSubSuggestions] = useState(POPULAR_SUBSCRIPTIONS);

  // Currency Converter Functions
  const convertAmount = (amount: number, from: string = 'TRY', to: string = 'TRY') => {
    if (from === to) return amount;
    const rateFrom = exchangeRates[from] || 1.0;
    const amountInTry = amount * rateFrom;
    const rateTo = exchangeRates[to] || 1.0;
    return amountInTry / rateTo;
  };

  const formatValue = (amount: number, currency: string = displayCurrency) => {
    const symbol = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' }[currency] || '₺';
    return `${symbol}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Fetch live exchange rates safely
  const fetchRates = async () => {
    setIsFetchingRates(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/TRY');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          const rates = data.rates;
          setExchangeRates({
            TRY: 1.0,
            USD: rates.USD ? 1 / rates.USD : 33.42,
            EUR: rates.EUR ? 1 / rates.EUR : 36.35,
            GBP: rates.GBP ? 1 / rates.GBP : 43.15
          });
        }
      }
    } catch (e) {
      console.error('Rates fetch error:', e);
    } finally {
      setIsFetchingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Calendar grouping helper
  const getDayOfMonth = (dateString: string) => {
    if (!dateString) return 1;
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 1 : d.getDate();
  };

  // Roadmap grouping
  const roadmapByDay = useMemo(() => {
    const days: Record<number, { subscriptions: Subscription[]; debts: Debt[]; total: number }> = {};
    for (let i = 1; i <= 31; i++) {
      days[i] = { subscriptions: [], debts: [], total: 0 };
    }

    subscriptions.filter(s => s.status === 'Aktif' && s.nextBillingDate).forEach(s => {
      const day = getDayOfMonth(s.nextBillingDate);
      if (days[day]) {
        days[day].subscriptions.push(s);
        days[day].total += convertAmount(s.amount, s.currency || 'TRY', displayCurrency);
      }
    });

    debts.filter(d => d.status === 'Devam Ediyor' && d.nextPaymentDate).forEach(d => {
      const day = getDayOfMonth(d.nextPaymentDate);
      if (days[day]) {
        days[day].debts.push(d);
        days[day].total += convertAmount(d.paymentAmount, d.currency || 'TRY', displayCurrency);
      }
    });

    return days;
  }, [subscriptions, debts, displayCurrency, exchangeRates]);

  // Calendar Day specific focus item list
  const selectedDayItems = useMemo(() => {
    const dayData = roadmapByDay[selectedCalendarDay] || { subscriptions: [], debts: [], total: 0 };
    return [
      ...dayData.subscriptions.map(s => ({ ...s, itemType: 'subscription' as const })),
      ...dayData.debts.map(d => ({ ...d, itemType: 'debt' as const }))
    ];
  }, [roadmapByDay, selectedCalendarDay]);

  // Cashflow Forecast Calculator
  const forecasts = useMemo(() => {
    const today = new Date();
    const calculateNeeded = (daysAhead: number) => {
      let total = 0;
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + daysAhead);

      subscriptions.filter(s => s.status === 'Aktif' && s.nextBillingDate).forEach(s => {
        const nextDate = new Date(s.nextBillingDate);
        if (nextDate >= today && nextDate <= targetDate) {
          total += convertAmount(s.amount, s.currency || 'TRY', displayCurrency);
        }
      });

      debts.filter(d => d.status === 'Devam Ediyor' && d.nextPaymentDate).forEach(d => {
        const nextDate = new Date(d.nextPaymentDate);
        if (nextDate >= today && nextDate <= targetDate) {
          total += convertAmount(d.paymentAmount, d.currency || 'TRY', displayCurrency);
        }
      });

      return total;
    };

    return {
      next7Days: calculateNeeded(7),
      next15Days: calculateNeeded(15),
      next30Days: calculateNeeded(30)
    };
  }, [subscriptions, debts, displayCurrency, exchangeRates]);

  // Calculations: Subscriptions
  const totalMonthlySubs = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'Aktif')
      .reduce((acc, s) => {
        let monthlyAmount = s.amount;
        if (s.billingCycle === 'Haftalık') monthlyAmount = s.amount * 4;
        if (s.billingCycle === 'Yıllık') monthlyAmount = s.amount / 12;
        return acc + convertAmount(monthlyAmount, s.currency || 'TRY', displayCurrency);
      }, 0);
  }, [subscriptions, displayCurrency, exchangeRates]);

  const totalYearlySubs = useMemo(() => totalMonthlySubs * 12, [totalMonthlySubs]);

  const upcomingSubsCount = useMemo(() => {
    const today = new Date();
    return subscriptions.filter(s => {
      if (s.status !== 'Aktif' || !s.nextBillingDate) return false;
      const diffDays = (new Date(s.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24);
      return diffDays >= -1 && diffDays <= 7;
    }).length;
  }, [subscriptions]);

  const subCategoryChartData = useMemo(() => {
    const data: Record<string, number> = {};
    subscriptions.filter(s => s.status === 'Aktif').forEach(s => {
      const label = s.category || 'Diğer';
      let monthly = s.amount;
      if (s.billingCycle === 'Haftalık') monthly = s.amount * 4;
      if (s.billingCycle === 'Yıllık') monthly = s.amount / 12;
      const converted = convertAmount(monthly, s.currency || 'TRY', displayCurrency);
      data[label] = (data[label] || 0) + converted;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [subscriptions, displayCurrency, exchangeRates]);

  // Calculations: Debts
  const activeDebts = useMemo(() => debts.filter(d => d.status === 'Devam Ediyor'), [debts]);
  
  const totalRemainingDebt = useMemo(() => {
    return activeDebts.reduce((acc, d) => acc + convertAmount(d.remainingAmount, d.currency || 'TRY', displayCurrency), 0);
  }, [activeDebts, displayCurrency, exchangeRates]);

  const totalStartingDebt = useMemo(() => {
    return debts.reduce((acc, d) => acc + convertAmount(d.totalAmount || d.remainingAmount, d.currency || 'TRY', displayCurrency), 0);
  }, [debts, displayCurrency, exchangeRates]);

  const totalMonthlyDebtPaymentNeeded = useMemo(() => {
    return debts
      .filter(d => d.status === 'Devam Ediyor' && !d.paidThisMonth)
      .reduce((acc, d) => {
        let monthly = d.paymentAmount || 0;
        if (d.paymentFrequency === 'Haftalık') monthly = d.paymentAmount * 4;
        if (d.paymentFrequency === 'Yıllık') monthly = d.paymentAmount / 12;
        return acc + convertAmount(monthly, d.currency || 'TRY', displayCurrency);
      }, 0);
  }, [debts, displayCurrency, exchangeRates]);

  const totalPaidMonthlyDebtPayment = useMemo(() => {
    return debts
      .filter(d => d.status === 'Ödendi' || (d.status === 'Devam Ediyor' && d.paidThisMonth))
      .reduce((acc, d) => {
        let monthly = d.paymentAmount || 0;
        if (d.paymentFrequency === 'Haftalık') monthly = d.paymentAmount * 4;
        if (d.paymentFrequency === 'Yıllık') monthly = d.paymentAmount / 12;
        return acc + convertAmount(monthly, d.currency || 'TRY', displayCurrency);
      }, 0);
  }, [debts, displayCurrency, exchangeRates]);

  const upcomingDebtsCount = useMemo(() => {
    const today = new Date();
    return activeDebts.filter(d => {
      if (!d.nextPaymentDate) return false;
      const diff = (new Date(d.nextPaymentDate).getTime() - today.getTime()) / (1000 * 3600 * 24);
      return diff >= -1 && diff <= 7;
    }).length;
  }, [activeDebts]);

  // Debt Snowball / Avalanche Strategy payoff order
  const debtPayoffOrder = useMemo(() => {
    const active = debts.filter(d => d.status === 'Devam Ediyor');
    if (active.length === 0) return [];
    return [...active].sort((a, b) => {
      if (snowballStrategy === 'snowball') {
        const balA = convertAmount(a.remainingAmount, a.currency || 'TRY', 'TRY');
        const balB = convertAmount(b.remainingAmount, b.currency || 'TRY', 'TRY');
        return balA - balB;
      } else {
        const rateA = a.interestRate || 0;
        const rateB = b.interestRate || 0;
        return rateB - rateA;
      }
    });
  }, [debts, snowballStrategy, exchangeRates]);

  // Combined Monthly Debt Payment including both paid and unpaid active installments
  const totalMonthlyDebtPayments = useMemo(() => {
    return activeDebts.reduce((acc, d) => {
      let monthly = d.paymentAmount || 0;
      if (d.paymentFrequency === 'Haftalık') monthly = d.paymentAmount * 4;
      if (d.paymentFrequency === 'Yıllık') monthly = d.paymentAmount / 12;
      return acc + convertAmount(monthly, d.currency || 'TRY', displayCurrency);
    }, 0);
  }, [activeDebts, displayCurrency, exchangeRates]);

  // Combined Subscriptions and Debt payment monthly load
  const totalMonthlyLoadCombined = useMemo(() => {
    return totalMonthlySubs + totalMonthlyDebtPayments;
  }, [totalMonthlySubs, totalMonthlyDebtPayments]);

  // Calculated Budget Stress Ratio based on Adjustable Income
  const budgetStressRatio = useMemo(() => {
    if (!monthlyIncome || monthlyIncome <= 0) return 0;
    return Math.min(100, Math.round((totalMonthlyLoadCombined / monthlyIncome) * 100));
  }, [totalMonthlyLoadCombined, monthlyIncome]);

  // Smart Stress Tester warning texts and advices
  const budgetStressAdvice = useMemo(() => {
    const ratio = budgetStressRatio;
    if (ratio === 0) {
      return {
        level: 'Sıfır Baskı 🟢',
        color: 'text-focus-neon border-focus-neon/20 bg-focus-neon/5',
        desc: 'Aktif aboneliğiniz veya borç ödemeniz bulunmuyor. Harika bir bütçe esnekliğine sahipsiniz!'
      };
    }
    if (ratio < 20) {
      return {
        level: 'Güvenli Bölge (Düşük Risk) 🟢',
        color: 'text-focus-neon border-focus-neon/20 bg-focus-neon/5',
        desc: 'Sabit ödemeleriniz gelirinizin %20\'sinin altında. Finansal olarak rahat bir konumdasınız. Tasarruf ve yatırıma çok geniş bütçe ayırabilirsiniz.'
      };
    }
    if (ratio < 40) {
      return {
        level: 'Yönetilebilir Dengeli Bölge 🟡',
        color: 'text-nrg-sun border-nrg-sun/20 bg-nrg-sun/5',
        desc: 'Sabit ödemeleriniz standart sınırlarda. Gelirinizin büyük kısmı size kalıyor, ancak bütçe kontrolünü elden bırakmamalı ve acil durum fonu oluşturmalısınız.'
      };
    }
    if (ratio < 60) {
      return {
        level: 'Yüksek Baskı Altında 🟠',
        color: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
        desc: 'Ödemeler bütçenizi zorlamaya başlamış. Gelirinizin yarısına yakını sabit giderlere gidiyor. Gereksiz abonelikleri iptal etmeli ve yeni borçlanmalardan kaçınmalısınız.'
      };
    }
    return {
      level: 'KRİTİK AŞIM SEVİYESİ 🔴',
      color: 'text-crit-vivid border-crit-vivid/20 bg-crit-vivid/5',
      desc: 'Alarm zilleri çalıyor! Sabit ödemeleriniz bütçenizin %60\'ından fazlasını yutuyor. Acilen kartopu veya çığ yöntemi ile borç kapatmaya odaklanmalı ve lüks abonelikleri derhal askıya almalısınız!'
    };
  }, [budgetStressRatio]);

  // Chronological 12-Month Projections detailing when each debt is completed & freed cashflow
  const chronologicalProjections = useMemo(() => {
    const projections = [];
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentYear = today.getFullYear();

    const turkishMonths = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    for (let m = 0; m < 12; m++) {
      const simMonthIndex = (currentMonthIndex + m) % 12;
      const simYear = currentYear + Math.floor((currentMonthIndex + m) / 12);
      const monthLabel = `${turkishMonths[simMonthIndex]} ${simYear}`;

      // Subscriptions remain active constant
      const subTotal = totalMonthlySubs;

      // Simulate debts status
      let debtTotal = 0;
      const activeDebtsInMonth: { title: string; payment: number }[] = [];
      const finishedDebtsThisMonth: string[] = [];

      activeDebts.forEach(d => {
        // Calculate remaining installments left to pay
        const remainingInstallments = d.installments ? (d.installments - (d.paidInstallments || 0)) : 12;

        if (m < remainingInstallments) {
          // Debt is still being paid in this month
          let monthlyAmount = d.paymentAmount || 0;
          if (d.paymentFrequency === 'Haftalık') monthlyAmount = d.paymentAmount * 4;
          if (d.paymentFrequency === 'Yıllık') monthlyAmount = d.paymentAmount / 12;

          const converted = convertAmount(monthlyAmount, d.currency || 'TRY', displayCurrency);
          debtTotal += converted;
          activeDebtsInMonth.push({ title: d.title, payment: converted });
        } else if (m === remainingInstallments) {
          // Exactly this month the debt becomes fully paid!
          finishedDebtsThisMonth.push(d.title);
        }
      });

      const totalOutflow = subTotal + debtTotal;

      // Freed cashflow = Outflow difference due to ended debts compared to month 0
      let freedCashflow = 0;
      activeDebts.forEach(d => {
        const remainingInstallments = d.installments ? (d.installments - (d.paidInstallments || 0)) : 12;
        if (m >= remainingInstallments) {
          let monthlyAmount = d.paymentAmount || 0;
          if (d.paymentFrequency === 'Haftalık') monthlyAmount = d.paymentAmount * 4;
          if (d.paymentFrequency === 'Yıllık') monthlyAmount = d.paymentAmount / 12;
          freedCashflow += convertAmount(monthlyAmount, d.currency || 'TRY', displayCurrency);
        }
      });

      const strainRatio = monthlyIncome > 0 ? Math.min(100, Math.round((totalOutflow / monthlyIncome) * 100)) : 0;

      projections.push({
        monthLabel,
        subTotal,
        debtTotal,
        totalOutflow,
        freedCashflow,
        finishedDebtsThisMonth,
        activeDebtsInMonth,
        strainRatio
      });
    }

    return projections;
  }, [activeDebts, totalMonthlySubs, displayCurrency, exchangeRates, monthlyIncome]);

  // Subscription Fatigue score and warning text
  const subFatigueScore = useMemo(() => {
    const limitInDisplay = convertAmount(1500, 'TRY', displayCurrency);
    const score = Math.min(100, Math.round((totalMonthlySubs / (limitInDisplay || 1)) * 100));
    return {
      score,
      label: score < 35 ? 'Düşük Yük (Sağlıklı)' : score < 70 ? 'Orta Yük (Dengeli)' : 'Yüksek Yük (Kritik Aşım!)',
      color: score < 35 ? 'text-focus-neon' : score < 70 ? 'text-nrg-sun' : 'text-crit-vivid'
    };
  }, [totalMonthlySubs, displayCurrency, exchangeRates]);

  // Action Handlers: Subscriptions
  const handleSubTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSubFormData(p => ({ ...p, title: val, platform: val }));
    if (val.trim()) {
      const filtered = POPULAR_SUBSCRIPTIONS.filter(s => s.title.toLowerCase().includes(val.toLowerCase()));
      setSubSuggestions(filtered);
      setShowSubSuggestions(true);
    } else {
      setSubSuggestions(POPULAR_SUBSCRIPTIONS);
      setShowSubSuggestions(false);
    }
  };

  const selectSubSuggestion = (preset: typeof POPULAR_SUBSCRIPTIONS[0]) => {
    setSubFormData(p => ({
      ...p,
      title: preset.title,
      platform: preset.platform,
      category: preset.category,
      amount: preset.amount,
      type: preset.type,
      currency: preset.currency
    }));
    setShowSubSuggestions(false);
  };

  const openSubWizard = (sub?: Subscription) => {
    if (sub) {
      setSubFormData(sub);
      setEditingSubId(sub.id);
    } else {
      setSubFormData({ billingCycle: 'Aylık', status: 'Aktif', type: 'Standart', currency: 'TRY' });
      setEditingSubId(null);
    }
    setIsSubWizardOpen(true);
    setActionMenuId(null);
  };

  const saveSubscription = () => {
    if (subFormData.title && subFormData.amount && subFormData.nextBillingDate) {
      if (editingSubId) {
        setSubscriptions(prev => prev.map(s => s.id === editingSubId ? { ...s, ...subFormData } as Subscription : s));
      } else {
        setSubscriptions(prev => [{ ...subFormData, id: Date.now().toString(), status: 'Aktif' } as Subscription, ...prev]);
      }
      setIsSubWizardOpen(false);
    }
  };

  const deleteSubscription = (id: string) => {
    if (confirm('Bu abonelik kaydını kalıcı olarak silmek istediğinize emin misiniz?')) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      setActionMenuId(null);
    }
  };

  // Action Handlers: Debts
  const openDebtWizard = (debt?: Debt) => {
    if (debt) {
      setDebtFormData(debt);
      setEditingDebtId(debt.id);
    } else {
      setDebtFormData({ status: 'Devam Ediyor', paymentFrequency: 'Aylık', category: 'İhtiyaç Kredisi', currency: 'TRY', interestRate: 0 });
      setEditingDebtId(null);
    }
    setIsDebtWizardOpen(true);
    setActionMenuId(null);
  };

  const saveDebt = () => {
    if (debtFormData.title && (debtFormData.remainingAmount !== undefined || debtFormData.totalAmount !== undefined)) {
      const remainingAmount = Number(debtFormData.remainingAmount !== undefined ? debtFormData.remainingAmount : debtFormData.totalAmount);
      const totalAmount = Number(debtFormData.totalAmount !== undefined ? debtFormData.totalAmount : remainingAmount);
      const paymentAmount = Number(debtFormData.paymentAmount || 0);
      const interestRate = Number(debtFormData.interestRate || 0);

      const payload = {
        ...debtFormData,
        remainingAmount,
        totalAmount,
        paymentAmount,
        interestRate
      };

      if (editingDebtId) {
        setDebts(prev => prev.map(d => d.id === editingDebtId ? { ...d, ...payload } as Debt : d));
      } else {
        setDebts(prev => [{ ...payload, id: Date.now().toString(), status: 'Devam Ediyor' } as Debt, ...prev]);
      }
      setIsDebtWizardOpen(false);
    }
  };

  const deleteDebt = (id: string) => {
    if (confirm('Bu borç kaydını silmek istediğinize emin misiniz?')) {
      setDebts(prev => prev.filter(d => d.id !== id));
      setActionMenuId(null);
    }
  };

  const markDebtAsPaid = (id: string, fullClose: boolean = false) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        if (!fullClose && d.installments && d.installments > 0) {
          const nextPaid = (d.paidInstallments || 0) + 1;
          const nextRemaining = Math.max(0, d.remainingAmount - d.paymentAmount);
          const isFullyPaid = nextPaid >= d.installments || nextRemaining <= 0;
          return {
            ...d,
            paidInstallments: nextPaid,
            remainingAmount: nextRemaining,
            status: isFullyPaid ? 'Ödendi' : 'Devam Ediyor',
            paidThisMonth: true
          } as Debt;
        } else {
          return {
            ...d,
            remainingAmount: 0,
            paidInstallments: d.installments || 0,
            status: 'Ödendi',
            paidThisMonth: true
          } as Debt;
        }
      }
      return d;
    }));
    setActionMenuId(null);
  };

  const markDebtAsUnpaid = (id: string, fullRevert: boolean = false) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        if (!fullRevert && d.installments && d.installments > 0) {
          const nextPaid = Math.max(0, (d.paidInstallments || 0) - 1);
          const nextRemaining = Math.min(d.totalAmount, d.remainingAmount + d.paymentAmount);
          return {
            ...d,
            paidInstallments: nextPaid,
            remainingAmount: nextRemaining,
            status: 'Devam Ediyor',
            paidThisMonth: false
          } as Debt;
        } else {
          return {
            ...d,
            remainingAmount: d.totalAmount || d.remainingAmount,
            paidInstallments: 0,
            status: 'Devam Ediyor',
            paidThisMonth: false
          } as Debt;
        }
      }
      return d;
    }));
    setActionMenuId(null);
  };

  // Helper calculation blur
  const handleDebtCalcBlur = (field: 'totalAmount' | 'paymentAmount' | 'installments') => {
    if (['Kredi Kartı', 'Esnek Hesap (KMH)'].includes(debtFormData.category || '')) return;
    const t = debtFormData.totalAmount || 0;
    const p = debtFormData.paymentAmount || 0;
    const i = debtFormData.installments || 0;

    setDebtFormData(prev => {
      const next = { ...prev };
      if (field === 'paymentAmount' || field === 'installments') {
        if (p > 0 && i > 0) next.totalAmount = p * i;
      }
      if (field === 'totalAmount' || field === 'installments') {
        if (t > 0 && i > 0) next.paymentAmount = Math.ceil(t / i);
      }
      if (field === 'totalAmount' || field === 'paymentAmount') {
        if (t > 0 && p > 0) next.installments = Math.ceil(t / p);
      }
      if (!next.remainingAmount) {
         next.remainingAmount = next.totalAmount;
      }
      return next;
    });
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6" onClick={() => setActionMenuId(null)}>
      
      {/* HEADER ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black text-text-primary tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-focus-neon/10 text-focus-neon rounded-lg">
              <Layers size={22} />
            </span>
            Abonelik & Borç Takip Paneli
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Döviz kurları ile entegre takvim yol haritası, bütçe denetimleri ve akıllı borç kapatma simülasyonu.
          </p>
        </div>

        {/* Currency & Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Display Currency Tabs */}
          <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1 shrink-0">
            {(['TRY', 'USD', 'EUR', 'GBP'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setDisplayCurrency(curr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  displayCurrency === curr 
                    ? 'bg-focus-neon/10 text-focus-neon border border-focus-neon/20 shadow-sm font-black' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {curr === 'TRY' ? '₺' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : '£'} {curr}
              </button>
            ))}
          </div>

          {/* Rate status badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.01] border border-white/5 rounded-xl text-[10px] text-text-secondary">
            <RefreshCw size={11} className={isFetchingRates ? 'animate-spin text-focus-neon' : 'text-focus-neon'} />
            <span className="font-mono">
              {isFetchingRates ? 'Kurlar yenileniyor...' : `USD: ₺${exchangeRates.USD.toFixed(2)}`}
            </span>
            <button 
              onClick={fetchRates} 
              type="button"
              className="p-0.5 hover:bg-white/5 rounded transition-all text-text-secondary hover:text-text-primary"
              title="Kurları Yenile"
            >
              <RefreshCw size={10} />
            </button>
          </div>

          {/* Quick tab switch */}
          <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'subscriptions' ? 'bg-white/5 text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Abonelikler
            </button>
            <button
              onClick={() => setActiveTab('debts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'debts' ? 'bg-white/5 text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Borçlar
            </button>
            <button
              onClick={() => setActiveTab('smart-analysis')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'smart-analysis' ? 'bg-focus-neon/15 text-focus-neon border border-focus-neon/20' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <Sparkles size={12} className={activeTab === 'smart-analysis' ? 'text-focus-neon' : 'text-text-secondary'} />
              Akıllı Analiz
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC INTERACTIVE ROADMAP CALENDAR (INTERACTIVE VIEWPORT) */}
      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-focus-neon" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Aylık Akıllı Ödeme Yol Haritası (Günlük Planlayıcı)</h2>
          </div>
          <span className="text-[10px] text-text-secondary italic">
            Bir güne tıklayarak o güne ait tüm ödemelerinizi anında listeleyin.
          </span>
        </div>

        {/* 31 Day Slider */}
        <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
            const dayData = roadmapByDay[day] || { subscriptions: [], debts: [], total: 0 };
            const hasSubs = dayData.subscriptions.length > 0;
            const hasDebts = dayData.debts.length > 0;
            const isSelected = selectedCalendarDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedCalendarDay(day)}
                className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-between py-2 transition-all border ${
                  isSelected 
                    ? 'bg-focus-neon/15 border-focus-neon text-focus-neon shadow-md font-black scale-105' 
                    : dayData.total > 0
                    ? 'bg-white/[0.03] border-white/10 hover:border-white/20 text-text-primary'
                    : 'bg-white/[0.005] border-transparent text-text-secondary/50'
                }`}
              >
                <span className="text-[10px] opacity-70">GÜN</span>
                <span className="text-base font-mono font-bold">{day}</span>
                {/* Visual Indicators */}
                <div className="flex gap-1 justify-center">
                  {hasSubs && <span className="w-1.5 h-1.5 rounded-full bg-focus-neon" title="Aktif Abonelik" />}
                  {hasDebts && <span className="w-1.5 h-1.5 rounded-full bg-crit-vivid" title="Borç/Taksit" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day View details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white/[0.01] border border-white/5 rounded-xl p-4">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-focus-neon" />
              Her Ayın {selectedCalendarDay}. Günü Gerçekleşecek Ödemeler
            </h3>
            
            {selectedDayItems.length === 0 ? (
              <p className="text-xs text-text-secondary italic py-4">
                Ayın bu gününde planlanmış herhangi bir ödeme yükümlülüğünüz bulunmamaktadır.
              </p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedDayItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.itemType === 'subscription' ? 'bg-focus-neon' : 'bg-crit-vivid'}`} />
                      <span className="font-bold text-text-primary">{item.title}</span>
                      <span className="text-[10px] text-text-secondary">({item.category})</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono font-bold">
                      <span className={item.itemType === 'subscription' ? 'text-focus-neon' : 'text-crit-vivid'}>
                        {formatValue(convertAmount(item.amount || (item as any).paymentAmount, item.currency || 'TRY', displayCurrency))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fast Cash-Flow Forecast Card */}
          <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl space-y-3">
            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1">
              <AlertCircle size={12} className="text-focus-neon" /> Acil Likidite & Nakit Tahmini
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                <span className="text-text-secondary">7 Günlük Ödeme Yükü:</span>
                <span className="font-mono font-bold text-text-primary">{formatValue(forecasts.next7Days)}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                <span className="text-text-secondary">15 Günlük Ödeme Yükü:</span>
                <span className="font-mono font-bold text-text-primary">{formatValue(forecasts.next15Days)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">30 Günlük Toplam Yük:</span>
                <span className="font-mono font-bold text-text-primary">{formatValue(forecasts.next30Days)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          {activeTab === 'subscriptions' ? (
            <>
              {/* SUB METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block tracking-wider">Aylık Abonelikler</span>
                  <p className="text-xl font-mono font-black text-text-primary mt-1">{formatValue(totalMonthlySubs)}</p>
                  <span className="text-[9px] text-text-secondary mt-1 block">Tüm aktif aboneliklerin aylık eşdeğeri</span>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block tracking-wider">Yıllık Toplam Projeksiyon</span>
                  <p className="text-xl font-mono font-black text-focus-neon mt-1">{formatValue(totalYearlySubs)}</p>
                  <span className="text-[9px] text-text-secondary mt-1 block">Aboneliklerin 12 aylık birikimli yükü</span>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block tracking-wider">Yaklaşan (7 Gün)</span>
                  <p className="text-xl font-mono font-black text-crit-vivid mt-1">{upcomingSubsCount} Adet</p>
                  <span className="text-[9px] text-text-secondary mt-1 block">Ödeme günü yaklaşan aktif hizmetler</span>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block tracking-wider">Fatigue (Yorulma Puanı)</span>
                  <p className={`text-xl font-mono font-black mt-1 ${subFatigueScore.color}`}>{subFatigueScore.score}%</p>
                  <span className="text-[9px] text-text-secondary mt-1 block">{subFatigueScore.label}</span>
                </div>
              </div>

              {/* SUBS MAIN INTERACTIVE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT 2/3: Subscription List with Fast Actions */}
                <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <Repeat size={14} className="text-focus-neon" />
                      Aktif Abonelik Planları
                    </h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-48">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input 
                          type="text" placeholder="Abonelik ara..." value={subSearch} onChange={(e) => setSubSearch(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-focus-neon/50 transition-colors"
                        />
                      </div>
                      <button onClick={() => openSubWizard()} className="flex items-center gap-1.5 bg-focus-neon text-black px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-focus-neon/90 transition-colors">
                        <Plus size={14} /> Yeni Ekle
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-text-secondary uppercase tracking-wider">
                          <th className="pb-2 px-2">Abonelik / Platform</th>
                          <th className="pb-2 px-2">Kategori</th>
                          <th className="pb-2 px-2">Sonraki Ödeme</th>
                          <th className="pb-2 px-2">Tutar</th>
                          <th className="pb-2 px-2">Durum</th>
                          <th className="pb-2 px-2"></th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {subscriptions
                          .filter(s => (s.title || '').toLowerCase().includes(subSearch.toLowerCase()) || (s.platform || '').toLowerCase().includes(subSearch.toLowerCase()))
                          .map((sub) => (
                            <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-2 font-bold text-text-primary">
                                <div className="flex flex-col">
                                  <span>{sub.title}</span>
                                  <span className="text-[10px] text-text-secondary font-normal">{sub.platform} {sub.type ? `• ${sub.type}` : ''}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-text-secondary">{sub.category}</td>
                              <td className="py-3 px-2 text-text-secondary font-mono">
                                {new Date(sub.nextBillingDate).toLocaleDateString('tr-TR')}
                                <span className="text-[9px] block opacity-50">{sub.billingCycle}</span>
                              </td>
                              <td className="py-3 px-2 font-mono font-bold text-text-primary">
                                {formatValue(convertAmount(sub.amount, sub.currency || 'TRY', displayCurrency))}
                                {sub.currency !== 'TRY' && (
                                  <span className="text-[8px] text-text-secondary block font-normal">Orijinal: {sub.amount} {sub.currency}</span>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold ${sub.status === 'Aktif' ? 'bg-focus-neon/10 text-focus-neon' : 'bg-white/5 text-text-secondary'}`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right relative">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === sub.id ? null : sub.id); }}
                                  className="p-1 text-text-secondary hover:text-white rounded hover:bg-white/5 transition-all"
                                >
                                  <MoreVertical size={14} />
                                </button>
                                {actionMenuId === sub.id && (
                                  <div className="absolute right-6 top-6 bg-neutral-950 border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 w-28 flex flex-col text-left">
                                    <button onClick={() => openSubWizard(sub)} className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-white hover:bg-white/5 transition-colors">
                                      <Edit3 size={11} /> Düzenle
                                    </button>
                                    <button onClick={() => deleteSubscription(sub.id)} className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-crit-vivid hover:bg-crit-vivid/10 border-t border-white/5 transition-colors">
                                      <Trash2 size={11} /> Sil
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {subscriptions.length === 0 && (
                      <div className="text-center py-8 text-xs text-text-secondary italic">Gösterilecek aktif abonelik bulunamadı.</div>
                    )}
                  </div>
                </div>

                {/* RIGHT 1/3: Interactive Fatigue & Cost Analyzer Widget */}
                <div className="space-y-4">
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={14} className="text-focus-neon" />
                      Abonelik Yorgunluk Analizi
                    </h3>

                    {/* Cost progression projections */}
                    <div className="space-y-3 pt-2">
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-wider">Aboneliklerin Gelecek Yükü</span>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                          <div className="p-1 bg-white/[0.01] border border-white/5 rounded">
                            <span className="text-[9px] text-text-secondary block">1 Yıllık</span>
                            <span className="text-xs font-mono font-bold text-text-primary">{formatValue(totalYearlySubs)}</span>
                          </div>
                          <div className="p-1 bg-white/[0.01] border border-white/5 rounded">
                            <span className="text-[9px] text-text-secondary block">3 Yıllık</span>
                            <span className="text-xs font-mono font-bold text-text-primary">{formatValue(totalMonthlySubs * 36)}</span>
                          </div>
                          <div className="p-1 bg-white/[0.01] border border-white/5 rounded">
                            <span className="text-[9px] text-text-secondary block">5 Yıllık</span>
                            <span className="text-xs font-mono font-black text-focus-neon">{formatValue(totalMonthlySubs * 60)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-focus-neon/5 border border-focus-neon/10 rounded-xl text-[11px] text-text-secondary leading-relaxed">
                        <strong className="text-text-primary block mb-1">💡 Tasarruf ve Yatırım Fırsatı:</strong>
                        Mevcut aboneliklerinize ödediğiniz bütçeyi yıllık olarak tasarruf edip fon/altın gibi araçlara yönlendirseydiniz, 5 yılda yaklaşık <span className="font-mono font-black text-focus-neon">{formatValue(totalMonthlySubs * 60 * 1.5)}</span> ek kazanç biriktirebilirdiniz.
                      </div>
                    </div>
                  </div>

                  {/* Recharts Pie Chart in right widget */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Kategorik Dağılım</h3>
                    {subCategoryChartData.length > 0 ? (
                      <div className="h-[140px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={subCategoryChartData}
                              innerRadius={35}
                              outerRadius={55}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {subCategoryChartData.map((_, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => formatValue(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-1.5 text-[10px] ml-2 shrink-0 max-w-[120px]">
                          {subCategoryChartData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              <span className="truncate text-text-secondary">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-text-secondary italic text-center py-6">Kategorik grafik verisi yok.</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : activeTab === 'debts' ? (
            <>
              {/* DEBTS Tab View Content */}
              <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-focus-neon">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Aylık Ödeme Performans Raporu</span>
                    </div>
                    <h3 className="text-base font-bold text-white font-display">Aylık Borç Ödeme İlerlemesi</h3>
                    <p className="text-xs text-text-secondary max-w-xl">
                      "Taksit Öde" / "Öde" komutlarını kullanarak bu aya ait asgari veya planlanmış ödeme performansınızı takip edin.
                    </p>
                  </div>
                  
                  {/* Performance Progress */}
                  <div className="w-full lg:w-72 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-secondary">
                      <span>Aylık Borç Ödeme Durumu</span>
                      <span className="text-focus-neon font-mono">{totalMonthlyDebtPaymentNeeded + totalPaidMonthlyDebtPayment > 0 ? Math.round((totalPaidMonthlyDebtPayment / (totalMonthlyDebtPaymentNeeded + totalPaidMonthlyDebtPayment)) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-focus-neon h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalMonthlyDebtPaymentNeeded + totalPaidMonthlyDebtPayment > 0 ? Math.min(100, (totalPaidMonthlyDebtPayment / (totalMonthlyDebtPaymentNeeded + totalPaidMonthlyDebtPayment)) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-secondary block font-mono">
                      Ödenen Bu Ay: {formatValue(totalPaidMonthlyDebtPayment)} / Kalan Bu Ay: {formatValue(totalMonthlyDebtPaymentNeeded)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5 relative z-10 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Toplam Kalan Borç</span>
                    <p className="text-lg font-mono font-bold text-white mt-0.5">{formatValue(totalRemainingDebt)}</p>
                    <span className="text-[9px] text-text-secondary">Başlangıç: {formatValue(totalStartingDebt)}</span>
                  </div>
                  <div className="sm:border-l sm:border-white/5 sm:pl-4">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Yaklaşan Taksit (7 Gün)</span>
                    <p className="text-lg font-mono font-bold text-crit-vivid mt-0.5">{upcomingDebtsCount} Adet</p>
                    <span className="text-[9px] text-text-secondary">Takvimdeki acil ödemeler</span>
                  </div>
                  <div className="sm:border-l sm:border-white/5 sm:pl-4">
                    <span className="text-[10px] font-bold text-focus-neon uppercase">Ödenmiş Borç Oranı</span>
                    <p className="text-lg font-mono font-bold text-focus-neon mt-0.5">
                      {totalStartingDebt > 0 ? Math.round(((totalStartingDebt - totalRemainingDebt) / totalStartingDebt) * 100) : 0}%
                    </p>
                    <span className="text-[9px] text-text-secondary">Ödenen ana para birikimi</span>
                  </div>
                </div>
              </div>

              {/* DEBTS MAIN ROW GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* DEBTS LEFT 2/3: All active debts list with interactive actions */}
                <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard size={14} className="text-crit-vivid" />
                      Aktif Borçlar, Krediler ve Kredi Kartları
                    </h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-48">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input 
                          type="text" placeholder="Borç ara..." value={debtSearch} onChange={(e) => setDebtSearch(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <button onClick={() => openDebtWizard()} className="flex items-center gap-1.5 bg-crit-vivid text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-crit-vivid/90 transition-colors">
                        <Plus size={14} /> Yeni Ekle
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[550px]">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-text-secondary uppercase tracking-wider">
                          <th className="pb-2 px-2">Borç / Kurum</th>
                          <th className="pb-2 px-2">Kategori</th>
                          <th className="pb-2 px-2">Ödeme Günü</th>
                          <th className="pb-2 px-2">Kalan / Toplam</th>
                          <th className="pb-2 px-2">Taksit / Ödeme</th>
                          <th className="pb-2 px-2">Durum</th>
                          <th className="pb-2 px-2">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {debts
                          .filter(d => (d.title || '').toLowerCase().includes(debtSearch.toLowerCase()) || (d.lender || '').toLowerCase().includes(debtSearch.toLowerCase()))
                          .map((debt) => (
                            <tr key={debt.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-2 font-bold text-text-primary">
                                <div className="flex flex-col">
                                  <span>{debt.title}</span>
                                  <span className="text-[10px] text-text-secondary font-normal flex items-center gap-1"><Building size={10} /> {debt.lender || '-'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-text-secondary">{debt.category}</td>
                              <td className="py-3 px-2 text-text-secondary font-mono">
                                {debt.nextPaymentDate ? new Date(debt.nextPaymentDate).toLocaleDateString('tr-TR') : '-'}
                                <span className="text-[9px] block opacity-50">{debt.paymentFrequency}</span>
                              </td>
                              <td className="py-3 px-2 font-mono">
                                <span className="font-bold text-text-primary block">{formatValue(convertAmount(debt.remainingAmount, debt.currency || 'TRY', displayCurrency))}</span>
                                <span className="text-[9px] text-text-secondary">/ {formatValue(convertAmount(debt.totalAmount || debt.remainingAmount, debt.currency || 'TRY', displayCurrency))}</span>
                              </td>
                              <td className="py-3 px-2 font-mono">
                                <span className="font-bold text-crit-vivid block">{formatValue(convertAmount(debt.paymentAmount, debt.currency || 'TRY', displayCurrency))}</span>
                                {debt.installments && debt.installments > 0 ? (
                                  <span className="text-[9px] text-text-secondary bg-white/5 px-1 py-0.5 rounded">Taksit: {debt.paidInstallments || 0}/{debt.installments}</span>
                                ) : <span className="text-[9px] text-text-secondary">-</span>}
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${debt.status === 'Devam Ediyor' ? 'bg-nrg-sun/10 text-nrg-sun' : 'bg-focus-neon/10 text-focus-neon'}`}>
                                    {debt.status}
                                  </span>
                                  {debt.status === 'Devam Ediyor' && (
                                    <span className={`text-[8px] font-bold ${debt.paidThisMonth ? 'text-focus-neon' : 'text-crit-vivid'}`}>
                                      {debt.paidThisMonth ? 'Bu Ay Ödendi' : 'Bu Ay Ödenmedi'}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {debt.status === 'Devam Ediyor' && (
                                    debt.paidThisMonth ? (
                                      <button
                                        onClick={() => markDebtAsUnpaid(debt.id)}
                                        className="px-2 py-1 text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black rounded transition-all cursor-pointer"
                                        title="Bu ayki ödemeyi geri al"
                                      >
                                        Geri Al
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => markDebtAsPaid(debt.id)}
                                        className="px-2 py-1 text-[10px] font-bold bg-focus-neon/10 hover:bg-focus-neon text-focus-neon hover:text-black rounded transition-all cursor-pointer"
                                        title={debt.installments ? "1 Taksit Öde" : "Borç Ödemesini Kaydet"}
                                      >
                                        Öde
                                      </button>
                                    )
                                  )}
                                  
                                  <div className="relative">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === debt.id ? null : debt.id); }}
                                      className="p-1 text-text-secondary hover:text-white rounded hover:bg-white/5"
                                    >
                                      <MoreVertical size={14} />
                                    </button>
                                    {actionMenuId === debt.id && (
                                      <div className="absolute right-0 top-6 bg-neutral-950 border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 w-36 flex flex-col text-left">
                                        <button onClick={() => openDebtWizard(debt)} className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-white hover:bg-white/5">
                                          <Edit3 size={11} /> Düzenle
                                        </button>
                                        {debt.status === 'Devam Ediyor' && (
                                          <button onClick={() => markDebtAsPaid(debt.id, true)} className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-focus-neon hover:bg-focus-neon/10 border-t border-white/5">
                                            <CheckCircle2 size={11} /> Borcu Kapat
                                          </button>
                                        )}
                                        <button onClick={() => deleteDebt(debt.id)} className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-crit-vivid hover:bg-crit-vivid/10 border-t border-white/5">
                                          <Trash2 size={11} /> Sil
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {debts.length === 0 && (
                      <div className="text-center py-8 text-xs text-text-secondary italic">Gösterilecek borç kaydı bulunamadı.</div>
                    )}
                  </div>
                </div>

                {/* RIGHT 1/3: Akıllı Borç Ödeme Sıralayıcı (Snowball vs Avalanche Simulator) */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingDown size={14} className="text-focus-neon" />
                      Akıllı Borç Sıralayıcı (Ödeme Stratejisi)
                    </h3>
                  </div>

                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Borçlarınızı en hızlı ve en az faiz maliyetiyle nasıl kapatabileceğinizi simüle edin.
                  </p>

                  {/* Strategy Buttons */}
                  <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setSnowballStrategy('snowball')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        snowballStrategy === 'snowball' 
                          ? 'bg-focus-neon/10 text-focus-neon border border-focus-neon/10 font-black' 
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Kartopu (Snowball)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSnowballStrategy('avalanche')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        snowballStrategy === 'avalanche' 
                          ? 'bg-focus-neon/10 text-focus-neon border border-focus-neon/10 font-black' 
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Çığ (Avalanche)
                    </button>
                  </div>

                  {/* Description Info */}
                  <p className="text-[10px] text-text-secondary/80 bg-white/[0.01] p-2.5 rounded-lg border border-white/5 italic">
                    {snowballStrategy === 'snowball' 
                      ? "💡 Kartopu Metodu: En küçük bakiyeli borca odaklanıp hızlıca kapatarak motivasyon kazanın." 
                      : "💡 Çığ Metodu: En yüksek faiz oranına sahip borca odaklanarak ödenecek toplam faiz yükünü en aza indirin."
                    }
                  </p>

                  {/* Sorted Payoff Order List */}
                  <div className="space-y-2 pt-1 max-h-[190px] overflow-y-auto pr-1">
                    {debtPayoffOrder.length === 0 ? (
                      <p className="text-[11px] text-text-secondary italic text-center py-6">Aktif borç kaydı yok.</p>
                    ) : (
                      debtPayoffOrder.map((debt, index) => (
                        <div key={debt.id} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-focus-neon/10 text-focus-neon text-[10px] font-bold flex items-center justify-center border border-focus-neon/20">
                              {index + 1}
                            </span>
                            <div className="truncate">
                              <p className="font-bold text-text-primary truncate">{debt.title}</p>
                              <p className="text-[9px] text-text-secondary">Faiz: %{debt.interestRate || 0} • {debt.lender}</p>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-bold text-text-primary block">{formatValue(convertAmount(debt.remainingAmount, debt.currency || 'TRY', displayCurrency))}</span>
                            <span className="text-[9px] text-text-secondary">Taksit: {formatValue(convertAmount(debt.paymentAmount, debt.currency || 'TRY', displayCurrency))}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* SMART ANALYSIS & FUTURE CHRONOLOGICAL PROJECTOR */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN (lg:col-span-5): Q&A and Adjustable Budget Stress Tester */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <Sparkles size={18} className="text-focus-neon animate-pulse" />
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bütçe Zorlanma & Soru-Cevap Asistanı</h3>
                        <p className="text-[10px] text-text-secondary">Akıllı algoritmalarla finansal durumunuzu sorgulayın.</p>
                      </div>
                    </div>

                    {/* Gelir Slider / Input Control */}
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                          <Wallet size={13} className="text-focus-neon" />
                          Aylık Net Geliriniz
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-text-secondary">₺</span>
                          <input 
                            type="number" 
                            value={monthlyIncome} 
                            onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                            className="w-24 bg-black/40 border border-white/10 rounded-md px-2 py-0.5 text-xs text-white font-mono text-right focus:outline-none focus:border-focus-neon/50"
                          />
                        </div>
                      </div>
                      
                      <input 
                        type="range" 
                        min="10000" 
                        max="250000" 
                        step="5000"
                        value={monthlyIncome} 
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        className="w-full accent-focus-neon cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-text-secondary font-mono">
                        <span>₺10k</span>
                        <span>₺100k</span>
                        <span>₺250k+</span>
                      </div>
                    </div>

                    {/* Stress gauge */}
                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-secondary font-bold">Sabit Gider Zorlanma Endeksi</span>
                        <span className="font-mono font-black text-text-primary">{budgetStressRatio}%</span>
                      </div>
                      
                      {/* Interactive Bar */}
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 flex">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            budgetStressRatio < 20 ? 'bg-focus-neon' : budgetStressRatio < 40 ? 'bg-nrg-sun' : budgetStressRatio < 60 ? 'bg-amber-500' : 'bg-crit-vivid'
                          }`}
                          style={{ width: `${budgetStressRatio}%` }}
                        />
                      </div>

                      <div className={`p-3 border rounded-xl text-xs leading-relaxed ${budgetStressAdvice.color}`}>
                        <div className="font-bold mb-1 flex items-center gap-1">
                          <Info size={12} />
                          {budgetStressAdvice.level}
                        </div>
                        {budgetStressAdvice.desc}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Accordion QA */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Aklınızdaki Soruları Yanıtlayalım:</h4>
                    
                    {/* Q1: Ne kadar borcum var */}
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setActiveFaqId(activeFaqId === 'debt_amount' ? null : 'debt_amount')}
                        className={`w-full p-3.5 text-left text-xs font-bold transition-all flex justify-between items-center hover:bg-white/[0.02] ${activeFaqId === 'debt_amount' ? 'bg-white/[0.02] text-white' : 'text-text-secondary'}`}
                      >
                        <span>Soru 1: Toplam ne kadar borcum var?</span>
                        <span className={`text-xs transition-transform ${activeFaqId === 'debt_amount' ? 'rotate-90 text-focus-neon' : ''}`}>➔</span>
                      </button>
                      {activeFaqId === 'debt_amount' && (
                        <div className="p-4 bg-black/20 border-t border-white/5 text-xs space-y-3">
                          <p className="text-text-secondary leading-relaxed">
                            Şu anda kayıtlı olan tüm aktif borçlarınızın ve kredilerinizin kalan ana para ve taksit bakiye durumları şu şekildedir:
                          </p>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg">
                              <span className="text-[10px] text-text-secondary block">Toplam Kalan Borç</span>
                              <span className="font-mono font-bold text-base text-white">{formatValue(totalRemainingDebt)}</span>
                            </div>
                            <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg">
                              <span className="text-[10px] text-text-secondary block">Başlangıçtaki Borç</span>
                              <span className="font-mono font-bold text-base text-text-secondary">{formatValue(totalStartingDebt)}</span>
                            </div>
                          </div>
                          
                          {totalStartingDebt > 0 && (
                            <div className="p-2.5 bg-focus-neon/5 border border-focus-neon/10 rounded-lg text-xs">
                              <p className="text-text-secondary font-bold flex justify-between">
                                <span>Borçların Erime Oranı:</span>
                                <span className="text-focus-neon">%{Math.round(((totalStartingDebt - totalRemainingDebt) / totalStartingDebt) * 100)} ödendi</span>
                              </p>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1.5">
                                <div className="bg-focus-neon h-full" style={{ width: `${((totalStartingDebt - totalRemainingDebt) / totalStartingDebt) * 100}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Q2: Dönemlik ne kadar ödemem gerekiyor */}
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setActiveFaqId(activeFaqId === 'payments_cycle' ? null : 'payments_cycle')}
                        className={`w-full p-3.5 text-left text-xs font-bold transition-all flex justify-between items-center hover:bg-white/[0.02] ${activeFaqId === 'payments_cycle' ? 'bg-white/[0.02] text-white' : 'text-text-secondary'}`}
                      >
                        <span>Soru 2: Dönemlik (Aylık/Yıllık) ne kadar ödemem var?</span>
                        <span className={`text-xs transition-transform ${activeFaqId === 'payments_cycle' ? 'rotate-90 text-focus-neon' : ''}`}>➔</span>
                      </button>
                      {activeFaqId === 'payments_cycle' && (
                        <div className="p-4 bg-black/20 border-t border-white/5 text-xs space-y-3">
                          <p className="text-text-secondary leading-relaxed">
                            Her ay abonelikleriniz ve aktif kredileriniz için yapmanız gereken toplam ödemeler bütçenizde şu şekilde dağılmaktadır:
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
                              <span className="text-text-secondary">Aylık Aktif Abonelikler:</span>
                              <span className="text-text-primary font-bold">{formatValue(totalMonthlySubs)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
                              <span className="text-text-secondary">Aylık Aktif Borç Ödemeleri:</span>
                              <span className="text-crit-vivid font-bold">{formatValue(totalMonthlyDebtPayments)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-white/5 font-mono text-sm font-bold">
                              <span className="text-white">Aylık Toplam Sabit Gider:</span>
                              <span className="text-focus-neon">{formatValue(totalMonthlyLoadCombined)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 font-mono text-xs text-text-secondary">
                              <span>Yıllık Kümülatif Projeksiyon:</span>
                              <span>{formatValue(totalMonthlyLoadCombined * 12)} / yıl</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Q3: Beni ne kadar zorluyor */}
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setActiveFaqId(activeFaqId === 'strain_level' ? null : 'strain_level')}
                        className={`w-full p-3.5 text-left text-xs font-bold transition-all flex justify-between items-center hover:bg-white/[0.02] ${activeFaqId === 'strain_level' ? 'bg-white/[0.02] text-white' : 'text-text-secondary'}`}
                      >
                        <span>Soru 3: Bu sabit ödemeler beni ne kadar zorluyor?</span>
                        <span className={`text-xs transition-transform ${activeFaqId === 'strain_level' ? 'rotate-90 text-focus-neon' : ''}`}>➔</span>
                      </button>
                      {activeFaqId === 'strain_level' && (
                        <div className="p-4 bg-black/20 border-t border-white/5 text-xs space-y-3">
                          <p className="text-text-secondary leading-relaxed">
                            Gelir ve gider rasyonuz temel alınarak yapılan bütçe stres testi analizi:
                          </p>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Gelirinizin Sabit Gider Oranı:</span>
                              <span className="font-bold text-white font-mono">{budgetStressRatio}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Kalan Serbest Bütçe Oranı:</span>
                              <span className="font-bold text-focus-neon font-mono">{100 - budgetStressRatio}%</span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-focus-neon/5 border border-focus-neon/10 rounded-lg text-[11px] text-text-secondary">
                            <strong className="text-text-primary block mb-1">💡 Çözüm ve Rahatlama Önerisi:</strong>
                            {budgetStressRatio > 40 ? (
                              'Kartopu (Snowball) metodunu etkinleştirerek bakiye tutarı en düşük olan borca ekstra ödeme yapın. Kapanan her borç bütçenizde anında kalıcı rahatlama sağlayacaktır.'
                            ) : (
                              'Mevcut durumunuz stabil. Sabit giderlerinizin %20 altında kalması her zaman önerilir. Kalan bütçenizi otomatik olarak tasarrufa veya altın/fon birikimlerine aktarabilirsiniz.'
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* RIGHT COLUMN (lg:col-span-7): Chronological 12-Month Timeline Projections */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                          <Calendar size={16} className="text-focus-neon" />
                          12 Aylık Kronolojik Yol Haritası & Pozitife Geçiş Zaman Tüneli
                        </h3>
                        <p className="text-[10px] text-text-secondary mt-1">
                          Ay ay hangi borçların bittiğini ve bütçenizde ne zaman ne kadar ek alan açılacağını simüle edin.
                        </p>
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                      {chronologicalProjections.map((proj, idx) => {
                        const hasEndedDebts = proj.finishedDebtsThisMonth.length > 0;
                        const isFullyFreeOfDebts = proj.debtTotal === 0;

                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              hasEndedDebts 
                                ? 'bg-focus-neon/5 border-focus-neon/20 shadow-[0_0_15px_rgba(16,185,129,0.04)]' 
                                : isFullyFreeOfDebts
                                ? 'bg-emerald-950/10 border-emerald-500/20'
                                : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white">{proj.monthLabel}</span>
                                {idx === 0 && <span className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-bold text-text-primary">İçinde Bulunulan Ay</span>}
                                {isFullyFreeOfDebts && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold">
                                    Borçsuz Dönem 🎯
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-secondary">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-focus-neon" />
                                  Abonelikler: {formatValue(proj.subTotal)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-crit-vivid" />
                                  Borçlar: {formatValue(proj.debtTotal)}
                                </span>
                                <span className="flex items-center gap-1 font-bold text-text-primary">
                                  Toplam Gider: {formatValue(proj.totalOutflow)}
                                </span>
                              </div>

                              {/* Progress load bar for this month */}
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1 max-w-xs">
                                <div 
                                  className={`h-full ${
                                    proj.strainRatio < 20 ? 'bg-focus-neon' : proj.strainRatio < 40 ? 'bg-nrg-sun' : proj.strainRatio < 60 ? 'bg-amber-500' : 'bg-crit-vivid'
                                  }`} 
                                  style={{ width: `${proj.strainRatio}%` }} 
                                />
                              </div>
                            </div>

                            {/* Achievements & Freed cashflow indicators */}
                            <div className="flex flex-col items-start md:items-end justify-center gap-2 shrink-0">
                              
                              {/* Finished Debts notification badge */}
                              {hasEndedDebts && (
                                <div className="space-y-1 w-full md:text-right">
                                  {proj.finishedDebtsThisMonth.map((title, dIdx) => (
                                    <span 
                                      key={dIdx} 
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-focus-neon text-black font-black text-[10px] shadow-sm animate-pulse"
                                    >
                                      🎉 {title} Bitti!
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Freed budget / Cash flow indicator */}
                              {proj.freedCashflow > 0 ? (
                                <div className="text-right">
                                  <span className="text-[10px] text-focus-neon font-black block">
                                    +{formatValue(proj.freedCashflow)} /ay Bütçe Alanı Açıldı
                                  </span>
                                  <span className="text-[8px] text-text-secondary block">M0 başlangıcına göre kazanılan nakit akışı</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-text-secondary/60 italic block">Nakit akışında değişim yok</span>
                              )}

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* SUBSCRIPTION WIZARD MODAL */}
      <AnimatePresence>
        {isSubWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                   <Repeat size={16} className="text-focus-neon"/> {editingSubId ? 'Abonelik Düzenle' : 'Yeni Abonelik Ekle'}
                </h2>
                <button onClick={() => setIsSubWizardOpen(false)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
                
                {/* Search Preset Suggestion Field */}
                <div className="relative">
                  <label className="block font-bold text-text-secondary mb-1">Abonelik Adı / Platform</label>
                  <input 
                    type="text" placeholder="Örn: Netflix, Spotify..." value={subFormData.title || ''}
                    onChange={handleSubTitleChange} onFocus={() => setShowSubSuggestions(true)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-focus-neon/50"
                  />
                  {showSubSuggestions && subSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-neutral-800 border border-white/10 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                      {subSuggestions.map((s, idx) => (
                        <div key={idx} onClick={() => selectSubSuggestion(s)} className="px-3 py-2 border-b border-white/5 hover:bg-white/[0.04] cursor-pointer flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white text-xs">{s.title}</p>
                            <p className="text-[9px] text-text-secondary">{s.category} • {s.type}</p>
                          </div>
                          <span className="font-mono text-focus-neon">₺{s.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Tutar</label>
                    <input 
                      type="number" placeholder="0.00" value={subFormData.amount || ''}
                      onChange={(e) => setSubFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Para Birimi</label>
                    <select 
                      value={subFormData.currency || 'TRY'} 
                      onChange={(e) => setSubFormData(prev => ({ ...prev, currency: e.target.value as any }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Döngü</label>
                    <select 
                      value={subFormData.billingCycle || 'Aylık'} onChange={(e) => setSubFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Haftalık">Haftalık</option>
                      <option value="Aylık">Aylık</option>
                      <option value="Yıllık">Yıllık</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Kategori</label>
                    <select 
                      value={subFormData.category || ''} onChange={(e) => setSubFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="">Seçiniz...</option>
                      <option value="Eğlence">Eğlence (Film, Müzik, Oyun)</option>
                      <option value="Yazılım">Yazılım (Adobe, AI Araçları)</option>
                      <option value="Altyapı">Altyapı (Bulut, Hosting)</option>
                      <option value="Alışveriş">Alışveriş (Premium Kargo vb)</option>
                      <option value="Medya">Medya & Yayıncılık</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Paket / Tür (Opsiyonel)</label>
                    <input 
                      type="text" placeholder="Örn: Premium, Aile" value={subFormData.type || ''}
                      onChange={(e) => setSubFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Sonraki Ödeme Tarihi</label>
                    <input 
                      type="date" value={subFormData.nextBillingDate || ''}
                      onChange={(e) => setSubFormData(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Ödeme Yöntemi</label>
                    <input 
                      type="text" placeholder="Kart sonu 4452 vb." value={subFormData.paymentMethod || ''}
                      onChange={(e) => setSubFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  {editingSubId && (
                    <div>
                      <label className="block font-bold text-text-secondary mb-1">Abonelik Durumu</label>
                      <select 
                        value={subFormData.status || 'Aktif'} onChange={(e) => setSubFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="İptal Edildi">İptal Edildi</option>
                      </select>
                    </div>
                  )}
                </div>

              </div>
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-2 text-xs font-bold">
                <button onClick={() => setIsSubWizardOpen(false)} className="px-4 py-2 text-text-secondary hover:text-white">İptal</button>
                <button onClick={saveSubscription} className="px-5 py-2 bg-focus-neon text-black rounded-xl hover:bg-focus-neon/90">
                  {editingSubId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEBT WIZARD MODAL */}
      <AnimatePresence>
        {isDebtWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={16} className="text-crit-vivid"/> {editingDebtId ? 'Borç / Kredi Güncelle' : 'Yeni Borç veya Kredi Ekle'}
                </h2>
                <button onClick={() => setIsDebtWizardOpen(false)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Kategori</label>
                    <select 
                      value={debtFormData.category || ''}
                      onChange={(e) => setDebtFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                    >
                      <option value="İhtiyaç Kredisi">İhtiyaç Kredisi</option>
                      <option value="Konut Kredisi">Konut Kredisi</option>
                      <option value="Taşıt Kredisi">Taşıt Kredisi</option>
                      <option value="Kredi Kartı">Kredi Kartı</option>
                      <option value="Esnek Hesap (KMH)">Esnek Hesap / KMH</option>
                      <option value="Elden Borç">Elden Borç / Şahıs</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Hesap / Borç Adı</label>
                    <input 
                      type="text" placeholder="Örn: Garanti BBVA Kredisi..."
                      value={debtFormData.title || ''} onChange={(e) => setDebtFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Kurum / Alacaklı</label>
                    <input 
                      type="text" placeholder="Örn: Yapı Kredi, Ahmet Bey..."
                      value={debtFormData.lender || ''} onChange={(e) => setDebtFormData(prev => ({ ...prev, lender: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Para Birimi</label>
                    <select 
                      value={debtFormData.currency || 'TRY'} 
                      onChange={(e) => setDebtFormData(prev => ({ ...prev, currency: e.target.value as any }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Yıllık Faiz Oranı (%)</label>
                    <input 
                      type="number" step="0.1" placeholder="Yıllık faiz örn: 45"
                      value={debtFormData.interestRate || ''} onChange={(e) => setDebtFormData(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Sonraki Taksit / Ödeme Günü</label>
                    <input 
                      type="date" value={debtFormData.nextPaymentDate || ''}
                      onChange={(e) => setDebtFormData(prev => ({ ...prev, nextPaymentDate: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Dinamik Taksit Hesaplayıcı Box */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                  <span className="font-bold text-text-primary block">Taksit ve Bakiye Bilgileri</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-text-secondary mb-1">Toplam Borç</label>
                      <input 
                        type="number" placeholder="0.00"
                        value={debtFormData.totalAmount || ''} 
                        onChange={(e) => setDebtFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                        onBlur={() => handleDebtCalcBlur('totalAmount')}
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-secondary mb-1">Taksit Tutarı</label>
                      <input 
                        type="number" placeholder="0.00"
                        value={debtFormData.paymentAmount || ''} 
                        onChange={(e) => setDebtFormData(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                        onBlur={() => handleDebtCalcBlur('paymentAmount')}
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 font-mono text-crit-vivid font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-secondary mb-1">Toplam Taksit</label>
                      <input 
                        type="number" placeholder="0"
                        value={debtFormData.installments || ''} 
                        onChange={(e) => setDebtFormData(prev => ({ ...prev, installments: Number(e.target.value) }))}
                        onBlur={() => handleDebtCalcBlur('installments')}
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[10px] text-text-secondary mb-1">Kalan Taksit Sayısı</label>
                      <input 
                        type="number" placeholder="0"
                        value={debtFormData.paidInstallments !== undefined && debtFormData.installments !== undefined ? (debtFormData.installments - debtFormData.paidInstallments) : ''} 
                        onChange={(e) => {
                          const remaining = Number(e.target.value);
                          if (debtFormData.installments !== undefined) {
                            setDebtFormData(prev => ({ ...prev, paidInstallments: Math.max(0, (prev.installments || 0) - remaining) }));
                          }
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-secondary mb-1">Ödeme Sıklığı</label>
                      <select 
                        value={debtFormData.paymentFrequency || 'Aylık'}
                        onChange={(e) => setDebtFormData(prev => ({ ...prev, paymentFrequency: e.target.value as any }))}
                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5"
                      >
                        <option value="Haftalık">Haftalık</option>
                        <option value="Aylık">Aylık</option>
                        <option value="Yıllık">Yıllık</option>
                      </select>
                    </div>
                  </div>
                </div>

                {editingDebtId && (
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Borç Durumu</label>
                    <select 
                      value={debtFormData.status || 'Devam Ediyor'} onChange={(e) => setDebtFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Devam Ediyor">Devam Ediyor</option>
                      <option value="Ödendi">Ödendi / Kapandı</option>
                    </select>
                  </div>
                )}

              </div>
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-2 text-xs font-bold">
                <button onClick={() => setIsDebtWizardOpen(false)} className="px-4 py-2 text-text-secondary hover:text-white">İptal</button>
                <button onClick={saveDebt} className="px-5 py-2 bg-crit-vivid text-white rounded-xl hover:bg-crit-vivid/90">
                  {editingDebtId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
