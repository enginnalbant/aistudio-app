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
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
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

const MOCK_EXPENSES: Expense[] = [];

const CATEGORIES = ['Barınma', 'Gıda', 'Fatura', 'Seyahat', 'Eğlence', 'Sağlık', 'Ulaşım', 'Diğer'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#64748b'];

export const FinanceExpenses = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('finance_expenses', MOCK_EXPENSES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  
  // Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [summaryModal, setSummaryModal] = useState<{title: string; value: string; type: string} | null>(null);

  // Form States
  const [formData, setFormData] = useState<Partial<Expense>>({
    title: '', amount: 0, category: 'Gıda', tags: [], date: new Date().toISOString().split('T')[0], status: 'Gerçekleşti', recipient: '', notes: '', recurrence: 'Tek Seferlik'
  });
  const [newTag, setNewTag] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = (exp.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                            (exp.recipient || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesCategory = selectedCategory === 'Tümü' || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm, selectedCategory]);

  const totalExpense = expenses.filter(e => e.status === 'Gerçekleşti').reduce((sum, e) => sum + e.amount, 0);
  const plannedExpense = expenses.filter(e => e.status === 'Planlı').reduce((sum, e) => sum + e.amount, 0);
  
  const categoryData = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat && e.status === 'Gerçekleşti').reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.value > 0);

  const monthlyData: any[] = [];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      title: formData.title,
      amount: Number(formData.amount),
      category: formData.category || 'Diğer',
      tags: formData.tags || [],
      date: formData.date || new Date().toISOString().split('T')[0],
      status: formData.status as 'Gerçekleşti' | 'Planlı',
      recurrence: formData.recurrence as 'Tek Seferlik' | 'Haftalık' | 'Aylık' | 'Yıllık',
      recipient: formData.recipient || '',
      notes: formData.notes
    };
    
    setExpenses([newExpense, ...expenses]);
    setIsWizardOpen(false);
    setFormData({ title: '', amount: 0, category: 'Gıda', tags: [], date: new Date().toISOString().split('T')[0], status: 'Gerçekleşti', recipient: '', notes: '', recurrence: 'Tek Seferlik' });
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
            Giderlerim
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Anlık ve planlı giderlerinizi takip edin, harcama alışkanlıklarınızı analiz edin.
          </p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 bg-crit-vivid text-pure-white font-bold px-4 py-2.5 rounded-xl hover:bg-crit-vivid/90 transition-all shadow-lg shadow-crit-vivid/20 active:scale-95"
        >
          <Plus size={18} />
          <span>Yeni Gider Ekle</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setSummaryModal({
            title: 'Gerçekleşen Gider', 
            value: `₺${totalExpense.toLocaleString('tr-TR')}`, 
            type: 'completed'
          })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-crit-vivid/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-crit-vivid/10 rounded-xl text-crit-vivid group-hover:scale-110 transition-transform">
              <Receipt size={20} />
            </div>
            <span className="text-xs font-mono font-bold text-crit-vivid bg-crit-vivid/10 px-2 py-1 rounded-md">Toplam</span>
          </div>
          <h3 className="text-sm font-bold text-text-secondary mb-1">Gerçekleşen Gider</h3>
          <p className="text-2xl font-display font-black text-text-primary">
            ₺{totalExpense.toLocaleString('tr-TR')}
          </p>
        </div>

        <div 
          onClick={() => setSummaryModal({
            title: 'Planlı Gider', 
            value: `₺${plannedExpense.toLocaleString('tr-TR')}`, 
            type: 'planned'
          })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-nrg-sun/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-nrg-sun/10 rounded-xl text-nrg-sun group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <span className="text-xs font-mono font-bold text-nrg-sun bg-nrg-sun/10 px-2 py-1 rounded-md">Planlı</span>
          </div>
          <h3 className="text-sm font-bold text-text-secondary mb-1">Planlı Gider</h3>
          <p className="text-2xl font-display font-black text-text-primary">
            ₺{plannedExpense.toLocaleString('tr-TR')}
          </p>
        </div>

        <div 
          onClick={() => setSummaryModal({
            title: 'Aylık Değişim', 
            value: '-%4.2', 
            type: 'trend'
          })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-crit-vivid/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-crit-vivid/10 rounded-xl text-crit-vivid group-hover:scale-110 transition-transform">
              <TrendingDown size={20} />
            </div>
            <span className="text-xs font-mono font-bold text-crit-vivid bg-crit-vivid/10 px-2 py-1 rounded-md">Trend</span>
          </div>
          <h3 className="text-sm font-bold text-text-secondary mb-1">Aylık Değişim</h3>
          <p className="text-2xl font-display font-black text-text-primary flex items-baseline gap-2">
            -%4.2
            <span className="text-xs font-mono text-text-secondary opacity-60">Geçen aya göre</span>
          </p>
        </div>

        <div 
          onClick={() => setSummaryModal({
            title: 'En Yüksek Harcama Kalemi', 
            value: categoryData.length > 0 ? categoryData.sort((a,b)=>b.value-a.value)[0].name : '-', 
            type: 'top-category'
          })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group overflow-hidden relative"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <PieChartIcon size={120} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2.5 bg-crit-vivid/10 rounded-xl text-crit-vivid group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
          </div>
          <h3 className="text-sm font-bold text-text-secondary mb-1 relative z-10">En Yüksek Harcama</h3>
          <p className="text-xl font-display font-black text-text-primary relative z-10 truncate">
            {categoryData.length > 0 ? categoryData.sort((a,b)=>b.value-a.value)[0].name : '-'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
            <TrendingDown size={16} className="text-crit-vivid" />
            Harcama Trendi (Son 6 Ay)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmountExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Gider']}
                />
                <Area type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAmountExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
            <PieChartIcon size={16} className="text-crit-vivid" />
            Kategori Dağılımı
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
          </div>
        </div>
      </div>

      {/* Dynamic Table Section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <CreditCard size={16} className="text-crit-vivid" />
            Gider Hareketleri
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                type="text"
                placeholder="Gider veya alıcı ara..."
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-3 px-4 text-xs font-bold text-text-secondary w-1/4">Başlık / Alıcı</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Tutar</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Kategori</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Tarih</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary">Durum</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary text-right">Detay</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-text-secondary">
                    Eşleşen gider kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    onClick={() => setSelectedExpense(expense)}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary group-hover:text-crit-vivid transition-colors flex items-center gap-2">
                          {expense.title}
                          {expense.recurrence && expense.recurrence !== 'Tek Seferlik' && (
                            <span className="text-[10px] font-bold text-crit-vivid bg-crit-vivid/10 px-1.5 py-0.5 rounded-md leading-none">
                              {expense.recurrence}
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-text-secondary">{expense.recipient}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono font-bold text-text-primary">
                        ₺{expense.amount.toLocaleString('tr-TR')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-text-secondary">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
                        <Calendar size={12} />
                        {new Date(expense.date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        expense.status === 'Gerçekleşti' 
                          ? 'bg-crit-vivid/10 text-crit-vivid border border-crit-vivid/20' 
                          : 'bg-nrg-sun/10 text-nrg-sun border border-nrg-sun/20'
                      }`}>
                        {expense.status === 'Gerçekleşti' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {expense.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-2 text-text-secondary group-hover:text-crit-vivid transition-colors">
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

      {/* Add Expense Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02]">
                <h2 className="text-xl font-display font-black text-text-primary flex items-center gap-2">
                  <Plus size={20} className="text-crit-vivid" />
                  Yeni Gider Ekle
                </h2>
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form id="expense-wizard" onSubmit={handleAddExpense} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Gider Başlığı</label>
                      <input 
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Örn: Market Alışverişi"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-crit-vivid/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tutar (₺)</label>
                      <input 
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                        placeholder="0.00"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-text-primary focus:outline-none focus:border-crit-vivid/50"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary appearance-none focus:outline-none focus:border-crit-vivid/50"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Alıcı / Kurum</label>
                      <input 
                        type="text"
                        value={formData.recipient}
                        onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                        placeholder="Örn: Migros, Ev Sahibi"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-crit-vivid/50"
                      />
                    </div>
                  </div>

                  {/* Date & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tarih</label>
                      <input 
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-text-primary focus:outline-none focus:border-crit-vivid/50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Durum</label>
                      <div className="flex bg-white/[0.03] border border-white/10 rounded-xl p-1">
                        {(['Gerçekleşti', 'Planlı'] as const).map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setFormData({...formData, status})}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                              formData.status === status 
                                ? (status === 'Gerçekleşti' ? 'bg-crit-vivid text-pure-white shadow-lg' : 'bg-nrg-sun text-pure-black shadow-lg')
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recurrence */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tekrarlama</label>
                    <select 
                      value={formData.recurrence || 'Tek Seferlik'}
                      onChange={(e) => setFormData({...formData, recurrence: e.target.value as any})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary appearance-none focus:outline-none focus:border-focus-neon/50"
                    >
                      {['Tek Seferlik', 'Haftalık', 'Aylık', 'Yıllık'].map(rec => (
                        <option key={rec} value={rec} className="bg-neutral-900">{rec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Etiketler</label>
                    <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {formData.tags?.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg text-xs text-text-primary">
                            <Tag size={10} className="text-crit-vivid" />
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-crit-vivid ml-1"><X size={12}/></button>
                          </span>
                        ))}
                        {(!formData.tags || formData.tags.length === 0) && (
                          <span className="text-xs text-text-secondary italic">Henüz etiket eklenmedi.</span>
                        )}
                      </div>
                      <input 
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="Etiket yazıp Enter'a basın..."
                        className="w-full bg-transparent border-t border-white/10 pt-3 text-xs text-text-primary focus:outline-none placeholder:text-text-secondary/50"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Açıklama / Notlar</label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Bu giderle ilgili ek detaylar..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-crit-vivid/50 min-h-[80px] resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  form="expense-wizard"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-crit-vivid text-pure-white hover:bg-crit-vivid/90 transition-all shadow-lg shadow-crit-vivid/20 active:scale-95"
                >
                  Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Detail Modal */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedExpense(null)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors z-10"
              >
                <X size={18} />
              </button>

              <div className="p-8 pt-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedExpense.status === 'Gerçekleşti' ? 'bg-crit-vivid/10 text-crit-vivid' : 'bg-nrg-sun/10 text-nrg-sun'}`}>
                    <Receipt size={20} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${selectedExpense.status === 'Gerçekleşti' ? 'bg-crit-vivid/10 text-crit-vivid border-crit-vivid/20' : 'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'}`}>
                    {selectedExpense.status}
                  </span>
                </div>
                
                <h2 className="text-2xl font-display font-black text-text-primary mt-4 leading-tight">
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
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">Tarih</span>
                    <span className="text-sm font-semibold text-text-primary font-mono">{new Date(selectedExpense.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="col-span-2 bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">Alıcı</span>
                    <span className="text-sm font-semibold text-text-primary">{selectedExpense.recipient}</span>
                  </div>
                </div>

                {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                  <div className="mt-6">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-2">Etiketler</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpense.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/10 rounded-md text-xs font-medium text-text-primary">
                          <Tag size={10} className="text-text-secondary" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedExpense.notes && (
                  <div className="mt-6">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-2">Açıklama</span>
                    <p className="text-sm text-text-secondary leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      {selectedExpense.notes}
                    </p>
                  </div>
                )}

              </div>
              <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-center">
                 <button onClick={() => setSelectedExpense(null)} className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
                   Kapat
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
                {summaryModal.type === 'completed' || summaryModal.type === 'planned' || summaryModal.type === 'top-category' ? (
                  <div className="space-y-3">
                    {expenses
                      .filter(exp => {
                        if (summaryModal.type === 'completed') return exp.status === 'Gerçekleşti';
                        if (summaryModal.type === 'planned') return exp.status === 'Planlı';
                        if (summaryModal.type === 'top-category') return exp.category === summaryModal.value;
                        return true;
                      })
                      .map(exp => (
                        <div key={exp.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="text-sm font-bold text-text-primary">{exp.title}</p>
                            <p className="text-[10px] text-text-secondary">{new Date(exp.date).toLocaleDateString('tr-TR')}</p>
                          </div>
                          <span className="text-sm font-mono font-bold text-crit-vivid">₺{exp.amount.toLocaleString('tr-TR')}</span>
                        </div>
                      ))}
                    {expenses.filter(exp => {
                        if (summaryModal.type === 'completed') return exp.status === 'Gerçekleşti';
                        if (summaryModal.type === 'planned') return exp.status === 'Planlı';
                        if (summaryModal.type === 'top-category') return exp.category === summaryModal.value;
                        return true;
                      }).length === 0 && (
                        <p className="text-xs text-text-secondary text-center py-4">Kayıt bulunamadı.</p>
                      )}
                  </div>
                ) : summaryModal.type === 'trend' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Geçen Ay Toplam</span>
                      <span className="text-sm font-mono font-bold text-text-primary">₺22.000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Bu Ay Toplam</span>
                      <span className="text-sm font-mono font-bold text-crit-vivid">₺{totalExpense.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-xs text-text-secondary">Geçen aya kıyasla giderlerinizde azalma var, tebrikler!</p>
                    </div>
                  </div>
                ) : null}
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

    </motion.div>
  );
};
