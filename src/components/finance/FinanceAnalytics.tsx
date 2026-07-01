import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Line
} from 'recharts';
import { 
  BrainCircuit, Zap, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Calculator, Clock, Target, Wallet, Activity, ArrowRight, CheckCircle2, Crosshair
} from 'lucide-react';

export const FinanceAnalytics = () => {
  const [activeEngine, setActiveEngine] = useState<'debt' | 'freedom' | 'analysis' | 'reports'>('debt');

  // Interactive Reports States
  const [activeReportTab, setActiveReportTab] = useState<'debt_strategy' | 'fire_plan' | 'stress_test'>('debt_strategy');
  const [extraPayment, setExtraPayment] = useState<number>(2000); // Ekstra aylık ödeme miktarı
  const [fireLifestyle, setFireLifestyle] = useState<'lean' | 'standard' | 'fat'>('standard');
  const [simIncomeLoss, setSimIncomeLoss] = useState<boolean>(false);
  const [simEmergencyExpense, setSimEmergencyExpense] = useState<number>(0); // 0, 25000, 50000
  const [simInflationShock, setSimInflationShock] = useState<boolean>(false);
  const [currentAge, setCurrentAge] = useState<number>(32);
  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(55);

  // New detailed interactive analytics states
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [expenseCutPercent, setExpenseCutPercent] = useState<number>(10);
  const [debtPayoffStrategy, setDebtPayoffStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  const [incomes] = useLocalStorage<any[]>('finance_incomes', []);
  const [expenses] = useLocalStorage<any[]>('finance_expenses', []);
  const [investments] = useLocalStorage<any[]>('finance_investments', []);
  const [debts] = useLocalStorage<any[]>('finance_debts', []);
  const [subscriptions] = useLocalStorage<any[]>('finance_subscriptions', []);
  const [savings] = useLocalStorage<any[]>('finance_savings', []);

  // --- DATA SYNTHESIS ---
  const calculateMonthly = (amount: number, freq: string) => {
    if (freq === 'Haftalık') return amount * 4;
    if (freq === 'Yıllık') return amount / 12;
    return amount;
  };

  const monthlyIncome = useMemo(() => {
    const recurring = incomes.filter(i => i.recurrence && i.recurrence !== 'Tek Seferlik');
    if (recurring.length > 0) {
      return recurring.reduce((sum, i) => sum + calculateMonthly(i.amount, i.recurrence), 0);
    }
    // Fallback if no recurring: average of last 3 months, or just total of 'Tamamlandı'
    const compl = incomes.filter(i => i.status === 'Tamamlandı');
    if (compl.length > 0) return compl.reduce((sum, i) => sum + i.amount, 0);
    return 0;
  }, [incomes]);

  const monthlyExpense = useMemo(() => {
    const recurring = expenses.filter(e => e.recurrence && e.recurrence !== 'Tek Seferlik');
    if (recurring.length > 0) {
      return recurring.reduce((sum, e) => sum + calculateMonthly(e.amount, e.recurrence), 0);
    }
    const compl = expenses.filter(e => e.status === 'Gerçekleşti');
    if (compl.length > 0) return compl.reduce((sum, e) => sum + e.amount, 0);
    return 0;
  }, [expenses]);

  const monthlySubscriptions = useMemo(() => {
    return subscriptions.filter(s => s.status === 'Aktif').reduce((sum, s) => sum + calculateMonthly(s.amount, s.billingCycle), 0);
  }, [subscriptions]);

  const activeDebts = useMemo(() => debts.filter(d => d.status === 'Devam Ediyor'), [debts]);
  const totalRemainingDebt = useMemo(() => activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0), [activeDebts]);
  const baseMonthlyDebtPayment = useMemo(() => activeDebts.reduce((sum, d) => sum + calculateMonthly(d.paymentAmount, d.paymentFrequency), 0), [activeDebts]);

  const totalNetWorth = useMemo(() => investments.reduce((sum, i) => sum + i.currentAmount, 0) + savings.reduce((sum, s) => sum + s.currentAmount, 0), [investments, savings]);

  // --- ENGINE 1: DEBT TRACKING (Borç Takip) ---
  const [debtProjection, setDebtProjection] = useState<any[]>([]);
  const [debtInsights, setDebtInsights] = useState<any[]>([]);
  const [debtMaxMonths, setDebtMaxMonths] = useState(0);
  const [timelineOffset, setTimelineOffset] = useState(0);

  useEffect(() => {
    if (activeEngine !== 'debt') return;

    const insights = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // 1. Simulate forward first (0 to 35 months relative to current)
    let currentDebts = activeDebts.map(d => ({ ...d, currentRemaining: d.remainingAmount }));
    let accumulatedCashForward = 0;
    const forwardProjection = [];
    let debtFreeMonthIndex = -1;

    for (let m = 0; m <= 35; m++) {
      let monthlyPaymentThisMonth = 0;
      let activeDebtsList: string[] = [];
      
      currentDebts.forEach(d => {
        if (d.currentRemaining > 0) {
          const payment = calculateMonthly(d.paymentAmount, d.paymentFrequency);
          const actualPayment = Math.min(payment, d.currentRemaining);
          d.currentRemaining -= actualPayment;
          monthlyPaymentThisMonth += actualPayment;
          activeDebtsList.push(`${d.title}: ₺${actualPayment.toLocaleString('tr-TR')}`);
        }
      });

      const cashLeft = monthlyIncome - (monthlyExpense + monthlySubscriptions) - monthlyPaymentThisMonth;
      accumulatedCashForward += cashLeft;

      const totalRemaining = currentDebts.reduce((sum, d) => sum + d.currentRemaining, 0);
      if (totalRemaining === 0 && debtFreeMonthIndex === -1 && activeDebts.length > 0) {
        debtFreeMonthIndex = m;
      }

      const date = new Date(currentYear, currentMonth + m, 1);
      forwardProjection.push({
        monthIndex: m,
        dateObj: date,
        dateLabel: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        aylikGelir: monthlyIncome,
        aylikGider: monthlyExpense + monthlySubscriptions,
        toplamKalanBorc: totalRemaining,
        aylikOdenen: monthlyPaymentThisMonth,
        eleKalan: cashLeft,
        birikenNakit: totalNetWorth + accumulatedCashForward,
        activeDebtsList: activeDebtsList
      });
    }

    // Combine into full 36-month timeline (only forward)
    const fullProjection = [...forwardProjection];
    setDebtProjection(fullProjection);
    setTimelineOffset(0); // Default showing index 0 (Current Month)
    setDebtMaxMonths(debtFreeMonthIndex !== -1 ? debtFreeMonthIndex : 0);

    // Insights Generation
    const totalOutflows = monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment;
    const isDeficit = monthlyIncome < totalOutflows;

    if (isDeficit) {
      insights.push({ type: 'danger', title: 'Kritik Bütçe Açığı!', desc: `Aylık geliriniz (₺${monthlyIncome.toLocaleString('tr-TR')}), toplam gider ve borç ödemelerinizi (₺${totalOutflows.toLocaleString('tr-TR')}) karşılamıyor. Her ay ₺${(totalOutflows - monthlyIncome).toLocaleString('tr-TR')} içeri giriyorsunuz.` });
    } else {
      insights.push({ type: 'success', title: 'Nakit Akışı Pozitif', desc: `Tüm borçlar ve giderler düşüldükten sonra her ay elinize ₺${Math.max(0, monthlyIncome - totalOutflows).toLocaleString('tr-TR')} kalıyor.` });
    }

    if (debtFreeMonthIndex !== -1) {
      const finishDate = new Date(currentYear, currentMonth + debtFreeMonthIndex, 1);
      insights.push({ type: 'info', title: 'Borç Bitiş Tarihi', desc: `Mevcut ödeme planına sadık kalırsanız, tüm düzenli borçlarınız ${finishDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} tarihinde tamamen sıfırlanacak (${debtFreeMonthIndex} ay sonra).` });
    }

    if (monthlySubscriptions > monthlyIncome * 0.1) {
      insights.push({ type: 'warning', title: 'Abonelik Yükü Yüksek', desc: `Aboneliklere aylık ₺${monthlySubscriptions.toLocaleString('tr-TR')} ödüyorsunuz. Bu gelirinizin %${((monthlySubscriptions/monthlyIncome)*100).toFixed(1)}'i demek. Kullanmadıklarınızı iptal etmeyi düşünün.` });
    }

    // Kategorik analiz
    if (activeDebts.length > 0) {
      const cats: Record<string, number> = {};
      activeDebts.forEach(d => {
        cats[d.category] = (cats[d.category] || 0) + d.remainingAmount;
      });
      const topCat = Object.entries(cats).sort((a,b) => b[1] - a[1])[0];
      if (topCat) {
        insights.push({ type: 'info', title: 'Borçların Dağılımı', desc: `Borçlarınızın en büyük kısmı "${topCat[0]}" kategorisinde (₺${topCat[1].toLocaleString('tr-TR')}).` });
      }
    }

    setDebtInsights(insights);
  }, [activeEngine, activeDebts, monthlyIncome, monthlyExpense, monthlySubscriptions, baseMonthlyDebtPayment, totalNetWorth, totalRemainingDebt]);


  // --- ENGINE 2: FREEDOM (Özgürlük) ---
  const [freedomSettings, setFreedomSettings] = useState({ returnRate: 10, inflationRate: 4, withdrawalRate: 4 });
  const [freedomProjection, setFreedomProjection] = useState<any[]>([]);
  const [freedomInsights, setFreedomInsights] = useState<any[]>([]);

  useEffect(() => {
    if (activeEngine !== 'freedom') return;
    
    // Basit bir fire hesaplaması
    const realReturnRate = (1 + freedomSettings.returnRate / 100) / (1 + freedomSettings.inflationRate / 100) - 1;
    const monthlyRealReturn = Math.pow(1 + realReturnRate, 1 / 12) - 1;
    
    const monthlySavings = monthlyIncome - (monthlyExpense + monthlySubscriptions);
    const annualLivingCost = (monthlyExpense + monthlySubscriptions) * 12;
    const fireNumber = annualLivingCost / (freedomSettings.withdrawalRate / 100);

    let currentWorth = totalNetWorth - totalRemainingDebt;
    let months = 0;
    const projection = [];
    const currentYear = new Date().getFullYear();

    if (monthlySavings <= 0 && currentWorth < fireNumber) {
      setFreedomInsights([{ type: 'danger', title: 'Tasarruf Edemiyorsunuz', desc: 'Aylık giderleriniz gelirinizden fazla veya eşit. Özgürlük simülasyonu için artı bütçe veya büyük bir başlangıç sermayesi gerekir.' }]);
      setFreedomProjection([]);
      return;
    }

    while (currentWorth < fireNumber && months < 600) { // max 50 years
      if (months % 12 === 0) {
        projection.push({
          year: currentYear + (months / 12),
          varlik: Math.max(0, Math.round(currentWorth)),
          hedef: Math.round(fireNumber)
        });
      }
      currentWorth = currentWorth * (1 + monthlyRealReturn) + monthlySavings;
      months++;
    }
    
    projection.push({
      year: currentYear + (months / 12),
      varlik: Math.max(0, Math.round(currentWorth)),
      hedef: Math.round(fireNumber)
    });

    setFreedomProjection(projection);
    setFreedomInsights([
      { type: 'info', title: 'Özgürlük Hedefi', desc: `Aylık yaşam maliyetinizi karşılayacak pasif gelir için ulaşmanız gereken portföy büyüklüğü: ₺${fireNumber.toLocaleString('tr-TR', {maximumFractionDigits:0})}` },
      { type: 'success', title: 'Ulaşım Süresi', desc: `Mevcut ₺${monthlySavings.toLocaleString('tr-TR')} aylık tasarruf ve enflasyondan arındırılmış %${(realReturnRate*100).toFixed(1)} reel getiri ile hedefinize ${(months/12).toFixed(1)} yılda ulaşacaksınız.` }
    ]);
  }, [activeEngine, freedomSettings, monthlyIncome, monthlyExpense, monthlySubscriptions, totalNetWorth, totalRemainingDebt]);


  // --- ENGINE 3: ANALYSIS (Genel Analiz) ---
  const [analysisInsights, setAnalysisInsights] = useState<any[]>([]);
  useEffect(() => {
    if (activeEngine !== 'analysis') return;
    
    const insights = [];
    const totalOut = monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment;
    const savingRate = monthlyIncome > 0 ? ((monthlyIncome - totalOut) / monthlyIncome) * 100 : 0;

    insights.push({
      category: 'Tasarruf Oranı',
      value: `%${savingRate.toFixed(1)}`,
      status: savingRate > 20 ? 'excellent' : savingRate > 0 ? 'good' : 'poor',
      desc: savingRate > 20 ? 'Harika bir tasarruf oranınız var. Zenginlik inşası ve finansal özgürlük (FIRE) için ideal seviyede.' : savingRate > 0 ? 'Pozitif tasarruf yapıyorsunuz, ancak bu oranı en azından %20 seviyelerine çıkarmayı hedefleyin.' : 'Kazandığınızdan fazlasını veya tamamını harcıyorsunuz. Acilen bütçe optimizasyonu yapmalısınız.'
    });

    const debtToIncome = monthlyIncome > 0 ? (baseMonthlyDebtPayment / monthlyIncome) * 100 : 0;
    insights.push({
      category: 'Borç / Gelir Oranı',
      value: `%${debtToIncome.toFixed(1)}`,
      status: debtToIncome < 20 ? 'excellent' : debtToIncome < 40 ? 'good' : 'poor',
      desc: debtToIncome < 20 ? 'Borç yükünüz oldukça hafif, finansal esnekliğiniz ve acil durumlara karşı koruma gücünüz yüksek.' : debtToIncome < 40 ? 'Kabul edilebilir bir borç yükü ancak yeni borç almadan önce mevcutları eritmeye çalışmalısınız.' : 'Yüksek Risk! Gelirinizin büyük kısmı doğrudan borca gidiyor. Borç yapılandırması veya acil ödeme takvimi şart.'
    });

    const subToIncome = monthlyIncome > 0 ? (monthlySubscriptions / monthlyIncome) * 100 : 0;
    insights.push({
      category: 'Abonelik Yükü',
      value: `%${subToIncome.toFixed(1)}`,
      status: subToIncome < 5 ? 'excellent' : subToIncome < 10 ? 'good' : 'poor',
      desc: subToIncome < 5 ? 'Abonelik giderleriniz bütçenizi yormuyor, sinsi sızıntılar kontrol altında.' : subToIncome < 10 ? 'Abonelikleriniz kabul edilebilir düzeyde, ancak periyodik olarak kullanmadıklarınızı temizleyebilirsiniz.' : 'Sinsi Harcama! Abonelikler bütçenizde delikler açıyor. Kullanmadıklarınızı derhal iptal edin.'
    });

    // 4. Emergency Buffer (Acil Durum Rezerv Rasyosu)
    const currentSavingsOnly = savings.reduce((sum, s) => sum + s.currentAmount, 0) || totalNetWorth;
    const emergencyBufferMonths = totalOut > 0 ? currentSavingsOnly / totalOut : 0;
    insights.push({
      category: 'Acil Durum Tamponu',
      value: `${emergencyBufferMonths.toFixed(1)} Ay`,
      status: emergencyBufferMonths >= 6 ? 'excellent' : emergencyBufferMonths >= 3 ? 'good' : 'poor',
      desc: emergencyBufferMonths >= 6 ? 'Mükemmel! Beklenmedik durumlara karşı tam korumadasınız. 6 aydan fazla süreli koruma kalkanınız var.' : emergencyBufferMonths >= 3 ? 'Kabul edilebilir bir güvenlik koridorunuz mevcut, ancak hedefiniz bunu en az 6 aya taşımak olmalı.' : 'Kritik Durum! Rezerviniz 3 ayın altında. Gelir kaybı veya büyük masraflara karşı çok hassas durumdasınız.'
    });

    // 5. Investment Efficiency Index (Yatırım Etkinlik Rasyosu)
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentAmount, 0);
    const totalWealth = currentSavingsOnly + totalInvestments;
    const investRatio = totalWealth > 0 ? (totalInvestments / totalWealth) * 100 : 0;
    insights.push({
      category: 'Yatırım Dağılım Etkinliği',
      value: `%${investRatio.toFixed(1)}`,
      status: investRatio >= 40 ? 'excellent' : investRatio >= 15 ? 'good' : 'poor',
      desc: investRatio >= 40 ? 'Harika! Paranız enflasyona karşı aktif yatırımlarda değerlendiriliyor ve değer kazanıyor.' : investRatio >= 15 ? 'Birikimleriniz var ancak nakitte veya vadeli mevduatta atıl bekleyen birikimleri de değerlendirebilirsiniz.' : 'Enflasyon Tehdidi! Paranız değer kaybediyor olabilir. Adım adım getiri potansiyeli yüksek fonlara yönelin.'
    });

    // 6. Overall Financial Health Score (Bütünsel Finansal Sağlık Skoru)
    let healthScore = 100;
    if (savingRate < 0) healthScore -= 30;
    else if (savingRate < 10) healthScore -= 15;
    else if (savingRate < 20) healthScore -= 5;

    if (debtToIncome > 40) healthScore -= 25;
    else if (debtToIncome > 20) healthScore -= 10;

    if (subToIncome > 10) healthScore -= 10;
    else if (subToIncome > 5) healthScore -= 5;

    if (emergencyBufferMonths < 3) healthScore -= 20;
    else if (emergencyBufferMonths < 6) healthScore -= 5;

    if (investRatio < 15) healthScore -= 15;
    else if (investRatio < 40) healthScore -= 5;

    const finalHealthScore = Math.max(10, healthScore);
    insights.push({
      category: 'Bütünsel Sağlık Skoru',
      value: `${finalHealthScore}/100`,
      status: finalHealthScore >= 80 ? 'excellent' : finalHealthScore >= 50 ? 'good' : 'poor',
      desc: finalHealthScore >= 80 ? 'Tebrikler! Finansal kararlarınız son derece rasyonel, disiplinli ve uzun vadeli büyümeyi hedefliyor.' : finalHealthScore >= 50 ? 'Finansal durumunuz ortalama ancak optimize edilmesi ve sıkılaştırılması gereken zayıf noktalarınız var.' : 'Acil Müdahale Şart! Bütçeniz çok kırılgan durumda. Derhal harcamaları kısıp borçları azaltmalısınız.'
    });

    setAnalysisInsights(insights);
  }, [activeEngine, monthlyIncome, monthlyExpense, monthlySubscriptions, baseMonthlyDebtPayment, savings, investments, totalNetWorth]);

  // --- DYNAMIC CALCULATIONS FOR REPORTS ---
  // 1. Debt Strategy Calculations
  const standardDebtMonths = useMemo(() => {
    let currentDebts = activeDebts.map(d => ({ ...d, currentRemaining: d.remainingAmount }));
    let months = 0;
    while (currentDebts.some(d => d.currentRemaining > 0) && months < 120) {
      currentDebts.forEach(d => {
        if (d.currentRemaining > 0) {
          const payment = calculateMonthly(d.paymentAmount, d.paymentFrequency);
          d.currentRemaining -= Math.min(payment, d.currentRemaining);
        }
      });
      months++;
    }
    return months;
  }, [activeDebts]);

  const acceleratedDebtMonths = useMemo(() => {
    let currentDebts = activeDebts.map(d => ({ ...d, currentRemaining: d.remainingAmount }));
    let months = 0;
    while (currentDebts.some(d => d.currentRemaining > 0) && months < 120) {
      let pool = baseMonthlyDebtPayment + extraPayment;
      // First pay regular minimums
      currentDebts.forEach(d => {
        if (d.currentRemaining > 0) {
          const payment = calculateMonthly(d.paymentAmount, d.paymentFrequency);
          const actual = Math.min(payment, d.currentRemaining);
          d.currentRemaining -= actual;
          pool -= actual;
        }
      });
      // Sort smallest first for Snowball
      currentDebts.sort((a, b) => a.currentRemaining - b.currentRemaining);
      for (let d of currentDebts) {
        if (pool <= 0) break;
        if (d.currentRemaining > 0) {
          const extra = Math.min(pool, d.currentRemaining);
          d.currentRemaining -= extra;
          pool -= extra;
        }
      }
      months++;
    }
    return months;
  }, [activeDebts, baseMonthlyDebtPayment, extraPayment]);

  const avalancheDebtMonths = useMemo(() => {
    let currentDebts = activeDebts.map(d => ({ 
      ...d, 
      currentRemaining: d.remainingAmount,
      interestRate: d.interestRate || (d.category === 'Kredi Kartı' ? 4.5 : d.category === 'Konut Kredisi' ? 2.5 : d.category === 'İhtiyaç Kredisi' ? 3.8 : 3.0)
    }));
    let months = 0;
    while (currentDebts.some(d => d.currentRemaining > 0) && months < 120) {
      let pool = baseMonthlyDebtPayment + extraPayment;
      // First pay regular minimums
      currentDebts.forEach(d => {
        if (d.currentRemaining > 0) {
          const payment = calculateMonthly(d.paymentAmount, d.paymentFrequency);
          const actual = Math.min(payment, d.currentRemaining);
          d.currentRemaining -= actual;
          pool -= actual;
        }
      });
      // Sort highest interest first for Avalanche
      currentDebts.sort((a, b) => b.interestRate - a.interestRate);
      for (let d of currentDebts) {
        if (pool <= 0) break;
        if (d.currentRemaining > 0) {
          const extra = Math.min(pool, d.currentRemaining);
          d.currentRemaining -= extra;
          pool -= extra;
        }
      }
      months++;
    }
    return months;
  }, [activeDebts, baseMonthlyDebtPayment, extraPayment]);

  const debtTimeSaved = Math.max(0, standardDebtMonths - (debtPayoffStrategy === 'snowball' ? acceleratedDebtMonths : avalancheDebtMonths));
  const estimatedInterestSavings = useMemo(() => {
    return debtTimeSaved * (baseMonthlyDebtPayment * 0.18);
  }, [debtTimeSaved, baseMonthlyDebtPayment]);

  // 2. FIRE Plan calculations
  const fireMultiplier = useMemo(() => {
    if (fireLifestyle === 'lean') return 0.75;
    if (fireLifestyle === 'fat') return 1.5;
    return 1.0;
  }, [fireLifestyle]);

  const adjustedMonthlyLivingCost = useMemo(() => {
    return (monthlyExpense + monthlySubscriptions) * fireMultiplier;
  }, [monthlyExpense, monthlySubscriptions, fireMultiplier]);

  const fireTargetAmount = useMemo(() => {
    return (adjustedMonthlyLivingCost * 12) / (freedomSettings.withdrawalRate / 100);
  }, [adjustedMonthlyLivingCost, freedomSettings.withdrawalRate]);

  const currentNetAsset = useMemo(() => {
    return totalNetWorth - totalRemainingDebt;
  }, [totalNetWorth, totalRemainingDebt]);

  const monthlySavings = useMemo(() => {
    return Math.max(0, monthlyIncome - (monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment));
  }, [monthlyIncome, monthlyExpense, monthlySubscriptions, baseMonthlyDebtPayment]);

  const fireYearsToTarget = useMemo(() => {
    if (monthlySavings <= 0 && currentNetAsset < fireTargetAmount) return Infinity;
    const realReturnRate = (1 + freedomSettings.returnRate / 100) / (1 + freedomSettings.inflationRate / 100) - 1;
    const monthlyRealReturn = Math.pow(1 + realReturnRate, 1 / 12) - 1;

    let tempWorth = currentNetAsset;
    let m = 0;
    while (tempWorth < fireTargetAmount && m < 600) {
      tempWorth = tempWorth * (1 + monthlyRealReturn) + monthlySavings;
      m++;
    }
    return m / 12;
  }, [monthlySavings, currentNetAsset, fireTargetAmount, freedomSettings]);

  const optimizedFireYearsToTarget = useMemo(() => {
    const optSavings = monthlySavings + (adjustedMonthlyLivingCost * expenseCutPercent / 100);
    const optTarget = fireTargetAmount * (1 - expenseCutPercent / 100);
    if (optSavings <= 0 && currentNetAsset < optTarget) return Infinity;
    const realReturnRate = (1 + freedomSettings.returnRate / 100) / (1 + freedomSettings.inflationRate / 100) - 1;
    const monthlyRealReturn = Math.pow(1 + realReturnRate, 1 / 12) - 1;

    let tempWorth = currentNetAsset;
    let m = 0;
    while (tempWorth < optTarget && m < 600) {
      tempWorth = tempWorth * (1 + monthlyRealReturn) + optSavings;
      m++;
    }
    return m / 12;
  }, [monthlySavings, adjustedMonthlyLivingCost, expenseCutPercent, fireTargetAmount, currentNetAsset, freedomSettings]);

  // 3. Stress Test Calculations
  const currentSavingsOnly = useMemo(() => {
    return savings.reduce((sum, s) => sum + s.currentAmount, 0) || totalNetWorth;
  }, [savings, totalNetWorth]);

  const stressScenarioOutflow = useMemo(() => {
    let baseOut = monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment;
    if (simInflationShock) {
      baseOut = (monthlyExpense + monthlySubscriptions) * 1.3 + baseMonthlyDebtPayment;
    }
    return baseOut;
  }, [monthlyExpense, monthlySubscriptions, baseMonthlyDebtPayment, simInflationShock]);

  const stressScenarioIncome = useMemo(() => {
    return simIncomeLoss ? monthlyIncome * 0.5 : monthlyIncome;
  }, [monthlyIncome, simIncomeLoss]);

  const stressMonthlyNetDeficit = useMemo(() => {
    return Math.max(0, stressScenarioOutflow - stressScenarioIncome);
  }, [stressScenarioOutflow, stressScenarioIncome]);

  const stressEmergencyFundStarting = useMemo(() => {
    return Math.max(0, currentSavingsOnly - simEmergencyExpense);
  }, [currentSavingsOnly, simEmergencyExpense]);

  const stressSurvivalMonths = useMemo(() => {
    if (stressMonthlyNetDeficit <= 0) return 999;
    return stressEmergencyFundStarting / stressMonthlyNetDeficit;
  }, [stressEmergencyFundStarting, stressMonthlyNetDeficit]);

  const stressResilienceScore = useMemo(() => {
    if (stressSurvivalMonths >= 24) return { grade: 'S+', title: 'Finansal Kale', desc: 'Süper güçlü rezervler! Kriz durumlarında 2 yıldan fazla tam koruma altındasınız.', color: 'text-focus-neon border-focus-neon bg-focus-neon/5' };
    if (stressSurvivalMonths >= 12) return { grade: 'S', title: 'Mükemmel Dayanıklılık', desc: 'Harika bir acil durum fonunuz var. 1 yıl boyunca tüm sarsıntılara göğüs gerebilirsiniz.', color: 'text-focus-neon border-focus-neon bg-focus-neon/5' };
    if (stressSurvivalMonths >= 6) return { grade: 'A', title: 'Güçlü Kalkan', desc: 'Bütçeniz sağlam. 6 ay boyunca zorlukları rahatlıkla aşacak rezerviniz mevcut.', color: 'text-ai-bright border-ai-bright bg-ai-bright/5' };
    if (stressSurvivalMonths >= 3) return { grade: 'B', title: 'Yeterli Düzey', desc: 'Standart 3 aylık güvenlik duvarınız devrede. Sürdürülebilir fakat geliştirilebilir.', color: 'text-nrg-sun border-nrg-sun bg-nrg-sun/5' };
    if (stressSurvivalMonths >= 1) return { grade: 'C', title: 'Hassas Seviye', desc: 'Güvenlik sınırındasınız. Acilen harcamaları kısıp acil durum fonunu büyütün.', color: 'text-orange-400 border-orange-400 bg-orange-400/5' };
    return { grade: 'F', title: 'Yüksek Risk', desc: 'Rezervleriniz tükenme noktasında! En ufak sarsıntı bütçe krizine yol açabilir.', color: 'text-crit-vivid border-crit-vivid bg-crit-vivid/5' };
  }, [stressSurvivalMonths]);

  // --- REPORLAR DETAYLI GRAFIK VE VERI HESAPLAMALARI ---
  const debtCompareProjection = useMemo(() => {
    if (activeDebts.length === 0) return [];
    const list = [];
    const maxMonths = Math.max(standardDebtMonths, acceleratedDebtMonths, 1);
    
    let currentDebtsStandard = activeDebts.map(d => ({ ...d, currentRemaining: d.remainingAmount }));
    let currentDebtsAccelerated = activeDebts.map(d => ({ ...d, currentRemaining: d.remainingAmount }));
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    for (let m = 0; m <= maxMonths; m++) {
      const date = new Date(currentYear, currentMonth + m, 1);
      const dateLabel = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      
      let standardRemaining = currentDebtsStandard.reduce((sum, d) => sum + d.currentRemaining, 0);
      let acceleratedRemaining = currentDebtsAccelerated.reduce((sum, d) => sum + d.currentRemaining, 0);

      list.push({
        monthName: dateLabel,
        "Standart Plan": Math.round(standardRemaining),
        "Kartopu Planı": Math.round(acceleratedRemaining),
      });

      // Advance Standard
      currentDebtsStandard.forEach(d => {
        if (d.currentRemaining > 0) {
          const payment = calculateMonthly(d.paymentAmount, d.paymentFrequency);
          d.currentRemaining -= Math.min(payment, d.currentRemaining);
        }
      });

      // Advance Accelerated
      let pool = baseMonthlyDebtPayment + extraPayment;
      currentDebtsAccelerated.forEach(d => {
        if (d.currentRemaining > 0) {
          const payment = calculateMonthly(d.paymentAmount, d.paymentFrequency);
          const actual = Math.min(payment, d.currentRemaining);
          d.currentRemaining -= actual;
          pool -= actual;
        }
      });
      
      currentDebtsAccelerated.sort((a, b) => a.currentRemaining - b.currentRemaining);
      for (let d of currentDebtsAccelerated) {
        if (pool <= 0) break;
        if (d.currentRemaining > 0) {
          const extra = Math.min(pool, d.currentRemaining);
          d.currentRemaining -= extra;
          pool -= extra;
        }
      }
    }
    return list;
  }, [activeDebts, standardDebtMonths, acceleratedDebtMonths, baseMonthlyDebtPayment, extraPayment]);

  const snowballPayoffSequence = useMemo(() => {
    if (activeDebts.length === 0) return [];
    let currentDebts = activeDebts.map(d => ({ ...d, currentRemaining: d.remainingAmount, payoffMonth: 0 }));
    let months = 0;
    while (currentDebts.some(d => d.currentRemaining > 0) && months < 120) {
      let pool = baseMonthlyDebtPayment + extraPayment;
      
      currentDebts.forEach(d => {
        if (d.currentRemaining > 0) {
          const payment = calculateMonthly(d.paymentAmount, d.paymentFrequency);
          const actual = Math.min(payment, d.currentRemaining);
          d.currentRemaining -= actual;
          pool -= actual;
          if (d.currentRemaining === 0 && d.payoffMonth === 0) {
            d.payoffMonth = months + 1;
          }
        }
      });

      currentDebts.sort((a, b) => a.currentRemaining - b.currentRemaining);
      for (let d of currentDebts) {
        if (pool <= 0) break;
        if (d.currentRemaining > 0) {
          const extra = Math.min(pool, d.currentRemaining);
          d.currentRemaining -= extra;
          pool -= extra;
          if (d.currentRemaining === 0 && d.payoffMonth === 0) {
            d.payoffMonth = months + 1;
          }
        }
      }
      months++;
    }
    return currentDebts.map(d => ({
      title: d.title,
      remainingAmount: d.remainingAmount,
      payoffMonth: d.payoffMonth || months,
    })).sort((a, b) => a.payoffMonth - b.payoffMonth);
  }, [activeDebts, baseMonthlyDebtPayment, extraPayment]);

  const fireCompareProjection = useMemo(() => {
    const list = [];
    const realReturnRate = (1 + freedomSettings.returnRate / 100) / (1 + freedomSettings.inflationRate / 100) - 1;
    const monthlyRealReturn = Math.pow(1 + realReturnRate, 1 / 12) - 1;
    
    let tempWorth = currentNetAsset;
    const currentYear = new Date().getFullYear();
    const maxYears = Math.min(30, Math.ceil(fireYearsToTarget === Infinity ? 25 : fireYearsToTarget + 5));

    for (let y = 0; y <= maxYears; y++) {
      list.push({
        year: currentYear + y,
        age: currentAge + y,
        "Birikim Portföyü": Math.max(0, Math.round(tempWorth)),
        "Özgürlük Hedefi": Math.round(fireTargetAmount)
      });

      for (let m = 0; m < 12; m++) {
        tempWorth = tempWorth * (1 + monthlyRealReturn) + monthlySavings;
      }
    }
    return list;
  }, [currentNetAsset, fireTargetAmount, monthlySavings, freedomSettings, fireYearsToTarget, currentAge]);

  const stressDecayProjection = useMemo(() => {
    const list = [];
    let funds = stressEmergencyFundStarting;
    const months = Math.min(12, stressSurvivalMonths === 999 ? 12 : Math.ceil(stressSurvivalMonths + 2));
    
    for (let m = 0; m <= months; m++) {
      list.push({
        monthName: `${m}. Ay`,
        "Rezerv Miktarı": Math.round(funds)
      });
      funds = Math.max(0, funds - stressMonthlyNetDeficit);
    }
    return list;
  }, [stressEmergencyFundStarting, stressMonthlyNetDeficit, stressSurvivalMonths]);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
            <BrainCircuit className="text-ai-bright" size={32} />
            Yapay Zeka Motorları
          </h1>
          <p className="text-text-secondary">Tüm verilerinizi sentezleyen gelişmiş finansal projeksiyon sistemleri.</p>
        </div>
        
        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 flex-wrap">
          <button onClick={() => setActiveEngine('debt')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeEngine === 'debt' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}>
            <TrendingDown size={16} /> Borç Takip
          </button>
          <button onClick={() => setActiveEngine('freedom')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeEngine === 'freedom' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}>
            <Target size={16} /> Özgürlük
          </button>
          <button onClick={() => setActiveEngine('analysis')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeEngine === 'analysis' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}>
            <Activity size={16} /> Detaylı Analiz
          </button>
          <button onClick={() => setActiveEngine('reports')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeEngine === 'reports' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}>
            <ShieldCheck size={16} className="text-ai-bright" /> Akıllı Raporlar
          </button>
        </div>
      </div>

      {/* --- ENGINE 1: DEBT TRACKING --- */}
      {activeEngine === 'debt' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between col-span-2 md:col-span-1">
               <span className="text-xs font-bold text-text-secondary uppercase">Toplam Borç</span>
               <span className="text-2xl font-mono font-bold text-crit-vivid mt-2">₺{totalRemainingDebt.toLocaleString('tr-TR')}</span>
             </div>
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
               <span className="text-xs font-bold text-text-secondary uppercase">Aylık Ödeme</span>
               <span className="text-xl font-mono font-bold text-orange-400 mt-2">₺{baseMonthlyDebtPayment.toLocaleString('tr-TR')}</span>
             </div>
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
               <span className="text-xs font-bold text-text-secondary uppercase">Aylık Gider+Abo</span>
               <span className="text-xl font-mono font-bold text-orange-400 mt-2">₺{(monthlyExpense + monthlySubscriptions).toLocaleString('tr-TR')}</span>
             </div>
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
               <span className="text-xs font-bold text-text-secondary uppercase">Aylık Gelir</span>
               <span className="text-xl font-mono font-bold text-focus-neon mt-2">₺{monthlyIncome.toLocaleString('tr-TR')}</span>
             </div>
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
               <span className="text-xs font-bold text-text-secondary uppercase">Elde Kalan (Net)</span>
               <span className={`text-xl font-mono font-bold mt-2 ${monthlyIncome - (monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment) >= 0 ? 'text-ai-bright' : 'text-crit-vivid'}`}>
                 ₺{(monthlyIncome - (monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment)).toLocaleString('tr-TR')}
               </span>
             </div>
          </div>

          {/* Interactive Timeline UI */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                     <Clock size={16} className="text-focus-neon animate-pulse" /> İnteraktif Bütçe Zaman Çizelgesi
                   </h3>
                   <p className="text-xs text-text-secondary mt-1">
                     {debtProjection.length > 0 && (
                       <span>Seçili Aralık: <strong className="text-white font-mono">{debtProjection[timelineOffset]?.dateLabel}</strong> ile <strong className="text-white font-mono">{debtProjection[Math.min(timelineOffset + 11, debtProjection.length - 1)]?.dateLabel}</strong> arası</span>
                     )}
                   </p>
                </div>
                
                {/* Instant Jump Controls */}
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 w-full md:w-auto overflow-x-auto">
                  <button 
                    onClick={() => setTimelineOffset(0)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${timelineOffset === 0 ? 'bg-focus-neon/20 text-focus-neon border border-focus-neon/20' : 'text-text-secondary hover:text-white'}`}
                  >
                    ⏺ Bugün (Başlangıç)
                  </button>
                  <button 
                    onClick={() => setTimelineOffset(12)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${timelineOffset === 12 ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                  >
                    ⏭ +12 Ay
                  </button>
                  <button 
                    onClick={() => setTimelineOffset(24)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${timelineOffset === 24 ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                  >
                    ⏭ +24 Ay
                  </button>
                </div>
             </div>

             {debtProjection.length > 0 ? (
                <div className="space-y-6">
                  {/* The Gorgeous Horizontal Slide Track / Slider Line */}
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-text-secondary uppercase">Zaman Akışı Sürgüsü</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTimelineOffset(Math.max(0, timelineOffset - 1))}
                            disabled={timelineOffset === 0}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                            title="1 Ay Geri"
                          >
                            ◀
                          </button>
                          <span className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">
                            Ay +{timelineOffset}
                          </span>
                          <button
                            onClick={() => setTimelineOffset(Math.min(debtProjection.length - 12, timelineOffset + 1))}
                            disabled={timelineOffset + 12 >= debtProjection.length}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                            title="1 Ay İleri"
                          >
                            ▶
                          </button>
                        </div>
                     </div>

                     {/* The Slider Track */}
                     <div className="relative pt-4 pb-2">
                        {/* Underlay glow bar representing active 12-month window */}
                        <div className="absolute top-[22px] left-0 right-0 h-1.5 bg-white/5 rounded-full" />
                        
                        {/* Highlighted portion of the track */}
                        <div 
                           className="absolute top-[22px] h-1.5 bg-gradient-to-r from-ai-bright via-focus-neon to-nrg-sun rounded-full blur-[1px] transition-all duration-300"
                           style={{
                             left: `${(timelineOffset / debtProjection.length) * 100}%`,
                             width: `${(12 / debtProjection.length) * 100}%`
                           }}
                        />

                        {/* Interactive Range Input styled perfectly */}
                        <input 
                           type="range" 
                           min="0" 
                           max={Math.max(0, debtProjection.length - 12)} 
                           step="1"
                           value={timelineOffset} 
                           onChange={(e) => setTimelineOffset(Number(e.target.value))}
                           className="absolute top-4 left-0 w-full h-3 opacity-0 cursor-pointer z-20"
                        />

                        {/* Visual track with tickmarks */}
                        <div className="flex justify-between px-1 text-[10px] text-text-secondary font-bold select-none relative pt-4 pointer-events-none">
                           {debtProjection.map((month, idx) => {
                             // Only render ticks every 3 months or for milestone months
                             const isMilestone = idx === 0 || idx === 12 || idx === 24 || idx === debtProjection.length - 1;
                             const isActive = idx >= timelineOffset && idx < timelineOffset + 12;
                             return (
                               <div key={idx} className="flex flex-col items-center relative">
                                 <div className={`w-1 h-2 rounded-full mb-1 transition-colors duration-300 ${
                                   isActive ? 'bg-focus-neon' : 'bg-white/10'
                                 }`} />
                                 {isMilestone && (
                                   <span className={`absolute top-3 whitespace-nowrap transition-all duration-300 ${
                                     isActive ? 'text-white scale-110 font-bold' : 'text-text-secondary'
                                   }`}>
                                     {idx === 0 ? 'Bugün (Başlangıç)' : 
                                      idx === 12 ? '+12 Ay' : 
                                      idx === 24 ? '+24 Ay' : 'Ufuk'}
                                   </span>
                                 )}
                               </div>
                             );
                           })}
                        </div>
                     </div>
                  </div>

                  {/* Horizontal Scroll Deck with Smooth Snap */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                      {debtProjection.slice(timelineOffset, timelineOffset + 12).map((month, idx) => {
                        const isCurrentMonth = month.monthIndex === 0;
                        return (
                          <motion.div 
                            key={month.monthIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            className={`border rounded-2xl p-4 flex flex-col gap-3 relative transition-all duration-300 ${
                              isCurrentMonth 
                                ? 'bg-gradient-to-b from-focus-neon/10 to-black/40 border-focus-neon/50 shadow-lg shadow-focus-neon/5'
                                : 'bg-black/30 border-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white font-mono">{month.dateLabel}</span>
                                {isCurrentMonth && (
                                  <span className="bg-focus-neon text-black text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase">Şimdi</span>
                                )}
                              </div>
                              {month.toplamKalanBorc === 0 ? (
                                <span className="bg-ai-bright/20 text-ai-bright text-[10px] px-2 py-0.5 rounded-full font-bold">Borçsuz</span>
                              ) : (
                                <span className="bg-crit-vivid/10 text-crit-vivid text-[10px] px-2 py-0.5 rounded-full font-mono">₺{month.toplamKalanBorc.toLocaleString('tr-TR')} Borç</span>
                              )}
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-text-secondary text-xs">Aylık Gelir</span>
                                <span className="font-mono text-focus-neon text-xs">₺{month.aylikGelir.toLocaleString('tr-TR')}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-text-secondary text-xs">Giderler + Abo</span>
                                <span className="font-mono text-orange-400 text-xs">-₺{month.aylikGider.toLocaleString('tr-TR')}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="text-text-secondary text-xs mt-0.5">Borç Ödemesi</span>
                                <div className="text-right">
                                  <span className="font-mono text-crit-vivid text-xs block">
                                    {month.aylikOdenen > 0 ? `-₺${month.aylikOdenen.toLocaleString('tr-TR')}` : '₺0'}
                                  </span>
                                  {month.activeDebtsList.length > 0 && (
                                     <div className="group relative mt-1 cursor-pointer">
                                       <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white hover:bg-white/10 transition-colors">
                                         Detay ({month.activeDebtsList.length})
                                       </span>
                                       <div className="absolute hidden group-hover:block z-50 bg-black/95 border border-white/10 p-2 rounded-lg text-left text-[10px] text-white w-48 right-0 top-full mt-1 shadow-2xl shadow-black/80">
                                         <div className="font-bold border-b border-white/10 pb-1 mb-1 text-[9px] text-text-secondary">Bu Ay Ödenenler:</div>
                                         {month.activeDebtsList.map((d: string, i: number) => <div key={i} className="py-0.5 font-mono text-white">{d}</div>)}
                                       </div>
                                     </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto pt-3 border-t border-white/5 space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-text-secondary">Bu Ay Net Kalan</span>
                                <span className={`font-mono text-xs font-bold ${month.eleKalan >= 0 ? 'text-ai-bright' : 'text-crit-vivid'}`}>
                                  {month.eleKalan > 0 ? '+' : ''}₺{month.eleKalan.toLocaleString('tr-TR')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-white/[0.02] p-1.5 rounded-lg border border-white/5 mt-1">
                                <span className="text-[10px] font-bold text-text-secondary">Kümülatif Varlık</span>
                                <span className="font-mono text-xs font-bold text-focus-neon">₺{month.birikenNakit.toLocaleString('tr-TR')}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
             ) : (
                <div className="py-12 flex flex-col items-center justify-center text-text-secondary text-sm">
                  <CheckCircle2 size={48} className="text-focus-neon mb-4 opacity-50" />
                  <p>Aktif borcunuz bulunmuyor. Harika!</p>
                </div>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-6 min-h-[400px]">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-focus-neon" /> Borç Erime Projeksiyonu
              </h3>
              {debtProjection.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={debtProjection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="dateLabel" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff20', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} />
                      <Bar yAxisId="left" dataKey="aylikOdenen" name="Aylık Ödenen" fill="#ff4b4b" opacity={0.5} maxBarSize={40} />
                      <Line yAxisId="left" type="monotone" dataKey="toplamKalanBorc" name="Kalan Toplam Borç" stroke="#ff4b4b" strokeWidth={3} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="eleKalan" name="Elde Kalan Nakit" stroke="#00E5FF" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary text-sm">
                  <CheckCircle2 size={48} className="text-focus-neon mb-4 opacity-50" />
                  <p>Aktif borcunuz bulunmuyor. Harika!</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden">
               <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 relative z-10">
                <BrainCircuit size={16} className="text-nrg-sun" /> Motor Çıkarımları
              </h3>
              <div className="space-y-4 relative z-10">
                {debtInsights.map((insight, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${
                    insight.type === 'success' ? 'bg-focus-neon/5 border-focus-neon/20' :
                    insight.type === 'danger' ? 'bg-crit-vivid/5 border-crit-vivid/20' :
                    insight.type === 'warning' ? 'bg-nrg-sun/5 border-nrg-sun/20' :
                    'bg-ai-bright/5 border-ai-bright/20'
                  }`}>
                    <h4 className={`text-xs font-bold mb-1 uppercase tracking-wider ${
                      insight.type === 'success' ? 'text-focus-neon' :
                      insight.type === 'danger' ? 'text-crit-vivid' :
                      insight.type === 'warning' ? 'text-nrg-sun' :
                      'text-ai-bright'
                    }`}>{insight.title}</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{insight.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-3xl p-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap size={16} className="text-nrg-sun" /> Yapay Zeka Stratejik Geri Ödeme Danışmanı
                </h3>
                <p className="text-xs text-text-secondary mt-1">Borçlarınızı en verimli şekilde kapatmak için en iyi geri ödeme stratejisini seçin.</p>
              </div>
              <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setDebtPayoffStrategy('snowball')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${debtPayoffStrategy === 'snowball' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                >
                  Kartopu (Küçükten Büyüğe)
                </button>
                <button
                  onClick={() => setDebtPayoffStrategy('avalanche')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${debtPayoffStrategy === 'avalanche' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                >
                  Çığ (Yüksek Faizden Düşüğe)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <h4 className="text-xs font-bold text-white uppercase mb-2">Seçilen Strateji Etkisi</h4>
                <div className="space-y-3 mt-4">
                  <div>
                    <span className="text-[10px] text-text-secondary block">Kapanma Süresi:</span>
                    <span className="text-xl font-mono font-black text-focus-neon">
                      {debtPayoffStrategy === 'snowball' ? acceleratedDebtMonths : avalancheDebtMonths} Ay
                    </span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">Standart Plana göre {debtTimeSaved} ay daha kısa!</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary block">Tahmini Faiz Tasarrufu:</span>
                    <span className="text-lg font-mono font-black text-ai-bright">
                      ₺{Math.round(estimatedInterestSavings).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Activity size={14} className="text-ai-bright" /> Strateji Analizi & Aksiyon Tavsiyeleri
                </h4>
                {debtPayoffStrategy === 'snowball' ? (
                  <div className="text-xs text-text-secondary space-y-3">
                    <p className="leading-relaxed">
                      <strong>Kartopu (Snowball)</strong> yöntemi, borçlarınızı faiz oranından bağımsız olarak en küçük bakiye olandan en yüksek bakiye olana doğru listeler. Ekstra ödeme bütçenizi (<span className="text-white font-mono">₺{extraPayment.toLocaleString('tr-TR')}</span>) her zaman listenin en başındaki en küçük borca yönlendirirsiniz.
                    </p>
                    <p className="leading-relaxed">
                      💡 <strong>Psikolojik Zafer:</strong> En küçük borçları hızla listeden silmek, size finansal başarı hissi kazandırır ve motivasyonunuzu yüksek tutar. Sürekli kapanan hesaplar görmek borç kapama sürecini hızlandırır.
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-text-secondary space-y-3">
                    <p className="leading-relaxed">
                      <strong>Çığ (Avalanche)</strong> yöntemi, borçlarınızı faiz oranı en yüksek olandan en düşük olana doğru listeler. Ekstra ödeme bütçenizi (<span className="text-white font-mono">₺{extraPayment.toLocaleString('tr-TR')}</span>) her zaman en yüksek faiz oranına sahip borca yönlendirirsiniz.
                    </p>
                    <p className="leading-relaxed">
                      💡 <strong>Matematiksel Üstünlük:</strong> Bu strateji matematiksel olarak en verimli yoldur. En yüksek faiz yükü oluşturan borcu kapatarak, bankalara ödeyeceğiniz kümülatif faiz miktarını en aza indirgemiş olursunuz.
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white font-mono">Snowball: {acceleratedDebtMonths} Ay</span>
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white font-mono">Avalanche: {avalancheDebtMonths} Ay</span>
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white font-mono">Fark: {Math.abs(acceleratedDebtMonths - avalancheDebtMonths)} Ay</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- ENGINE 2: FREEDOM --- */}
      {activeEngine === 'freedom' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
               <span className="text-[10px] font-bold text-text-secondary uppercase">Mevcut Net Varlık</span>
               <span className="text-xl font-mono font-bold text-focus-neon mt-2">₺{currentNetAsset.toLocaleString('tr-TR')}</span>
             </div>
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
               <span className="text-[10px] font-bold text-text-secondary uppercase">FIRE Hedef Tutarı</span>
               <span className="text-xl font-mono font-bold text-white mt-2">₺{Math.round(fireTargetAmount).toLocaleString('tr-TR')}</span>
             </div>
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
               <span className="text-[10px] font-bold text-text-secondary uppercase">Yıllık Ek Birikim</span>
               <span className="text-xl font-mono font-bold text-orange-400 mt-2">₺{(monthlySavings * 12).toLocaleString('tr-TR')}</span>
             </div>
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
               <span className="text-[10px] font-bold text-text-secondary uppercase">Özgürlük Kapsama %</span>
               <span className="text-xl font-mono font-bold text-ai-bright mt-2">
                 %{fireTargetAmount > 0 ? Math.min(100, (currentNetAsset / fireTargetAmount * 100)).toFixed(1) : '0.0'}
               </span>
             </div>
             <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between col-span-2 md:col-span-1">
               <span className="text-[10px] font-bold text-text-secondary uppercase">Hedefe Kalan Süre</span>
               <span className="text-xl font-mono font-bold text-nrg-sun mt-2">
                 {fireYearsToTarget === Infinity ? 'Hesaplanamıyor' : `${fireYearsToTarget.toFixed(1)} Yıl`}
               </span>
             </div>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-3xl p-6 mb-6">
             <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider flex items-center gap-2">
                <Target size={16} /> Motor Parametreleri
              </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                    <span>Beklenen Yıllık Getiri (Nominal)</span>
                    <span className="text-white">%{freedomSettings.returnRate}</span>
                  </label>
                  <input type="range" min="1" max="25" step="0.5" value={freedomSettings.returnRate} onChange={(e) => setFreedomSettings({...freedomSettings, returnRate: Number(e.target.value)})} className="w-full accent-ai-bright h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                    <span>Enflasyon Beklentisi</span>
                    <span className="text-white">%{freedomSettings.inflationRate}</span>
                  </label>
                  <input type="range" min="1" max="15" step="0.5" value={freedomSettings.inflationRate} onChange={(e) => setFreedomSettings({...freedomSettings, inflationRate: Number(e.target.value)})} className="w-full accent-nrg-sun h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                    <span>Güvenli Çekim Oranı (4% Kuralı)</span>
                    <span className="text-white">%{freedomSettings.withdrawalRate}</span>
                  </label>
                  <input type="range" min="2" max="8" step="0.5" value={freedomSettings.withdrawalRate} onChange={(e) => setFreedomSettings({...freedomSettings, withdrawalRate: Number(e.target.value)})} className="w-full accent-focus-neon h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-6 min-h-[400px]">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={16} className="text-focus-neon" /> Varlık Büyüme Projeksiyonu
              </h3>
              {freedomProjection.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={freedomProjection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVarlik" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="year" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${(v/1000000).toFixed(1)}M`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff20', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} />
                      <ReferenceLine y={freedomProjection[0]?.hedef} stroke="#ff4b4b" strokeDasharray="3 3" label={{ position: 'top', value: 'Hedef Portföy', fill: '#ff4b4b', fontSize: 10 }} />
                      <Area type="monotone" dataKey="varlik" name="Net Varlık" stroke="#00E5FF" strokeWidth={3} fill="url(#colorVarlik)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary text-sm text-center px-8">
                  <AlertTriangle size={48} className="text-crit-vivid mb-4 opacity-50" />
                  <p>Şu anki tasarruf oranınızla finansal özgürlük projeksiyonu yapılamıyor. Giderleriniz gelirinize eşit veya fazla. Tasarrufunuzu artırmanız gerekiyor.</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden">
               <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 relative z-10">
                <BrainCircuit size={16} className="text-ai-bright" /> Özgürlük Analizi
              </h3>
              <div className="space-y-4 relative z-10">
                {freedomInsights.map((insight, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${
                    insight.type === 'success' ? 'bg-focus-neon/5 border-focus-neon/20' :
                    insight.type === 'danger' ? 'bg-crit-vivid/5 border-crit-vivid/20' :
                    'bg-ai-bright/5 border-ai-bright/20'
                  }`}>
                    <h4 className={`text-xs font-bold mb-1 uppercase tracking-wider ${
                      insight.type === 'success' ? 'text-focus-neon' :
                      insight.type === 'danger' ? 'text-crit-vivid' :
                      'text-ai-bright'
                    }`}>{insight.title}</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{insight.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-3xl p-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-focus-neon" /> Yapay Zeka Portföy Dağılımı & Varlık Yönetimi
                </h3>
                <p className="text-xs text-text-secondary mt-1">Özgürlük portföyünüzün risk toleransınıza göre ideal varlık dağılımı ve stratejisi.</p>
              </div>
              <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setRiskTolerance('conservative')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${riskTolerance === 'conservative' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                >
                  Muhafazakar
                </button>
                <button
                  onClick={() => setRiskTolerance('moderate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${riskTolerance === 'moderate' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                >
                  Dengeli
                </button>
                <button
                  onClick={() => setRiskTolerance('aggressive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${riskTolerance === 'aggressive' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                >
                  Agresif
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase mb-4">Önerilen Portföy Dağılımı</h4>
                  <div className="space-y-3">
                    {riskTolerance === 'conservative' && (
                      <>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Altın & Değerli Metaller</span>
                            <span className="text-white font-mono">%40</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-nrg-sun rounded-full" style={{ width: '40%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Mevduat / Hazine Tahvili</span>
                            <span className="text-white font-mono">%40</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-focus-neon rounded-full" style={{ width: '40%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Hisse Senedi / Fonlar</span>
                            <span className="text-white font-mono">%20</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-ai-bright rounded-full" style={{ width: '20%' }} />
                          </div>
                        </div>
                      </>
                    )}
                    {riskTolerance === 'moderate' && (
                      <>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Altın & Eurobond</span>
                            <span className="text-white font-mono">%20</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-nrg-sun rounded-full" style={{ width: '20%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Dengeli Fonlar / Tahvil</span>
                            <span className="text-white font-mono">%30</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-focus-neon rounded-full" style={{ width: '30%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Hisse Senedi Fonları</span>
                            <span className="text-white font-mono">%45</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-ai-bright rounded-full" style={{ width: '45%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Alternatif (Kripto vb.)</span>
                            <span className="text-white font-mono">%5</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: '5%' }} />
                          </div>
                        </div>
                      </>
                    )}
                    {riskTolerance === 'aggressive' && (
                      <>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Değerli Metaller & Eurobond</span>
                            <span className="text-white font-mono">%10</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-nrg-sun rounded-full" style={{ width: '10%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Yüksek Getirili Borçlanma Araçları</span>
                            <span className="text-white font-mono">%10</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-focus-neon rounded-full" style={{ width: '10%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Hisse Senedi / Yabancı Hisse Fonları</span>
                            <span className="text-white font-mono">%65</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-ai-bright rounded-full" style={{ width: '65%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>Alternatif & Kripto Varlıklar</span>
                            <span className="text-white font-mono">%15</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Activity size={14} className="text-ai-bright" /> Varlık Yönetim Stratejisi & AI Yorumu
                </h4>
                {riskTolerance === 'conservative' && (
                  <div className="text-xs text-text-secondary space-y-3 leading-relaxed">
                    <p>
                      🛡️ <strong>Sermaye Koruma Odaklı Yaklaşım:</strong> Bu portföy, yüksek enflasyon ve piyasa dalgalanmalarına karşı ana paranızı korumayı amaçlar. Risk minimumda tutulur.
                    </p>
                    <p>
                      📈 <strong>Nasıl Uygulanır?</strong> Aylık birikiminizin (<span className="text-white font-mono">₺{monthlySavings.toLocaleString('tr-TR')}</span>) yaklaşık %40'ını altın ve gümüş gibi güvenli liman emtialarına, %40'ını hazine tahvilleri veya yüksek korumalı para piyasası fonlarına yatırın. Kalan %20 ile temettü verimi yüksek, hisse senedi fonlarına kademeli giriş yapın.
                    </p>
                  </div>
                )}
                {riskTolerance === 'moderate' && (
                  <div className="text-xs text-text-secondary space-y-3 leading-relaxed">
                    <p>
                      ⚖️ <strong>Dengeli Büyüme Yaklaşımı:</strong> Orta vadede istikrarlı bir sermaye artışı hedeflenirken, ani piyasa düşüşlerinden korunmak için tahvil ve Eurobond gibi koruyucu kalkanlar barındırır.
                    </p>
                    <p>
                      📈 <strong>Nasıl Uygulanır?</strong> Aylık birikiminizin %45'ini yerli ve yabancı endeks hisse senedi fonlarına düzenli (DCA) olarak yatırın. %30'unu Eurobond ve korumalı değişken fonlarda tutarak dolar bazlı getiri ve kupon ödemesi sağlayın. %20 altın ile enflasyon koruması yaparken, %5'lik bir kısmı Bitcoin veya teknoloji ağırlıklı büyüme hisseleri ile destekleyebilirsiniz.
                    </p>
                  </div>
                )}
                {riskTolerance === 'aggressive' && (
                  <div className="text-xs text-text-secondary space-y-3 leading-relaxed">
                    <p>
                      🚀 <strong>Maksimum Bileşik Getiri Odaklı Yaklaşım:</strong> Genç yaş grupları veya uzun vadeli yatırım ufkuna sahip bireyler için idealdir. Dalgalanmaları göz ardı ederek servet büyümesini maksimum hıza ulaştırmayı hedefler.
                    </p>
                    <p>
                      📈 <strong>Nasıl Uygulanır?</strong> Aylık birikiminizin %65'ini doğrudan büyüme odaklı teknoloji hisse senetleri fonlarına, yabancı hisse senedi fonlarına ve yerli endeks fonlarına (BIST 100/30) dağıtın. %15'lik payı yüksek getiri potansiyeline sahip kripto varlıklar veya girişim sermayesi fonlarında değerlendirin. Kalan %20'yi ise likit rezerv ve Eurobond ile acil alım fırsatları için yedek akçe olarak kullanın.
                    </p>
                  </div>
                )}
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-text-secondary">
                  <strong>Not:</strong> Aylık <span className="text-focus-neon font-bold">₺{monthlySavings.toLocaleString('tr-TR')}</span> birikim miktarınız bu strateji ile değerlendirildiğinde, bileşik getiri gücü sayesinde hedefinize ulaşma sürenizi hızlandıracaktır.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- ENGINE 3: ANALYSIS --- */}
      {activeEngine === 'analysis' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisInsights.map((item, idx) => (
              <div key={idx} className="bg-black/20 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  item.status === 'excellent' ? 'bg-focus-neon' :
                  item.status === 'good' ? 'bg-nrg-sun' : 'bg-crit-vivid'
                }`} />
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">{item.category}</h3>
                  <p className={`text-3xl font-mono font-black mb-4 ${
                    item.status === 'excellent' ? 'text-focus-neon' :
                    item.status === 'good' ? 'text-nrg-sun' : 'text-crit-vivid'
                  }`}>{item.value}</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mt-2">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Crosshair className="text-ai-bright animate-pulse" /> Yapay Zeka Derin Analiz & Aksiyon Yol Haritası
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Tüm finansal rasyolarınız, harcama alışkanlıklarınız ve acil durum tamponunuz derin yapay zeka analiz motorumuz tarafından sentezlendi. İşte mali durumunuzu güçlendirmek için atmanız gereken somut adımlar:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-focus-neon/20 text-focus-neon flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-bold text-white text-sm">Borç & Kredi Kaldıraç Yönetimi</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Borç ödeme hızınızı artırmak için her ay ekstra en az <strong className="text-white">₺{extraPayment.toLocaleString('tr-TR')}</strong> ödemeyi alışkanlık haline getirin. Bu sayede borçlarınız standart plandan çok daha erken biter ve kümülatif faiz yükünden ciddi oranda tasarruf edersiniz.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-nrg-sun/20 text-nrg-sun flex items-center justify-center font-bold text-sm">2</div>
                <h4 className="font-bold text-white text-sm">Nakit Akışı & Likidite Kalkanı</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Aylık zorunlu giderleriniz olan <strong className="text-white">₺{(monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment).toLocaleString('tr-TR')}</strong> tutarını baz aldığımızda, finansal güvenceniz için likit hesaplarınızda tutmanız gereken ideal acil durum fonu hedefiniz <strong className="text-focus-neon">₺{Math.round((monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment) * 6).toLocaleString('tr-TR')}</strong> olmalıdır (6 Aylık Tampon).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-ai-bright/20 text-ai-bright flex items-center justify-center font-bold text-sm">3</div>
                <h4 className="font-bold text-white text-sm">Varlık Büyütme & Enflasyon Koruması</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Tasarruf oranınız şu an <strong className="text-white">%{(monthlyIncome > 0 ? ((monthlyIncome - (monthlyExpense + monthlySubscriptions + baseMonthlyDebtPayment)) / monthlyIncome * 100) : 0).toFixed(1)}</strong> seviyesinde. Boşta kalan her kuruşu enflasyona ezdirmemek adına hisse senedi fonları, değerli metaller ve Eurobond gibi üretken varlıklara otomatik yatırım talimatı ile yönlendirin.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 bg-white/[0.01] p-5 rounded-2xl border border-white/5 text-xs text-text-secondary leading-relaxed">
              <span className="font-bold text-white block mb-1">💡 Yapay Zeka Stratejik Tavsiyesi:</span>
              Mali durumunuzu mükemmelleştirmek için "Abonelik Sızıntısı" kontrolü yapmanızı öneririz. Şu an aylık <strong className="text-orange-400">₺{monthlySubscriptions.toLocaleString('tr-TR')}</strong> abonelik ödemeniz var. Kullanım sıklığı "düşük" veya "kullanılmıyor" olan dijital platform üyeliklerinizi dondurarak bütçenize doğrudan ek can suyu sağlayabilirsiniz.
            </div>
          </div>
        </motion.div>
      )}

      {/* --- ENGINE 4: REPORTS & INTERACTIVE PRESENTATIONS --- */}
      {activeEngine === 'reports' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Top Selection Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 border border-white/10 rounded-2xl p-2">
            <button 
              onClick={() => setActiveReportTab('debt_strategy')}
              className={`p-4 rounded-xl text-left transition-all ${
                activeReportTab === 'debt_strategy' 
                  ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-white shadow-lg' 
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={18} className={activeReportTab === 'debt_strategy' ? 'text-crit-vivid' : 'text-text-secondary'} />
                <span className="font-bold text-sm">Borç Tasfiye Stratejisi</span>
              </div>
              <p className="text-xs text-text-secondary">Ek ödeme simülasyonu, karşılaştırmalı grafik ve kapatma sırası.</p>
            </button>

            <button 
              onClick={() => setActiveReportTab('fire_plan')}
              className={`p-4 rounded-xl text-left transition-all ${
                activeReportTab === 'fire_plan' 
                  ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-white shadow-lg' 
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target size={18} className={activeReportTab === 'fire_plan' ? 'text-focus-neon' : 'text-text-secondary'} />
                <span className="font-bold text-sm">Yaşam Standartı & FIRE</span>
              </div>
              <p className="text-xs text-text-secondary">Sade, standart ve lüks emeklilik senaryoları & projeksiyonu.</p>
            </button>

            <button 
              onClick={() => setActiveReportTab('stress_test')}
              className={`p-4 rounded-xl text-left transition-all ${
                activeReportTab === 'stress_test' 
                  ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-white shadow-lg' 
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={18} className={activeReportTab === 'stress_test' ? 'text-ai-bright' : 'text-text-secondary'} />
                <span className="font-bold text-sm">Bütçe Dayanıklılık Testi</span>
              </div>
              <p className="text-xs text-text-secondary">Beklenmedik gelir kaybı ve hiperenflasyon kriz simülasyonu.</p>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* TAB 1: DEBT STRATEGY */}
            {activeReportTab === 'debt_strategy' && (
              <motion.div 
                key="debt_strategy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Simulation Controls Card */}
                <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calculator size={16} className="text-crit-vivid" /> Simülasyon Kontrolleri
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed mb-6">
                      Her ay bütçenizden yapacağınız <strong>ekstra borç ödemesini</strong> sürgüden ayarlayarak, borçsuz hayata ne kadar erken adım atabileceğinizi simüle edin.
                    </p>

                    <div className="space-y-6">
                      <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                        <label className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                          <span>Aylık Düzenli Borç Ödemesi</span>
                          <span className="text-white font-mono">₺{baseMonthlyDebtPayment.toLocaleString('tr-TR')}</span>
                        </label>
                        <div className="text-xs text-text-secondary font-medium">Sistemdeki aktif borçların toplamıdır.</div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-white uppercase">Ek Ödeme Sürgüsü</span>
                          <span className="text-base font-mono font-bold text-focus-neon bg-focus-neon/10 px-2.5 py-1 rounded-lg border border-focus-neon/20">
                            +₺{extraPayment.toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="20000" 
                          step="500" 
                          value={extraPayment} 
                          onChange={(e) => setExtraPayment(Number(e.target.value))} 
                          className="w-full accent-focus-neon h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        />
                        <div className="flex justify-between text-[10px] text-text-secondary mt-1 font-mono">
                          <span>₺0</span>
                          <span>₺10K</span>
                          <span>₺20K</span>
                        </div>
                      </div>

                      {/* Quick preset buttons */}
                      <div className="flex gap-2">
                        {[1000, 3000, 5000, 10000].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setExtraPayment(preset)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              extraPayment === preset 
                                ? 'bg-focus-neon text-black border-focus-neon' 
                                : 'bg-white/5 text-text-secondary border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            ₺{preset/1000}K
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                      <Zap size={14} className="text-nrg-sun" />
                      <span>Snowball (Kartopu) algoritması ile hesaplanır.</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Results Card */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Headline metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Standart Borç Süresi</span>
                      <span className="text-3xl font-mono font-black text-white block mt-1">
                        {activeDebts.length > 0 ? `${standardDebtMonths} Ay` : 'Borç Yok'}
                      </span>
                      <span className="text-xs text-text-secondary mt-1 block">Normal takvim ödeme hızı.</span>
                    </div>

                    <div className="bg-gradient-to-br from-focus-neon/10 to-black/30 border border-focus-neon/30 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-focus-neon/5">
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-focus-neon animate-ping" />
                      <span className="text-[10px] font-bold text-focus-neon uppercase tracking-wider block">Hızlandırılmış Süre</span>
                      <span className="text-3xl font-mono font-black text-focus-neon block mt-1">
                        {activeDebts.length > 0 ? `${acceleratedDebtMonths} Ay` : 'Borç Yok'}
                      </span>
                      <span className="text-xs text-text-secondary mt-1 block">Kartopu stratejisiyle yeni takvim.</span>
                    </div>

                    <div className="bg-gradient-to-br from-ai-bright/10 to-black/30 border border-ai-bright/30 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-ai-bright/5">
                      <span className="text-[10px] font-bold text-ai-bright uppercase tracking-wider block">Kazanılan Zaman</span>
                      <span className="text-3xl font-mono font-black text-ai-bright block mt-1">
                        {debtTimeSaved > 0 ? `${debtTimeSaved} Ay` : '0 Ay'}
                      </span>
                      <span className="text-xs text-text-secondary mt-1 block">Daha erken borçsuz bir hayat!</span>
                    </div>
                  </div>

                  {/* Financial savings box with chart */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Wallet size={16} className="text-ai-bright" /> Karşılaştırmalı Borç Erime Projeksiyonu
                      </h4>
                      {debtTimeSaved > 0 && (
                        <span className="text-xs font-bold text-focus-neon bg-focus-neon/10 px-3 py-1 rounded-full border border-focus-neon/20">
                          ₺{Math.round(estimatedInterestSavings).toLocaleString('tr-TR')} Faiz Tasarrufu
                        </span>
                      )}
                    </div>

                    {activeDebts.length > 0 ? (
                      <div className="space-y-6">
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={debtCompareProjection}>
                              <defs>
                                <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorAccelerated" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="monthName" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}K`} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                              />
                              <Area type="monotone" dataKey="Standart Plan" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorStandard)" />
                              <Area type="monotone" dataKey="Kartopu Planı" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAccelerated)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-crit-vivid" /> Standart Plan Özeti
                            </h5>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              Ekstra katkı yapmadan, sadece asgari taksitleri ödeyerek borçlarınızı sıfırlama süreniz <strong className="text-white">{standardDebtMonths} aydır</strong>. Bu sürede toplam ödemeleriniz yüksek enflasyona ve vade farkına maruz kalır.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-focus-neon uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-focus-neon" /> Kartopu Planı Avantajı
                            </h5>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              Aylık fazladan ayıracağınız <strong className="text-focus-neon">₺{extraPayment.toLocaleString('tr-TR')}</strong> sayesinde tüm borçlarınızı sadece <strong className="text-white">{acceleratedDebtMonths} ayda</strong> sıfırlıyorsunuz. Elde ettiğiniz zaman kazancı tam <strong className="text-focus-neon">{debtTimeSaved} aydır</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-text-secondary text-sm bg-black/20 rounded-2xl border border-white/5">
                        Borç analiz grafiğini görmek için lütfen sisteme aktif bir borç kalemi ekleyin.
                      </div>
                    )}
                  </div>

                  {/* Payoff sequence list */}
                  {activeDebts.length > 0 && (
                    <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                      <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={16} className="text-nrg-sun" /> Borç Tasfiye Sıralaması & Milestonelar
                      </h4>
                      <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                        Kartopu (Snowball) yöntemi uyarınca en hızlı kapatılabilecek borçtan en büyüğe doğru oluşturulmuş aylık kapatma sıralaması:
                      </p>

                      <div className="space-y-3">
                        {snowballPayoffSequence.map((debt, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-focus-neon/10 border border-focus-neon/20 text-focus-neon flex items-center justify-center font-bold text-xs">
                                {index + 1}
                              </div>
                              <div>
                                <span className="font-bold text-white text-sm block">{debt.title}</span>
                                <span className="text-[10px] text-text-secondary">Başlangıç Bakiyesi: ₺{debt.remainingAmount.toLocaleString('tr-TR')}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-focus-neon bg-focus-neon/10 border border-focus-neon/20 px-2.5 py-1 rounded-lg inline-block">
                                {debt.payoffMonth}. Ayda Kapanır
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Eradication Plan */}
                  <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Crosshair size={16} className="text-nrg-sun" /> Borç Kartopu Eylem Planı (Aksiyon Adımları)
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                        <div>
                          <h5 className="font-bold text-white text-sm mb-0.5">En Küçük Borca Odaklanın (Snowball)</h5>
                          <p className="text-xs text-text-secondary leading-relaxed">Ekstra olarak belirlediğiniz <strong>₺{extraPayment.toLocaleString('tr-TR')}</strong> tutarı, mevcut borçlar arasından en düşük bakiyeli olana yönlendirin. Diğer borçlara sadece minimum taksitlerini ödeyin.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                        <div>
                          <h5 className="font-bold text-white text-sm mb-0.5">Biten Taksiti Havuza Ekleyin</h5>
                          <p className="text-xs text-text-secondary leading-relaxed">En küçük borç bittiğinde, onun için ödediğiniz taksit tutarını havuzunuza dahil edin. Artık bir sonraki küçük borca ödediğiniz ekstra bütçe katlanarak büyür.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                        <div>
                          <h5 className="font-bold text-white text-sm mb-0.5">Geri Kazanılan Gelirle Yatırıma Başlayın</h5>
                          <p className="text-xs text-text-secondary leading-relaxed">Tüm borçlar sıfırlandığında, aylık serbest kalan <strong>₺{(baseMonthlyDebtPayment + extraPayment).toLocaleString('tr-TR')}</strong> tutarın tamamını doğrudan "Özgürlük Fonuna" yönlendirerek servet inşasına başlayın.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: FIRE PLAN */}
            {activeReportTab === 'fire_plan' && (
              <motion.div 
                key="fire_plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Lifestyle Choice Card */}
                <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Target size={16} className="text-focus-neon" /> Yaşam Standartı Seçimi
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Finansal özgürlüğe ulaştığınızda nasıl bir hayat sürmek istersiniz? Farklı bütçe katsayılarına göre hedeflerinizi anında değiştirin.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => setFireLifestyle('lean')}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${
                          fireLifestyle === 'lean' 
                            ? 'bg-gradient-to-r from-focus-neon/15 to-transparent border-focus-neon text-white shadow-lg' 
                            : 'bg-black/20 border-white/5 text-text-secondary hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">Sade Yaşam (Lean FIRE)</span>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold">Katsayı: 0.75</span>
                        </div>
                        <p className="text-xs text-text-secondary">Mevcut sabit giderlerin %75'i ile minimalist ve huzurlu bir yaşam tarzı.</p>
                      </button>

                      <button
                        onClick={() => setFireLifestyle('standard')}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${
                          fireLifestyle === 'standard' 
                            ? 'bg-gradient-to-r from-focus-neon/15 to-transparent border-focus-neon text-white shadow-lg' 
                            : 'bg-black/20 border-white/5 text-text-secondary hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">Mevcut Standart (Standard)</span>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold">Katsayı: 1.00</span>
                        </div>
                        <p className="text-xs text-text-secondary">Şu anki bütçenizi birebir koruyarak aynı konforda özgürlük.</p>
                      </button>

                      <button
                        onClick={() => setFireLifestyle('fat')}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${
                          fireLifestyle === 'fat' 
                            ? 'bg-gradient-to-r from-focus-neon/15 to-transparent border-focus-neon text-white shadow-lg' 
                            : 'bg-black/20 border-white/5 text-text-secondary hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">Konforlu Yaşam (Fat FIRE)</span>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold">Katsayı: 1.50</span>
                        </div>
                        <p className="text-xs text-text-secondary">Gider limitlerinizi %50 esneterek seyahat ve lüks odaklı özgürlük.</p>
                      </button>
                    </div>

                    {/* Interactive Age Inputs */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Yaş Parametreleri</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Mevcut Yaşınız</span>
                          <span className="text-white font-mono font-bold">{currentAge} Yaş</span>
                        </div>
                        <input 
                          type="range" 
                          min="18" 
                          max="70" 
                          value={currentAge} 
                          onChange={(e) => setCurrentAge(Number(e.target.value))} 
                          className="w-full accent-focus-neon h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Hedef Emeklilik Yaşınız</span>
                          <span className="text-white font-mono font-bold">{targetRetirementAge} Yaş</span>
                        </div>
                        <input 
                          type="range" 
                          min="40" 
                          max="85" 
                          value={targetRetirementAge} 
                          onChange={(e) => setTargetRetirementAge(Number(e.target.value))} 
                          className="w-full accent-focus-neon h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Ayarlanmış Yaşam Maliyeti:</span>
                      <span className="font-mono font-bold text-white">₺{Math.round(adjustedMonthlyLivingCost).toLocaleString('tr-TR')} / ay</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Güvenli Çekim Oranı:</span>
                      <span className="font-mono font-bold text-focus-neon">%{freedomSettings.withdrawalRate} / yıl</span>
                    </div>
                  </div>
                </div>

                {/* FIRE Target and Roadmap Area */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Metric boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5 relative">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Gereken Özgürlük Portföyü</span>
                      <span className="text-2xl font-mono font-black text-white block mt-1">
                        ₺{Math.round(fireTargetAmount).toLocaleString('tr-TR')}
                      </span>
                      <span className="text-xs text-text-secondary mt-1 block">Pasif gelir üreten anapara büyüklüğü.</span>
                    </div>

                    <div className="bg-gradient-to-br from-focus-neon/10 to-black/30 border border-focus-neon/30 rounded-2xl p-5 relative">
                      <span className="text-[10px] font-bold text-focus-neon uppercase tracking-wider block">Kalan Süre</span>
                      <span className="text-2xl font-mono font-black text-focus-neon block mt-1">
                        {fireYearsToTarget === Infinity ? 'Hesaplanamıyor' : `${fireYearsToTarget.toFixed(1)} Yıl`}
                      </span>
                      <span className="text-xs text-text-secondary mt-1 block">
                        {monthlySavings > 0 
                          ? `Aylık ₺${monthlySavings.toLocaleString('tr-TR')} tasarruf ile.` 
                          : 'Tasarruf oranı yetersiz!'}
                      </span>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5 relative">
                      <span className="text-[10px] font-bold text-ai-bright uppercase tracking-wider block">Özgürlük Yaşı</span>
                      <span className="text-2xl font-mono font-black text-ai-bright block mt-1">
                        {fireYearsToTarget === Infinity ? 'Hesaplanamıyor' : `${Math.round(currentAge + fireYearsToTarget)} Yaş`}
                      </span>
                      <span className="text-xs text-text-secondary mt-1 block">
                        {fireYearsToTarget !== Infinity && (currentAge + fireYearsToTarget) <= targetRetirementAge 
                          ? 'Hedef yaşınızdan daha erken!' 
                          : 'Hedef yaşınızı aşıyor.'}
                      </span>
                    </div>
                  </div>

                  {/* FIRE Roadmap Line Chart */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Activity size={16} className="text-ai-bright" /> Yıllık Varlık & FIRE Hedefi Projeksiyonu
                    </h4>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={fireCompareProjection}>
                          <defs>
                            <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="age" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} tickFormatter={(age) => `${age} Yaş`} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} tickFormatter={(val) => `₺${(val/1000000).toFixed(1)}M`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                            formatter={(value: any) => [`₺${Number(value).toLocaleString('tr-TR')}`, '']}
                          />
                          <Area type="monotone" dataKey="Birikim Portföyü" stroke="#00e5ff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAssets)" />
                          <ReferenceLine y={fireTargetAmount} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'FIRE HEDEFİ', fill: '#10b981', fontSize: 10, position: 'top' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-1">
                      <div className="text-[10px] font-bold text-text-secondary uppercase">Gelecekteki Aylık Güvenli Pasif Gelir (Enflasyondan Arındırılmış)</div>
                      <div className="text-2xl font-mono font-black text-ai-bright">₺{Math.round(adjustedMonthlyLivingCost).toLocaleString('tr-TR')} / ay</div>
                      <div className="text-[10px] text-text-secondary">4% Çekim kuralı uyarınca anaparanız hiç erimeden ömür boyu çekebileceğiniz net miktar.</div>
                    </div>
                  </div>

                  {/* FIRE action plan recommendations */}
                  <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Zap size={16} className="text-nrg-sun" /> Özgürlük Yol Haritası Tavsiyeleri
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <h5 className="font-bold text-white mb-1.5">Tasarruf Oranını Artırın</h5>
                        <p className="text-text-secondary leading-relaxed">Tasarruf oranınızı her %5 artırdığınızda, finansal özgürlüğe ulaşma sürenizi yaklaşık 3-4 yıl öne çekersiniz.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <h5 className="font-bold text-white mb-1.5">Temettü ve Kira Getirisi</h5>
                        <p className="text-text-secondary leading-relaxed">Özgürlük portföyünüzü nakit akışı üreten enstrümanlar (temettü hisseleri, gayrimenkul) ile çeşitlendiririn.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: STRESS TEST */}
            {activeReportTab === 'stress_test' && (
              <motion.div 
                key="stress_test"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Crisis Simulator Controls */}
                <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-crit-vivid" /> Kriz Senaryolarını Tetikle
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed mb-6">
                      Bütçenize gelebilecek potansiyel dışsal veya içsel şokları aktif ederek, finansal kalkanınızın dayanıklılığını test edin.
                    </p>

                    <div className="space-y-4">
                      {/* Shock 1: Income Loss */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/20 border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">İş Kaybı / Gelir Azalması</span>
                          <span className="text-[10px] text-text-secondary">Aylık gelir %50 kesintiye uğrar</span>
                        </div>
                        <button
                          onClick={() => setSimIncomeLoss(!simIncomeLoss)}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                            simIncomeLoss ? 'bg-crit-vivid' : 'bg-white/10'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            simIncomeLoss ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      {/* Shock 2: Emergency Expense */}
                      <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-white block">Acil Büyük Masraf</span>
                            <span className="text-[10px] text-text-secondary">Tek seferlik beklenmeyen fatura</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[0, 25000, 50000].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setSimEmergencyExpense(amt)}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                simEmergencyExpense === amt 
                                  ? 'bg-crit-vivid text-white border-crit-vivid' 
                                  : 'bg-white/5 text-text-secondary border-white/10 hover:text-white'
                              }`}
                            >
                              {amt === 0 ? 'Yok' : `₺${amt/1000}K`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Shock 3: Inflation / Cost increase */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/20 border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">Hiperenflasyon Şoku</span>
                          <span className="text-[10px] text-text-secondary">Aylık giderler %30 artış gösterir</span>
                        </div>
                        <button
                          onClick={() => setSimInflationShock(!simInflationShock)}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                            simInflationShock ? 'bg-crit-vivid' : 'bg-white/10'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            simInflationShock ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5">
                    <span className="text-[10px] text-text-secondary leading-relaxed block">
                      *Tüm hesaplamalar anlık nakit rezervlerinize (Acil Durum Fonu) göre simüle edilmiştir.
                    </span>
                  </div>
                </div>

                {/* Resilience Results Area */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Performance Grade Gauge */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Acil Durum Başlangıç Rezervi</span>
                        <span className="text-2xl font-mono font-black text-white mt-1 block">₺{currentSavingsOnly.toLocaleString('tr-TR')}</span>
                      </div>
                      <span className="text-[10px] text-text-secondary mt-2 block">Kullanılabilir birikimleriniz.</span>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Kriz Altında Aylık Açık</span>
                        <span className="text-2xl font-mono font-black text-crit-vivid mt-1 block">₺{Math.round(stressMonthlyNetDeficit).toLocaleString('tr-TR')}</span>
                      </div>
                      <span className="text-[10px] text-text-secondary mt-2 block">Simüle edilen aylık net kayıp.</span>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Rezervlerin Erime Süresi</span>
                        <span className="text-2xl font-mono font-black text-white mt-1 block">
                          {stressSurvivalMonths === 999 ? 'Güvenli (Sonsuz)' : `${stressSurvivalMonths.toFixed(1)} Ay`}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-secondary mt-2 block">Fonlar bitene kadar geçen süre.</span>
                    </div>
                  </div>

                  {/* Resilience Score Card */}
                  <div className={`border rounded-3xl p-6 transition-all duration-300 ${stressResilienceScore.color}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Finansal Dayanıklılık Skoru</span>
                        <h4 className="text-lg font-bold text-white mt-1">{stressResilienceScore.title}</h4>
                      </div>
                      <div className="text-4xl font-mono font-black border border-white/10 w-16 h-16 rounded-2xl flex items-center justify-center bg-black/40">
                        {stressResilienceScore.grade}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">
                      {stressResilienceScore.desc}
                    </p>

                    {/* Progress slider showing safety buffer */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-text-secondary">
                        <span>Güvenlik Sınırı</span>
                        <span>{stressSurvivalMonths === 999 ? 'Tam Koruma' : `${stressSurvivalMonths.toFixed(1)} Ay Koruma`}</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-crit-vivid via-nrg-sun to-focus-neon rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (stressSurvivalMonths === 999 ? 24 : stressSurvivalMonths) * 4.16)}%` }} 
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-text-secondary font-mono">
                        <span>0 Ay (Kritik)</span>
                        <span>6 Ay (Güvenli)</span>
                        <span>12 Ay (Mükemmel)</span>
                        <span>24+ Ay (Yıkılmaz)</span>
                      </div>
                    </div>
                  </div>

                  {/* Stress Depletion Bar Chart */}
                  {stressSurvivalMonths !== 999 && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <TrendingDown size={16} className="text-crit-vivid" /> Acil Durum Rezervlerinin Aylık Erime Simülasyonu
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Kriz durumunun devam etmesi halinde mevcut nakit rezervlerinizin (Acil Durum Fonu) aylar içerisindeki tükeniş hızı:
                      </p>

                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stressDecayProjection}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="monthName" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}K`} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="Rezerv Miktarı" fill="#ef4444" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Risk Shock Breakdown Table */}
                  <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle size={16} className="text-crit-vivid" /> Aktif Şok Durum Matrisi
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-text-secondary">
                            <th className="pb-3 font-bold uppercase">Sarsıntı Faktörü</th>
                            <th className="pb-3 font-bold uppercase">Normal Durum</th>
                            <th className="pb-3 font-bold uppercase">Kriz Altındaki Durum</th>
                            <th className="pb-3 font-bold text-right uppercase">Bütçe Etkisi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-text-secondary">
                          <tr>
                            <td className="py-3 font-bold text-white">Aylık Net Gelir</td>
                            <td className="py-3 font-mono">₺{monthlyIncome.toLocaleString('tr-TR')}</td>
                            <td className="py-3 font-mono text-white">₺{stressScenarioIncome.toLocaleString('tr-TR')}</td>
                            <td className="py-3 text-right font-bold font-mono text-crit-vivid">
                              {simIncomeLoss ? `-₺${(monthlyIncome * 0.5).toLocaleString('tr-TR')}` : 'Etki Yok'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 font-bold text-white">Aylık Sabit Harcamalar</td>
                            <td className="py-3 font-mono">₺{(monthlyExpense + monthlySubscriptions).toLocaleString('tr-TR')}</td>
                            <td className="py-3 font-mono text-white">₺{(simInflationShock ? (monthlyExpense + monthlySubscriptions) * 1.3 : (monthlyExpense + monthlySubscriptions)).toLocaleString('tr-TR')}</td>
                            <td className="py-3 text-right font-bold font-mono text-crit-vivid">
                              {simInflationShock ? `+₺${Math.round((monthlyExpense + monthlySubscriptions) * 0.3).toLocaleString('tr-TR')}` : 'Etki Yok'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 font-bold text-white">Acil Büyük Masraf (Rezerv Kaybı)</td>
                            <td className="py-3 font-mono">₺{currentSavingsOnly.toLocaleString('tr-TR')}</td>
                            <td className="py-3 font-mono text-white">₺{stressEmergencyFundStarting.toLocaleString('tr-TR')}</td>
                            <td className="py-3 text-right font-bold font-mono text-crit-vivid">
                              {simEmergencyExpense > 0 ? `-₺${simEmergencyExpense.toLocaleString('tr-TR')}` : 'Etki Yok'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tactical Advice during Crisis */}
                  <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Crosshair size={16} className="text-ai-bright" /> Kriz Savunma Eylem Planı
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                        <div>
                          <h5 className="font-bold text-white text-sm">Abonelikleri Askıya Alın</h5>
                          <p className="text-xs text-text-secondary leading-relaxed">İlk iş olarak tüm aktif aboneliklerinizi dondurun veya iptal edin. Bu, bütçenize anında <strong>₺{monthlySubscriptions.toLocaleString('tr-TR')}</strong> ek can suyu sağlar.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                        <div>
                          <h5 className="font-bold text-white text-sm">Borç Alacaklıları ile Görüşün</h5>
                          <p className="text-xs text-text-secondary leading-relaxed">Ödemelerinizde aksama yaşamadan önce bankalarla görüşerek yapılandırma veya erteleme talep edin. Bu, aylık zorunlu taksit yükünüzü hafifletir.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                        <div>
                          <h5 className="font-bold text-white text-sm">Likit Varlıkları Korumaya Alın</h5>
                          <p className="text-xs text-text-secondary leading-relaxed">Kriz anında hisse senedi veya değişken fonlardaki birikimlerinizi acil durum masrafları dışında bozmamaya çalışın. Değer kaybı dönemlerinde nakit ihtiyacını acil durum fonu karşılamalıdır.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  );
};
