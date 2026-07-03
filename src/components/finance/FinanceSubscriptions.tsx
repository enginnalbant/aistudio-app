import React, { useState, useMemo, useEffect } from 'react';
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
  PieChart as PieChartIcon,
  Edit3,
  Trash2,
  Wallet,
  Building,
  RefreshCw,
  CheckCircle2,
  XCircle
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
  type?: string; 
  paymentMethod?: string;
  billingInfo?: string;
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
  accountLimit?: number; 
  paidThisMonth?: boolean;
}

const POPULAR_SUBSCRIPTIONS = [
  { title: 'Netflix', category: 'Eğlence', amount: 200, platform: 'Netflix', type: 'Premium' },
  { title: 'Spotify', category: 'Eğlence', amount: 60, platform: 'Spotify', type: 'Bireysel' },
  { title: 'YouTube Premium', category: 'Eğlence', amount: 58, platform: 'YouTube', type: 'Bireysel' },
  { title: 'Amazon Prime', category: 'Alışveriş', amount: 40, platform: 'Amazon', type: 'Standart' },
  { title: 'Adobe Creative Cloud', category: 'Yazılım', amount: 850, platform: 'Adobe', type: 'Tüm Uygulamalar' }
];

export const FinanceSubscriptions = () => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'debts'>('subscriptions');
  
  // Subscriptions State
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('finance_subscriptions', []);
  const [subSearch, setSubSearch] = useState('');
  const [isSubWizardOpen, setIsSubWizardOpen] = useState(false);
  const [subFormData, setSubFormData] = useState<Partial<Subscription>>({
    billingCycle: 'Aylık',
    status: 'Aktif',
    type: 'Standart',
    paymentMethod: ''
  });
  const [subSuggestions, setSubSuggestions] = useState(POPULAR_SUBSCRIPTIONS);
  const [showSubSuggestions, setShowSubSuggestions] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  
  // Debts State
  const [debts, setDebts] = useLocalStorage<Debt[]>('finance_debts', []);
  const [debtSearch, setDebtSearch] = useState('');
  const [isDebtWizardOpen, setIsDebtWizardOpen] = useState(false);
  const [debtFormData, setDebtFormData] = useState<Partial<Debt>>({
    status: 'Devam Ediyor', paymentFrequency: 'Aylık', category: 'İhtiyaç Kredisi'
  });
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  
  // Modals
  const [summaryModal, setSummaryModal] = useState<{title: string; value: string; type: string} | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Sub Handlers
  const handleSubTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubFormData(prev => ({ ...prev, title: value, platform: value }));
    if (value.trim()) {
      const filtered = POPULAR_SUBSCRIPTIONS.filter(s => (s.title || '').toLowerCase().includes((value || '').toLowerCase()));
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
      amount: suggestion.amount,
      type: suggestion.type
    }));
    setShowSubSuggestions(false);
  };

  const openSubWizard = (sub?: Subscription) => {
    if (sub) {
      setSubFormData(sub);
      setEditingSubId(sub.id);
    } else {
      setSubFormData({ billingCycle: 'Aylık', status: 'Aktif', type: 'Standart' });
      setEditingSubId(null);
    }
    setIsSubWizardOpen(true);
    setActionMenuId(null);
  };

  const saveSubscription = () => {
    if(subFormData.title && subFormData.amount && subFormData.nextBillingDate) {
      if (editingSubId) {
        setSubscriptions(prev => prev.map(s => s.id === editingSubId ? { ...s, ...subFormData } as Subscription : s));
      } else {
        setSubscriptions(prev => [{ ...subFormData, id: Date.now().toString(), status: 'Aktif' } as Subscription, ...prev]);
      }
      setIsSubWizardOpen(false);
    }
  };

  const deleteSubscription = (id: string) => {
    if(confirm('Aboneliği silmek istediğinize emin misiniz?')) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      setActionMenuId(null);
    }
  };

  // Debt Auto-Calculations
  useEffect(() => {
    if (debtFormData.category && ['Kredi Kartı', 'Esnek Hesap (KMH)'].includes(debtFormData.category)) {
      // Don't auto-calculate installments for revolving credit
      return;
    }

    const t = debtFormData.totalAmount || 0;
    const p = debtFormData.paymentAmount || 0;
    const i = debtFormData.installments || 0;

    // Logic to calculate missing value if other two are present
    // Only apply if user is actively changing one
    // Actually, simple derivation on blur is better to prevent locking inputs.
  }, [debtFormData.totalAmount, debtFormData.paymentAmount, debtFormData.installments, debtFormData.category]);

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

  const openDebtWizard = (debt?: Debt) => {
    if (debt) {
      setDebtFormData(debt);
      setEditingDebtId(debt.id);
    } else {
      setDebtFormData({ status: 'Devam Ediyor', paymentFrequency: 'Aylık', category: 'İhtiyaç Kredisi' });
      setEditingDebtId(null);
    }
    setIsDebtWizardOpen(true);
    setActionMenuId(null);
  };

  const saveDebt = () => {
    if(debtFormData.title && (debtFormData.remainingAmount !== undefined || debtFormData.totalAmount !== undefined)) {
      const remainingAmount = Number(debtFormData.remainingAmount !== undefined ? debtFormData.remainingAmount : debtFormData.totalAmount);
      const totalAmount = Number(debtFormData.totalAmount !== undefined ? debtFormData.totalAmount : remainingAmount);
      const paymentAmount = Number(debtFormData.paymentAmount || 0);
      const installments = debtFormData.installments ? Number(debtFormData.installments) : undefined;
      const paidInstallments = debtFormData.paidInstallments ? Number(debtFormData.paidInstallments) : undefined;
      
      const updatedData = {
        ...debtFormData,
        remainingAmount,
        totalAmount,
        paymentAmount,
        installments,
        paidInstallments
      };

      if (editingDebtId) {
        setDebts(prev => prev.map(d => d.id === editingDebtId ? { ...d, ...updatedData } as Debt : d));
      } else {
        setDebts(prev => [{ 
          ...updatedData, 
          id: Date.now().toString(), 
          status: 'Devam Ediyor',
        } as Debt, ...prev]);
      }
      setIsDebtWizardOpen(false);
    }
  };

  const deleteDebt = (id: string) => {
    if(confirm('Borç kaydını silmek istediğinize emin misiniz?')) {
      setDebts(prev => prev.filter(d => d.id !== id));
      setActionMenuId(null);
    }
  };

  const markDebtAsPaid = (id: string, fullClose: boolean = false) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        if (!fullClose && d.installments && d.installments > 0) {
          const nextPaidInstallments = (d.paidInstallments || 0) + 1;
          const nextRemainingAmount = Math.max(0, (Number(d.remainingAmount) || 0) - (Number(d.paymentAmount) || 0));
          const isFullyPaid = nextPaidInstallments >= d.installments || nextRemainingAmount <= 0;
          return {
            ...d,
            paidInstallments: nextPaidInstallments,
            remainingAmount: nextRemainingAmount,
            status: isFullyPaid ? 'Ödendi' : d.status,
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
          const nextPaidInstallments = Math.max(0, (d.paidInstallments || 0) - 1);
          const nextRemainingAmount = Math.min(Number(d.totalAmount) || 0, (Number(d.remainingAmount) || 0) + (Number(d.paymentAmount) || 0));
          return {
            ...d,
            paidInstallments: nextPaidInstallments,
            remainingAmount: nextRemainingAmount,
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

  // Calculations: Subscriptions
  const monthlySubs = useMemo(() => subscriptions.filter(s => s.status === 'Aktif' && s.billingCycle === 'Aylık'), [subscriptions]);
  const totalMonthlySubs = monthlySubs.reduce((acc, curr) => acc + curr.amount, 0);
  const yearlySubs = useMemo(() => subscriptions.filter(s => s.status === 'Aktif' && s.billingCycle === 'Yıllık'), [subscriptions]);
  const totalYearlySubs = yearlySubs.reduce((acc, curr) => acc + curr.amount, 0);
  const upcomingSubs = useMemo(() => {
    const today = new Date(); 
    return subscriptions.filter(s => s.status === 'Aktif' && (new Date(s.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7 && (new Date(s.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24) >= -1);
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
  const totalStartingDebt = useMemo(() => {
    return debts.reduce((acc, curr) => acc + (Number(curr.totalAmount) || Number(curr.remainingAmount) || 0), 0);
  }, [debts]);

  const totalMonthlyDebtPayment = useMemo(() => {
    const unpaidActiveDebts = debts.filter(d => d.status === 'Devam Ediyor' && d.paidThisMonth !== true);
    return unpaidActiveDebts.reduce((acc, curr) => {
      let monthly = curr.paymentAmount || 0;
      if (curr.paymentFrequency === 'Haftalık') monthly = (curr.paymentAmount || 0) * 4;
      if (curr.paymentFrequency === 'Yıllık') monthly = (curr.paymentAmount || 0) / 12;
      return acc + monthly;
    }, 0);
  }, [debts]);

  const totalPaidMonthlyDebtPayment = useMemo(() => {
    const paidDebts = debts.filter(d => d.status === 'Ödendi' || (d.status === 'Devam Ediyor' && d.paidThisMonth === true));
    return paidDebts.reduce((acc, curr) => {
      let monthly = curr.paymentAmount || 0;
      if (curr.paymentFrequency === 'Haftalık') monthly = (curr.paymentAmount || 0) * 4;
      if (curr.paymentFrequency === 'Yıllık') monthly = (curr.paymentAmount || 0) / 12;
      return acc + monthly;
    }, 0);
  }, [debts]);
  const upcomingDebts = useMemo(() => {
    const today = new Date();
    return activeDebts.filter(d => d.nextPaymentDate && (new Date(d.nextPaymentDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7 && (new Date(d.nextPaymentDate).getTime() - today.getTime()) / (1000 * 3600 * 24) >= -1);
  }, [activeDebts]);
  const debtCategoryData = useMemo(() => {
    const data = activeDebts.reduce((acc, curr) => {
      acc[curr.category || 'Diğer'] = (acc[curr.category || 'Diğer'] || 0) + curr.remainingAmount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [activeDebts]);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8" onClick={() => setActionMenuId(null)}>
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
                  onClick={() => setSummaryModal({ title: 'Aylık Abonelik', value: `₺${totalMonthlySubs.toLocaleString('tr-TR')}`, type: 'sub-monthly' })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-focus-neon/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-focus-neon/10 rounded-lg text-focus-neon group-hover:scale-110 transition-transform"><Repeat size={20} /></div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Aylık Abonelikler</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">₺{totalMonthlySubs.toLocaleString('tr-TR')}</p>
                </div>
                <div 
                  onClick={() => setSummaryModal({ title: 'Yıllık Abonelik', value: `₺${totalYearlySubs.toLocaleString('tr-TR')}`, type: 'sub-yearly' })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-nrg-sun/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun group-hover:scale-110 transition-transform"><Calendar size={20} /></div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Yıllık Abonelikler</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">₺{totalYearlySubs.toLocaleString('tr-TR')}</p>
                </div>
                <div 
                  onClick={() => setSummaryModal({ title: 'Yaklaşan Ödemeler', value: upcomingSubs.length.toString(), type: 'sub-upcoming' })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-crit-vivid/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-crit-vivid/10 rounded-lg text-crit-vivid group-hover:scale-110 transition-transform"><AlertCircle size={20} /></div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Yaklaşan (7 Gün)</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">{upcomingSubs.length}</p>
                </div>
                <div 
                  onClick={() => setSummaryModal({ title: 'En Yüksek Kategori', value: subCategoryData.length > 0 ? subCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-', type: 'sub-category' })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-ai-bright/10 rounded-lg text-ai-bright group-hover:scale-110 transition-transform"><PieChartIcon size={20} /></div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">En Yüksek Kategori</h3>
                  <p className="text-2xl font-display font-bold text-text-primary">{subCategoryData.length > 0 ? subCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-'}</p>
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
                        type="text" placeholder="Abonelik ara..." value={subSearch} onChange={(e) => setSubSearch(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-focus-neon/50 transition-colors"
                      />
                    </div>
                    <button onClick={() => openSubWizard()} className="flex items-center gap-2 bg-focus-neon text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-focus-neon/90 transition-colors">
                      <Plus size={18} /> <span className="hidden md:inline">Yeni Ekle</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-sm text-text-secondary">
                        <th className="pb-3 font-medium px-2">Abonelik / Platform</th>
                        <th className="pb-3 font-medium px-2">Kategori & Tür</th>
                        <th className="pb-3 font-medium px-2">Sonraki Ödeme</th>
                        <th className="pb-3 font-medium px-2">Yöntem</th>
                        <th className="pb-3 font-medium px-2">Tutar</th>
                        <th className="pb-3 font-medium px-2">Durum</th>
                        <th className="pb-3 font-medium px-2"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {subscriptions
                        .filter(s => (s.title || '').toLowerCase().includes((subSearch || '').toLowerCase()) || (s.platform || '').toLowerCase().includes((subSearch || '').toLowerCase()))
                        .map((sub) => (
                        <tr key={sub.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors relative">
                          <td className="py-4 px-2">
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary">{sub.title}</span>
                              <span className="text-xs text-text-secondary">{sub.platform}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex flex-col">
                              <span className="text-text-secondary">{sub.category}</span>
                              <span className="text-[10px] uppercase font-bold text-focus-neon/70 mt-1">{sub.type}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-text-secondary">{new Date(sub.nextBillingDate).toLocaleDateString('tr-TR')} <span className="text-[10px] block opacity-50">{sub.billingCycle}</span></td>
                          <td className="py-4 px-2 text-text-secondary text-xs">{sub.paymentMethod || '-'}</td>
                          <td className="py-4 px-2">
                            <span className="font-mono font-bold text-text-primary">₺{sub.amount.toLocaleString('tr-TR')}</span>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.status === 'Aktif' ? 'bg-focus-neon/10 text-focus-neon' : 'bg-text-secondary/10 text-text-secondary'}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right relative">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === sub.id ? null : sub.id); }}
                              className="p-2 text-text-secondary hover:text-white transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {actionMenuId === sub.id && (
                              <div className="absolute right-6 top-10 bg-neutral-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 w-40 flex flex-col">
                                <button onClick={() => openSubWizard(sub)} className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors text-left">
                                  <Edit3 size={14} /> Düzenle
                                </button>
                                <button onClick={() => deleteSubscription(sub.id)} className="flex items-center gap-2 px-4 py-3 text-sm text-crit-vivid hover:bg-crit-vivid/10 transition-colors text-left border-t border-white/5">
                                  <Trash2 size={14} /> Sil
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {subscriptions.length === 0 && <div className="text-center py-12 text-text-secondary">Gösterilecek abonelik bulunamadı.</div>}
                </div>
              </div>
            </>
          )}

          {activeTab === 'debts' && (
            <>
              {/* Borç Ödeme ve Performans Kartı */}
              <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 p-6 rounded-3xl mb-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-focus-neon/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-crit-vivid/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-focus-neon">
                      <CheckCircle2 size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Aylık Borç Ödeme Özeti</span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-display">Borç ve Taksit Ödeme Karnesi</h3>
                    <p className="text-xs text-text-secondary max-w-xl">
                      Borçlarınızın ödeme durumunu kontrol edebilir ve "Taksit Öde" / "Öde" butonlarını kullanarak aylık performansınızı güncelleyebilirsiniz.
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full lg:w-72 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-secondary">
                      <span>Aylık Borç Ödeme İlerlemesi</span>
                      <span className="text-focus-neon font-mono">{totalMonthlyDebtPayment + totalPaidMonthlyDebtPayment > 0 ? Math.round((totalPaidMonthlyDebtPayment / (totalMonthlyDebtPayment + totalPaidMonthlyDebtPayment)) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-focus-neon h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalMonthlyDebtPayment + totalPaidMonthlyDebtPayment > 0 ? Math.min(100, (totalPaidMonthlyDebtPayment / (totalMonthlyDebtPayment + totalPaidMonthlyDebtPayment)) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-secondary block">
                      Toplam Aylık Yük: ₺{(totalMonthlyDebtPayment + totalPaidMonthlyDebtPayment).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Toplam Borç</span>
                    <p className="text-2xl font-mono font-bold text-white">₺{totalRemainingDebt.toLocaleString('tr-TR')}</p>
                    <span className="text-[10px] text-text-secondary block">Başlangıç: ₺{totalStartingDebt.toLocaleString('tr-TR')}</span>
                  </div>
                  
                  <div className="space-y-1 sm:border-l sm:border-white/5 sm:pl-6">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Aylık Ödenmesi Gereken Borç</span>
                    <p className="text-2xl font-mono font-bold text-crit-vivid">₺{totalMonthlyDebtPayment.toLocaleString('tr-TR')}</p>
                    <span className="text-[10px] text-text-secondary block">Kalan Aktif Taksitler</span>
                  </div>
                  
                  <div className="space-y-1 sm:border-l sm:border-white/5 sm:pl-6">
                    <span className="text-[10px] font-bold text-focus-neon uppercase tracking-wider">Aylık Ödenen Borç</span>
                    <p className="text-2xl font-mono font-bold text-focus-neon">₺{totalPaidMonthlyDebtPayment.toLocaleString('tr-TR')}</p>
                    <span className="text-[10px] text-text-secondary block">Bu Ay Ödenen / Kapatılan</span>
                  </div>
                </div>
              </div>

              {/* Debt Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setSummaryModal({ title: 'Toplam Kalan Borç', value: `₺${totalRemainingDebt.toLocaleString('tr-TR')}`, type: 'debt-total' })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-crit-vivid/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-crit-vivid/10 rounded-lg text-crit-vivid group-hover:scale-110 transition-transform"><CreditCard size={20} /></div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Toplam Kalan Borç</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">₺{totalRemainingDebt.toLocaleString('tr-TR')}</p>
                </div>
                <div 
                  onClick={() => setSummaryModal({ title: 'Aylık Ödeme', value: `₺${totalMonthlyDebtPayment.toLocaleString('tr-TR')}`, type: 'debt-monthly' })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-nrg-sun/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun group-hover:scale-110 transition-transform"><Calendar size={20} /></div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Aylık Toplam Ödeme</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">₺{totalMonthlyDebtPayment.toLocaleString('tr-TR')}</p>
                </div>
                <div 
                  onClick={() => setSummaryModal({ title: 'Yaklaşan Taksitler', value: upcomingDebts.length.toString(), type: 'debt-upcoming' })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-focus-neon/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-focus-neon/10 rounded-lg text-focus-neon group-hover:scale-110 transition-transform"><AlertCircle size={20} /></div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">Yaklaşan Taksitler (7 Gün)</h3>
                  <p className="text-2xl font-mono font-bold text-text-primary">{upcomingDebts.length}</p>
                </div>
                <div 
                  onClick={() => setSummaryModal({ title: 'En Yüksek Borç', value: debtCategoryData.length > 0 ? debtCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-', type: 'debt-category' })}
                  className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-ai-bright/10 rounded-lg text-ai-bright group-hover:scale-110 transition-transform"><PieChartIcon size={20} /></div>
                  </div>
                  <h3 className="text-sm text-text-secondary mb-1">En Yüksek Kategori</h3>
                  <p className="text-2xl font-display font-bold text-text-primary">{debtCategoryData.length > 0 ? debtCategoryData.sort((a,b)=>b.value-a.value)[0].name : '-'}</p>
                </div>
              </div>

              {/* Debts List */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <h2 className="text-xl font-display font-bold text-text-primary">Tüm Borçlar ve Krediler</h2>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="text" placeholder="Borç ara..." value={debtSearch} onChange={(e) => setDebtSearch(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-focus-neon/50 transition-colors"
                      />
                    </div>
                    <button onClick={() => openDebtWizard()} className="flex items-center gap-2 bg-crit-vivid text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-crit-vivid/90 transition-colors">
                      <Plus size={18} /> <span className="hidden md:inline">Yeni Ekle</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-sm text-text-secondary">
                        <th className="pb-3 font-medium px-2">Borç / Kurum</th>
                        <th className="pb-3 font-medium px-2">Kategori</th>
                        <th className="pb-3 font-medium px-2">Sonraki Ödeme</th>
                        <th className="pb-3 font-medium px-2">Kalan / Toplam</th>
                        <th className="pb-3 font-medium px-2">Ödeme / Taksit</th>
                        <th className="pb-3 font-medium px-2">Durum</th>
                        <th className="pb-3 font-medium px-2"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {debts
                        .filter(d => (d.title || '').toLowerCase().includes((debtSearch || '').toLowerCase()) || (d.lender || '').toLowerCase().includes((debtSearch || '').toLowerCase()))
                        .map((debt) => (
                        <tr key={debt.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-2">
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary">{debt.title}</span>
                              <span className="text-xs text-text-secondary flex items-center gap-1"><Building size={10}/> {debt.lender || '-'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-text-secondary">{debt.category}</td>
                          <td className="py-4 px-2 text-text-secondary">
                            {debt.nextPaymentDate ? new Date(debt.nextPaymentDate).toLocaleDateString('tr-TR') : '-'}
                            <span className="text-[10px] block opacity-50 mt-1">{debt.paymentFrequency}</span>
                          </td>
                          <td className="py-4 px-2">
                            <span className="font-mono font-bold text-text-primary text-base">₺{debt.remainingAmount?.toLocaleString('tr-TR')}</span>
                            <span className="text-[10px] text-text-secondary ml-1 block">/ ₺{debt.totalAmount?.toLocaleString('tr-TR')}</span>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex flex-col items-start">
                              <span className="font-mono font-bold text-crit-vivid text-base">₺{debt.paymentAmount?.toLocaleString('tr-TR')}</span>
                              {debt.installments && debt.installments > 0 ? (
                                <span className="text-[10px] text-text-secondary mt-1 bg-white/5 px-2 py-0.5 rounded">Taksit: {debt.paidInstallments || 0} / {debt.installments}</span>
                              ) : <span className="text-[10px] text-text-secondary mt-1">-</span>}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${debt.status === 'Devam Ediyor' ? 'bg-nrg-sun/10 text-nrg-sun' : 'bg-focus-neon/10 text-focus-neon'}`}>
                                {debt.status}
                              </span>
                              {debt.status === 'Devam Ediyor' && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide ${debt.paidThisMonth ? 'bg-focus-neon/20 text-focus-neon' : 'bg-crit-vivid/10 text-crit-vivid'}`}>
                                  {debt.paidThisMonth ? 'Bu Ay Ödendi' : 'Bu Ay Ödenmedi'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {debt.status === 'Devam Ediyor' && (
                                debt.paidThisMonth ? (
                                  <button
                                    onClick={() => markDebtAsUnpaid(debt.id, false)}
                                    className="px-2.5 py-1 text-xs font-bold bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                                    title="Ödemeyi iptal et ve borcu henüz ödenmedi olarak işaretle"
                                  >
                                    <XCircle size={12} /> Geri Al
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => markDebtAsPaid(debt.id)}
                                    className="px-2.5 py-1 text-xs font-bold bg-focus-neon/10 hover:bg-focus-neon text-focus-neon hover:text-black rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                                    title={debt.installments && debt.installments > 0 ? "1 Taksit Öde" : "Borcu Kapat"}
                                  >
                                    <CheckCircle2 size={12} /> {debt.installments && debt.installments > 0 ? "Taksit Öde" : "Öde"}
                                  </button>
                                )
                              )}
                              {debt.status === 'Ödendi' && (
                                <button
                                  onClick={() => markDebtAsUnpaid(debt.id, true)}
                                  className="px-2.5 py-1 text-xs font-bold bg-crit-vivid/10 hover:bg-crit-vivid text-crit-vivid hover:text-white rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                                  title="Borcu tekrar açık hale getir"
                                >
                                  <XCircle size={12} /> Geri Al
                                </button>
                              )}
                              <div className="relative">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === debt.id ? null : debt.id); }}
                                  className="p-2 text-text-secondary hover:text-white transition-colors"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {actionMenuId === debt.id && (
                                  <div className="absolute right-0 top-8 bg-neutral-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 w-44 flex flex-col text-left">
                                    {debt.status === 'Devam Ediyor' ? (
                                      <>
                                        {debt.paidThisMonth ? (
                                          <button onClick={() => markDebtAsUnpaid(debt.id, false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-white hover:bg-white/5 transition-colors text-left">
                                            <XCircle size={12} className="text-amber-500" /> Ödemeyi Geri Al
                                          </button>
                                        ) : (
                                          <>
                                            <button onClick={() => markDebtAsPaid(debt.id, false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-white hover:bg-white/5 transition-colors text-left">
                                              <CheckCircle2 size={12} className="text-focus-neon" /> {debt.installments && debt.installments > 0 ? "1 Taksit Öde" : "Ödendi Olarak İşaretle"}
                                            </button>
                                            {debt.installments && debt.installments > 0 && (
                                              <button onClick={() => markDebtAsPaid(debt.id, true)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-white hover:bg-white/5 transition-colors text-left border-t border-white/5">
                                                <CheckCircle2 size={12} className="text-focus-neon" /> Borcu Tamamen Kapat
                                              </button>
                                            )}
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      <button onClick={() => markDebtAsUnpaid(debt.id, true)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-white hover:bg-white/5 transition-colors text-left">
                                        <XCircle size={12} className="text-crit-vivid" /> Borcu Tekrar Aç
                                      </button>
                                    )}
                                    <button onClick={() => openDebtWizard(debt)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-white hover:bg-white/5 transition-colors text-left border-t border-white/5">
                                      <Edit3 size={12} /> Düzenle
                                    </button>
                                    <button onClick={() => deleteDebt(debt.id)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-crit-vivid hover:bg-crit-vivid/10 transition-colors text-left border-t border-white/5">
                                      <Trash2 size={12} /> Sil
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
                  {debts.length === 0 && <div className="text-center py-12 text-text-secondary">Gösterilecek borç bulunamadı.</div>}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Subscription Wizard Modal */}
      <AnimatePresence>
        {isSubWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
                   <Repeat size={20} className="text-focus-neon"/> {editingSubId ? 'Aboneliği Düzenle' : 'Yeni Abonelik Ekle'}
                </h2>
                <button onClick={() => setIsSubWizardOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-text-secondary hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                {/* Search & Suggestions */}
                <div className="relative">
                  <label className="block text-sm font-bold text-text-secondary mb-2">Abonelik Adı veya Platform</label>
                  <input 
                    type="text" placeholder="Örn: Netflix, Spotify..." value={subFormData.title || ''}
                    onChange={handleSubTitleChange} onFocus={() => setShowSubSuggestions(true)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors"
                  />
                  {showSubSuggestions && subSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-neutral-800 border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                      {subSuggestions.map((s, i) => (
                        <div key={i} onClick={() => selectSubSuggestion(s)} className="px-4 py-3 border-b border-white/5 hover:bg-white/[0.04] cursor-pointer flex justify-between items-center">
                          <div><p className="text-sm font-bold text-white">{s.title}</p><p className="text-[10px] text-text-secondary">{s.category} • {s.type}</p></div>
                          <span className="text-sm font-mono text-focus-neon">₺{s.amount.toLocaleString('tr-TR')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Tutar (₺)</label>
                    <input 
                      type="number" placeholder="0.00" value={subFormData.amount || ''}
                      onChange={(e) => setSubFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Döngü</label>
                    <select 
                      value={subFormData.billingCycle || 'Aylık'} onChange={(e) => setSubFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors appearance-none"
                    >
                      <option value="Haftalık">Haftalık</option>
                      <option value="Aylık">Aylık</option>
                      <option value="Yıllık">Yıllık</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Abonelik Türü (Opsiyonel)</label>
                    <input 
                      type="text" placeholder="Örn: Premium, Aile Paketi" value={subFormData.type || ''}
                      onChange={(e) => setSubFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Kategori</label>
                    <select 
                      value={subFormData.category || ''} onChange={(e) => setSubFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors appearance-none"
                    >
                      <option value="">Seçiniz...</option>
                      <option value="Eğlence">Eğlence (Film, Müzik, Oyun)</option>
                      <option value="Yazılım">Yazılım (Adobe, AI, Araçlar)</option>
                      <option value="Altyapı">Altyapı (Hosting, Domain, Bulut)</option>
                      <option value="Alışveriş">Alışveriş (Prime vb.)</option>
                      <option value="Medya">Haber & Medya</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Ödeme Yöntemi</label>
                    <input 
                      type="text" placeholder="Örn: Garanti Kredi Kartı Sonu 4521" value={subFormData.paymentMethod || ''}
                      onChange={(e) => setSubFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">İlk / Sonraki Ödeme Tarihi</label>
                    <input 
                      type="date" value={subFormData.nextBillingDate || ''}
                      onChange={(e) => setSubFormData(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                {editingSubId && (
                   <div>
                     <label className="block text-sm font-bold text-text-secondary mb-2">Abonelik Durumu</label>
                     <select 
                        value={subFormData.status || 'Aktif'} onChange={(e) => setSubFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors appearance-none"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="İptal Edildi">İptal Edildi</option>
                      </select>
                   </div>
                )}
                
              </div>
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button onClick={() => setIsSubWizardOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors">İptal</button>
                <button onClick={saveSubscription} className="px-6 py-3 bg-focus-neon text-black rounded-xl text-sm font-bold hover:bg-focus-neon/90 transition-colors">
                  {editingSubId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Debt Wizard Modal */}
      <AnimatePresence>
        {isDebtWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
                  <CreditCard size={20} className="text-crit-vivid"/> {editingDebtId ? 'Borç / Kredi Güncelle' : 'Yeni Banka Borcu veya Kredi Ekle'}
                </h2>
                <button onClick={() => setIsDebtWizardOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-text-secondary hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Kategori</label>
                    <select 
                      name="category" value={debtFormData.category || ''}
                      onChange={(e) => setDebtFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crit-vivid/50 transition-colors appearance-none font-bold"
                    >
                      <option value="İhtiyaç Kredisi">İhtiyaç Kredisi</option>
                      <option value="Konut Kredisi">Konut Kredisi</option>
                      <option value="Taşıt Kredisi">Taşıt Kredisi</option>
                      <option value="Kredi Kartı">Kredi Kartı</option>
                      <option value="Esnek Hesap (KMH)">Esnek Hesap / Kredili Mevduat (KMH)</option>
                      <option value="Elden Borç">Elden Borç / Bireysel</option>
                      <option value="Kurumsal Borç">Kurumsal Borç (Vergi, SGK vb.)</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Hesap / Kredi Adı</label>
                    <input 
                      type="text" name="title" placeholder="Örn: Garanti İhtiyaç, Enpara Kredi Kartı..."
                      value={debtFormData.title || ''} onChange={(e) => setDebtFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crit-vivid/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Kurum / Banka</label>
                    <input 
                      type="text" name="lender" placeholder="Örn: Garanti BBVA, Ziraat Bankası..."
                      value={debtFormData.lender || ''} onChange={(e) => setDebtFormData(prev => ({ ...prev, lender: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crit-vivid/50 transition-colors"
                    />
                  </div>
                  {['Kredi Kartı', 'Esnek Hesap (KMH)'].includes(debtFormData.category || '') ? (
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Limit (Opsiyonel)</label>
                      <input 
                        type="number" name="accountLimit" placeholder="0.00"
                        value={debtFormData.accountLimit || ''} onChange={(e) => setDebtFormData(prev => ({ ...prev, accountLimit: Number(e.target.value) }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crit-vivid/50 transition-colors font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-text-secondary mb-2">Sonraki Taksit / Ödeme Tarihi</label>
                      <input 
                        type="date" name="nextPaymentDate" value={debtFormData.nextPaymentDate || ''}
                        onChange={(e) => setDebtFormData(prev => ({ ...prev, nextPaymentDate: e.target.value }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crit-vivid/50 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  )}
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RefreshCw size={16} className="text-crit-vivid"/> Dinamik Hesaplayıcı 
                    {!['Kredi Kartı', 'Esnek Hesap (KMH)'].includes(debtFormData.category || '') && <span className="text-xs font-normal text-text-secondary">(İkisini girin, kalanı hesaplasın)</span>}
                  </h3>
                  
                  {['Kredi Kartı', 'Esnek Hesap (KMH)'].includes(debtFormData.category || '') ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Güncel Borç (Kullanılan Bakiye)</label>
                          <input 
                            type="number" name="remainingAmount" placeholder="0.00"
                            value={debtFormData.remainingAmount || ''} 
                            onChange={(e) => setDebtFormData(prev => ({ ...prev, remainingAmount: Number(e.target.value), totalAmount: Number(e.target.value) }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-base text-crit-vivid font-mono font-bold focus:outline-none focus:border-crit-vivid/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Aylık Asgari / Tahmini Ödeme</label>
                          <input 
                            type="number" name="paymentAmount" placeholder="0.00"
                            value={debtFormData.paymentAmount || ''} 
                            onChange={(e) => setDebtFormData(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-base text-white font-mono focus:outline-none focus:border-crit-vivid/50 transition-colors"
                          />
                        </div>
                     </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Toplam Kalan Borç</label>
                          <input 
                            type="number" name="totalAmount" placeholder="0.00"
                            value={debtFormData.totalAmount || ''} 
                            onChange={(e) => setDebtFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                            onBlur={() => handleDebtCalcBlur('totalAmount')}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-base text-white font-mono focus:outline-none focus:border-crit-vivid/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Taksit Tutarı</label>
                          <input 
                            type="number" name="paymentAmount" placeholder="0.00"
                            value={debtFormData.paymentAmount || ''} 
                            onChange={(e) => setDebtFormData(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                            onBlur={() => handleDebtCalcBlur('paymentAmount')}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-base text-crit-vivid font-mono font-bold focus:outline-none focus:border-crit-vivid/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Kalan Taksit Sayısı</label>
                          <input 
                            type="number" name="installments" placeholder="0"
                            value={debtFormData.installments || ''} 
                            onChange={(e) => setDebtFormData(prev => ({ ...prev, installments: Number(e.target.value) }))}
                            onBlur={() => handleDebtCalcBlur('installments')}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-base text-white font-mono focus:outline-none focus:border-crit-vivid/50 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Şuana Kadar Ödenen Taksit (Opsiyonel)</label>
                          <input 
                            type="number" name="paidInstallments" placeholder="0"
                            value={debtFormData.paidInstallments || ''} 
                            onChange={(e) => setDebtFormData(prev => ({ ...prev, paidInstallments: Number(e.target.value) }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-crit-vivid/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Ödeme Sıklığı</label>
                          <select 
                            name="paymentFrequency" value={debtFormData.paymentFrequency || 'Aylık'}
                            onChange={(e) => setDebtFormData(prev => ({ ...prev, paymentFrequency: e.target.value as any }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-crit-vivid/50 transition-colors appearance-none"
                          >
                            <option value="Haftalık">Haftalık</option>
                            <option value="Aylık">Aylık</option>
                            <option value="Yıllık">Yıllık</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {editingDebtId && (
                   <div>
                     <label className="block text-sm font-bold text-text-secondary mb-2">Durum</label>
                     <select 
                        value={debtFormData.status || 'Devam Ediyor'} onChange={(e) => setDebtFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crit-vivid/50 transition-colors appearance-none"
                      >
                        <option value="Devam Ediyor">Devam Ediyor</option>
                        <option value="Ödendi">Ödendi / Kapandı</option>
                      </select>
                   </div>
                )}
                
              </div>
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button onClick={() => setIsDebtWizardOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors">İptal</button>
                <button onClick={saveDebt} className="px-6 py-3 bg-crit-vivid text-black rounded-xl text-sm font-bold hover:bg-crit-vivid/90 transition-colors">
                  {editingDebtId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Stat Modals */}
      <AnimatePresence>
        {summaryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-8"
            >
              <button onClick={() => setSummaryModal(null)} className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors z-10"><X size={18} /></button>
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-2">{summaryModal.title}</h2>
              <p className="text-4xl font-display font-black text-text-primary mb-4">{summaryModal.value}</p>
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {summaryModal.type.startsWith('sub') ? (
                    subscriptions.filter(s => {
                      if (summaryModal.type === 'sub-monthly') return s.status === 'Aktif' && s.billingCycle === 'Aylık';
                      if (summaryModal.type === 'sub-yearly') return s.status === 'Aktif' && s.billingCycle === 'Yıllık';
                      if (summaryModal.type === 'sub-upcoming') {
                         const today = new Date();
                         return s.status === 'Aktif' && (new Date(s.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7 && (new Date(s.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24) >= -1;
                      }
                      if (summaryModal.type === 'sub-category') return s.status === 'Aktif' && s.category === summaryModal.value;
                      return false;
                    }).map(sub => (
                      <div key={sub.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div><p className="text-sm font-bold text-text-primary">{sub.title}</p><p className="text-[10px] text-text-secondary">{new Date(sub.nextBillingDate).toLocaleDateString('tr-TR')}</p></div>
                        <span className="text-sm font-mono font-bold text-focus-neon">₺{sub.amount.toLocaleString('tr-TR')}</span>
                      </div>
                    ))
                  ) : (
                    debts.filter(d => {
                      if (summaryModal.type === 'debt-total') return d.status === 'Devam Ediyor';
                      if (summaryModal.type === 'debt-monthly') return d.status === 'Devam Ediyor';
                      if (summaryModal.type === 'debt-upcoming') {
                         const today = new Date();
                         return d.status === 'Devam Ediyor' && d.nextPaymentDate && (new Date(d.nextPaymentDate).getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7 && (new Date(d.nextPaymentDate).getTime() - today.getTime()) / (1000 * 3600 * 24) >= -1;
                      }
                      if (summaryModal.type === 'debt-category') return d.status === 'Devam Ediyor' && d.category === summaryModal.value;
                      return false;
                    }).map(debt => (
                      <div key={debt.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div><p className="text-sm font-bold text-text-primary">{debt.title}</p><p className="text-[10px] text-text-secondary">{debt.nextPaymentDate ? new Date(debt.nextPaymentDate).toLocaleDateString('tr-TR') : '-'}</p></div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold text-crit-vivid">₺{summaryModal.type === 'debt-monthly' ? debt.paymentAmount?.toLocaleString('tr-TR') : debt.remainingAmount?.toLocaleString('tr-TR')}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {((summaryModal.type.startsWith('sub') && subscriptions.filter(s => {
                      if (summaryModal.type === 'sub-monthly') return s.status === 'Aktif' && s.billingCycle === 'Aylık';
                      if (summaryModal.type === 'sub-yearly') return s.status === 'Aktif' && s.billingCycle === 'Yıllık';
                      if (summaryModal.type === 'sub-upcoming') return s.status === 'Aktif' && (new Date(s.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7 && (new Date(s.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) >= -1;
                      if (summaryModal.type === 'sub-category') return s.status === 'Aktif' && s.category === summaryModal.value;
                      return false;
                    }).length === 0) || 
                    (summaryModal.type.startsWith('debt') && debts.filter(d => {
                      if (summaryModal.type === 'debt-total') return d.status === 'Devam Ediyor';
                      if (summaryModal.type === 'debt-monthly') return d.status === 'Devam Ediyor';
                      if (summaryModal.type === 'debt-upcoming') return d.status === 'Devam Ediyor' && d.nextPaymentDate && (new Date(d.nextPaymentDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7 && (new Date(d.nextPaymentDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) >= -1;
                      if (summaryModal.type === 'debt-category') return d.status === 'Devam Ediyor' && d.category === summaryModal.value;
                      return false;
                    }).length === 0)) && (
                      <p className="text-xs text-text-secondary text-center py-4">Kayıt bulunamadı.</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                 <button onClick={() => setSummaryModal(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors">Kapat</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
