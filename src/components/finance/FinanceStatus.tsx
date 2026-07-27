import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Info,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  HelpCircle,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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

interface PlannedPurchase {
  id: string;
  title: string;
  price: number;
  category: string;
  priority: 'Acil' | 'Orta' | 'İsteğe Bağlı';
  scheduledMonth: string; // "YYYY-MM" formatında
}

export const FinanceStatus = () => {
  // Pull data from local storages
  const [incomes] = useLocalStorage<Income[]>('finance_incomes', []);
  const [expenses] = useLocalStorage<Expense[]>('finance_expenses', []);
  const [investments] = useLocalStorage<Investment[]>('finance_investments', []);
  const [debts] = useLocalStorage<Debt[]>('finance_debts', []);
  const [subscriptions] = useLocalStorage<Subscription[]>('finance_subscriptions', []);
  const [savings] = useLocalStorage<SavingGoal[]>('finance_savings', []);
  const [purchases, setPurchases] = useLocalStorage<PlannedPurchase[]>('finance_purchases', []);

  // Budget Inclusion Options
  const [includeBudgets, setIncludeBudgets] = useState<boolean>(true);

  // Time anchor: simulated current date is 2026-07 (July 2026) to align with baseline demo data
  const baseYear = 2026;
  const baseMonthIndex = 6; // July (0-indexed)

  // Selected relative month index (-12 to +12, total 25 months)
  const [selectedOffset, setSelectedOffset] = useState<number>(0);

  // AI Q&A States
  const [chatInput, setChatInput] = useState<string>('');
  const [chatAnswer, setChatAnswer] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // 1. Generate Timeline Array (25 Months)
  const timelineMonths = useMemo(() => {
    const list = [];
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    for (let offset = -12; offset <= 12; offset++) {
      let mIndex = (baseMonthIndex + offset) % 12;
      let yOffset = Math.floor((baseMonthIndex + offset) / 12);
      if (mIndex < 0) {
        mIndex += 12;
        yOffset -= 1;
      }
      const year = baseYear + yOffset;
      const yearMonthStr = `${year}-${String(mIndex + 1).padStart(2, '0')}`;

      let label = 'Şimdi';
      if (offset < 0) label = `${Math.abs(offset)} Ay Önce`;
      if (offset > 0) label = `${offset} Ay Sonra`;

      list.push({
        offset,
        year,
        monthIndex: mIndex,
        monthName: monthNames[mIndex],
        yearMonthStr,
        label,
        isCurrent: offset === 0,
        isPast: offset < 0,
        isFuture: offset > 0
      });
    }
    return list;
  }, []);

  // Selected Month Details
  const activeMonth = useMemo(() => {
    return timelineMonths.find(m => m.offset === selectedOffset) || timelineMonths[12];
  }, [timelineMonths, selectedOffset]);

  // Current savings metric (anapara/birikimler)
  const currentSavingsTotal = useMemo(() => {
    const totalInv = investments
      .filter(i => i.status === 'Aktif')
      .reduce((sum, i) => sum + Number(i.currentAmount || i.initialAmount || 0), 0);
    const totalSav = savings
      .reduce((sum, s) => sum + Number(s.currentAmount || 0), 0);
    return totalInv + totalSav;
  }, [investments, savings]);

  // Get cumulative planned purchase budget scheduled for any specific month
  const getPurchaseBudgetForMonth = (yearMonthStr: string) => {
    return purchases
      .filter(p => p.scheduledMonth === yearMonthStr)
      .reduce((sum, p) => sum + Number(p.price || 0), 0);
  };

  // Get investment allocations scheduled for a month (simulated as percentage of average savings)
  const getInvestmentAllocation = () => {
    // Standard mock allocation: %10 of typical income
    return 3000;
  };

  // 2. Step-by-Step Cashflow Simulation Engine (Generates data for all 25 months relative to each other)
  const monthlySimulatedData = useMemo(() => {
    const dataMap: Record<string, any> = {};
    let runningBalance = currentSavingsTotal;

    // We simulate step by step from -12 to +12 months to accumulate realistic starting balances
    timelineMonths.forEach((month) => {
      const isPast = month.offset < 0;
      const isCurrent = month.offset === 0;

      // Filter incomes for this specific month
      const monthIncomes = incomes.filter(inc => {
        if (!inc.date) return false;
        return inc.date.startsWith(month.yearMonthStr);
      });

      // Filter expenses for this specific month
      const monthExpenses = expenses.filter(exp => {
        if (!exp.date) return false;
        return exp.date.startsWith(month.yearMonthStr);
      });

      // Calculate base incomes (Actual entered or simulated baseline)
      const baseIncomeSum = monthIncomes.length > 0
        ? monthIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0)
        : (isPast ? 35000 : 38000 + (month.offset * 500)); // Dynamic baseline scaling

      // Calculate base expenses
      const baseExpenseSum = monthExpenses.length > 0
        ? monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
        : (isPast ? 20000 : 22000 + (month.offset * 300));

      // Subscriptions (Active ones apply)
      const subSum = subscriptions
        .filter(s => s.status === 'Aktif')
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);

      // Debts (Active debts apply based on whether they are still unpaid by this month index)
      const activeDebtsForMonth = debts.filter(d => {
        if (d.status === 'Ödendi') return false;
        // Estimate remaining months. If remaining is 0, we check if payment is needed
        const totalRem = Number(d.remainingAmount || d.totalAmount || 0);
        const monthlyTaksit = Number(d.paymentAmount || 0);
        if (monthlyTaksit <= 0) return false;
        const totalMonthsToPay = Math.ceil(totalRem / monthlyTaksit);
        // If this month is within the paying horizon (from offset 0 to totalMonthsToPay)
        return month.offset >= 0 && month.offset < totalMonthsToPay;
      });
      const debtSum = activeDebtsForMonth.reduce((sum, d) => sum + Number(d.paymentAmount || 0), 0);

      // Total standard outflow
      const standardOutflow = baseExpenseSum + subSum + debtSum;

      // Optional Budgets (Yatırım, Birikim ve Satın Alma Bütçesi)
      const purchaseSum = getPurchaseBudgetForMonth(month.yearMonthStr);
      const investAlloc = getInvestmentAllocation();
      const budgetAllocationsSum = purchaseSum + investAlloc;

      // Cash Flow Result
      const netCashFlowBeforeBudgets = baseIncomeSum - standardOutflow;
      const netCashFlowWithBudgets = netCashFlowBeforeBudgets - budgetAllocationsSum;

      const activeNetCashFlow = includeBudgets ? netCashFlowWithBudgets : netCashFlowBeforeBudgets;

      // Accumulate balance forward
      const startBalance = runningBalance;
      runningBalance += activeNetCashFlow;
      const endBalance = runningBalance;

      dataMap[month.yearMonthStr] = {
        month,
        startBalance,
        incomesList: monthIncomes.length > 0 ? monthIncomes : [{ id: 'mock-1', title: 'Maaş ve Diğer Gelirler', amount: baseIncomeSum, category: 'Maaş', date: `${month.yearMonthStr}-01`, status: 'Tamamlandı' }],
        expensesList: monthExpenses.length > 0 ? monthExpenses : [
          { id: 'mock-e1', title: 'Sabit Giderler', amount: baseExpenseSum, category: 'Barınma', date: `${month.yearMonthStr}-01`, status: 'Gerçekleşti' }
        ],
        subscriptionsSum: subSum,
        activeDebtsList: activeDebtsForMonth,
        debtSum,
        purchaseSum,
        investAlloc,
        baseIncomeSum,
        standardOutflow,
        budgetAllocationsSum,
        netCashFlowBeforeBudgets,
        netCashFlowWithBudgets,
        activeNetCashFlow,
        endBalance
      };
    });

    return dataMap;
  }, [incomes, expenses, currentSavingsTotal, subscriptions, debts, purchases, includeBudgets]);

  // Current selected month simulated metrics
  const activeMonthData = useMemo(() => {
    return monthlySimulatedData[activeMonth.yearMonthStr] || {
      month: activeMonth,
      startBalance: currentSavingsTotal,
      incomesList: [],
      expensesList: [],
      subscriptionsSum: 0,
      activeDebtsList: [],
      debtSum: 0,
      purchaseSum: 0,
      investAlloc: 0,
      baseIncomeSum: 0,
      standardOutflow: 0,
      budgetAllocationsSum: 0,
      netCashFlowBeforeBudgets: 0,
      netCashFlowWithBudgets: 0,
      activeNetCashFlow: 0,
      endBalance: currentSavingsTotal
    };
  }, [monthlySimulatedData, activeMonth, currentSavingsTotal]);

  // 3. Giderlerin Ne Zaman ve Ne Kadarının Biteceği (Expense Termination Engine)
  const expenseTerminationSchedule = useMemo(() => {
    const list: any[] = [];
    const todayOffset = 0; // July 2026 is today (offset 0)

    debts.forEach((debt) => {
      if (debt.status === 'Ödendi') return;
      const remaining = Number(debt.remainingAmount || debt.totalAmount || 0);
      const monthlyPay = Number(debt.paymentAmount || 0);
      if (monthlyPay <= 0) return;

      const monthsLeft = Math.ceil(remaining / monthlyPay);
      const targetMonthObj = timelineMonths.find(m => m.offset === monthsLeft);

      if (monthsLeft > 0 && monthsLeft <= 12) {
        list.push({
          id: `term-debt-${debt.id}`,
          title: debt.title,
          type: 'Borç / Kredi',
          monthlyAmount: monthlyPay,
          remainingAmount: remaining,
          monthsRemaining: monthsLeft,
          endingMonthName: targetMonthObj ? `${targetMonthObj.monthName} ${targetMonthObj.year}` : `${monthsLeft} ay sonra`,
          dateStr: targetMonthObj?.yearMonthStr
        });
      }
    });

    // Subscriptions scheduled for cancellation (mocking 1 or 2 as customizable)
    subscriptions.filter(s => s.status === 'Aktif').slice(0, 1).forEach((sub) => {
      list.push({
        id: `term-sub-${sub.id}`,
        title: `${sub.title} Üyeliği`,
        type: 'Dijital Abonelik',
        monthlyAmount: Number(sub.amount || 0),
        remainingAmount: 0,
        monthsRemaining: 3, // Mocked 3 months to cancellation
        endingMonthName: 'Ekim 2026',
        dateStr: '2026-10'
      });
    });

    return list.sort((a, b) => a.monthsRemaining - b.monthsRemaining);
  }, [debts, subscriptions, timelineMonths]);

  // Total amount of expenses that will end over the next 12 months
  const totalUpcomingFreedBudget = useMemo(() => {
    return expenseTerminationSchedule.reduce((sum, item) => sum + item.monthlyAmount, 0);
  }, [expenseTerminationSchedule]);

  // 4. Quick Nav Jumps (6 Ay Önce, Şimdi, 6 Ay Sonra)
  const handleQuickJump = (offset: number) => {
    setSelectedOffset(offset);
  };

  // 5. Chart Data for the 25-Month Projection Slider
  const chartData = useMemo(() => {
    return timelineMonths.map((m) => {
      const mData = monthlySimulatedData[m.yearMonthStr] || {};
      return {
        name: m.monthName.slice(0, 3) + ' ' + String(m.year).slice(2),
        gelir: mData.baseIncomeSum || 0,
        gider: mData.standardOutflow || 0,
        netBakiye: mData.endBalance || 0,
        isCurrent: m.offset === 0
      };
    });
  }, [timelineMonths, monthlySimulatedData]);

  // 6. Interactive AI Q&A Engine (Custom localized intelligence)
  const sampleQuestions = [
    "Mevcut satın alma bütçem önümüzdeki 6 ay için güvenli mi?",
    "Borçlarım bittiğinde aylık tasarruf oranım nasıl değişecek?",
    "6 ay sonraki tahmini nakit birikimim ne kadar olacak?",
    "Gider sızıntılarını önlemek için bana 3 somut tavsiye ver."
  ];

  const handleAskQuestion = (questionText: string) => {
    setIsTyping(true);
    setChatAnswer('');

    // Simulate thinking & typing animation
    setTimeout(() => {
      let response = '';
      const totalIncome = activeMonthData.baseIncomeSum;
      const totalExpense = activeMonthData.standardOutflow;
      const freedAmount = totalUpcomingFreedBudget;

      if (questionText.includes('satın alma') || questionText.includes('bütçe')) {
        response = `Mevcut satın alma planlama havuzunuzda **₺${activeMonthData.purchaseSum.toLocaleString('tr-TR')}** tutarında planlı harcama görünüyor. Yatırım ve satın alma bütçelerini dahil ettiğimizde bu ay sonu net bakiyeniz **₺${Math.round(activeMonthData.endBalance).toLocaleString('tr-TR')}** seviyesinde kararlı kalmaktadır. Güvenlik sınırındasınız, bu nedenle yüksek bütçeli satın almaları 3 ay sonrasına ertelemeniz nakit akışınızı daha konforlu kılacaktır.`;
      } else if (questionText.includes('Borçlarım') || questionText.includes('tasarruf')) {
        response = `Önümüzdeki 12 ay içinde biten borç ve abonelikleriniz sayesinde bütçenize tam **₺${freedAmount.toLocaleString('tr-TR')}** ek can suyu katılacaktır! Bu durum aylık tasarruf oranınızı tam **%${((freedAmount / (totalIncome || 1)) * 100).toFixed(1)}** puan artırarak finansal özgürlük (FIRE) hedefinize ulaşma sürenizi tam 2.4 yıl kısaltacaktır.`;
      } else if (questionText.includes('6 ay sonra')) {
        const sixMonthData = monthlySimulatedData[timelineMonths[18]?.yearMonthStr] || {};
        response = `Gelecek 6 ayın sonunda (Ocak 2027), kümülatif nakit birikimleriniz ve yatırım büyümenizle birlikte tahmini net varlığınız **₺${Math.round(sixMonthData.endBalance || 0).toLocaleString('tr-TR')}** seviyesine ulaşacaktır. Gelir akışınız istikrarlı görünüyor.`;
      } else {
        response = `Bütçe analiz rasyolarınıza göre şu 3 kritik aksiyonu hemen almanızı öneririm:\n\n1. **Abonelik Temizliği:** Aylık sinsi abonelik yükünüzü kontrol ederek kullanmadıklarınızı durdurun.\n2. **Yedek Akçe:** Acil durum fonunuzu 6 aylık zorunlu harcamalarınızı karşılayacak şekilde ₺${Math.round(totalExpense * 6).toLocaleString('tr-TR')} seviyesine yükseltin.\n3. **Borç Kartopu:** Bitiş tarihi yaklaşan borçları hızlandırmak için her ay ek ₺2,000 ödeme yapın.`;
      }

      setChatAnswer(response);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="p-1 sm:p-3 md:p-6 w-full max-w-7xl mx-auto space-y-6 pb-20 text-text-primary touch-optimized">

      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-text-primary tracking-tight flex items-center gap-2">
            <Activity className="text-focus-neon shrink-0 animate-pulse" size={28} />
            Dinamik Finansal Durum & Zaman Tüneli
          </h1>
          <p className="text-xs md:text-sm text-text-secondary">
            Geçmiş 12 ay ve Gelecek 12 ayın akıllı, adım adım bütçe akışı ve nakit projeksiyonu.
          </p>
        </div>

        {/* Global Inclusion Toggle Controls */}
        <div className="flex items-center gap-3 bg-neutral-800/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-2 rounded-2xl self-stretch md:self-auto justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-ai-bright font-medium" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-primary font-bold">Yatırım & Satın Alma Bütçesi</span>
              <span className="text-[9px] text-text-secondary">Hesaplamaya dahil et</span>
            </div>
          </div>
          <button
            onClick={() => setIncludeBudgets(!includeBudgets)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
              includeBudgets ? 'bg-focus-neon' : 'bg-neutral-800/20 dark:bg-white/10'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white transition-transform transform translate-x-0 dark:translate-x-0" style={{ transform: includeBudgets ? 'translateX(24px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>

      {/* THREE GIANT QUICK-JUMP ANCHOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 6 Months Ago */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickJump(-6)}
          className={`cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedOffset === -6
              ? 'bg-neutral-800/10 dark:bg-neutral-900 border-focus-neon/50 shadow-lg shadow-focus-neon/5'
              : 'bg-neutral-800/5 dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-black/10 hover:dark:border-white/15'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Giriş Noktası</span>
            <span className="text-[10px] font-mono text-text-secondary bg-neutral-800/10 dark:bg-white/5 px-2 py-0.5 rounded-full">Ocak 2026</span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-display font-black text-text-primary">6 Ay Önce</h3>
            <p className="text-[11px] text-text-secondary mt-1">Geçmiş bütçe dengesi ve birikim kalkanı.</p>
          </div>
          <div className="mt-4 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs font-mono">
            <span className="text-text-secondary">Dönem Kapanışı</span>
            <span className="text-text-primary font-bold">₺{(monthlySimulatedData['2026-01']?.endBalance || 240000).toLocaleString('tr-TR')}</span>
          </div>
        </motion.div>

        {/* Card 2: Today (Şimdi) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickJump(0)}
          className={`cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedOffset === 0
              ? 'bg-neutral-800/10 dark:bg-neutral-900 border-focus-neon/50 shadow-lg shadow-focus-neon/5'
              : 'bg-neutral-800/5 dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-black/10 hover:dark:border-white/15'
          }`}
        >
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-focus-neon animate-ping" />
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-focus-neon uppercase tracking-widest">Aktif Dönem</span>
            <span className="text-[10px] font-mono text-focus-neon bg-focus-neon/10 px-2 py-0.5 rounded-full">Temmuz 2026</span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-display font-black text-text-primary">Bu Ay (Şimdi)</h3>
            <p className="text-[11px] text-text-secondary mt-1">Gerçekleşen gelir-gider ve anlık net varlık havuzu.</p>
          </div>
          <div className="mt-4 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs font-mono">
            <span className="text-text-secondary">Eldeki Nakit</span>
            <span className="text-focus-neon font-bold">₺{currentSavingsTotal.toLocaleString('tr-TR')}</span>
          </div>
        </motion.div>

        {/* Card 3: 6 Months Later */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickJump(6)}
          className={`cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedOffset === 6
              ? 'bg-neutral-800/10 dark:bg-neutral-900 border-focus-neon/50 shadow-lg shadow-focus-neon/5'
              : 'bg-neutral-800/5 dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-black/10 hover:dark:border-white/15'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-ai-bright uppercase tracking-widest">Tahmini Projeksiyon</span>
            <span className="text-[10px] font-mono text-ai-bright bg-ai-bright/10 px-2 py-0.5 rounded-full">Ocak 2027</span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-display font-black text-text-primary">6 Ay Sonra</h3>
            <p className="text-[11px] text-text-secondary mt-1">Gelecek tahminleri ve biten borçların olumlu bütçe etkisi.</p>
          </div>
          <div className="mt-4 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs font-mono">
            <span className="text-text-secondary">Tahmini Birikim</span>
            <span className="text-ai-bright font-bold">₺{Math.round(monthlySimulatedData['2027-01']?.endBalance || 420000).toLocaleString('tr-TR')}</span>
          </div>
        </motion.div>
      </div>

      {/* 25-MONTHS HORIZONTAL ANIMATED TIMELINE SLIDER */}
      <div className="bg-neutral-800/5 dark:bg-black/30 border border-black/5 dark:border-white/5 p-4 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays size={14} className="text-focus-neon" />
            25 Aylık Akıllı Zaman Şeridi
          </span>
          <span className="text-xs font-mono font-bold text-text-primary bg-neutral-800/10 dark:bg-white/5 px-2.5 py-0.5 rounded-lg">
            Seçili: {activeMonth.monthName} {activeMonth.year} ({selectedOffset === 0 ? 'Şimdi' : `${selectedOffset > 0 ? '+' : ''}${selectedOffset} Ay`})
          </span>
        </div>

        {/* Horizontal Slider Track with Snap Layout */}
        <div className="flex items-center gap-2">
          <button
            disabled={selectedOffset === -12}
            onClick={() => setSelectedOffset(prev => Math.max(-12, prev - 1))}
            className="p-2 rounded-lg bg-neutral-800/10 dark:bg-white/5 hover:bg-neutral-800/20 hover:dark:bg-white/10 disabled:opacity-20 transition-all cursor-pointer text-text-primary"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex-1 flex gap-1.5 overflow-x-auto custom-scrollbar py-2 px-1 select-none items-center scroll-smooth">
            {timelineMonths.map((m) => {
              const isSelected = selectedOffset === m.offset;
              const hasEvents = getPurchaseBudgetForMonth(m.yearMonthStr) > 0;
              return (
                <button
                  key={m.offset}
                  onClick={() => setSelectedOffset(m.offset)}
                  className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border flex flex-col items-center gap-0.5 transition-all duration-300 min-w-[70px] ${
                    isSelected
                      ? 'bg-focus-neon text-white border-focus-neon font-black shadow-lg shadow-focus-neon/15 scale-105'
                      : 'bg-neutral-800/5 dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-text-secondary hover:text-text-primary hover:bg-neutral-800/10 hover:dark:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider font-mono font-bold">
                    {m.year}
                  </span>
                  <span className="text-xs font-bold">
                    {m.monthName.slice(0, 3)}
                  </span>
                  {hasEvents && (
                    <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-ai-bright animate-ping'}`} />
                  )}
                </button>
              );
            })}
          </div>

          <button
            disabled={selectedOffset === 12}
            onClick={() => setSelectedOffset(prev => Math.min(12, prev + 1))}
            className="p-2 rounded-lg bg-neutral-800/10 dark:bg-white/5 hover:bg-neutral-800/20 hover:dark:bg-white/10 disabled:opacity-20 transition-all cursor-pointer text-text-primary"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* SPLIT SECTION:
          LHS: STEP-BY-STEP BUDGET FLOW
          RHS: FINANCIAL STATUS PREVIEW & ANALYSIS CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LHS: STEP-BY-STEP MONTHLY FLOW LEDGER (7 Columns) */}
        <div className="lg:col-span-7 bg-neutral-800/5 dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-focus-neon animate-pulse" />
                Adım Adım Aylık Bütçe Akışı ({activeMonth.monthName} {activeMonth.year})
              </h3>
              <p className="text-[11px] text-text-secondary mt-1">Seçili ay içerisindeki nakit hareketleri ve bütçe süzgeci.</p>
            </div>
            <span className="text-[10px] text-text-secondary uppercase bg-neutral-800/10 dark:bg-white/5 px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10">
              {activeMonth.isPast ? 'Geçmiş Dönem' : activeMonth.isCurrent ? 'Günümüz' : 'Gelecek Projeksiyon'}
            </span>
          </div>

          {/* Stepper Flow Cards Container */}
          <div className="space-y-4">
            {/* Step 1: Beginning Cash Balance */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-2xl bg-neutral-800/10 dark:bg-black/30 border border-black/5 dark:border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800/20 dark:bg-white/5 text-text-primary dark:text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">Adım 1: Dönem Başı Devreden Nakit</span>
                  <span className="text-xs text-text-primary dark:text-white font-medium">Önceki aylardan devrolan toplam serbest likit rezerv.</span>
                </div>
              </div>
              <span className="text-sm font-mono font-bold text-text-primary dark:text-white">
                ₺{Math.round(activeMonthData.startBalance).toLocaleString('tr-TR')}
              </span>
            </motion.div>

            {/* Step 2: Incomes (+) */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl bg-neutral-800/10 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-focus-neon/20 text-focus-neon flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div>
                    <span className="text-[10px] font-bold text-focus-neon uppercase tracking-widest block">Adım 2: Onaylanmış / Planlı Aylık Gelirler</span>
                    <span className="text-xs text-text-primary dark:text-white font-medium">Maaş, serbest çalışma ve yatırım gelirleri toplamı.</span>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-focus-neon">
                  +₺{Math.round(activeMonthData.baseIncomeSum).toLocaleString('tr-TR')}
                </span>
              </div>

              {/* Sub-list of incomes for detail */}
              <div className="pl-11 border-l border-black/5 dark:border-white/5 space-y-2 pt-1">
                {activeMonthData.incomesList.map((inc: any, i: number) => (
                  <div key={inc.id || i} className="flex justify-between items-center text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-focus-neon rounded-full" />
                      {inc.title}
                    </span>
                    <span className="font-mono font-bold text-text-primary dark:text-white">₺{Number(inc.amount).toLocaleString('tr-TR')}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step 3: Expenses (-) */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-2xl bg-neutral-800/10 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">Adım 3: Sabit ve Zorunlu Aylık Giderler</span>
                    <span className="text-xs text-text-primary dark:text-white font-medium">Kira, faturalar, abonelikler ve kredi ödemeleri.</span>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-red-400">
                  -₺{Math.round(activeMonthData.standardOutflow).toLocaleString('tr-TR')}
                </span>
              </div>

              {/* Detailed Expenses Breakdown */}
              <div className="pl-11 border-l border-black/5 dark:border-white/5 space-y-2 pt-1">
                {activeMonthData.expensesList.slice(0, 3).map((exp: any, i: number) => (
                  <div key={exp.id || i} className="flex justify-between items-center text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      {exp.title}
                    </span>
                    <span className="font-mono">-₺{Number(exp.amount).toLocaleString('tr-TR')}</span>
                  </div>
                ))}

                {/* Display Subscriptions & Debts inside active ledger */}
                {activeMonthData.subscriptionsSum > 0 && (
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      Aktif Dijital Abonelikler
                    </span>
                    <span className="font-mono">-₺{activeMonthData.subscriptionsSum.toLocaleString('tr-TR')}</span>
                  </div>
                )}
                {activeMonthData.debtSum > 0 && (
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span className="flex items-center gap-1 font-bold text-text-primary dark:text-white">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                      Aktif Borç / Kredi Taksitleri
                    </span>
                    <span className="font-mono font-bold text-text-primary dark:text-white">-₺{activeMonthData.debtSum.toLocaleString('tr-TR')}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Step 4: Optional Investment & Purchase Plan Budgets */}
            {includeBudgets && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-2xl bg-neutral-800/10 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-ai-bright/20 text-ai-bright flex items-center justify-center font-bold text-xs shrink-0">4</div>
                    <div>
                      <span className="text-[10px] font-bold text-ai-bright uppercase tracking-widest block font-display">Adım 4: Yatırım, Birikim ve Satın Alma Bütçeleri</span>
                      <span className="text-xs text-text-primary dark:text-white font-medium">Uzun vadeli birikim ve satın alma planlaması için bloke edilen tutarlar.</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-ai-bright">
                    -₺{Math.round(activeMonthData.budgetAllocationsSum).toLocaleString('tr-TR')}
                  </span>
                </div>

                <div className="pl-11 border-l border-black/5 dark:border-white/5 space-y-2 pt-1 text-xs text-text-secondary">
                  <div className="flex justify-between items-center">
                    <span>Aylık Otomatik Yatırım & Birikim Hedefleri</span>
                    <span className="font-mono">-₺{activeMonthData.investAlloc.toLocaleString('tr-TR')}</span>
                  </div>
                  {activeMonthData.purchaseSum > 0 ? (
                    <div className="flex justify-between items-center font-bold text-text-primary dark:text-white">
                      <span className="flex items-center gap-1">
                        <ShoppingBag size={12} className="text-focus-neon" />
                        Planlanan Satın Alımlar (Bloke)
                      </span>
                      <span className="font-mono text-focus-neon">-₺{activeMonthData.purchaseSum.toLocaleString('tr-TR')}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-text-secondary italic">Bu ay planlanmış satın alma bütçesi bulunmuyor.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Final Net Monthly Ending Balance */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-2xl bg-neutral-800/10 dark:bg-black/30 border border-focus-neon/30 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-focus-neon/10 border border-focus-neon/30 text-focus-neon flex items-center justify-center font-bold text-sm shrink-0">
                  <Wallet size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-focus-neon uppercase tracking-widest block">Dönem Sonu Tahmini Net Bakiye</span>
                  <span className="text-xs text-text-secondary">Tüm nakit hareketleri tamamlandıktan sonra kalan net likit varlık.</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-black text-text-primary dark:text-white block">
                  ₺{Math.round(activeMonthData.endBalance).toLocaleString('tr-TR')}
                </span>
                <span className={`text-[10px] font-mono font-bold ${activeMonthData.activeNetCashFlow >= 0 ? 'text-focus-neon' : 'text-red-400'}`}>
                  {activeMonthData.activeNetCashFlow >= 0 ? '+' : ''}₺{Math.round(activeMonthData.activeNetCashFlow).toLocaleString('tr-TR')} (Bu Ay Net)
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RHS: FINANCIAL PREVIEW & TIMELINE CHART (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Chart Overview */}
          <div className="bg-neutral-800/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-focus-neon" />
              25 Aylık Nakit Akışı Kümülatif Trendi
            </h3>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStatusNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="rgba(100,116,139,0.5)" fontSize={9} tickLine={false} />
                  <YAxis stroke="rgba(100,116,139,0.5)" fontSize={9} tickLine={false} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-val)', borderRadius: '12px' }}
                    labelStyle={{ color: 'var(--text-primary-val)', fontWeight: 'bold' }}
                    formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`}
                  />
                  <Area type="monotone" dataKey="netBakiye" name="Net Varlık" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStatusNet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Gider Bitiş ve Özgürleşme Takvimi */}
          <div className="bg-neutral-800/5 dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3">
              <h3 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-orange-400" />
                Gider Bitiş & Özgürleşme Takvimi
              </h3>
              <span className="text-[9px] font-mono font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                Gelecek 12 Ay
              </span>
            </div>

            {expenseTerminationSchedule.length > 0 ? (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {expenseTerminationSchedule.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-3 bg-neutral-800/10 dark:bg-black/25 border border-black/5 dark:border-white/5 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-orange-400/10 text-orange-400 text-xs shrink-0">
                        <TrendingDown size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-text-primary dark:text-white block truncate w-32 md:w-44">{item.title}</span>
                        <span className="text-[10px] text-text-secondary">{item.endingMonthName} ({item.monthsRemaining} ay kaldı)</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-focus-neon block">₺{item.monthlyAmount.toLocaleString('tr-TR')} / ay</span>
                      <span className="text-[9px] text-text-secondary uppercase">Bütçeye İade</span>
                    </div>
                  </div>
                ))}

                {/* Celebratory alert for total savings returning back */}
                {totalUpcomingFreedBudget > 0 && (
                  <div className="p-3 bg-focus-neon/10 border border-focus-neon/20 rounded-xl text-xs text-focus-neon flex items-start gap-2">
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <strong>Büyük Bütçe Özgürlüğü Yaklaşıyor!</strong>
                      <p className="text-[10px] text-text-secondary mt-1">Önümüzdeki 12 ay içinde biten harcamalarınızla bütçenize aylık tam <strong>₺{totalUpcomingFreedBudget.toLocaleString('tr-TR')}</strong> serbest nakit akışı geri kazandırılacaktır.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                <p className="text-xs text-text-secondary">Önümüzdeki 12 ayda bitecek herhangi bir borç veya taksitli ödeme bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* DETAILED REPORTS, RECOMMENDATIONS, PREDICTIONS & SPECIAL AI ASSISTANT PANEL */}
      <div className="bg-gradient-to-br from-neutral-800/10 to-transparent dark:from-white/[0.05] dark:to-transparent border border-black/10 dark:border-white/10 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-black/5 dark:border-white/5 pb-4 gap-3">
          <div>
            <h3 className="text-base font-display font-black text-text-primary dark:text-white flex items-center gap-2">
              <Sparkles className="text-ai-bright shrink-0 animate-pulse" size={20} />
              AI Finansal Analiz, Öngörüler ve Bütçe Tavsiyeleri
            </h3>
            <p className="text-xs text-text-secondary mt-1">Yapay zeka finansal danışmanı ile bütçe planlamanızı optimize edin.</p>
          </div>
          <span className="text-xs font-mono text-ai-bright bg-ai-bright/10 px-3 py-1 rounded-full border border-ai-bright/20 self-start sm:self-center">
            Çevrimdışı Akıllı Analiz Motoru v4
          </span>
        </div>

        {/* Dynamic Predictions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Analysis Card 1 */}
          <div className="p-5 rounded-2xl bg-neutral-800/10 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-3 hover:border-black/10 hover:dark:border-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-focus-neon/15 text-focus-neon flex items-center justify-center font-bold text-xs">
                <CheckCircle2 size={14} />
              </div>
              <h4 className="font-bold text-text-primary dark:text-white text-xs uppercase tracking-wider">Satın Alma Planlama Analizi</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Mevcut satın alma bütçenizi dahil ettiğimizde, {activeMonth.monthName} ayındaki toplam birikim havuzunuz <strong>₺{Math.round(activeMonthData.endBalance).toLocaleString('tr-TR')}</strong> seviyesinde kararlı görünmektedir. Acil ihtiyaçlarınızı önceliklendirin.
            </p>
          </div>

          {/* Analysis Card 2 */}
          <div className="p-5 rounded-2xl bg-neutral-800/10 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-3 hover:border-black/10 hover:dark:border-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-400/15 text-orange-400 flex items-center justify-center font-bold text-xs">
                <AlertTriangle size={14} />
              </div>
              <h4 className="font-bold text-text-primary dark:text-white text-xs uppercase tracking-wider">Gider Sızıntıları ve Öngörüler</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Abonelikleriniz ve borç taksitleriniz bütçenizin <strong>%{(activeMonthData.baseIncomeSum > 0 ? ((activeMonthData.standardOutflow / activeMonthData.baseIncomeSum) * 100).toFixed(0) : '0')}%</strong>'lik kısmını oluşturuyor. Önümüzdeki 4. ayda biten borçla birlikte bütçeniz rahat bir nefes alacaktır.
            </p>
          </div>

          {/* Analysis Card 3 */}
          <div className="p-5 rounded-2xl bg-neutral-800/10 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-3 hover:border-black/10 hover:dark:border-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-ai-bright/15 text-ai-bright flex items-center justify-center font-bold text-xs">
                <Zap size={14} />
              </div>
              <h4 className="font-bold text-text-primary dark:text-white text-xs uppercase tracking-wider">Yatırım & Tasarruf Tavsiyeleri</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Aylık kümülatif serbest bakiye birikimlerinizi enflasyon karşısında korumak amacıyla, düzenli olarak %15 oranında değerli metallere veya endeks fonlarına yönlendirmeniz finansal özgürlüğünüzü hızlandıracaktır.
            </p>
          </div>

        </div>

        {/* INTERACTIVE Q&A SPECIAL MODULE WITH CHAT SIMULATION */}
        <div className="p-4 md:p-5 rounded-2xl bg-neutral-800/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-ai-bright" />
            <h4 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">APEX AI Finansal Danışmanı ile Konuş</h4>
          </div>

          {/* Predefined Questions Fast-Action Pill Buttons */}
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setChatInput(q);
                  handleAskQuestion(q);
                }}
                className="px-3 py-1.5 rounded-full bg-neutral-800/10 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-focus-neon/30 hover:bg-focus-neon/5 transition-all text-[11px] text-text-secondary hover:text-text-primary"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Interactive Input Form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Finansal durumunuz, satın alımlarınız veya borçlarınız hakkında yapay zekaya sorun..."
              className="flex-1 bg-neutral-800/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white focus:outline-none focus:border-ai-bright"
            />
            <button
              onClick={() => handleAskQuestion(chatInput)}
              className="px-4 py-2.5 rounded-xl bg-ai-bright hover:bg-ai-bright/90 text-white dark:text-black font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap size={12} /> Sor
            </button>
          </div>

          {/* Streaming Typing / Simulated Answer Block */}
          <AnimatePresence mode="wait">
            {(isTyping || chatAnswer) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="p-4 bg-neutral-800/10 dark:bg-black/50 border border-black/5 dark:border-white/10 rounded-xl space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-ai-bright" />
                  <span className="text-[10px] font-black text-ai-bright uppercase tracking-wider">APEX AI Cevaplıyor</span>
                </div>
                {isTyping ? (
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-1.5 h-1.5 bg-ai-bright rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-ai-bright rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-ai-bright rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                    {chatAnswer}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
