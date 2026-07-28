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
  CheckCircle2,
  X
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
  recurrence?: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: 'Gerçekleşti' | 'Planlı';
  recurrence?: string;
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
  const [incomes, setIncomes] = useLocalStorage<Income[]>('finance_incomes', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('finance_expenses', []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('finance_investments', []);
  const [debts, setDebts] = useLocalStorage<Debt[]>('finance_debts', []);
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('finance_subscriptions', []);
  const [savings, setSavings] = useLocalStorage<SavingGoal[]>('finance_savings', []);
  const [purchases, setPurchases] = useLocalStorage<PlannedPurchase[]>('finance_purchases', []);

  // Budget Inclusion Options
  const [includeBudgets, setIncludeBudgets] = useState<boolean>(true);

  // New purchase target wizard state
  const [isNewTargetOpen, setIsNewTargetOpen] = useState(false);
  const [newTargetTitle, setNewTargetTitle] = useState('');
  const [newTargetPrice, setNewTargetPrice] = useState(100000);
  const [newTargetMonth, setNewTargetMonth] = useState('2026-12');
  const [newTargetPriority, setNewTargetPriority] = useState<'Acil' | 'Orta' | 'İsteğe Bağlı'>('Orta');

  // Time anchor: simulated current date is 2026-07 (July 2026) to align with baseline demo data
  const baseYear = 2026;
  const baseMonthIndex = 6; // July (0-indexed)

  // Selected relative month index (-12 to +12, total 25 months)
  const [selectedOffset, setSelectedOffset] = useState<number>(0);

  // AI Q&A States
  const [chatInput, setChatInput] = useState<string>('');
  const [chatAnswer, setChatAnswer] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Interactive Simulation sliders state
  const [simExtraSavings, setSimExtraSavings] = useState<number>(0); // Ek tasarruf miktarı (₺)
  const [simInflationShock, setSimInflationShock] = useState<number>(0); // Enflasyon Şoku (%)
  const [simEmergencyShock, setSimEmergencyShock] = useState<number>(0); // Beklenmedik Gider (₺)
  const [startingReserve, setStartingReserve] = useLocalStorage<number>('finance_starting_reserve_v2', 250000); // Başlangıç Varlık / Birikim Kalkanı

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

  // Current savings metric (anapara/birikimler) using user-defined starting capital
  const currentSavingsTotal = useMemo(() => {
    const totalInv = investments
      .filter(i => i.status === 'Aktif')
      .reduce((sum, i) => sum + Number(i.currentAmount || i.initialAmount || 0), 0);
    const totalSav = savings
      .reduce((sum, s) => sum + Number(s.currentAmount || 0), 0);

    // Base savings = investments + target savings + customizable Starting Reserve
    return totalInv + totalSav + startingReserve;
  }, [investments, savings, startingReserve]);

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

  // Helper to determine if a transaction is active in a target month
  const isTxActiveInMonth = (txDateStr: string, recurrence: string | undefined, targetYearMonthStr: string) => {
    if (!txDateStr) return false;
    const [txYear, txMonth] = txDateStr.split('-').map(Number);
    const [tgtYear, tgtMonth] = targetYearMonthStr.split('-').map(Number);

    const txDateNum = txYear * 12 + (txMonth - 1);
    const tgtDateNum = tgtYear * 12 + (tgtMonth - 1);

    if (tgtDateNum < txDateNum) return false;
    if (tgtDateNum === txDateNum) return true;

    const rec = recurrence || 'Tek Seferlik';
    if (rec === 'Tek Seferlik') return false;
    if (rec === 'Aylık' || rec === 'Haftalık') return true;
    if (rec === 'Yıllık') {
      return (tgtMonth - 1) === (txMonth - 1);
    }
    return false;
  };

  // 2. Step-by-Step Cashflow Simulation Engine (Generates data for all 25 months relative to each other)
  const monthlySimulatedData = useMemo(() => {
    const dataMap: Record<string, any> = {};

    // First, let's map out the debts remaining balances at offset = 0 (current month)
    const initialDebtRemaining: Record<string, number> = {};
    debts.forEach(d => {
      if (d.status !== 'Ödendi') {
        initialDebtRemaining[d.id] = Number(d.remainingAmount ?? d.totalAmount ?? 0);
      }
    });

    // We will simulate forward from offset 0 to 12
    const forwardBalances: Record<string, { start: number; end: number; net: number }> = {};
    let currentBalance = currentSavingsTotal;

    // Track debt remaining balances through forward months
    const projectedDebtRemaining: Record<string, Record<number, number>> = {};
    // Initialize for month 0
    projectedDebtRemaining[0] = { ...initialDebtRemaining };

    // Let's also record the dynamic payoff month for each debt
    const dynamicDebtPayoffs: Record<string, { yearMonthStr: string; offset: number; monthName: string }> = {};

    // Helper to calculate details for any given month
    const calculateMonthDetails = (month: typeof timelineMonths[0], offset: number, debtBalances: Record<string, number>) => {
      // Find matching incomes
      let monthIncomes = incomes.filter(inc => isTxActiveInMonth(inc.date, inc.recurrence, month.yearMonthStr));
      let baseIncomeSum = monthIncomes.reduce((sum, inc) => {
        const mult = inc.recurrence === 'Haftalık' ? 4 : 1;
        return sum + Number(inc.amount || 0) * mult;
      }, 0);

      // Find matching expenses
      let monthExpenses = expenses.filter(exp => isTxActiveInMonth(exp.date, exp.recurrence, month.yearMonthStr));
      let baseExpenseSum = monthExpenses.reduce((sum, exp) => {
        const mult = exp.recurrence === 'Haftalık' ? 4 : 1;
        return sum + Number(exp.amount || 0) * mult;
      }, 0);

      // Apply Interactive Simulation Inflation Shock to future months
      if (offset > 0 && simInflationShock > 0) {
        baseExpenseSum = Math.round(baseExpenseSum * (1 + simInflationShock / 100));
      }

      // Subscriptions (Active digital services)
      const activeSubs = subscriptions.filter(s => s.status === 'Aktif');
      let subSum = activeSubs.reduce((sum, s) => {
        const mult = s.billingCycle === 'Haftalık' ? 4 : (s.billingCycle === 'Yıllık' ? 0.083 : 1);
        return sum + Number(s.amount || 0) * mult;
      }, 0);

      if (offset > 0 && simInflationShock > 0) {
        subSum = Math.round(subSum * (1 + simInflationShock / 100));
      }

      // Debt payments for this month
      const activeDebtsList: typeof debts = [];
      let debtSum = 0;

      debts.forEach(d => {
        if (d.status === 'Ödendi') return;

        // For past months, assume payment is made if status is ongoing
        if (offset < 0) {
          activeDebtsList.push(d);
          debtSum += Number(d.paymentAmount || 0);
        } else {
          // For current and future months, check projected remaining balance
          const rem = debtBalances[d.id];
          if (rem !== undefined && rem > 0) {
            const pay = Math.min(Number(d.paymentAmount || 0), rem);
            debtSum += pay;
            activeDebtsList.push({
              ...d,
              paymentAmount: pay,
              remainingAmount: rem - pay
            });
          }
        }
      });

      // Total regular outflow
      const standardOutflow = baseExpenseSum + subSum + debtSum;

      // Optional Budgets (Investments, savings, planned purchases)
      const purchaseSum = purchases
        .filter(p => p.scheduledMonth === month.yearMonthStr)
        .reduce((sum, p) => sum + Number(p.price || 0), 0);
      const investAlloc = 3000; // Standard simulated savings allocation
      const budgetAllocationsSum = purchaseSum + investAlloc;

      const netCashFlowBeforeBudgets = baseIncomeSum - standardOutflow;
      const netCashFlowWithBudgets = netCashFlowBeforeBudgets - budgetAllocationsSum;
      const activeNetCashFlow = includeBudgets ? netCashFlowWithBudgets : netCashFlowBeforeBudgets;

      return {
        monthIncomes,
        baseIncomeSum,
        monthExpenses,
        baseExpenseSum,
        subSum,
        activeDebtsList,
        debtSum,
        purchaseSum,
        investAlloc,
        standardOutflow,
        budgetAllocationsSum,
        netCashFlowBeforeBudgets,
        netCashFlowWithBudgets,
        activeNetCashFlow
      };
    };

    // Forward simulation (0 to 12)
    let tempDebts = { ...initialDebtRemaining };
    for (let o = 0; o <= 12; o++) {
      const month = timelineMonths.find(m => m.offset === o);
      if (!month) continue;

      // Calculate details
      const details = calculateMonthDetails(month, o, tempDebts);

      // Update remaining debt balances for the next month
      const nextDebts = { ...tempDebts };
      debts.forEach(d => {
        if (d.status === 'Ödendi') return;
        const rem = tempDebts[d.id];
        if (rem !== undefined && rem > 0) {
          const pay = Math.min(Number(d.paymentAmount || 0), rem);
          nextDebts[d.id] = Math.max(0, rem - pay);
          if (nextDebts[d.id] === 0 && !dynamicDebtPayoffs[d.id]) {
            dynamicDebtPayoffs[d.id] = {
              yearMonthStr: month.yearMonthStr,
              offset: o,
              monthName: `${month.monthName} ${month.year}`
            };
          }
        }
      });
      tempDebts = nextDebts;
      projectedDebtRemaining[o + 1] = { ...tempDebts };

      // Apply Interactive Simulation parameter modifiers
      let monthlyNetFlow = details.activeNetCashFlow;

      // If o === 0, apply current month emergency shock once
      if (o === 0 && simEmergencyShock > 0) {
        monthlyNetFlow -= simEmergencyShock;
      }

      // If o > 0, apply extra positive savings simulation rate
      if (o > 0 && simExtraSavings > 0) {
        monthlyNetFlow += simExtraSavings;
      }

      // Balance tracking
      const startBal = currentBalance;
      currentBalance += monthlyNetFlow;
      const endBal = currentBalance;

      forwardBalances[month.yearMonthStr] = { start: startBal, end: endBal, net: monthlyNetFlow };

      dataMap[month.yearMonthStr] = {
        month,
        startBalance: startBal,
        endBalance: endBal,
        incomesList: details.monthIncomes,
        expensesList: details.monthExpenses,
        subscriptionsSum: details.subSum,
        activeDebtsList: details.activeDebtsList,
        debtSum: details.debtSum,
        purchaseSum: details.purchaseSum,
        investAlloc: details.investAlloc,
        baseIncomeSum: details.baseIncomeSum,
        standardOutflow: details.standardOutflow,
        budgetAllocationsSum: details.budgetAllocationsSum,
        netCashFlowBeforeBudgets: details.netCashFlowBeforeBudgets,
        netCashFlowWithBudgets: details.netCashFlowWithBudgets,
        activeNetCashFlow: details.activeNetCashFlow
      };
    }

    // Backward simulation (-1 to -12)
    let backwardBalance = currentSavingsTotal;
    for (let o = -1; o >= -12; o--) {
      const month = timelineMonths.find(m => m.offset === o);
      if (!month) continue;

      const details = calculateMonthDetails(month, o, {});

      // For backward, we subtract the net flow to find previous starting balance
      const endBal = backwardBalance;
      backwardBalance -= details.activeNetCashFlow;
      const startBal = backwardBalance;

      dataMap[month.yearMonthStr] = {
        month,
        startBalance: startBal,
        endBalance: endBal,
        incomesList: details.monthIncomes,
        expensesList: details.monthExpenses,
        subscriptionsSum: details.subSum,
        activeDebtsList: details.activeDebtsList,
        debtSum: details.debtSum,
        purchaseSum: details.purchaseSum,
        investAlloc: details.investAlloc,
        baseIncomeSum: details.baseIncomeSum,
        standardOutflow: details.standardOutflow,
        budgetAllocationsSum: details.budgetAllocationsSum,
        netCashFlowBeforeBudgets: details.netCashFlowBeforeBudgets,
        netCashFlowWithBudgets: details.netCashFlowWithBudgets,
        activeNetCashFlow: details.activeNetCashFlow
      };
    }

    // We can attach the dynamic payoffs helper to the returned map
    dataMap._dynamicDebtPayoffs = dynamicDebtPayoffs;

    return dataMap;
  }, [incomes, expenses, currentSavingsTotal, subscriptions, debts, purchases, includeBudgets, timelineMonths]);

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
    const payoffs = monthlySimulatedData._dynamicDebtPayoffs || {};

    debts.forEach((debt) => {
      if (debt.status === 'Ödendi') return;
      const payoffInfo = payoffs[debt.id];
      const monthlyPay = Number(debt.paymentAmount || 0);
      const remaining = Number(debt.remainingAmount || debt.totalAmount || 0);
      const totalAmt = Number(debt.totalAmount || debt.remainingAmount || 1);
      if (monthlyPay <= 0) return;

      const paidPct = Math.min(100, Math.round(((totalAmt - remaining) / totalAmt) * 100));

      if (payoffInfo) {
        list.push({
          id: `term-debt-${debt.id}`,
          title: debt.title,
          type: 'Borç / Kredi',
          monthlyAmount: monthlyPay,
          remainingAmount: remaining,
          totalAmount: totalAmt,
          paidPercentage: paidPct,
          monthsRemaining: payoffInfo.offset,
          endingMonthName: payoffInfo.monthName,
          dateStr: payoffInfo.yearMonthStr
        });
      } else {
        const monthsLeft = Math.ceil(remaining / monthlyPay);
        const targetMonthObj = timelineMonths.find(m => m.offset === monthsLeft);
        list.push({
          id: `term-debt-${debt.id}`,
          title: debt.title,
          type: 'Borç / Kredi',
          monthlyAmount: monthlyPay,
          remainingAmount: remaining,
          totalAmount: totalAmt,
          paidPercentage: paidPct,
          monthsRemaining: monthsLeft,
          endingMonthName: targetMonthObj ? `${targetMonthObj.monthName} ${targetMonthObj.year}` : `${monthsLeft} ay sonra`,
          dateStr: targetMonthObj?.yearMonthStr
        });
      }
    });

    return list.sort((a, b) => a.monthsRemaining - b.monthsRemaining);
  }, [debts, subscriptions, timelineMonths, monthlySimulatedData]);

  const handleAddNewTarget = () => {
    if (!newTargetTitle.trim() || !newTargetPrice) return;
    const newTarget: PlannedPurchase = {
      id: `p-${Date.now()}`,
      title: newTargetTitle,
      price: Number(newTargetPrice),
      category: 'Satınalma Planlama',
      priority: newTargetPriority,
      scheduledMonth: newTargetMonth
    };
    setPurchases(prev => [...(prev || []), newTarget]);
    setIsNewTargetOpen(false);
    setNewTargetTitle('');
  };

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
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Target Creator Button */}
          <button
            onClick={() => setIsNewTargetOpen(true)}
            className="flex items-center gap-2 bg-skel-space hover:bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl text-xs font-bold text-text-primary transition-all active:scale-95 cursor-pointer"
          >
            <Target size={15} className="text-focus-neon" />
            <span>Yeni Hedef/Plan Ekle</span>
          </button>

          <div className="flex items-center gap-3 bg-neutral-800/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-2 rounded-2xl self-stretch md:self-auto justify-between flex-1 md:flex-initial">
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
            <span className="text-text-primary font-bold">
              ₺{Math.round(monthlySimulatedData['2026-01']?.endBalance || 240000).toLocaleString('tr-TR')}
            </span>
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
            <span className="text-focus-neon font-bold">
              ₺{Math.round(monthlySimulatedData['2026-07']?.endBalance || currentSavingsTotal).toLocaleString('tr-TR')}
            </span>
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
            <span className="text-ai-bright font-bold">
              ₺{Math.round(monthlySimulatedData['2027-01']?.endBalance || 420000).toLocaleString('tr-TR')}
            </span>
          </div>
        </motion.div>
      </div>

      {/* INTERACTIVE SIMULATION PARAMETER CONTROL BOARD */}
      <div className="bg-gradient-to-r from-neutral-800/5 to-transparent dark:from-white/[0.02] dark:to-transparent border border-black/5 dark:border-white/5 p-5 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
          <Sparkles className="text-focus-neon animate-pulse shrink-0" size={18} />
          <div>
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">İnteraktif Parametrik Finansal Simülasyon Stüdyosu</h3>
            <p className="text-[10px] text-text-secondary">Enflasyon dalgalanmaları veya beklenmedik acil durum harcamalarının 25 aylık nakit yol haritanıza etkisini gerçek zamanlı simüle edin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          {/* Slider 0: Başlangıç Nakit Birikimi */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-text-secondary">
              <span>Başlangıç Varlık / Birikim Kalkanı</span>
              <span className="font-mono text-focus-main">₺{startingReserve.toLocaleString('tr-TR')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="10000"
              value={startingReserve}
              onChange={(e) => setStartingReserve(Number(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-focus-main"
            />
            <span className="text-[9px] text-text-secondary block">Mevcut nakit birikiminiz ve finansal tampon kalkanınız.</span>
          </div>

          {/* Slider 1: Aylık Ek Tasarruf Oranı */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-text-secondary">
              <span>Aylık Ekstra Birikim</span>
              <span className="font-mono text-focus-neon">+₺{simExtraSavings.toLocaleString('tr-TR')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={simExtraSavings}
              onChange={(e) => setSimExtraSavings(Number(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-focus-neon"
            />
            <span className="text-[9px] text-text-secondary block">Maaş dışındaki her ay biriktirilen ilave tasarruf.</span>
          </div>

          {/* Slider 2: Yıllık Enflasyon Şoku */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-text-secondary">
              <span>Yıllık Enflasyon Şoku (Gelecek)</span>
              <span className="font-mono text-red-400">%{simInflationShock}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={simInflationShock}
              onChange={(e) => setSimInflationShock(Number(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
            <span className="text-[9px] text-text-secondary block">Gelecek aylarda sabit ve dijital giderlerin artış oranı.</span>
          </div>

          {/* Slider 3: Beklenmedik Gider Şoku */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-text-secondary">
              <span>Beklenmedik Acil Gider (Şimdi)</span>
              <span className="font-mono text-orange-400">₺{simEmergencyShock.toLocaleString('tr-TR')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={simEmergencyShock}
              onChange={(e) => setSimEmergencyShock(Number(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
            />
            <span className="text-[9px] text-text-secondary block">Bu ay gerçekleşen tek seferlik tıbbi/teknik acil harcama.</span>
          </div>
        </div>
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
                {activeMonthData.incomesList.map((inc: any, i: number) => {
                  const isPending = inc.status === 'Beklemede';
                  return (
                    <div key={inc.id || i} className="flex justify-between items-center text-xs text-text-secondary">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-focus-neon rounded-full" />
                        <span>{inc.title}</span>
                        {isPending && !inc.isDynamic && (
                          <button
                            type="button"
                            onClick={() => {
                              setIncomes(prev => prev.map(item => item.id === inc.id ? { ...item, status: 'Tamamlandı' } : item));
                            }}
                            className="text-[8px] font-bold bg-focus-neon/15 hover:bg-focus-neon text-focus-neon hover:text-black border border-focus-neon/20 px-1.5 py-0.2 rounded-full cursor-pointer"
                          >
                            Tamamla ✓
                          </button>
                        )}
                      </span>
                      <span className="font-mono font-bold text-text-primary dark:text-white">₺{Number(inc.amount).toLocaleString('tr-TR')}</span>
                    </div>
                  );
                })}
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
                {activeMonthData.expensesList.slice(0, 3).map((exp: any, i: number) => {
                  const isPlanned = exp.status === 'Planlı';
                  return (
                    <div key={exp.id || i} className="flex justify-between items-center text-xs text-text-secondary">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        <span>{exp.title}</span>
                        {isPlanned && !exp.isDynamic && (
                          <button
                            type="button"
                            onClick={() => {
                              setExpenses(prev => prev.map(item => item.id === exp.id ? { ...item, status: 'Gerçekleşti' } : item));
                            }}
                            className="text-[8px] font-bold bg-crit-vivid/15 hover:bg-crit-vivid text-crit-vivid hover:text-white border border-crit-vivid/20 px-1.5 py-0.2 rounded-full cursor-pointer"
                          >
                            Öde ✓
                          </button>
                        )}
                      </span>
                      <span className="font-mono">-₺{Number(exp.amount).toLocaleString('tr-TR')}</span>
                    </div>
                  );
                })}

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
              <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                {expenseTerminationSchedule.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 bg-neutral-800/10 dark:bg-black/25 border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
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

                    {/* Interactive Taksit Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-text-secondary font-mono">
                        <span>Borç Ödeme İlerlemesi</span>
                        <span>%{item.paidPercentage} Ödendi</span>
                      </div>
                      <div className="w-full bg-neutral-800 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-focus-neon h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.paidPercentage}%` }}
                        />
                      </div>
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
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-focus-neon/15 text-focus-neon flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 size={14} />
                </div>
                <h4 className="font-bold text-text-primary dark:text-white text-xs uppercase tracking-wider">Satın Alma Planlama Analizi</h4>
              </div>
              <span className="text-[9px] bg-focus-neon/10 text-focus-neon px-2 py-0.5 rounded font-mono">Dinamik</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Mevcut satın alma bütçenizi dahil ettiğimizde, {activeMonth.monthName} ayındaki toplam birikim havuzunuz <strong>₺{Math.round(activeMonthData.endBalance).toLocaleString('tr-TR')}</strong> seviyesinde kararlı görünmektedir. Acil ihtiyaçlarınızı önceliklendirin.
            </p>
          </div>

          {/* Analysis Card 2 */}
          <div className="p-5 rounded-2xl bg-neutral-800/10 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-3 hover:border-black/10 hover:dark:border-white/10 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-400/15 text-orange-400 flex items-center justify-center font-bold text-xs">
                  <AlertTriangle size={14} />
                </div>
                <h4 className="font-bold text-text-primary dark:text-white text-xs uppercase tracking-wider">Gider Sızıntıları ve Öngörüler</h4>
              </div>
              <span className="text-[9px] bg-orange-400/10 text-orange-400 px-2 py-0.5 rounded font-mono">Uyarı</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Abonelikleriniz ve borç taksitleriniz bütçenizin <strong>%{(activeMonthData.baseIncomeSum > 0 ? ((activeMonthData.standardOutflow / activeMonthData.baseIncomeSum) * 100).toFixed(0) : '0')}%</strong>'lik kısmını oluşturuyor. Önümüzdeki 4. ayda biten borçla birlikte bütçeniz rahat bir nefes alacaktır.
            </p>
          </div>

          {/* Analysis Card 3 */}
          <div className="p-5 rounded-2xl bg-neutral-800/10 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-3 hover:border-black/10 hover:dark:border-white/10 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-ai-bright/15 text-ai-bright flex items-center justify-center font-bold text-xs">
                  <Zap size={14} />
                </div>
                <h4 className="font-bold text-text-primary dark:text-white text-xs uppercase tracking-wider">Yatırım & Tasarruf Tavsiyeleri</h4>
              </div>
              <span className="text-[9px] bg-ai-bright/10 text-ai-bright px-2 py-0.5 rounded font-mono">Tavsiye</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Aylık kümülatif serbest bakiye birikimlerinizi enflasyon karşısında korumak amacıyla, düzenli olarak %15 oranında değerli metallere veya endeks fonlarına yönlendirmeniz finansal özgürlüğünüzü hızlandıracaktır.
            </p>
          </div>

        </div>

        {/* INTERACTIVE Q&A SPECIAL MODULE WITH CHAT SIMULATION */}
        <div className="p-4 md:p-5 rounded-2xl bg-neutral-800/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-ai-bright" />
              <h4 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">APEX AI Finansal Danışmanı ile Konuş</h4>
            </div>

            {/* Create Report Button */}
            <button
              onClick={() => {
                const docText = `
                ====================================================
                     APEX DOCK AKILLI FİNANSAL ANALİZ VE RAPORU
                ====================================================
                Rapor Tarihi: Temmuz 2026 (Aktif Dönem)
                Başlangıç Birikim Kalkanı: ₺${startingReserve.toLocaleString('tr-TR')}

                GELİR-GİDER DURUMU:
                - Bu Ay Maaş/Gelir: ₺${Math.round(activeMonthData.baseIncomeSum).toLocaleString('tr-TR')}
                - Bu Ay Sabit Giderler & Borçlar: ₺${Math.round(activeMonthData.standardOutflow).toLocaleString('tr-TR')}
                - Bu Ay Net Nakit Akışı: ₺${Math.round(activeMonthData.activeNetCashFlow).toLocaleString('tr-TR')}
                - Dönem Sonu Tahmini Bakiye: ₺${Math.round(activeMonthData.endBalance).toLocaleString('tr-TR')}

                ÖZGÜRLEŞEN BÜTÇE:
                - Gelecek 12 Ayda Özgürleşen Toplam Tutar: ₺${totalUpcomingFreedBudget.toLocaleString('tr-TR')} / ay

                YAPAY ZEKA STRATEJİK ÖNERİLERİ:
                1. Borçlarınız bittikten sonra bütçenize eklenecek aylık can suyunu derhal endeks fonlarına yönlendirin.
                2. Acil durum yedek akçenizi 6 aylık harcamanızı karşılayacak seviyede koruyun.
                3. Keyfi dijital aboneliklerinizi kontrol edip azaltın.
                ====================================================
                `;
                const element = document.createElement("a");
                const file = new Blob([docText], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `APEX_Finansal_Rapor_${activeMonth.yearMonthStr}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold bg-skel-space hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-text-primary transition-all cursor-pointer"
            >
              <Info size={12} className="text-focus-neon" />
              <span>Finansal Analiz Raporu Oluştur (.txt)</span>
            </button>
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

      {/* NEW INVESTMENT & PURCHASE TARGET CREATION MODAL */}
      <AnimatePresence>
        {isNewTargetOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                   <Target size={16} className="text-focus-neon"/> Yeni Hedef & Satın Alma Bütçesi Planı
                </h2>
                <button onClick={() => setIsNewTargetOpen(false)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-text-secondary mb-1">Hedef / Satın Alma Başlığı</label>
                  <input
                    type="text" placeholder="Örn: Yıl Sonu Araba Peşinatı, Yeni Laptop, Tatil Bütçesi..." value={newTargetTitle}
                    onChange={(e) => setNewTargetTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-focus-neon/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Fiyat / Tahsis Edilen Bütçe (₺)</label>
                    <input
                      type="number" placeholder="0" value={newTargetPrice}
                      onChange={(e) => setNewTargetPrice(Number(e.target.value))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text-secondary mb-1">Hedeflenen Ay (Simülasyon)</label>
                    <select
                      value={newTargetMonth}
                      onChange={(e) => setNewTargetMonth(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    >
                      {timelineMonths.map(m => (
                        <option key={m.yearMonthStr} value={m.yearMonthStr}>{m.monthName} {m.year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-text-secondary mb-1">Aciliyet Seviyesi</label>
                  <select
                    value={newTargetPriority}
                    onChange={(e) => setNewTargetPriority(e.target.value as any)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Acil">Acil (Ertelenemez)</option>
                    <option value="Orta">Orta (Dengeli)</option>
                    <option value="İsteğe Bağlı">İsteğe Bağlı (Keyfi)</option>
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-2 text-xs font-bold">
                <button onClick={() => setIsNewTargetOpen(false)} className="px-4 py-2 text-text-secondary hover:text-white">İptal</button>
                <button onClick={handleAddNewTarget} className="px-5 py-2 bg-focus-neon text-black rounded-xl hover:bg-focus-neon/90">
                  Planla ✓
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
