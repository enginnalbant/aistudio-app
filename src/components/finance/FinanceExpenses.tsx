import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  Calendar,
  X,
  Tag,
  CheckCircle2,
  Clock,
  ArrowRight,
  PieChart as PieChartIcon,
  Activity,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  ShoppingBag,
  BarChart3
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  tags: string[];
  date: string;
  status: 'Gerçekleşti' | 'Planlı';
  recurrence?: 'Tek Seferlik' | 'Haftalık' | 'Aylık' | 'Yıllık';
  recipient: string;
  notes?: string;
}

const CATEGORIES = ['Barınma', 'Gıda', 'Fatura', 'Seyahat', 'Eğlence', 'Sağlık', 'Ulaşım', 'Diğer'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#64748b'];

export const FinanceExpenses = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('finance_expenses', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  
  // Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isEditingWizard, setIsEditingWizard] = useState(false);
  
  // View/Edit Modal States
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [summaryModal, setSummaryModal] = useState<{title: string; value: string; type: string} | null>(null);

  // Form States
  const defaultFormState: Partial<Expense> = {
    title: '', amount: 0, category: 'Gıda', tags: [], date: new Date().toISOString().split('T')[0], status: 'Gerçekleşti', recipient: '', notes: '', recurrence: 'Tek Seferlik'
  };
  const [formData, setFormData] = useState<Partial<Expense>>(defaultFormState);
  const [newTag, setNewTag] = useState('');

  // --- DERIVED DATA ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = (exp.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                            (exp.recipient || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                            (exp.tags || []).some(t => t.toLowerCase().includes((searchTerm || '').toLowerCase()));
      const matchesCategory = selectedCategory === 'Tümü' || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm, selectedCategory]);

  const { totalExpense, plannedExpense, currentMonthExpense, lastMonthExpense } = useMemo(() => {
    let total = 0, planned = 0, currMonth = 0, lastMonth = 0;
    const now = new Date();
    const currentMonthNum = now.getMonth();
    const currentYearNum = now.getFullYear();
    const lastMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
    const lastMonthYearNum = currentMonthNum === 0 ? currentYearNum - 1 : currentYearNum;

    expenses.forEach(e => {
      if (e.status === 'Gerçekleşti') {
        total += e.amount;
        const d = new Date(e.date);
        if (d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum) currMonth += e.amount;
        if (d.getMonth() === lastMonthNum && d.getFullYear() === lastMonthYearNum) lastMonth += e.amount;
      } else {
        planned += e.amount;
      }
    });
    return { totalExpense: total, plannedExpense: planned, currentMonthExpense: currMonth, lastMonthExpense: lastMonth };
  }, [expenses]);

  const monthlyChange = useMemo(() => {
    if (lastMonthExpense === 0) return currentMonthExpense > 0 ? 100 : 0;
    return (((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100).toFixed(1);
  }, [currentMonthExpense, lastMonthExpense]);
  
  const changeLabel = `${Number(monthlyChange) >= 0 ? '+' : ''}%${monthlyChange}`;

  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      value: expenses.filter(e => e.category === cat && e.status === 'Gerçekleşti').reduce((sum, e) => sum + e.amount, 0)
    })).filter(c => c.value > 0);
  }, [expenses]);

  // Generate 6 months data for charts
  const monthlyTrendData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('tr-TR', { month: 'short' });
      const yearStr = d.getFullYear().toString().slice(-2);
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear() && exp.status === 'Gerçekleşti';
      });
      const monthPlanned = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear() && exp.status === 'Planlı';
      });

      data.push({
        name: `${monthStr} '${yearStr}`,
        Gerçekleşen: monthExpenses.reduce((acc, curr) => acc + curr.amount, 0),
        Planlı: monthPlanned.reduce((acc, curr) => acc + curr.amount, 0)
      });
    }
    return data;
  }, [expenses]);

  const topRecipient = useMemo(() => {
    const recipientMap: Record<string, number> = {};
    expenses.filter(e => e.status === 'Gerçekleşti').forEach(e => {
      if (e.recipient) {
        recipientMap[e.recipient] = (recipientMap[e.recipient] || 0) + e.amount;
      }
    });
    const entries = Object.entries(recipientMap);
    if (entries.length === 0) return '-';
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [expenses]);

  // --- ACTIONS ---
  const handleOpenWizard = (expenseToEdit?: Expense) => {
    if (expenseToEdit) {
      setFormData(expenseToEdit);
      setIsEditingWizard(true);
    } else {
      setFormData(defaultFormState);
      setIsEditingWizard(false);
    }
    setWizardStep(1);
    setIsWizardOpen(true);
    setSelectedExpense(null);
  };

  const handleSaveExpense = () => {
    if (!formData.title || !formData.amount) return;
    
    if (isEditingWizard && formData.id) {
      setExpenses(expenses.map(exp => exp.id === formData.id ? { ...formData } as Expense : exp));
    } else {
      const newExpense: Expense = {
        ...(formData as any),
        id: Date.now().toString(),
        category: formData.category || 'Diğer',
        tags: formData.tags || [],
        date: formData.date || new Date().toISOString().split('T')[0],
        status: formData.status as 'Gerçekleşti' | 'Planlı',
        recurrence: formData.recurrence as 'Tek Seferlik' | 'Haftalık' | 'Aylık' | 'Yıllık',
        recipient: formData.recipient || '',
      };
      setExpenses([newExpense, ...expenses]);
    }
    
    setIsWizardOpen(false);
    setFormData(defaultFormState);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Bu gider kaydını silmek istediğinize emin misiniz?')) {
      setExpenses(expenses.filter(e => e.id !== id));
      setSelectedExpense(null);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(newTag.trim())) {
        setFormData({ ...formData, tags: [...(formData.tags || []), newTag.trim()] });
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(tag => tag !== tagToRemove) });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-text-primary">
            Gider Merkezi
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Gelişmiş harcama analizi, alıcı takibi ve bütçe yönetimi.
          </p>
        </div>
        <button 
          onClick={() => handleOpenWizard()}
          className="flex items-center gap-2 bg-crit-vivid text-pure-white font-bold px-4 py-2.5 rounded-xl hover:bg-crit-vivid/90 transition-all shadow-lg shadow-crit-vivid/20 active:scale-95"
        >
          <Plus size={18} />
          <span>Yeni Gider Ekle</span>
        </button>
      </div>

      {/* Info Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setSummaryModal({ title: 'Gerçekleşen Gider', value: `₺${totalExpense.toLocaleString('tr-TR')}`, type: 'completed' })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-crit-vivid/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-crit-vivid/10 rounded-xl text-crit-vivid group-hover:scale-110 transition-transform">
              <Receipt size={20} />
            </div>
          </div>
          <h3 className="text-sm font-bold text-text-secondary mb-1">Toplam Gerçekleşen</h3>
          <p className="text-2xl font-display font-black text-text-primary">
            ₺{totalExpense.toLocaleString('tr-TR')}
          </p>
        </div>

        <div 
          onClick={() => setSummaryModal({ title: 'Planlı Gider', value: `₺${plannedExpense.toLocaleString('tr-TR')}`, type: 'planned' })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-nrg-sun/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-nrg-sun/10 rounded-xl text-nrg-sun group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
          </div>
          <h3 className="text-sm font-bold text-text-secondary mb-1">Planlı Ödemeler</h3>
          <p className="text-2xl font-display font-black text-text-primary">
            ₺{plannedExpense.toLocaleString('tr-TR')}
          </p>
        </div>

        <div 
          onClick={() => setSummaryModal({ title: 'Aylık Değişim', value: changeLabel, type: 'trend' })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-ai-bright/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-ai-bright/10 rounded-xl text-ai-bright group-hover:scale-110 transition-transform">
              <TrendingDown size={20} />
            </div>
          </div>
          <h3 className="text-sm font-bold text-text-secondary mb-1">Aylık Değişim</h3>
          <p className="text-2xl font-display font-black text-text-primary flex items-baseline gap-2">
            {changeLabel}
          </p>
        </div>

        <div 
          onClick={() => setSummaryModal({ title: 'En Fazla Ödenen', value: topRecipient, type: 'recipient' })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-focus-main/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-focus-main/10 rounded-xl text-focus-main group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
          </div>
          <h3 className="text-sm font-bold text-text-secondary mb-1">En Fazla Ödenen</h3>
          <p className="text-xl font-display font-black text-text-primary truncate">
            {topRecipient}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main Trend Bar Chart */}
        <div className="xl:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-crit-vivid" />
            Harcama Performansı (Son 6 Ay)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Gerçekleşen" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Planlı" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col">
          <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
            <PieChartIcon size={16} className="text-crit-vivid" />
            Kategori Dağılımı
          </h3>
          <div className="flex-1 min-h-[280px] w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-text-secondary flex flex-col items-center gap-2 opacity-50">
                <PieChartIcon size={32} />
                <span>Yeterli veri yok</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Table Section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Activity size={16} className="text-crit-vivid" />
            Gider Hareketleri ve Detaylar
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                type="text"
                placeholder="Ara: Başlık, Alıcı, Etiket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-crit-vivid/50 transition-colors"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative shrink-0">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-text-primary appearance-none focus:outline-none focus:border-crit-vivid/50 transition-colors"
              >
                <option value="Tümü" className="bg-neutral-900">Tüm Kategoriler</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Başlık / Alıcı</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Kategori & Etiketler</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Tutar</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Tarih</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Durum</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-text-secondary">
                    <div className="flex flex-col items-center gap-3">
                      <Search size={32} className="opacity-20" />
                      Eşleşen gider kaydı bulunamadı.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    onClick={() => setSelectedExpense(expense)}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary group-hover:text-crit-vivid transition-colors flex items-center gap-2">
                          {expense.title}
                          {expense.recurrence && expense.recurrence !== 'Tek Seferlik' && (
                            <span className="text-[9px] font-bold text-focus-main bg-focus-main/10 border border-focus-main/20 px-1.5 py-0.5 rounded-md leading-none uppercase">
                              {expense.recurrence}
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-text-secondary mt-0.5">{expense.recipient || 'Alıcı belirtilmedi'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="inline-block px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[11px] font-semibold text-text-secondary">
                          {expense.category}
                        </span>
                        {expense.tags && expense.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {expense.tags.slice(0, 2).map(t => (
                              <span key={t} className="text-[10px] text-text-secondary/70 flex items-center gap-0.5">
                                <Tag size={8} />{t}
                              </span>
                            ))}
                            {expense.tags.length > 2 && <span className="text-[10px] text-text-secondary/70">+{expense.tags.length - 2}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono font-black text-text-primary group-hover:text-crit-vivid transition-colors">
                        ₺{expense.amount.toLocaleString('tr-TR')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
                        <Calendar size={12} />
                        {new Date(expense.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                        expense.status === 'Gerçekleşti' 
                          ? 'bg-crit-vivid/10 text-crit-vivid border border-crit-vivid/20' 
                          : 'bg-nrg-sun/10 text-nrg-sun border border-nrg-sun/20'
                      }`}>
                        {expense.status === 'Gerçekleşti' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {expense.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedExpense(expense); }}
                        className="p-2 text-text-secondary group-hover:text-white group-hover:bg-white/10 rounded-xl transition-all"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW SMART LAYERED WIZARD */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: 'calc(100vh - 40px)' }}
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-display font-black text-text-primary flex items-center gap-2">
                    <Plus size={20} className="text-crit-vivid" />
                    {isEditingWizard ? 'Gider Kaydını Düzenle' : 'Akıllı Gider Ekleme Sihirbazı'}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">Adım {wizardStep} / 3: {wizardStep === 1 ? 'Temel Bilgiler' : wizardStep === 2 ? 'Kategori & Alıcı' : 'Gelişmiş Detaylar'}</p>
                </div>
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex h-1 bg-white/5">
                <div className="bg-crit-vivid transition-all duration-300" style={{ width: `${(wizardStep / 3) * 100}%` }} />
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative min-h-[300px]">
                <form id="smart-wizard" onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  
                  <AnimatePresence mode="wait">
                    {/* STEP 1: BASIC INFO */}
                    {wizardStep === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Gider Başlığı <span className="text-crit-vivid">*</span></label>
                          <input 
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Örn: Ofis Kirası"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-base text-text-primary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                            autoFocus
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tutar (₺) <span className="text-crit-vivid">*</span></label>
                            <div className="relative">
                              <Receipt size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                              <input 
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount || ''}
                                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                                placeholder="0.00"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-4 text-lg font-mono font-bold text-text-primary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tarih <span className="text-crit-vivid">*</span></label>
                            <input 
                              required
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData({...formData, date: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-base font-mono text-text-primary focus:outline-none focus:border-crit-vivid/50 [color-scheme:dark] transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Durum</label>
                          <div className="grid grid-cols-2 gap-3">
                            {(['Gerçekleşti', 'Planlı'] as const).map(status => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setFormData({...formData, status})}
                                className={`flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold border transition-all ${
                                  formData.status === status 
                                    ? (status === 'Gerçekleşti' ? 'bg-crit-vivid/20 text-crit-vivid border-crit-vivid/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-nrg-sun/20 text-nrg-sun border-nrg-sun/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]')
                                    : 'bg-white/[0.02] border-white/5 text-text-secondary hover:bg-white/[0.05]'
                                }`}
                              >
                                {status === 'Gerçekleşti' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: CATEGORY & RECIPIENT */}
                    {wizardStep === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Kategori Seçimi</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setFormData({...formData, category: cat})}
                                className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                                  formData.category === cat 
                                    ? 'bg-crit-vivid/10 text-crit-vivid border-crit-vivid/50' 
                                    : 'bg-white/[0.02] border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Alıcı / Kurum / Satıcı</label>
                          <div className="relative">
                            <ShoppingBag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input 
                              type="text"
                              value={formData.recipient}
                              onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                              placeholder="Örn: Ev Sahibi, Market, Havayolu Şirketi"
                              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-4 text-base text-text-primary focus:outline-none focus:border-crit-vivid/50 transition-colors"
                            />
                          </div>
                          <p className="text-xs text-text-secondary mt-2 opacity-70">Giderin alıcısını belirtmek ileride finansal raporlarınızı daha doğru analiz etmenizi sağlar.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: ADVANCED */}
                    {wizardStep === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tekrarlama Sıklığı</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Tek Seferlik', 'Haftalık', 'Aylık', 'Yıllık'].map(rec => (
                              <button
                                key={rec}
                                type="button"
                                onClick={() => setFormData({...formData, recurrence: rec as any})}
                                className={`py-3 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                                  formData.recurrence === rec 
                                    ? 'bg-ai-bright/10 text-ai-bright border-ai-bright/50' 
                                    : 'bg-white/[0.02] border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20'
                                }`}
                              >
                                {rec}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Etiketler (Tags)</label>
                          <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl focus-within:border-crit-vivid/50 transition-colors">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {formData.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-text-primary">
                                  <Tag size={12} className="text-crit-vivid" />
                                  {tag}
                                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-crit-vivid ml-1"><X size={14}/></button>
                                </span>
                              ))}
                              {(!formData.tags || formData.tags.length === 0) && (
                                <span className="text-xs text-text-secondary italic">Etiket eklenmedi. (örn: acil, abonelik, iş-gezisi)</span>
                              )}
                            </div>
                            <input 
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={addTag}
                              placeholder="Etiket yazıp Enter'a basın..."
                              className="w-full bg-transparent border-t border-white/10 pt-3 text-sm text-text-primary focus:outline-none placeholder:text-text-secondary/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Ek Notlar ve Detaylar</label>
                          <textarea 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Örn: Bu faturaya gecikme zammı dahil edilmiştir..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-sm text-text-primary focus:outline-none focus:border-crit-vivid/50 min-h-[100px] resize-none transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </form>
              </div>

              <div className="p-6 border-t border-white/10 bg-[#121212] flex justify-between items-center z-10">
                <button 
                  onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setIsWizardOpen(false)}
                  className="px-5 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 flex items-center gap-2 transition-colors"
                >
                  {wizardStep > 1 ? <><ChevronLeft size={16}/> Geri</> : 'İptal'}
                </button>
                
                {wizardStep < 3 ? (
                  <button 
                    onClick={() => {
                      if (wizardStep === 1 && (!formData.title || !formData.amount)) {
                        alert('Lütfen başlık ve tutar giriniz.');
                        return;
                      }
                      setWizardStep(wizardStep + 1);
                    }}
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 flex items-center gap-2 transition-colors"
                  >
                    İleri <ChevronRight size={16}/>
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveExpense}
                    className="px-8 py-3 rounded-xl text-sm font-bold bg-crit-vivid text-pure-white hover:bg-crit-vivid/90 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={18}/> Kaydet
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Detail & Action Modal */}
      <AnimatePresence>
        {selectedExpense && !isWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button 
                  onClick={() => handleOpenWizard(selectedExpense)}
                  className="p-2 text-text-secondary hover:text-crit-vivid bg-white/5 hover:bg-white/10 rounded-xl transition-colors tooltip-trigger"
                  title="Düzenle"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteExpense(selectedExpense.id)}
                  className="p-2 text-text-secondary hover:text-crit-vivid bg-white/5 hover:bg-white/10 rounded-xl transition-colors tooltip-trigger"
                  title="Sil"
                >
                  <Trash2 size={18} />
                </button>
                <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                <button 
                  onClick={() => setSelectedExpense(null)}
                  className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 pt-12">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${selectedExpense.status === 'Gerçekleşti' ? 'bg-crit-vivid/10 text-crit-vivid border-crit-vivid/20' : 'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'}`}>
                    {selectedExpense.status === 'Gerçekleşti' ? <Receipt size={24} /> : <Clock size={24} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${selectedExpense.status === 'Gerçekleşti' ? 'text-crit-vivid' : 'text-nrg-sun'}`}>
                      {selectedExpense.status}
                    </span>
                    <span className="text-xs text-text-secondary">{new Date(selectedExpense.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-display font-black text-text-primary mt-4 leading-tight pr-8">
                  {selectedExpense.title}
                </h2>
                <p className="text-4xl font-display font-black text-crit-vivid mt-2 font-mono">
                  ₺{selectedExpense.amount.toLocaleString('tr-TR')}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">Kategori</span>
                    <span className="text-sm font-semibold text-text-primary">{selectedExpense.category}</span>
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">Tekrarlama</span>
                    <span className="text-sm font-semibold text-text-primary">{selectedExpense.recurrence || 'Tek Seferlik'}</span>
                  </div>
                  <div className="col-span-2 bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-text-secondary"><ShoppingBag size={16}/></div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Alıcı / Kurum</span>
                      <span className="text-sm font-semibold text-text-primary">{selectedExpense.recipient || '-'}</span>
                    </div>
                  </div>
                </div>

                {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                  <div className="mt-6">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-3">Etiketler</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpense.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-text-primary">
                          <Tag size={12} className="text-crit-vivid opacity-70" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedExpense.notes && (
                  <div className="mt-6">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-3">Açıklama / Notlar</span>
                    <div className="text-sm text-text-secondary leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      {selectedExpense.notes}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Stat Modal */}
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
              <p className="text-4xl font-display font-black text-text-primary mb-6">
                {summaryModal.value}
              </p>
              
              {/* Optional detail breakdown inside modal */}
              <div className="bg-white/[0.02] rounded-xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                 {summaryModal.type === 'completed' || summaryModal.type === 'planned' ? (
                   <div className="p-4 space-y-3">
                     {expenses
                       .filter(exp => summaryModal.type === 'completed' ? exp.status === 'Gerçekleşti' : exp.status === 'Planlı')
                       .slice(0, 5)
                       .map(exp => (
                         <div key={exp.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                           <div className="truncate pr-2">
                             <p className="text-sm font-bold text-text-primary truncate">{exp.title}</p>
                             <p className="text-[10px] text-text-secondary">{new Date(exp.date).toLocaleDateString('tr-TR')}</p>
                           </div>
                           <span className="text-sm font-mono font-bold text-crit-vivid shrink-0">₺{exp.amount.toLocaleString('tr-TR')}</span>
                         </div>
                       ))}
                     {expenses.filter(exp => summaryModal.type === 'completed' ? exp.status === 'Gerçekleşti' : exp.status === 'Planlı').length === 0 && (
                       <p className="text-xs text-text-secondary text-center py-2">Kayıt yok.</p>
                     )}
                   </div>
                 ) : (
                   <div className="p-4">
                     <p className="text-sm text-text-secondary">Bu metrik, sistemdeki mevcut verileriniz kullanılarak hesaplanmıştır.</p>
                   </div>
                 )}
              </div>

              <div className="mt-6 flex justify-end">
                 <button onClick={() => setSummaryModal(null)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors">
                   Kapat
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
