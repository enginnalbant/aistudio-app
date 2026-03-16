import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { 
  ListTodo, Plus, AlertTriangle, TrendingUp, Package, 
  BrainCircuit, X, CheckCircle2, XCircle, Clock, 
  FileText, DollarSign, BarChart3, Activity, Search,
  Filter, ChevronRight, ArrowUpRight, History, Wallet,
  ArrowDownRight, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { PurchaseRequestWizard } from './PurchaseRequestWizard';
import { PurchaseRequestTable } from './PurchaseRequestTable';

interface PurchasingRequestsProps {
  setActiveModule?: (module: string) => void;
}

export function PurchasingRequests({ setActiveModule }: PurchasingRequestsProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardInitialStockId, setWizardInitialStockId] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [tableFilter, setTableFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
    fetchStocks();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/purchase-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setRequests([]);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await fetch('/api/stocks/summary');
      if (res.ok) {
        const data = await res.json();
        setStocks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setStocks([]);
    }
  };

  const openWizard = (stockId: string | null = null) => {
    setWizardInitialStockId(stockId);
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
    setWizardInitialStockId(null);
  };

  const handleSaveRequest = async (data: any) => {
    try {
      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          status: 'pending'
        })
      });
      if (res.ok) {
        setIsWizardOpen(false);
        fetchRequests();
        setToast({ message: 'Talep başarıyla oluşturuldu.', type: 'success' });
      }
    } catch (error) {
      console.error('Error saving request:', error);
      setToast({ message: 'Talep oluşturulurken bir hata oluştu.', type: 'error' });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/purchase-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequests();
        setToast({ message: 'Durum güncellendi.', type: 'success' });
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest({ ...selectedRequest, status });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Durum güncellenirken hata oluştu.', type: 'error' });
    }
  };

  const lowStockItems = stocks.filter(s => s.balance <= s.critical_level);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');

  const totalPendingCost = pendingRequests.reduce((sum, req) => 
    sum + (req.items?.reduce((s: number, i: any) => s + (i.qty * (i.estimated_price || 0)), 0) || 0)
  , 0);

  const totalApprovedCost = approvedRequests.reduce((sum, req) => 
    sum + (req.items?.reduce((s: number, i: any) => s + (i.qty * (i.estimated_price || 0)), 0) || 0)
  , 0);

  // Chart Data Generation
  const costTrendData = useMemo(() => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'];
    return months.map(month => ({
      name: month,
      cost: Math.floor(Math.random() * 50000) + 20000,
      requests: Math.floor(Math.random() * 15) + 5
    }));
  }, []);

  const departmentData = useMemo(() => [
    { name: 'Üretim', value: 45000, color: '#6366f1' },
    { name: 'Lojistik', value: 32000, color: '#8b5cf6' },
    { name: 'İdari', value: 18000, color: '#ec4899' },
    { name: 'Bakım', value: 25000, color: '#f59e0b' },
  ], []);

  const itemCounts: Record<string, {name: string, count: number}> = {};
  requests.forEach(req => {
    req.items?.forEach((item: any) => {
      if (!itemCounts[item.stock_id]) {
        itemCounts[item.stock_id] = { name: item.stock_name, count: 0 };
      }
      itemCounts[item.stock_id].count += item.qty;
    });
  });
  const topRequestedItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 3);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit"><Clock size={12} /> BEKLEYEN</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-fit"><CheckCircle2 size={12} /> ONAYLANDI</span>;
      case 'ordered':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 w-fit"><FileText size={12} /> SİPARİŞ EDİLDİ</span>;
      case 'received':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 w-fit"><Package size={12} /> TESLİM ALINDI</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-fit"><XCircle size={12} /> İPTAL EDİLDİ</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 w-fit">{status.toUpperCase()}</span>;
    }
  };

  return (
    <div className="h-full bg-slate-50/50 flex flex-col gap-8 p-8 pb-24 overflow-y-auto custom-scrollbar scroll-smooth">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={clsx(
              "fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 border",
              toast.type === 'success' ? "bg-emerald-600 text-white border-emerald-500" : "bg-rose-600 text-white border-rose-500"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest">Satınalma Yönetimi</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Talepler <span className="text-indigo-600">Merkezi</span>
          </h1>
          <div className="mt-4 relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Talep no, kişi veya departman ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchRequests();
              fetchStocks();
            }}
            className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            title="Yenile"
          >
            <Zap size={20} />
          </button>
          <button
            onClick={() => openWizard()}
            className="group flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 relative z-20 cursor-pointer"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Yeni Talep Oluştur
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Stats */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => setTableFilter('pending')}
            className={clsx(
              "bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer",
              tableFilter === 'pending' ? "border-amber-500 ring-2 ring-amber-500/10" : "border-slate-200"
            )}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Clock size={80} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bekleyen</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{pendingRequests.length}</span>
              <span className="text-slate-400 font-medium">Talep</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tahmini Maliyet</span>
              <span className="text-sm font-bold text-slate-900">{totalPendingCost.toLocaleString('tr-TR')} ₺</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => setTableFilter('approved')}
            className={clsx(
              "bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer",
              tableFilter === 'approved' ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-200"
            )}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <CheckCircle2 size={80} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Onaylanan</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{approvedRequests.length}</span>
              <span className="text-slate-400 font-medium">Talep</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Toplam Tutar</span>
              <span className="text-sm font-bold text-slate-900">{totalApprovedCost.toLocaleString('tr-TR')} ₺</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => setTableFilter('all')}
            className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <AlertTriangle size={80} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kritik Stok</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-rose-600">{lowStockItems.length}</span>
              <span className="text-slate-400 font-medium">Kalem</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] uppercase tracking-wider">
                <Activity size={12} />
                Acil Aksiyon Gerekli
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Insights Card */}
        <div className="md:col-span-4">
          <motion.div 
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setToast({ message: 'Yapay zeka analizleri güncelleniyor...', type: 'success' });
              fetchRequests();
            }}
            className="h-full bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden cursor-pointer group"
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
              <BrainCircuit size={160} />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <BrainCircuit size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">AI Öngörüleri</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-100">CANLI</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium leading-snug">
                  {lowStockItems.length > 0 
                    ? `${lowStockItems[0].name} için kritik seviye uyarısı! Son tüketim verilerine göre 48 saat içinde stoklar tükenebilir.`
                    : 'Stok verimliliğiniz %94 seviyesinde. Mevcut talepleriniz bütçe hedeflerinizle uyumlu ilerliyor.'}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between bg-white/10 rounded-2xl p-3">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-indigo-600 bg-indigo-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">3 Yeni Öneri</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Charts & More Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Maliyet Trendleri</h3>
              <p className="text-sm text-slate-500 font-medium">Son 6 aylık satınalma harcamaları</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-slate-400 uppercase">Harcama</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full relative min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <AreaChart data={costTrendData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCost)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-2">Departman Bazlı</h3>
          <p className="text-sm text-slate-500 font-medium mb-8">Harcama dağılımı</p>
          <div className="h-[300px] w-full relative min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={departmentData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTableFilter('approved')}
          className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between cursor-pointer group hover:border-indigo-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Wallet size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
              <ArrowUpRight size={14} />
              12%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Aylık Bütçe</p>
            <h4 className="text-2xl font-black text-slate-900">125.400 ₺</h4>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-indigo-600 w-3/4" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('Ortalama onay süresi analizi hazırlanıyor...')}
          className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between cursor-pointer group hover:border-rose-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <History size={24} />
            </div>
            <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg text-xs font-bold">
              <ArrowDownRight size={14} />
              4%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ort. Onay Süresi</p>
            <h4 className="text-2xl font-black text-slate-900">4.2 Saat</h4>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-4">Geçen aya göre %4 daha hızlı</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTableFilter('received')}
          className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between cursor-pointer group hover:border-emerald-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tamamlanan</p>
            <h4 className="text-2xl font-black text-slate-900">84%</h4>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-4">Hedef: %90</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTableFilter('ordered')}
          className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between cursor-pointer group hover:border-amber-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Activity size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Aktif Tedarikçi</p>
            <h4 className="text-2xl font-black text-slate-900">12</h4>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-4">3 Yeni Tedarikçi</p>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table Section */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ListTodo size={20} className="text-indigo-600" />
                Talepler Listesi
              </h2>
              <div className="flex items-center gap-1">
                {['all', 'pending', 'approved'].map(f => (
                  <button
                    key={f}
                    onClick={() => setTableFilter(f)}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                      tableFilter === f 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                        : "text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {f === 'all' ? 'Hepsi' : f === 'pending' ? 'Bekleyen' : 'Onaylı'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              {requests.length} Toplam Kayıt
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px]">
            <div className="overflow-x-auto custom-scrollbar">
              <PurchaseRequestTable 
                requests={requests} 
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={setSelectedRequest}
                statusFilter={tableFilter}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Requested Items */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp size={16} className="text-indigo-600" />
              Trend Talepler
            </h3>
            <div className="space-y-4">
              {topRequestedItems.length > 0 ? topRequestedItems.map((item, i) => (
                <motion.div 
                  whileHover={{ x: 4 }}
                  key={i} 
                  className="group cursor-pointer"
                  onClick={() => {
                    setTableFilter('all');
                    setSearchQuery(item.name);
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                    <span className="text-xs font-black text-slate-900">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / topRequestedItems[0].count) * 100}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <Package size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Veri Bekleniyor</p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Stocks Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <AlertTriangle size={16} className="text-rose-600" />
                Kritik Stoklar
              </h3>
              <button 
                onClick={fetchStocks}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
              >
                <Zap size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-200 mb-2" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Her Şey Yolunda</p>
                </div>
              ) : (
                lowStockItems.map(item => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-rose-200 transition-all group cursor-pointer"
                    onClick={() => {
                      openWizard(item.id);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                      <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">KRİTİK</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Mevcut: {item.balance} {item.unit}</div>
                      <button className="text-indigo-600 hover:text-indigo-700">
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <History size={16} className="text-indigo-600" />
              Son Aktiviteler
            </h3>
            <div className="space-y-4">
              {requests.slice(0, 4).map((req, i) => (
                <motion.div 
                  whileHover={{ x: 4 }}
                  key={i} 
                  className="flex gap-3 relative cursor-pointer group"
                  onClick={() => setSelectedRequest(req)}
                >
                  {i < 3 && <div className="absolute left-[11px] top-8 bottom-[-16px] w-0.5 bg-slate-100" />}
                  <div className={clsx(
                    "w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white transition-transform group-hover:scale-110",
                    req.status === 'approved' ? "bg-emerald-500" : 
                    req.status === 'pending' ? "bg-amber-500" : "bg-slate-400"
                  )}>
                    {req.status === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {req.requested_by} <span className="text-slate-400 font-medium">yeni bir talep oluşturdu</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(req.date).toLocaleDateString('tr-TR')} • PRQ-{req.id}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {isWizardOpen && (
          <PurchaseRequestWizard 
            key="wizard"
            initialStockId={wizardInitialStockId}
            onClose={closeWizard}
            onSave={handleSaveRequest}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <FileText size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Talep Detayı</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    PRQ-{selectedRequest.id}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)} 
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tarih</div>
                    <div className="font-bold text-slate-900">{new Date(selectedRequest.date).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Talep Eden</div>
                    <div className="font-bold text-slate-900">{selectedRequest.requested_by}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Departman</div>
                    <div className="font-bold text-slate-900">{selectedRequest.department}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Durum</div>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText size={14} className="text-indigo-600" />
                      Açıklama / Notlar
                    </h3>
                    <div className="text-slate-700 text-sm leading-relaxed font-medium">
                      {selectedRequest.notes}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Package size={14} className="text-indigo-600" />
                    Talep Edilen Kalemler
                  </h3>
                  <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Stok</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Miktar</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Tahmini Fiyat</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Tedarikçi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedRequest.items?.map((item: any) => (
                          <tr 
                            key={item.id} 
                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                            onClick={() => setActiveModule?.('stocks-all')}
                          >
                            <td className="p-4">
                              <div className="font-bold text-slate-900 group-hover/row:text-indigo-600 transition-colors">{item.stock_name}</div>
                              <div className="text-[10px] font-bold text-slate-400 font-mono">{item.stock_code}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-black text-slate-900">{item.qty}</span>
                              <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">{item.unit}</span>
                            </td>
                            <td className="p-4">
                              {item.estimated_price ? (
                                <span className="font-black text-indigo-600">{item.estimated_price.toLocaleString('tr-TR')} ₺</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="p-4 text-slate-500 font-bold text-xs">{item.supplier_name || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-4 shrink-0 bg-slate-50/50">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'cancelled')}
                      className="px-6 py-3 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      İptal Et
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Talebi Onayla
                    </button>
                  </>
                )}
                {selectedRequest.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'ordered')}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Siparişe Dönüştür
                  </button>
                )}
                {selectedRequest.status === 'ordered' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'received')}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    <Package size={16} />
                    Teslim Alındı İşaretle
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
