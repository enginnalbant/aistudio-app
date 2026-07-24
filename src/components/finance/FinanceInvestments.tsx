import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp,
  TrendingDown,
  Target,
  PiggyBank,
  Wallet,
  MoreVertical,
  X,
  AlertCircle,
  PieChart as PieChartIcon,
  Sparkles,
  Info,
  Calendar,
  ArrowUpRight,
  CheckCircle
} from 'lucide-react';

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

interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: 'Devam Ediyor' | 'Tamamlandı';
}

const MOCK_INVESTMENTS: Investment[] = [];

const MOCK_SAVINGS: SavingGoal[] = [];

export const FinanceInvestments = () => {
  const [activeTab, setActiveTab] = useState<'investments' | 'savings' | 'smart-analysis'>('investments');
  
  // Investments State
  const [investments, setInvestments] = useLocalStorage<Investment[]>('finance_investments', MOCK_INVESTMENTS);
  const [invSearch, setInvSearch] = useState('');
  const [isInvWizardOpen, setIsInvWizardOpen] = useState(false);
  const [invFormData, setInvFormData] = useState<Partial<Investment>>({
    status: 'Aktif',
    type: 'Hisse Senedi'
  });
  
  // Savings State
  const [savings, setSavings] = useLocalStorage<SavingGoal[]>('finance_savings', MOCK_SAVINGS);
  const [savSearch, setSavSearch] = useState('');
  const [isSavWizardOpen, setIsSavWizardOpen] = useState(false);
  const [savFormData, setSavFormData] = useState<Partial<SavingGoal>>({
    status: 'Devam Ediyor',
    category: 'Genel'
  });

  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number>('finance_monthly_income', 50000);
  const [monthlySavingPower, setMonthlySavingPower] = useLocalStorage<number>('finance_monthly_saving_power', 10000);
  const [activeFaqId, setActiveFaqId] = useState<string | null>('saving_progress');

  // Modals
  const [summaryModal, setSummaryModal] = useState<{title: string; value: string; type: string} | null>(null);

  // Handlers for Investments Wizard
  const handleInvChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvFormData(prev => ({ ...prev, [name]: name.includes('Amount') ? Number(value) : value }));
  };

  // Handlers for Savings Wizard
  const handleSavChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSavFormData(prev => ({ ...prev, [name]: name.includes('Amount') ? Number(value) : value }));
  };

  // Calculations: Investments
  const activeInvestments = useMemo(() => investments.filter(i => i.status === 'Aktif'), [investments]);
  const totalInitial = activeInvestments.reduce((acc, curr) => acc + curr.initialAmount, 0);
  const totalCurrent = activeInvestments.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const totalProfitLoss = totalCurrent - totalInitial;
  const profitLossPercent = totalInitial > 0 ? (totalProfitLoss / totalInitial) * 100 : 0;

  const invCategoryData = useMemo(() => {
    const data = activeInvestments.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + curr.currentAmount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [activeInvestments]);

  // Calculations: Savings
  const totalSaved = useMemo(() => savings.reduce((acc, curr) => acc + curr.currentAmount, 0), [savings]);
  const activeSavings = useMemo(() => savings.filter(s => s.status === 'Devam Ediyor'), [savings]);
  const totalTarget = activeSavings.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const activeSaved = activeSavings.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const progressPercent = totalTarget > 0 ? (activeSaved / totalTarget) * 100 : 0;
  const completedSavingsCount = savings.filter(s => s.status === 'Tamamlandı').length;

  const totalPortfolioValue = useMemo(() => {
    return totalCurrent + totalSaved;
  }, [totalCurrent, totalSaved]);

  const savingRateRatio = useMemo(() => {
    if (!monthlyIncome || monthlyIncome <= 0) return 0;
    return Math.min(100, Math.round((monthlySavingPower / monthlyIncome) * 100));
  }, [monthlySavingPower, monthlyIncome]);

  const savingAdvice = useMemo(() => {
    const ratio = savingRateRatio;
    if (ratio === 0) {
      return {
        level: 'Tasarruf Yapılmıyor 🔴',
        color: 'text-crit-vivid border-crit-vivid/20 bg-crit-vivid/5',
        desc: 'Henüz aylık birikim veya yatırım gücü tanımlamadınız. Finansal geleceğinizi güvence altına almak için gelirinizin en az %20\'sini biriktirmeye çalışmalısınız.'
      };
    }
    if (ratio < 10) {
      return {
        level: 'Tasarruf Oranı Düşük 🟠',
        color: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
        desc: 'Tasarruf oranınız %10\'un altında. 50/30/20 bütçe kuralına göre birikim ve yatırımlarınızı artırmak için lüks veya gereksiz abonelik harcamalarını kısmayı deneyin.'
      };
    }
    if (ratio < 20) {
      return {
        level: 'Yönetilebilir Dengeli Bölge 🟡',
        color: 'text-nrg-sun border-nrg-sun/20 bg-nrg-sun/5',
        desc: 'Fena olmayan bir tasarruf oranına sahipsiniz. Gelirinizin %20\'sini biriktirmeyi hedefleyerek finansal dayanıklılığınızı daha da artırabilirsiniz.'
      };
    }
    if (ratio < 40) {
      return {
        level: 'Mükemmel Biriktirici 🟢',
        color: 'text-focus-neon border-focus-neon/20 bg-focus-neon/5',
        desc: 'Harika! Gelirinizin kayda değer bir kısmını geleceğinize ve yatırımlarınıza ayırıyorsunuz. Finansal olarak güvendesiniz.'
      };
    }
    return {
      level: 'Finansal Özgürlük Yolcusu 🔥',
      color: 'text-focus-neon border-focus-neon/20 bg-focus-neon/5',
      desc: 'Sıra dışı bir birikim oranı! Gelirinizin %40\'ından fazlasını yatırıma dönüştürüyorsunuz. Bu tempoyla çok erken yaşta finansal bağımsızlığa ulaşabilirsiniz.'
    };
  }, [savingRateRatio]);

  // Chronological 12-Month savings goal projection
  const savingsProjections = useMemo(() => {
    const projections = [];
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentYear = today.getFullYear();

    const turkishMonths = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    // Create a deep copy of active savings to simulate month by month
    const simulatedGoals = activeSavings.map(s => ({
      ...s,
      simulatedCurrent: s.currentAmount
    }));

    let accumulatedTotalSaved = totalSaved;
    let accumulatedTotalPortfolio = totalPortfolioValue;

    for (let m = 0; m < 12; m++) {
      const simMonthIndex = (currentMonthIndex + m) % 12;
      const simYear = currentYear + Math.floor((currentMonthIndex + m) / 12);
      const monthLabel = `${turkishMonths[simMonthIndex]} ${simYear}`;

      const goalsCompletedThisMonth: string[] = [];
      const monthlyAllocations: { title: string; amount: number; completed: boolean }[] = [];

      // Calculate total remaining target among incomplete goals to distribute monthlySavingPower proportionally
      const incompleteGoals = simulatedGoals.filter(g => g.simulatedCurrent < g.targetAmount);
      const totalRemainingNeeded = incompleteGoals.reduce((sum, g) => sum + (g.targetAmount - g.simulatedCurrent), 0);

      if (totalRemainingNeeded > 0 && monthlySavingPower > 0) {
        // Distribute saving power proportionally based on remaining amount
        incompleteGoals.forEach(g => {
          const remainingForThis = g.targetAmount - g.simulatedCurrent;
          const proportion = remainingForThis / totalRemainingNeeded;
          const allocated = Math.min(remainingForThis, monthlySavingPower * proportion);
          
          g.simulatedCurrent += allocated;
          accumulatedTotalSaved += allocated;
          accumulatedTotalPortfolio += allocated;

          const isNowCompleted = g.simulatedCurrent >= g.targetAmount;
          if (isNowCompleted) {
            goalsCompletedThisMonth.push(g.title);
          }

          monthlyAllocations.push({
            title: g.title,
            amount: allocated,
            completed: isNowCompleted
          });
        });
      } else if (monthlySavingPower > 0) {
        // No active incomplete goals, saving power just accumulates to general net worth
        accumulatedTotalSaved += monthlySavingPower;
        accumulatedTotalPortfolio += monthlySavingPower;
      }

      // Calculate total target of all simulated active goals
      const currentActiveTarget = simulatedGoals.reduce((sum, g) => sum + g.targetAmount, 0);
      const currentActiveSaved = simulatedGoals.reduce((sum, g) => sum + g.simulatedCurrent, 0);
      const simulatedProgress = currentActiveTarget > 0 ? Math.min(100, (currentActiveSaved / currentActiveTarget) * 100) : 100;

      projections.push({
        monthLabel,
        accumulatedTotalSaved,
        accumulatedTotalPortfolio,
        goalsCompletedThisMonth,
        monthlyAllocations,
        simulatedProgress
      });
    }

    return projections;
  }, [activeSavings, totalSaved, totalPortfolioValue, monthlySavingPower]);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Yatırım ve Birikimlerim</h1>
          <p className="text-text-secondary">Varlıklarınızı ve birikim hedeflerinizi yönetin.</p>
        </div>
        <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('investments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'investments' ? 'bg-focus-neon/10 text-focus-neon' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Yatırımlar
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'savings' ? 'bg-ai-bright/10 text-ai-bright' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Birikim Hedefleri
          </button>
          <button
            onClick={() => setActiveTab('smart-analysis')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'smart-analysis' ? 'bg-focus-neon/15 text-focus-neon border border-focus-neon/20' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Sparkles size={13} className={activeTab === 'smart-analysis' ? 'text-focus-neon' : 'text-text-secondary'} />
            Akıllı Analiz
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {activeTab === 'investments' && (
            <>
              {/* Investment Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setSummaryModal({
                    title: 'Güncel Portföy', 
                    value: `₺${totalCurrent.toLocaleString('tr-TR')}`, 
                    type: 'inv-total'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-focus-neon/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-focus-neon/10 rounded-lg text-focus-neon group-hover:scale-110 transition-transform">
                      <Wallet size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Güncel Portföy Değeri</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    ₺{totalCurrent.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-2">
                    Ana Para: ₺{totalInitial.toLocaleString('tr-TR')}
                  </p>
                </div>

                <div 
                  onClick={() => setSummaryModal({
                    title: 'Toplam Kâr/Zarar', 
                    value: `${totalProfitLoss >= 0 ? '+' : ''}₺${totalProfitLoss.toLocaleString('tr-TR')}`, 
                    type: 'inv-profit'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-white/20 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${
                      totalProfitLoss >= 0 ? 'bg-focus-neon/10 text-focus-neon' : 'bg-crit-vivid/10 text-crit-vivid'
                    }`}>
                      {totalProfitLoss >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Toplam Kâr / Zarar</h3>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-mono font-bold ${totalProfitLoss >= 0 ? 'text-focus-neon' : 'text-crit-vivid'}`}>
                      {totalProfitLoss >= 0 ? '+' : ''}₺{totalProfitLoss.toLocaleString('tr-TR')}
                    </p>
                    <span className={`text-xs font-bold ${totalProfitLoss >= 0 ? 'text-focus-neon' : 'text-crit-vivid'}`}>
                      {totalProfitLoss >= 0 ? '+' : ''}%{profitLossPercent.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div 
                  onClick={() => setSummaryModal({
                    title: 'Varlık Dağılımı', 
                    value: invCategoryData.length > 0 ? invCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-', 
                    type: 'inv-category'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-ai-bright/10 rounded-lg text-ai-bright group-hover:scale-110 transition-transform">
                      <PieChartIcon size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">En Büyük Varlık</h3>
                  <p className="text-2xl font-display font-bold text-text-primary truncate">
                    {invCategoryData.length > 0 ? invCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-'}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-2">
                    {invCategoryData.length} farklı varlık tipi
                  </p>
                </div>

                <div 
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-default"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun">
                      <Target size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Aktif Yatırımlar</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    {activeInvestments.length} <span className="text-sm text-text-secondary font-sans font-normal">adet</span>
                  </p>
                </div>
              </div>

              {/* Investments List */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <h2 className="text-xl font-display font-bold text-text-primary">Tüm Yatırımlar</h2>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="text"
                        placeholder="Yatırım ara..."
                        value={invSearch}
                        onChange={(e) => setInvSearch(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors"
                      />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
                      <Filter size={18} />
                    </button>
                    <button 
                      onClick={() => setIsInvWizardOpen(true)}
                      className="flex items-center gap-2 bg-focus-neon text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-focus-neon/90 transition-colors"
                    >
                      <Plus size={18} />
                      <span className="hidden md:inline">Yatırım Ekle</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-sm text-text-secondary">
                        <th className="pb-3 font-medium">Varlık / Platform</th>
                        <th className="pb-3 font-medium">Tür</th>
                        <th className="pb-3 font-medium">Ana Para</th>
                        <th className="pb-3 font-medium">Güncel Değer</th>
                        <th className="pb-3 font-medium">Kâr/Zarar</th>
                        <th className="pb-3 font-medium">Durum</th>
                        <th className="pb-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {investments
                        .filter(i => (i.title || '').toLowerCase().includes((invSearch || '').toLowerCase()) || (i.platform || '').toLowerCase().includes((invSearch || '').toLowerCase()))
                        .map((inv) => {
                          const profitLoss = inv.currentAmount - inv.initialAmount;
                          const profitLossPerc = (profitLoss / inv.initialAmount) * 100;
                          return (
                          <tr key={inv.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-text-primary">{inv.title}</span>
                                <span className="text-xs text-text-secondary">{inv.platform} • {new Date(inv.purchaseDate).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </td>
                            <td className="py-4 text-text-secondary">{inv.type}</td>
                            <td className="py-4">
                              <span className="font-mono text-text-secondary">₺{inv.initialAmount.toLocaleString('tr-TR')}</span>
                            </td>
                            <td className="py-4">
                              <span className="font-mono font-bold text-text-primary">₺{inv.currentAmount.toLocaleString('tr-TR')}</span>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className={`font-mono font-bold ${profitLoss >= 0 ? 'text-focus-neon' : 'text-crit-vivid'}`}>
                                  {profitLoss >= 0 ? '+' : ''}₺{profitLoss.toLocaleString('tr-TR')}
                                </span>
                                <span className={`text-[10px] ${profitLoss >= 0 ? 'text-focus-neon/70' : 'text-crit-vivid/70'}`}>
                                  {profitLoss >= 0 ? '+' : ''}%{profitLossPerc.toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                inv.status === 'Aktif' ? 'bg-focus-neon/10 text-focus-neon' :
                                'bg-text-secondary/10 text-text-secondary'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button className="p-2 text-text-secondary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        )})}
                    </tbody>
                  </table>
                  {investments.length === 0 && (
                    <div className="text-center py-12 text-text-secondary">
                      Gösterilecek yatırım bulunamadı.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'savings' && (
            <>
              {/* Saving Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setSummaryModal({
                    title: 'Toplam Birikim', 
                    value: `₺${totalSaved.toLocaleString('tr-TR')}`, 
                    type: 'sav-total'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-ai-bright/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-ai-bright/10 rounded-lg text-ai-bright group-hover:scale-110 transition-transform">
                      <PiggyBank size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Toplam Birikim</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    ₺{totalSaved.toLocaleString('tr-TR')}
                  </p>
                </div>

                <div 
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-default"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun">
                      <Target size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Aktif Hedeflenen</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    ₺{totalTarget.toLocaleString('tr-TR')}
                  </p>
                </div>

                <div 
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-default"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-focus-neon/10 rounded-lg text-focus-neon">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Genel İlerleme</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-mono font-bold text-text-primary">
                      %{progressPercent.toFixed(1)}
                    </p>
                    <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-focus-neon rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-default"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                      <PiggyBank size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Tamamlanan Hedefler</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    {completedSavingsCount} <span className="text-sm text-text-secondary font-sans font-normal">adet</span>
                  </p>
                </div>
              </div>

              {/* Savings List */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <h2 className="text-xl font-display font-bold text-text-primary">Birikim Hedefleri</h2>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="text"
                        placeholder="Hedef ara..."
                        value={savSearch}
                        onChange={(e) => setSavSearch(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-ai-bright/50 transition-colors"
                      />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
                      <Filter size={18} />
                    </button>
                    <button 
                      onClick={() => setIsSavWizardOpen(true)}
                      className="flex items-center gap-2 bg-ai-bright text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-ai-bright/90 transition-colors"
                    >
                      <Plus size={18} />
                      <span className="hidden md:inline">Yeni Hedef</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savings
                    .filter(s => (s.title || '').toLowerCase().includes((savSearch || '').toLowerCase()) || (s.category || '').toLowerCase().includes((savSearch || '').toLowerCase()))
                    .map((sav) => {
                      const perc = (sav.currentAmount / sav.targetAmount) * 100;
                      return (
                      <div key={sav.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group relative">
                        <div className="absolute top-4 right-4">
                           <button className="p-1.5 text-text-secondary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                             <MoreVertical size={16} />
                           </button>
                        </div>
                        <div className="mb-4 pr-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${
                            sav.status === 'Devam Ediyor' ? 'bg-ai-bright/10 text-ai-bright' : 'bg-focus-neon/10 text-focus-neon'
                          }`}>
                            {sav.status}
                          </span>
                          <h3 className="text-lg font-bold text-text-primary truncate">{sav.title}</h3>
                          <p className="text-xs text-text-secondary">{sav.category} • Hedef: {new Date(sav.deadline).toLocaleDateString('tr-TR')}</p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1">BİRİKEN</p>
                              <p className="font-mono font-bold text-text-primary text-xl">₺{sav.currentAmount.toLocaleString('tr-TR')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1">HEDEF</p>
                              <p className="font-mono text-text-secondary">₺{sav.targetAmount.toLocaleString('tr-TR')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-text-secondary">İlerleme</span>
                            <span className="text-xs font-bold text-white">%{perc.toFixed(1)}</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${perc >= 100 ? 'bg-focus-neon' : 'bg-ai-bright'}`} 
                              style={{ width: `${Math.min(perc, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )})}
                    {savings.length === 0 && (
                      <div className="col-span-full text-center py-12 text-text-secondary">
                        Gösterilecek birikim hedefi bulunamadı.
                      </div>
                    )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'smart-analysis' && (
            <>
              {/* SMART ANALYSIS & FUTURE CHRONOLOGICAL PROJECTOR */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="smart-analysis-grid">
                
                {/* LEFT COLUMN (lg:col-span-5): Q&A and Adjustable Budget Saving power Tester */}
                <div className="lg:col-span-5 space-y-5" id="smart-analysis-left">
                  <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl" id="smart-analysis-budget-card">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <Sparkles size={18} className="text-focus-neon animate-pulse" />
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tasarruf & Yatırım Planlama Asistanı</h3>
                        <p className="text-[10px] text-text-secondary">Akıllı simülasyonlarla finansal gücünüzü analiz edin.</p>
                      </div>
                    </div>

                    {/* Gelir Slider / Input Control */}
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3" id="smart-analysis-income-control">
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

                    {/* Tasarruf Gücü Slider / Input Control */}
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3" id="smart-analysis-saving-control">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                          <PiggyBank size={13} className="text-ai-bright" />
                          Aylık Birikim & Yatırım Gücünüz
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-text-secondary">₺</span>
                          <input 
                            type="number" 
                            value={monthlySavingPower} 
                            onChange={(e) => setMonthlySavingPower(Math.max(0, Number(e.target.value)))}
                            className="w-24 bg-black/40 border border-white/10 rounded-md px-2 py-0.5 text-xs text-white font-mono text-right focus:outline-none focus:border-ai-bright/50"
                          />
                        </div>
                      </div>
                      
                      <input 
                        type="range" 
                        min="1000" 
                        max="100000" 
                        step="1000"
                        value={monthlySavingPower} 
                        onChange={(e) => setMonthlySavingPower(Number(e.target.value))}
                        className="w-full accent-ai-bright cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-text-secondary font-mono">
                        <span>₺1k</span>
                        <span>₺50k</span>
                        <span>₺100k+</span>
                      </div>
                    </div>

                    {/* Saving gauge */}
                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2.5" id="smart-analysis-gauge-panel">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-secondary font-bold">Gelirinize Oranla Tasarruf Hızınız</span>
                        <span className="font-mono font-black text-text-primary">{savingRateRatio}%</span>
                      </div>
                      
                      {/* Interactive Bar */}
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 flex">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            savingRateRatio < 10 ? 'bg-crit-vivid' : savingRateRatio < 20 ? 'bg-amber-500' : savingRateRatio < 40 ? 'bg-nrg-sun' : 'bg-focus-neon'
                          }`}
                          style={{ width: `${savingRateRatio}%` }}
                        />
                      </div>

                      <div className={`p-3 border rounded-xl text-xs leading-relaxed ${savingAdvice.color}`}>
                        <div className="font-bold mb-1 flex items-center gap-1">
                          <Info size={12} />
                          {savingAdvice.level}
                        </div>
                        {savingAdvice.desc}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Accordion QA */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-3" id="smart-analysis-faq-panel">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Aklınızdaki Soruları Yanıtlayalım:</h4>
                    
                    {/* Q1: Ne kadar yatırımım ve birikimim var */}
                    <div className="border border-white/5 rounded-xl overflow-hidden" id="faq-total-assets">
                      <button 
                        onClick={() => setActiveFaqId(activeFaqId === 'assets_amount' ? null : 'assets_amount')}
                        className={`w-full p-3.5 text-left text-xs font-bold transition-all flex justify-between items-center hover:bg-white/[0.02] ${activeFaqId === 'assets_amount' ? 'bg-white/[0.02] text-white' : 'text-text-secondary'}`}
                      >
                        <span>Soru 1: Toplam ne kadar yatırım ve birikimim var?</span>
                        <span className={`text-xs transition-transform ${activeFaqId === 'assets_amount' ? 'rotate-90 text-focus-neon' : ''}`}>➔</span>
                      </button>
                      {activeFaqId === 'assets_amount' && (
                        <div className="p-4 bg-black/20 border-t border-white/5 text-xs space-y-3">
                          <p className="text-text-secondary leading-relaxed">
                            Mevcut yatırımlarınızın güncel değerleri ve birikim hedeflerinizde biriken toplam bakiyeleriniz şu şekildedir:
                          </p>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg">
                              <span className="text-[10px] text-text-secondary block">Güncel Yatırımlar</span>
                              <span className="font-mono font-bold text-sm text-white">₺{totalCurrent.toLocaleString('tr-TR')}</span>
                            </div>
                            <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg">
                              <span className="text-[10px] text-text-secondary block">Biriken Mevduat/Tasarruf</span>
                              <span className="font-mono font-bold text-sm text-ai-bright">₺{totalSaved.toLocaleString('tr-TR')}</span>
                            </div>
                          </div>
                          
                          <div className="p-2.5 bg-focus-neon/5 border border-focus-neon/10 rounded-lg text-xs">
                            <p className="text-text-secondary font-bold flex justify-between">
                              <span>Toplam Varlık Gücünüz:</span>
                              <span className="text-focus-neon font-black">₺{totalPortfolioValue.toLocaleString('tr-TR')}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Q2: Hedeflerime ne kadar sürede ulaşırım */}
                    <div className="border border-white/5 rounded-xl overflow-hidden" id="faq-savings-reach">
                      <button 
                        onClick={() => setActiveFaqId(activeFaqId === 'saving_progress' ? null : 'saving_progress')}
                        className={`w-full p-3.5 text-left text-xs font-bold transition-all flex justify-between items-center hover:bg-white/[0.02] ${activeFaqId === 'saving_progress' ? 'bg-white/[0.02] text-white' : 'text-text-secondary'}`}
                      >
                        <span>Soru 2: Birikim hedeflerime ne kadar sürede ulaşırım?</span>
                        <span className={`text-xs transition-transform ${activeFaqId === 'saving_progress' ? 'rotate-90 text-focus-neon' : ''}`}>➔</span>
                      </button>
                      {activeFaqId === 'saving_progress' && (
                        <div className="p-4 bg-black/20 border-t border-white/5 text-xs space-y-3">
                          {activeSavings.length > 0 ? (
                            <>
                              <p className="text-text-secondary leading-relaxed">
                                Aylık tanımladığınız <strong>₺{monthlySavingPower.toLocaleString('tr-TR')}</strong> birikim gücü ile aktif hedeflerinizin tamamlanma süreleri:
                              </p>
                              <div className="space-y-2">
                                {activeSavings.map(s => {
                                  const remaining = Math.max(0, s.targetAmount - s.currentAmount);
                                  const monthsToReach = monthlySavingPower > 0 ? Math.ceil(remaining / (monthlySavingPower / activeSavings.length)) : Infinity;
                                  return (
                                    <div key={s.id} className="flex justify-between items-center py-1.5 border-b border-white/5">
                                      <div>
                                        <span className="text-text-primary font-bold">{s.title}</span>
                                        <span className="block text-[10px] text-text-secondary">Kalan: ₺{remaining.toLocaleString('tr-TR')}</span>
                                      </div>
                                      <span className="font-mono font-bold text-ai-bright text-xs">
                                        {monthsToReach === Infinity ? 'Hesaplanamıyor' : monthsToReach <= 0 ? 'Tamamlandı! 🎉' : `~${monthsToReach} Ay`}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <p className="text-text-secondary italic">Aktif birikim hedefiniz bulunmuyor. Yeni bir hedef ekleyerek süreyi hesaplayabilirsiniz.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Q3: Yatırımlarım beni koruyor mu */}
                    <div className="border border-white/5 rounded-xl overflow-hidden" id="faq-investment-yield">
                      <button 
                        onClick={() => setActiveFaqId(activeFaqId === 'investment_yield' ? null : 'investment_yield')}
                        className={`w-full p-3.5 text-left text-xs font-bold transition-all flex justify-between items-center hover:bg-white/[0.02] ${activeFaqId === 'investment_yield' ? 'bg-white/[0.02] text-white' : 'text-text-secondary'}`}
                      >
                        <span>Soru 3: Yatırımlarımın getirisi beni nasıl koruyor?</span>
                        <span className={`text-xs transition-transform ${activeFaqId === 'investment_yield' ? 'rotate-90 text-focus-neon' : ''}`}>➔</span>
                      </button>
                      {activeFaqId === 'investment_yield' && (
                        <div className="p-4 bg-black/20 border-t border-white/5 text-xs space-y-3">
                          <p className="text-text-secondary leading-relaxed">
                            Mevcut yatırımlarınızın kümülatif kâr/zarar ve performans rasyosu:
                          </p>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Toplam Yatırım Kâr/Zarar:</span>
                              <span className={`font-bold font-mono ${totalProfitLoss >= 0 ? 'text-focus-neon' : 'text-crit-vivid'}`}>
                                {totalProfitLoss >= 0 ? '+' : ''}₺{totalProfitLoss.toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Toplam Getiri Oranı (ROI):</span>
                              <span className={`font-bold font-mono ${totalProfitLoss >= 0 ? 'text-focus-neon' : 'text-crit-vivid'}`}>
                                {totalProfitLoss >= 0 ? '+' : ''}%{profitLossPercent.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-focus-neon/5 border border-focus-neon/10 rounded-lg text-[11px] text-text-secondary">
                            <strong className="text-text-primary block mb-1">💡 Portföy Çeşitlendirme Tavsiyesi:</strong>
                            {invCategoryData.length < 3 ? (
                              'Portföyünüzde az sayıda farklı varlık türü bulunuyor. Enflasyona karşı korunmak ve risk dengesini sağlamak için hisse senedi, altın ve yatırım fonu gibi farklı enstrümanlara sepet yapmayı düşünebilirsiniz.'
                            ) : (
                              'Güzel bir portföy çeşitliliğine sahipsiniz. Farklı varlık sınıfları (Hisse, Altın, Fon vb.) piyasa dalgalanmalarında risklerinizi azaltacaktır.'
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* RIGHT COLUMN (lg:col-span-7): Chronological 12-Month Timeline Projections */}
                <div className="lg:col-span-7 space-y-4" id="smart-analysis-right">
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                          <Calendar size={16} className="text-focus-neon" />
                          12 Aylık Kronolojik Birikim Simülasyonu & Hedef Yol Haritası
                        </h3>
                        <p className="text-[10px] text-text-secondary mt-1">
                          Aylık birikim gücünüzün hedeflerinize dağıtılmasıyla oluşan ileri tarihli projeksiyon tablosu.
                        </p>
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                      {savingsProjections.map((proj, idx) => {
                        const hasCompletedGoals = proj.goalsCompletedThisMonth.length > 0;
                        const progress = proj.simulatedProgress;

                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              hasCompletedGoals 
                                ? 'bg-focus-neon/5 border-focus-neon/20 shadow-[0_0_15px_rgba(16,185,129,0.04)]' 
                                : progress >= 100
                                ? 'bg-emerald-950/10 border-emerald-500/20'
                                : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white">{proj.monthLabel}</span>
                                {idx === 0 && <span className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-bold text-text-primary">İçinde Bulunulan Ay</span>}
                                {progress >= 100 && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold">
                                    Tüm Hedefler Tamam! 🎯
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-secondary">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-ai-bright" />
                                  Kümülatif Birikim: ₺{Math.round(proj.accumulatedTotalSaved).toLocaleString('tr-TR')}
                                </span>
                                <span className="flex items-center gap-1 font-bold text-text-primary">
                                  Varlık Değeri: ₺{Math.round(proj.accumulatedTotalPortfolio).toLocaleString('tr-TR')}
                                </span>
                              </div>

                              {/* Progress load bar for this simulated month */}
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1 max-w-xs">
                                <div 
                                  className={`h-full bg-ai-bright transition-all duration-300`} 
                                  style={{ width: `${progress}%` }} 
                                />
                              </div>
                            </div>

                            {/* Achievements & Goals completed indicators */}
                            <div className="flex flex-col items-start md:items-end justify-center gap-2 shrink-0">
                              
                              {/* Finished Goals notification badge */}
                              {hasCompletedGoals && (
                                <div className="space-y-1 w-full md:text-right">
                                  {proj.goalsCompletedThisMonth.map((title, gIdx) => (
                                    <span 
                                      key={gIdx} 
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-focus-neon text-black font-black text-[10px] shadow-sm animate-pulse"
                                    >
                                      🎉 {title} Tamamlandı!
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Simulated month status text */}
                              {!hasCompletedGoals && (
                                <span className="text-[10px] text-text-secondary/60 italic block text-right">
                                  Birikimler istikrarlı büyüyor
                                </span>
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

      {/* Investment Wizard Modal */}
      <AnimatePresence>
        {isInvWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-display font-bold text-text-primary">Yeni Yatırım Ekle</h2>
                <button 
                  onClick={() => setIsInvWizardOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-text-secondary hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Varlık Adı / Kodu</label>
                      <input 
                        type="text" 
                        name="title"
                        placeholder="Örn: THYAO, Bitcoin, Gram Altın"
                        value={invFormData.title || ''}
                        onChange={handleInvChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Platform / Aracı Kurum</label>
                      <input 
                        type="text" 
                        name="platform"
                        placeholder="Örn: Midas, Binance, Akbank"
                        value={invFormData.platform || ''}
                        onChange={handleInvChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Yatırılan Ana Para (₺)</label>
                      <input 
                        type="number" 
                        name="initialAmount"
                        placeholder="0.00"
                        value={invFormData.initialAmount || ''}
                        onChange={handleInvChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Güncel Değer (₺) - Opsiyonel</label>
                      <input 
                        type="number" 
                        name="currentAmount"
                        placeholder="0.00"
                        value={invFormData.currentAmount || ''}
                        onChange={handleInvChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Yatırım Türü</label>
                      <select 
                        name="type"
                        value={invFormData.type || ''}
                        onChange={handleInvChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors appearance-none"
                      >
                        <option value="Hisse Senedi">Hisse Senedi</option>
                        <option value="Kripto">Kripto Para</option>
                        <option value="Döviz">Döviz</option>
                        <option value="Altın">Altın / Gümüş</option>
                        <option value="Yatırım Fonu">Yatırım Fonu</option>
                        <option value="Mevduat">Mevduat / Faiz</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Alım / Başlangıç Tarihi</label>
                      <input 
                        type="date" 
                        name="purchaseDate"
                        value={invFormData.purchaseDate || ''}
                        onChange={handleInvChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button 
                  onClick={() => setIsInvWizardOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={() => {
                    if(invFormData.title && invFormData.initialAmount && invFormData.purchaseDate) {
                      setInvestments(prev => [{ 
                        ...invFormData, 
                        id: Date.now().toString(), 
                        status: 'Aktif',
                        currentAmount: invFormData.currentAmount || invFormData.initialAmount
                      } as Investment, ...prev]);
                      setIsInvWizardOpen(false);
                      setInvFormData({ status: 'Aktif', type: 'Hisse Senedi' });
                    }
                  }}
                  className="px-6 py-3 bg-focus-neon text-black rounded-xl text-sm font-bold hover:bg-focus-neon/90 transition-colors"
                >
                  Yatırımı Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Saving Wizard Modal */}
      <AnimatePresence>
        {isSavWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-display font-bold text-text-primary">Yeni Birikim Hedefi Ekle</h2>
                <button 
                  onClick={() => setIsSavWizardOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-text-secondary hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Hedef Adı</label>
                      <input 
                        type="text" 
                        name="title"
                        placeholder="Örn: Acil Durum Fonu, Araba Peşinatı"
                        value={savFormData.title || ''}
                        onChange={handleSavChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-ai-bright/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Kategori</label>
                      <select 
                        name="category"
                        value={savFormData.category || ''}
                        onChange={handleSavChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ai-bright/50 transition-colors appearance-none"
                      >
                        <option value="Genel">Genel</option>
                        <option value="Güvenlik">Güvenlik / Acil Durum</option>
                        <option value="Ev/Araç">Ev / Araç</option>
                        <option value="Tatil">Tatil</option>
                        <option value="Elektronik">Elektronik</option>
                        <option value="Eğitim">Eğitim</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Hedeflenen Tutar (₺)</label>
                      <input 
                        type="number" 
                        name="targetAmount"
                        placeholder="0.00"
                        value={savFormData.targetAmount || ''}
                        onChange={handleSavChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-ai-bright/50 transition-colors font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Şu Anki Birikim (₺)</label>
                      <input 
                        type="number" 
                        name="currentAmount"
                        placeholder="0.00"
                        value={savFormData.currentAmount || ''}
                        onChange={handleSavChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-ai-bright/50 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Hedef Tarihi</label>
                      <input 
                        type="date" 
                        name="deadline"
                        value={savFormData.deadline || ''}
                        onChange={handleSavChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-ai-bright/50 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button 
                  onClick={() => setIsSavWizardOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={() => {
                    if(savFormData.title && savFormData.targetAmount && savFormData.deadline) {
                      setSavings(prev => [{ 
                        ...savFormData, 
                        id: Date.now().toString(), 
                        status: 'Devam Ediyor',
                        currentAmount: savFormData.currentAmount || 0
                      } as SavingGoal, ...prev]);
                      setIsSavWizardOpen(false);
                      setSavFormData({ status: 'Devam Ediyor', category: 'Genel' });
                    }
                  }}
                  className="px-6 py-3 bg-ai-bright text-black rounded-xl text-sm font-bold hover:bg-ai-bright/90 transition-colors"
                >
                  Hedefi Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Modal */}
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
              <p className="text-4xl font-display font-black text-text-primary mb-4">
                {summaryModal.value}
              </p>
              
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {summaryModal.type.startsWith('inv') ? (
                    investments.filter(i => {
                      if (summaryModal.type === 'inv-total') return i.status === 'Aktif';
                      if (summaryModal.type === 'inv-profit') return i.status === 'Aktif';
                      if (summaryModal.type === 'inv-category') return i.status === 'Aktif' && i.type === summaryModal.value;
                      return false;
                    }).map(inv => {
                      const pLoss = inv.currentAmount - inv.initialAmount;
                      return (
                      <div key={inv.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{inv.title}</p>
                          <p className="text-[10px] text-text-secondary">{inv.type}</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-mono font-bold text-text-primary">₺{inv.currentAmount.toLocaleString('tr-TR')}</span>
                          {summaryModal.type === 'inv-profit' && (
                             <span className={`block text-[10px] font-mono font-bold ${pLoss >= 0 ? 'text-focus-neon' : 'text-crit-vivid'}`}>
                               {pLoss >= 0 ? '+' : ''}₺{pLoss.toLocaleString('tr-TR')}
                             </span>
                          )}
                        </div>
                      </div>
                    )})
                  ) : (
                    savings.filter(s => {
                      if (summaryModal.type === 'sav-total') return s.status === 'Devam Ediyor';
                      return false;
                    }).map(sav => (
                      <div key={sav.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{sav.title}</p>
                          <p className="text-[10px] text-text-secondary">Hedef: ₺{sav.targetAmount.toLocaleString('tr-TR')}</p>
                        </div>
                        <span className="text-sm font-mono font-bold text-ai-bright">₺{sav.currentAmount.toLocaleString('tr-TR')}</span>
                      </div>
                    ))
                  )}

                  {((summaryModal.type.startsWith('inv') && investments.filter(i => {
                      if (summaryModal.type === 'inv-total') return i.status === 'Aktif';
                      if (summaryModal.type === 'inv-profit') return i.status === 'Aktif';
                      if (summaryModal.type === 'inv-category') return i.status === 'Aktif' && i.type === summaryModal.value;
                      return false;
                    }).length === 0) || 
                    (summaryModal.type.startsWith('sav') && savings.filter(s => {
                      if (summaryModal.type === 'sav-total') return s.status === 'Devam Ediyor';
                      return false;
                    }).length === 0)) && (
                      <p className="text-xs text-text-secondary text-center py-4">Kayıt bulunamadı.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                 <button onClick={() => setSummaryModal(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors">
                   Kapat
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
