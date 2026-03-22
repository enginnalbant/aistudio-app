import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  Package, Truck, Calendar, PieChart as PieChartIcon,
  Download, Filter, Building2
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

export function PurchasingReports() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y, all

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/purchase-orders');
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Data Aggregation
  const { 
    totalSpend, 
    monthlySpendData, 
    supplierSpendData, 
    statusData,
    topItemsData
  } = useMemo(() => {
    let filteredOrders = [...orders];
    
    // Time filtering could be implemented here based on timeRange
    // For now, we'll use all data but structure it to be ready for filtering
    const now = new Date();
    if (timeRange !== 'all') {
      const monthsToSubtract = timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
      const cutoffDate = new Date(now.setMonth(now.getMonth() - monthsToSubtract));
      filteredOrders = orders.filter(o => new Date(o.date) >= cutoffDate);
    }

    let total = 0;
    const monthlyMap = new Map<string, number>();
    const supplierMap = new Map<string, number>();
    const statusMap = new Map<string, number>();
    const itemMap = new Map<string, { name: string, qty: number, spend: number }>();

    filteredOrders.forEach(order => {
      const orderTotal = order.items.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0);
      total += orderTotal;

      // Monthly
      const date = new Date(order.date);
      const monthYear = `${date.toLocaleString('tr-TR', { month: 'short' })} ${date.getFullYear()}`;
      monthlyMap.set(monthYear, (monthlyMap.get(monthYear) || 0) + orderTotal);

      // Supplier
      supplierMap.set(order.supplier_name, (supplierMap.get(order.supplier_name) || 0) + orderTotal);

      // Status
      const statusLabel = order.status === 'completed' ? 'Tamamlandı' : order.status === 'open' ? 'Açık' : 'İptal';
      statusMap.set(statusLabel, (statusMap.get(statusLabel) || 0) + 1);

      // Items
      order.items.forEach((item: any) => {
        const existing = itemMap.get(item.stock_code) || { name: item.stock_name, qty: 0, spend: 0 };
        itemMap.set(item.stock_code, {
          name: item.stock_name,
          qty: existing.qty + item.qty,
          spend: existing.spend + (item.qty * item.price)
        });
      });
    });

    return {
      totalSpend: total,
      monthlySpendData: Array.from(monthlyMap, ([month, spend]) => ({ month, spend })).reverse(), // Assuming chronological order from API
      supplierSpendData: Array.from(supplierMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
      statusData: Array.from(statusMap, ([name, value]) => ({ name, value })),
      topItemsData: Array.from(itemMap.values()).sort((a, b) => b.spend - a.spend).slice(0, 5)
    };
  }, [orders, timeRange]);

  const formatCurrency = (value: number) => `${value.toLocaleString('tr-TR')} ₺`;

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Raporlar yükleniyor...</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Satınalma Raporları
            <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
              Analitik
            </div>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Satınalma performansınızı, harcamalarınızı ve tedarikçi verimliliğini analiz edin.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            {[
              { id: '1m', label: '1A' },
              { id: '3m', label: '3A' },
              { id: '6m', label: '6A' },
              { id: '1y', label: '1Y' },
              { id: 'all', label: 'Tümü' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all",
                  timeRange === t.id ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download size={20} />
            Raporu İndir
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><DollarSign size={24} /></div>
            <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><TrendingDown size={14} /> %12</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{formatCurrency(totalSpend)}</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Toplam Harcama</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Package size={24} /></div>
            <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><TrendingUp size={14} /> %5</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{orders.length}</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Toplam Sipariş</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Truck size={24} /></div>
            <span className="flex items-center gap-1 text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">-</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{supplierSpendData.length}</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktif Tedarikçi</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><PieChartIcon size={24} /></div>
            <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><TrendingUp size={14} /> %2</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {orders.length > 0 ? Math.round((statusData.find(s => s.name === 'Tamamlandı')?.value || 0) / orders.length * 100) : 0}%
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tamamlanma Oranı</div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={20} />
            Aylık Harcama Trendi
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₺`}
                  dx={-10}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Harcama']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Suppliers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Building2 className="text-emerald-500" size={20} />
            En Çok Harcama Yapılan Tedarikçiler
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierSpendData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} width={120} />
                <RechartsTooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Harcama']}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24}>
                  {supplierSpendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="text-amber-500" size={20} />
            Sipariş Durum Dağılımı
          </h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => {
                    let color = '#94a3b8';
                    if (entry.name === 'Tamamlandı') color = '#10b981';
                    if (entry.name === 'Açık') color = '#f59e0b';
                    if (entry.name === 'İptal') color = '#f43f5e';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`${value} Sipariş`, 'Miktar']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Items List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Package className="text-rose-500" size={20} />
            En Çok Alınan Kalemler
          </h3>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="space-y-4">
              {topItemsData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 font-black text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs font-medium text-slate-500">{item.qty} Adet Alındı</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-indigo-600">{formatCurrency(item.spend)}</div>
                  </div>
                </div>
              ))}
              {topItemsData.length === 0 && (
                <div className="text-center py-8 text-slate-500">Veri bulunamadı.</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
