import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  CreditCard,
  Calendar,
  MoreVertical,
  X,
  AlertCircle,
  Repeat,
  PieChart as PieChartIcon
} from 'lucide-react';

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

const MOCK_SUBSCRIPTIONS: Subscription[] = [];

const MOCK_DEBTS: Debt[] = [];

const POPULAR_SUBSCRIPTIONS = [
  { title: 'Netflix Premium', category: 'Eğlence', amount: 200, platform: 'Netflix' },
  { title: 'Spotify Premium', category: 'Eğlence', amount: 60, platform: 'Spotify' },
  { title: 'YouTube Premium', category: 'Eğlence', amount: 58, platform: 'YouTube' },
  { title: 'Amazon Prime', category: 'Alışveriş', amount: 40, platform: 'Amazon' },
  { title: 'Adobe Creative Cloud', category: 'Yazılım', amount: 850, platform: 'Adobe' },
  { title: 'ChatGPT Plus', category: 'Yazılım', amount: 600, platform: 'OpenAI' },
  { title: 'Apple Music', category: 'Eğlence', amount: 40, platform: 'Apple' },
  { title: 'Disney+', category: 'Eğlence', amount: 135, platform: 'Disney' }
];

export const FinanceSubscriptions = () => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'debts'>('subscriptions');
  
  // Subscriptions State
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('finance_subscriptions', MOCK_SUBSCRIPTIONS);
  const [subSearch, setSubSearch] = useState('');
  const [isSubWizardOpen, setIsSubWizardOpen] = useState(false);
  const [subFormData, setSubFormData] = useState<Partial<Subscription>>({
    billingCycle: 'Aylık',
    status: 'Aktif'
  });
  const [subSuggestions, setSubSuggestions] = useState(POPULAR_SUBSCRIPTIONS);
  const [showSubSuggestions, setShowSubSuggestions] = useState(false);
  
  // Debts State
  const [debts, setDebts] = useLocalStorage<Debt[]>('finance_debts', MOCK_DEBTS);
  const [debtSearch, setDebtSearch] = useState('');
  const [isDebtWizardOpen, setIsDebtWizardOpen] = useState(false);
  const [debtFormData, setDebtFormData] = useState<Partial<Debt>>({
    status: 'Devam Ediyor', paymentFrequency: 'Aylık'
  });
  const [calculatedMonths, setCalculatedMonths] = useState<number | null>(null);

  // Handlers for wizards
  const handleSubTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubFormData(prev => ({ ...prev, title: value, platform: value }));
    if (value.trim()) {
      const filtered = POPULAR_SUBSCRIPTIONS.filter(s => (s.title || '').toLowerCase().includes((value || '').toLowerCase()) || (s.platform || '').toLowerCase().includes((value || '').toLowerCase()));
      setSubSuggestions(filtered);
      setShowSubSuggestions(true);
    } else {
      setSubSuggestions(POPULAR_SUBSCRIPTIONS);
      setShowSubSuggestions(false);
    }
  };

  const selectSubSuggestion = (suggestion: typeof POPULAR_SUBSCRIPTIONS[0]) => {
    setSubFormData(prev => ({
      ...prev,
      title: suggestion.title,
      platform: suggestion.platform,
      category: suggestion.category,
      amount: suggestion.amount
    }));
    setShowSubSuggestions(false);
  };

  const handleDebtCalculation = () => {
    if (debtFormData.remainingAmount && debtFormData.paymentAmount && debtFormData.paymentAmount > 0) {
      setCalculatedMonths(Math.ceil(debtFormData.remainingAmount / debtFormData.paymentAmount));
    } else {
      setCalculatedMonths(null);
    }
  };

  const handleDebtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDebtFormData(prev => ({ ...prev, [name]: name.includes('Amount') || name === 'paymentAmount' ? Number(value) : value }));
  };

  const calculateRemainingFromMonths = (months: number) => {
    if (debtFormData.remainingAmount && months > 0) {
      setDebtFormData(prev => ({ ...prev, paymentAmount: Math.ceil(debtFormData.remainingAmount! / months) }));
      setCalculatedMonths(months);
    }
  };

  // Modals
  const [summaryModal, setSummaryModal] = useState<{title: string; value: string; type: string} | null>(null);

  // Calculations: Subscriptions
  const monthlySubs = useMemo(() => subscriptions.filter(s => s.status === 'Aktif' && s.billingCycle === 'Aylık'), [subscriptions]);
  const totalMonthlySubs = monthlySubs.reduce((acc, curr) => acc + curr.amount, 0);
  const yearlySubs = useMemo(() => subscriptions.filter(s => s.status === 'Aktif' && s.billingCycle === 'Yıllık'), [subscriptions]);
  const totalYearlySubs = yearlySubs.reduce((acc, curr) => acc + curr.amount, 0);
  
  const upcomingSubs = useMemo(() => {
    const today = new Date('2026-07-01'); // Using a fixed date for context
    return subscriptions.filter(s => s.status === 'Aktif' && (new Date(s.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7);
  }, [subscriptions]);

  const subCategoryData = useMemo(() => {
    const data = subscriptions.filter(s => s.status === 'Aktif').reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  // Calculations: Debts
  const activeDebts = useMemo(() => debts.filter(d => d.status === 'Devam Ediyor'), [debts]);
  const totalRemainingDebt = activeDebts.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const totalMonthlyDebtPayment = activeDebts.reduce((acc, curr) => {
    let monthly = curr.paymentAmount;
    if (curr.paymentFrequency === 'Haftalık') monthly = curr.paymentAmount * 4;
    if (curr.paymentFrequency === 'Yıllık') monthly = curr.paymentAmount / 12;
    return acc + monthly;
  }, 0);

  const upcomingDebts = useMemo(() => {
    const today = new Date('2026-07-01');
    return activeDebts.filter(d => (new Date(d.nextPaymentDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7);
  }, [activeDebts]);

  const debtCategoryData = useMemo(() => {
    const data = activeDebts.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.remainingAmount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [activeDebts]);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Abonelik ve Borçlarım</h1>
          <p className="text-text-secondary">Düzenli ödemelerinizi ve borç durumunuzu görün.</p>
        </div>
        <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'subscriptions' ? 'bg-focus-neon/10 text-focus-neon' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Abonelikler
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'debts' ? 'bg-crit-vivid/10 text-crit-vivid' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Borçlar
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
          {activeTab === 'subscriptions' && (
            <>
              {/* Subscription Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setSummaryModal({
                    title: 'Aylık Abonelik', 
                    value: `₺${totalMonthlySubs.toLocaleString('tr-TR')}`, 
                    type: 'sub-monthly'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-focus-neon/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-focus-neon/10 rounded-lg text-focus-neon group-hover:scale-110 transition-transform">
                      <Repeat size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Aylık Abonelikler</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    ₺{totalMonthlySubs.toLocaleString('tr-TR')}
                  </p>
                </div>

                <div 
                  onClick={() => setSummaryModal({
                    title: 'Yıllık Abonelik', 
                    value: `₺${totalYearlySubs.toLocaleString('tr-TR')}`, 
                    type: 'sub-yearly'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-nrg-sun/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun group-hover:scale-110 transition-transform">
                      <Calendar size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Yıllık Abonelikler</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    ₺{totalYearlySubs.toLocaleString('tr-TR')}
                  </p>
                </div>

                <div 
                  onClick={() => setSummaryModal({
                    title: 'Yaklaşan Ödemeler', 
                    value: upcomingSubs.length.toString(), 
                    type: 'sub-upcoming'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-crit-vivid/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-crit-vivid/10 rounded-lg text-crit-vivid group-hover:scale-110 transition-transform">
                      <AlertCircle size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Yaklaşan Ödemeler (7 Gün)</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    {upcomingSubs.length} <span className="text-sm text-text-secondary font-sans font-normal">adet</span>
                  </p>
                </div>

                <div 
                  onClick={() => setSummaryModal({
                    title: 'En Yüksek Kategori', 
                    value: subCategoryData.length > 0 ? subCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-', 
                    type: 'sub-category'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-ai-bright/10 rounded-lg text-ai-bright group-hover:scale-110 transition-transform">
                      <PieChartIcon size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">En Yüksek Kategori</h3>
                  <p className="text-2xl font-display font-bold text-text-primary">
                    {subCategoryData.length > 0 ? subCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-'}
                  </p>
                </div>
              </div>

              {/* Subscriptions List */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <h2 className="text-xl font-display font-bold text-text-primary">Tüm Abonelikler</h2>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="text"
                        placeholder="Abonelik ara..."
                        value={subSearch}
                        onChange={(e) => setSubSearch(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors"
                      />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
                      <Filter size={18} />
                    </button>
                    <button 
                      onClick={() => setIsSubWizardOpen(true)}
                      className="flex items-center gap-2 bg-focus-neon text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-focus-neon/90 transition-colors"
                    >
                      <Plus size={18} />
                      <span className="hidden md:inline">Yeni Ekle</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-sm text-text-secondary">
                        <th className="pb-3 font-medium">Abonelik / Platform</th>
                        <th className="pb-3 font-medium">Kategori</th>
                        <th className="pb-3 font-medium">Sonraki Ödeme</th>
                        <th className="pb-3 font-medium">Döngü</th>
                        <th className="pb-3 font-medium">Tutar</th>
                        <th className="pb-3 font-medium">Durum</th>
                        <th className="pb-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {subscriptions
                        .filter(s => (s.title || '').toLowerCase().includes((subSearch || '').toLowerCase()) || (s.platform || '').toLowerCase().includes((subSearch || '').toLowerCase()))
                        .map((sub) => (
                        <tr key={sub.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-text-primary">{sub.title}</span>
                              <span className="text-xs text-text-secondary">{sub.platform}</span>
                            </div>
                          </td>
                          <td className="py-4 text-text-secondary">{sub.category}</td>
                          <td className="py-4 text-text-secondary">{new Date(sub.nextBillingDate).toLocaleDateString('tr-TR')}</td>
                          <td className="py-4 text-text-secondary">{sub.billingCycle}</td>
                          <td className="py-4">
                            <span className="font-mono font-medium text-text-primary">₺{sub.amount.toLocaleString('tr-TR')}</span>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              sub.status === 'Aktif' ? 'bg-focus-neon/10 text-focus-neon' :
                              'bg-text-secondary/10 text-text-secondary'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="p-2 text-text-secondary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {subscriptions.length === 0 && (
                    <div className="text-center py-12 text-text-secondary">
                      Gösterilecek abonelik bulunamadı.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'debts' && (
            <>
              {/* Debt Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setSummaryModal({
                    title: 'Toplam Kalan Borç', 
                    value: `₺${totalRemainingDebt.toLocaleString('tr-TR')}`, 
                    type: 'debt-total'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-crit-vivid/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-crit-vivid/10 rounded-lg text-crit-vivid group-hover:scale-110 transition-transform">
                      <CreditCard size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Toplam Kalan Borç</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    ₺{totalRemainingDebt.toLocaleString('tr-TR')}
                  </p>
                </div>

                <div 
                  onClick={() => setSummaryModal({
                    title: 'Aylık Ödeme', 
                    value: `₺${totalMonthlyDebtPayment.toLocaleString('tr-TR')}`, 
                    type: 'debt-monthly'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-nrg-sun/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun group-hover:scale-110 transition-transform">
                      <Calendar size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Aylık Toplam Ödeme</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    ₺{totalMonthlyDebtPayment.toLocaleString('tr-TR')}
                  </p>
                </div>

                <div 
                  onClick={() => setSummaryModal({
                    title: 'Yaklaşan Taksitler', 
                    value: upcomingDebts.length.toString(), 
                    type: 'debt-upcoming'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-focus-neon/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-focus-neon/10 rounded-lg text-focus-neon group-hover:scale-110 transition-transform">
                      <AlertCircle size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Yaklaşan Taksitler (7 Gün)</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    {upcomingDebts.length} <span className="text-sm text-text-secondary font-sans font-normal">adet</span>
                  </p>
                </div>

                <div 
                  onClick={() => setSummaryModal({
                    title: 'En Yüksek Borç', 
                    value: debtCategoryData.length > 0 ? debtCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-', 
                    type: 'debt-category'
                  })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-ai-bright/10 rounded-lg text-ai-bright group-hover:scale-110 transition-transform">
                      <PieChartIcon size={20} />
                    </div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">En Yüksek Kategori</h3>
                  <p className="text-2xl font-display font-bold text-text-primary">
                    {debtCategoryData.length > 0 ? debtCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-'}
                  </p>
                </div>
              </div>

              {/* Debts List */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <h2 className="text-xl font-display font-bold text-text-primary">Tüm Borçlar</h2>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="text"
                        placeholder="Borç ara..."
                        value={debtSearch}
                        onChange={(e) => setDebtSearch(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors"
                      />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
                      <Filter size={18} />
                    </button>
                    <button 
                      onClick={() => setIsDebtWizardOpen(true)}
                      className="flex items-center gap-2 bg-crit-vivid text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-crit-vivid/90 transition-colors"
                    >
                      <Plus size={18} />
                      <span className="hidden md:inline">Yeni Borç Ekle</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-sm text-text-secondary">
                        <th className="pb-3 font-medium">Borç / Kurum</th>
                        <th className="pb-3 font-medium">Kategori</th>
                        <th className="pb-3 font-medium">Sonraki Taksit</th>
                        <th className="pb-3 font-medium">Kalan Borç</th>
                        <th className="pb-3 font-medium">Taksit Tutarı</th>
                        <th className="pb-3 font-medium">Durum</th>
                        <th className="pb-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {debts
                        .filter(d => (d.title || '').toLowerCase().includes((debtSearch || '').toLowerCase()) || (d.lender || '').toLowerCase().includes((debtSearch || '').toLowerCase()))
                        .map((debt) => (
                        <tr key={debt.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-text-primary">{debt.title}</span>
                              <span className="text-xs text-text-secondary">{debt.lender}</span>
                            </div>
                          </td>
                          <td className="py-4 text-text-secondary">{debt.category}</td>
                          <td className="py-4 text-text-secondary">{new Date(debt.nextPaymentDate).toLocaleDateString('tr-TR')}</td>
                          <td className="py-4">
                            <span className="font-mono font-medium text-text-primary">₺{debt.remainingAmount.toLocaleString('tr-TR')}</span>
                            <span className="text-[10px] text-text-secondary ml-2 block">/ ₺{debt.totalAmount.toLocaleString('tr-TR')}</span>
                          </td>
                          <td className="py-4">
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-medium text-crit-vivid">₺{debt.paymentAmount.toLocaleString('tr-TR')}</span>
                            <span className="text-[10px] text-text-secondary">{debt.paymentFrequency}</span>
                          </div>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              debt.status === 'Devam Ediyor' ? 'bg-nrg-sun/10 text-nrg-sun' :
                              'bg-focus-neon/10 text-focus-neon'
                            }`}>
                              {debt.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="p-2 text-text-secondary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {debts.length === 0 && (
                    <div className="text-center py-12 text-text-secondary">
                      Gösterilecek borç bulunamadı.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sub Wizard Modal */}
      <AnimatePresence>
        {isSubWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-display font-bold text-text-primary">Yeni Abonelik Ekle</h2>
                <button 
                  onClick={() => setIsSubWizardOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-text-secondary hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-bold text-text-secondary mb-2">Abonelik Adı veya Platform</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Netflix, Spotify..."
                      value={subFormData.title || ''}
                      onChange={handleSubTitleChange}
                      onFocus={() => setShowSubSuggestions(true)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors"
                    />
                    {showSubSuggestions && subSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-neutral-800 border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                        {subSuggestions.map((s, i) => (
                          <div 
                            key={i} 
                            onClick={() => selectSubSuggestion(s)}
                            className="px-4 py-3 border-b border-white/5 hover:bg-white/[0.04] cursor-pointer flex justify-between items-center transition-colors last:border-0"
                          >
                            <div>
                              <p className="text-sm font-bold text-white">{s.title}</p>
                              <p className="text-[10px] text-text-secondary">{s.category}</p>
                            </div>
                            <span className="text-sm font-mono text-focus-neon">₺{s.amount.toLocaleString('tr-TR')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Aylık Tutar (₺)</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={subFormData.amount || ''}
                        onChange={(e) => setSubFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Kategori</label>
                      <select 
                        value={subFormData.category || ''}
                        onChange={(e) => setSubFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors appearance-none"
                      >
                        <option value="">Seçiniz...</option>
                        <option value="Eğlence">Eğlence (Netflix, Spotify vb.)</option>
                        <option value="Yazılım">Yazılım (Adobe, AI vb.)</option>
                        <option value="Altyapı">Altyapı (Hosting, Domain)</option>
                        <option value="Alışveriş">Alışveriş (Prime vb.)</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Döngü</label>
                      <select 
                        value={subFormData.billingCycle || 'Aylık'}
                        onChange={(e) => setSubFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors appearance-none"
                      >
                        <option value="Haftalık">Haftalık</option>
                        <option value="Aylık">Aylık</option>
                        <option value="Yıllık">Yıllık</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">İlk / Sonraki Ödeme Tarihi</label>
                      <input 
                        type="date" 
                        value={subFormData.nextBillingDate || ''}
                        onChange={(e) => setSubFormData(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button 
                  onClick={() => setIsSubWizardOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={() => {
                    if(subFormData.title && subFormData.amount && subFormData.nextBillingDate) {
                      setSubscriptions(prev => [{ ...subFormData, id: Date.now().toString(), status: 'Aktif' } as Subscription, ...prev]);
                      setIsSubWizardOpen(false);
                      setSubFormData({ billingCycle: 'Aylık', status: 'Aktif' });
                    }
                  }}
                  className="px-6 py-3 bg-focus-neon text-black rounded-xl text-sm font-bold hover:bg-focus-neon/90 transition-colors"
                >
                  Aboneliği Başlat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Debt Wizard Modal */}
      <AnimatePresence>
        {isDebtWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-display font-bold text-text-primary">Yeni Borç / Kredi Ekle</h2>
                <button 
                  onClick={() => setIsDebtWizardOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-text-secondary hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Borç Adı / Tanımı</label>
                      <input 
                        type="text" 
                        name="title"
                        placeholder="Örn: İhtiyaç Kredisi"
                        value={debtFormData.title || ''}
                        onChange={handleDebtChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Kurum / Banka</label>
                      <input 
                        type="text" 
                        name="lender"
                        placeholder="Örn: Garanti, Apple..."
                        value={debtFormData.lender || ''}
                        onChange={handleDebtChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Toplam Borç (Opsiyonel)</label>
                      <input 
                        type="number" 
                        name="totalAmount"
                        placeholder="0.00"
                        value={debtFormData.totalAmount || ''}
                        onChange={handleDebtChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Kalan Borç (₺)</label>
                      <input 
                        type="number" 
                        name="remainingAmount"
                        placeholder="0.00"
                        value={debtFormData.remainingAmount || ''}
                        onChange={handleDebtChange}
                        onBlur={handleDebtCalculation}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-crit-vivid/50 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-white">Ödeme Planı Hesaplayıcı</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Taksit Tutarı</label>
                        <input 
                          type="number" 
                          name="paymentAmount"
                          placeholder="0.00"
                          value={debtFormData.paymentAmount || ''}
                          onChange={handleDebtChange}
                          onBlur={handleDebtCalculation}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-crit-vivid font-mono focus:outline-none focus:border-crit-vivid/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Taksit Sayısı (Ay)</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={calculatedMonths || ''}
                          onChange={(e) => calculateRemainingFromMonths(Number(e.target.value))}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-crit-vivid/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Ödeme Sıklığı</label>
                        <select 
                          name="paymentFrequency"
                          value={debtFormData.paymentFrequency || 'Aylık'}
                          onChange={(e) => setDebtFormData({...debtFormData, paymentFrequency: e.target.value as any})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-crit-vivid/50 transition-colors appearance-none"
                        >
                          <option value="Haftalık">Haftalık</option>
                          <option value="Aylık">Aylık</option>
                          <option value="Yıllık">Yıllık</option>
                        </select>
                      </div>
                    </div>
                    {calculatedMonths && debtFormData.paymentFrequency === 'Aylık' && (
                      <p className="text-xs text-text-secondary">
                        <span className="text-crit-vivid font-bold">{calculatedMonths} ay</span> boyunca aylık <span className="font-mono">₺{debtFormData.paymentAmount?.toLocaleString('tr-TR')}</span> ödeme yapılacaktır.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Kategori</label>
                      <select 
                        name="category"
                        value={debtFormData.category || ''}
                        onChange={(e) => setDebtFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crit-vivid/50 transition-colors appearance-none"
                      >
                        <option value="">Seçiniz...</option>
                        <option value="Kredi">Banka Kredisi</option>
                        <option value="Kredi Kartı">Kredi Kartı</option>
                        <option value="Taksit">Mağaza Taksiti (Telefon vb.)</option>
                        <option value="Elden Borç">Elden Borç</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">İlk / Sonraki Ödeme Tarihi</label>
                      <input 
                        type="date" 
                        name="nextPaymentDate"
                        value={debtFormData.nextPaymentDate || ''}
                        onChange={handleDebtChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-crit-vivid/50 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button 
                  onClick={() => setIsDebtWizardOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={() => {
                    if(debtFormData.title && debtFormData.remainingAmount && debtFormData.nextPaymentDate) {
                      setDebts(prev => [{ 
                        ...debtFormData, 
                        id: Date.now().toString(), 
                        status: 'Devam Ediyor',
                        totalAmount: debtFormData.totalAmount || debtFormData.remainingAmount
                      } as Debt, ...prev]);
                      setIsDebtWizardOpen(false);
                      setDebtFormData({ status: 'Devam Ediyor' });
                      setCalculatedMonths(null);
                    }
                  }}
                  className="px-6 py-3 bg-crit-vivid text-black rounded-xl text-sm font-bold hover:bg-crit-vivid/90 transition-colors"
                >
                  Borcu Kaydet
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
                {/* Dynamically list based on modal type */}
                <div className="space-y-3">
                  {summaryModal.type.startsWith('sub') ? (
                    subscriptions.filter(s => {
                      if (summaryModal.type === 'sub-monthly') return s.status === 'Aktif' && s.billingCycle === 'Aylık';
                      if (summaryModal.type === 'sub-yearly') return s.status === 'Aktif' && s.billingCycle === 'Yıllık';
                      if (summaryModal.type === 'sub-upcoming') {
                         const today = new Date('2026-07-01');
                         return s.status === 'Aktif' && (new Date(s.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7;
                      }
                      if (summaryModal.type === 'sub-category') return s.status === 'Aktif' && s.category === summaryModal.value;
                      return false;
                    }).map(sub => (
                      <div key={sub.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{sub.title}</p>
                          <p className="text-[10px] text-text-secondary">{new Date(sub.nextBillingDate).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <span className="text-sm font-mono font-bold text-focus-neon">₺{sub.amount.toLocaleString('tr-TR')}</span>
                      </div>
                    ))
                  ) : (
                    debts.filter(d => {
                      if (summaryModal.type === 'debt-total') return d.status === 'Devam Ediyor';
                      if (summaryModal.type === 'debt-monthly') return d.status === 'Devam Ediyor';
                      if (summaryModal.type === 'debt-upcoming') {
                         const today = new Date('2026-07-01');
                         return d.status === 'Devam Ediyor' && (new Date(d.nextPaymentDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7;
                      }
                      if (summaryModal.type === 'debt-category') return d.status === 'Devam Ediyor' && d.category === summaryModal.value;
                      return false;
                    }).map(debt => (
                      <div key={debt.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{debt.title}</p>
                          <p className="text-[10px] text-text-secondary">{new Date(debt.nextPaymentDate).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold text-crit-vivid">₺{summaryModal.type === 'debt-monthly' ? debt.paymentAmount.toLocaleString('tr-TR') : debt.remainingAmount.toLocaleString('tr-TR')}</p>
                          {summaryModal.type !== 'debt-monthly' && <p className="text-[10px] text-text-secondary">{debt.paymentFrequency}: ₺{debt.paymentAmount.toLocaleString('tr-TR')}</p>}
                        </div>
                      </div>
                    ))
                  )}

                  {((summaryModal.type.startsWith('sub') && subscriptions.filter(s => {
                      if (summaryModal.type === 'sub-monthly') return s.status === 'Aktif' && s.billingCycle === 'Aylık';
                      if (summaryModal.type === 'sub-yearly') return s.status === 'Aktif' && s.billingCycle === 'Yıllık';
                      if (summaryModal.type === 'sub-upcoming') {
                         const today = new Date('2026-07-01');
                         return s.status === 'Aktif' && (new Date(s.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7;
                      }
                      if (summaryModal.type === 'sub-category') return s.status === 'Aktif' && s.category === summaryModal.value;
                      return false;
                    }).length === 0) || 
                    (summaryModal.type.startsWith('debt') && debts.filter(d => {
                      if (summaryModal.type === 'debt-total') return d.status === 'Devam Ediyor';
                      if (summaryModal.type === 'debt-monthly') return d.status === 'Devam Ediyor';
                      if (summaryModal.type === 'debt-upcoming') {
                         const today = new Date('2026-07-01');
                         return d.status === 'Devam Ediyor' && (new Date(d.nextPaymentDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7;
                      }
                      if (summaryModal.type === 'debt-category') return d.status === 'Devam Ediyor' && d.category === summaryModal.value;
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
