import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  BarChart2,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  ArrowRight,
  Zap,
  Layers,
  Plus,
  Search,
  CheckCircle2
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
  Cell
} from 'recharts';
import { StockWizardModal } from './StockWizardModal';

const COLORS = ['#00F2FF', '#00D1FF', '#7000FF', '#FF00E5', '#FFD600'];

export function StocksDashboard({ setActiveModule }: { setActiveModule: (module: string) => void }) {
  const [stocks, setStocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stocks/summary');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setStocks(data);
    } catch (error: any) {
      console.error('Error fetching stocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = stocks.length;
  const totalQty = stocks.reduce((acc, curr) => acc + curr.balance, 0);
  const criticalStocks = stocks.filter(s => s.balance < s.critical_level);
  const totalValue = stocks.reduce((acc, curr) => acc + (curr.balance * (curr.purchase_price || 0)), 0);

  // Category distribution
  const categoryData = Object.entries(
    stocks.reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Top stocks by balance
  const topStocks = [...stocks]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 6)
    .map(s => ({
      name: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
      balance: s.balance,
      fullName: s.name
    }));

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">Veri Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 pb-12">
        {/* Header */}
        <div className="md:col-span-4 lg:col-span-4 flex flex-col justify-center">
        <h1 className="display-large mb-4">Envanter</h1>
        <p className="text-text-secondary max-w-md font-medium">
          Depo mevcudu, kritik seviyeler ve envanter değeri analizi.
        </p>
      </div>

      {/* Actions */}
      <div className="md:col-span-4 lg:col-span-2 bento-card p-6 flex flex-col justify-between bg-accent text-bg-card">
        <div className="flex items-center justify-between mb-8">
          <span className="label-mono text-bg-card/60">Envanter İşlemleri</span>
          <Package size={20} />
        </div>
        <button onClick={() => setIsWizardOpen(true)} className="flex items-center justify-between p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-bold">
          Yeni Stok Kartı <Plus size={16} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="md:col-span-2 lg:col-span-2 bento-card p-6 flex flex-col justify-between">
        <span className="label-mono">Toplam Çeşit</span>
        <div>
          <div className="text-4xl font-bold tracking-tighter">{totalItems}</div>
          <p className="text-xs text-text-secondary font-bold mt-1 uppercase tracking-wider">Ürün Kartı</p>
        </div>
      </div>

      <div className="md:col-span-2 lg:col-span-2 bento-card p-6 flex flex-col justify-between">
        <span className="label-mono">Envanter Değeri</span>
        <div>
          <div className="text-4xl font-bold tracking-tighter">₺{totalValue.toLocaleString()}</div>
          <p className="text-xs text-text-secondary font-bold mt-1 uppercase tracking-wider">Tahmini Değer</p>
        </div>
      </div>

      <div className="md:col-span-2 lg:col-span-2 bento-card p-6 flex flex-col justify-between">
        <span className="label-mono">Kritik Stok</span>
        <div>
          <div className={`text-4xl font-bold tracking-tighter ${criticalStocks.length > 0 ? 'text-rose-600' : ''}`}>
            {criticalStocks.length}
          </div>
          <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${criticalStocks.length > 0 ? 'text-rose-600' : 'text-text-secondary'}`}>
            {criticalStocks.length > 0 ? 'Dikkat Gerekli' : 'Güvenli Seviye'}
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="md:col-span-4 lg:col-span-4 bento-card p-8 min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="label-mono">Stok Dağılımı</span>
            <h2 className="text-2xl font-bold mt-1">En Yüksek Mevcutlar</h2>
          </div>
          <BarChart2 size={20} className="text-text-secondary opacity-50" />
        </div>
        <div className="flex-1 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
            <BarChart data={topStocks}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
              <Bar dataKey="balance" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="md:col-span-2 lg:col-span-2 bento-card p-8 flex flex-col">
        <span className="label-mono mb-8">Kategori Analizi</span>
        <div className="flex-1 relative min-h-[200px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold">{categoryData.length}</span>
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Kategori</span>
          </div>
        </div>
        <div className="space-y-2 mt-8">
          {categoryData.slice(0, 4).map((cat, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-medium">{cat.name}</span>
              </div>
              <span className="text-xs font-bold">{String(cat.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Items List */}
      <div className="md:col-span-4 lg:col-span-6 bento-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold tracking-tight">Kritik Seviye Uyarıları</h2>
          <span className="label-mono text-rose-600">{criticalStocks.length} Ürün</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalStocks.length > 0 ? (
            criticalStocks.map((stock, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-rose-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-rose-600 transition-colors">{stock.name}</h4>
                    <p className="label-mono text-[10px] opacity-50">{stock.code} • {stock.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-rose-600">{stock.balance}</div>
                  <div className="label-mono text-[9px] opacity-50">Mevcut / {stock.critical_level}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 flex flex-col items-center justify-center py-12 text-text-secondary">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4 opacity-20" />
              <p className="text-sm font-medium">Tüm stok seviyeleri güvenli limitler dahilinde.</p>
            </div>
          )}
        </div>
      </div>

      <StockWizardModal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSave={() => {
          setIsWizardOpen(false);
          fetchStocks();
        }} 
      />
      </div>
    </div>
  );
}
