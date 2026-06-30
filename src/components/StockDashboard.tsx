import React from 'react';
import { 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  History, 
  Truck, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Plus,
  Download,
  RotateCcw,
  RefreshCw,
  Box,
  Clock,
  User,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import clsx from 'clsx';

/* ------------------------------- Mock Data ------------------------------- */

const CATEGORY_VALUE_DISTRIBUTION = [
  { name: 'Hammadde', value: 850000, color: '#3b82f6' },
  { name: 'Yarı Mamul', value: 420000, color: '#8b5cf6' },
  { name: 'Mamul', value: 980000, color: '#06b6d4' },
  { name: 'Sarf Malz.', value: 120000, color: '#f59e0b' },
  { name: 'Ambalaj', value: 35000, color: '#ec4899' },
];

const MOVEMENT_HISTORY_30D = [
  { day: '1', in: 45, out: 30 },
  { day: '5', in: 52, out: 40 },
  { day: '10', in: 38, out: 65 },
  { day: '15', in: 85, out: 42 },
  { day: '20', in: 48, out: 38 },
  { day: '25', in: 62, out: 55 },
  { day: '30', in: 55, out: 48 },
];

const WAREHOUSE_CAPACITY = [
  { name: 'Ana Depo', value: 85, fill: '#3b82f6' },
  { name: 'Bölge Depo', value: 45, fill: '#8b5cf6' },
  { name: 'Sarf Malz.', value: 92, fill: '#f59e0b' },
];

const RECENT_MOVEMENTS = [
  { id: 1, date: '12.05.2026 14:20', stockName: 'Alüminyum Profil A1', type: 'ÇIKIŞ', amount: '-45 Adet', user: 'Ahmet Y.', color: 'rose' },
  { id: 2, date: '12.05.2026 13:15', stockName: 'Elektrik Motoru 1.5kW', type: 'GİRİŞ', amount: '+10 Adet', user: 'Mehmet S.', color: 'emerald' },
  { id: 3, date: '12.05.2026 11:45', stockName: 'Paslanmaz Vida M8', type: 'GİRİŞ', amount: '+5000 Adet', user: 'Can K.', color: 'emerald' },
  { id: 4, date: '12.05.2026 10:30', stockName: 'Karton Kutu 40x40', type: 'ÇIKIŞ', amount: '-1200 Adet', user: 'Ayşe B.', color: 'rose' },
  { id: 5, date: '12.05.2026 09:12', stockName: 'Boya Beyaz 20kg', type: 'GİRİŞ', amount: '+40 Paket', user: 'Demir T.', color: 'emerald' },
];

const CRITICAL_STOCKS = [
  { name: 'Elektrik Motoru 1.5kW', current: 8, min: 10, progress: 80, color: 'rose' },
  { name: 'Karton Kutu 40x40', current: 500, min: 1000, progress: 50, color: 'orange' },
  { name: 'Hidrolik Yağ ISO 46', current: 0, min: 200, progress: 0, color: 'rose' },
  { name: 'Alüminyum Profil A1', current: 120, min: 300, progress: 40, color: 'orange' },
  { name: 'Rulman 6204', current: 15, min: 30, progress: 50, color: 'orange' },
];

/* ------------------------------- Components ------------------------------ */

const navigate = (moduleId: string) => {
  if ((window as any).setActiveModule) {
    (window as any).setActiveModule(moduleId);
  }
};

const StatCard = ({ title, value, icon, color, trend, onClick }: { title: string, value: string | number, icon: React.ReactNode, color: string, trend?: { value: string, up: boolean }, onClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -10, rotateX: 5, rotateY: 2, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="relative group perspective-1000 cursor-pointer"
    onClick={onClick}
  >
    <div className={clsx(
      "p-6 rounded-3xl border border-white/10 bg-skel-space/40 backdrop-blur-xl relative overflow-hidden transition-all duration-500",
      "hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-white/20"
    )}>
      <div className={clsx(
        "absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-3xl group-hover:opacity-30 transition-opacity",
        color === 'blue' ? "bg-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.6)]" : 
        color === 'purple' ? "bg-purple-500 shadow-[0_0_50px_rgba(139,92,246,0.6)]" : 
        color === 'cyan' ? "bg-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.6)]" : 
        color === 'orange' ? "bg-orange-500 shadow-[0_0_50px_rgba(245,158,11,0.6)]" : 
        color === 'pink' ? "bg-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.6)]" : "bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.6)]"
      )} />

      <div className="flex justify-between items-start mb-4">
        <div className={clsx(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg",
          color === 'blue' ? "bg-blue-500/20 text-blue-400" : 
          color === 'purple' ? "bg-purple-500/20 text-purple-400" : 
          color === 'cyan' ? "bg-cyan-500/20 text-cyan-400" : 
          color === 'orange' ? "bg-orange-500/20 text-orange-400" : 
          color === 'pink' ? "bg-pink-500/20 text-pink-400" : "bg-emerald-500/20 text-emerald-400"
        )}>
          {icon}
        </div>
        {trend && (
          <div className={clsx(
            "flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full border",
            trend.up ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          )}>
            {trend.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trend.value}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-text-secondary text-[10px] uppercase tracking-widest font-mono opacity-60">
          {title}
        </h3>
        <p className="text-2xl font-display font-black text-white tracking-tight">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

export const StockDashboard = () => {
  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-display font-black text-white italic tracking-tighter uppercase mb-2 shadow-blue-500/20"
          >
            STOKLAR <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">DASHBOARD</span>
          </motion.h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.3em] opacity-60">Envanter Özet & Durum Paneli</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:block text-right">
            <p className="text-white font-mono text-sm">12 Mayıs 2026</p>
            <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest">Salı | 11:25</p>
          </div>
          <button 
            onClick={() => navigate('stocks-list')}
            className="px-8 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 group"
          >
            Stok Listesine Git
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Toplam Stok Çeşidi" 
          value="12,450" 
          icon={<Layers size={24} />} 
          color="blue" 
          trend={{ value: "+12%", up: true }}
          onClick={() => navigate('stocks-list')}
        />
        <StatCard 
          title="Toplam Stok Değeri" 
          value="₺2.4M" 
          icon={<DollarSign size={24} />} 
          color="purple" 
          trend={{ value: "+4%", up: true }}
          onClick={() => navigate('stocks-reports')}
        />
        <StatCard 
          title="Kritik Seviye" 
          value="42" 
          icon={<AlertTriangle size={24} />} 
          color="orange" 
          trend={{ value: "-15%", up: false }}
          onClick={() => navigate('stocks-list')}
        />
        <StatCard 
          title="Stokta Sıfır" 
          value="12" 
          icon={<Box size={24} />} 
          color="pink" 
          onClick={() => navigate('stocks-list')}
        />
        <StatCard 
          title="Bugün Hareket" 
          value="156" 
          icon={<History size={24} />} 
          color="cyan" 
          onClick={() => navigate('stocks-reports')}
        />
        <StatCard 
          title="Bu Ay Eklenen" 
          value="84" 
          icon={<CheckCircle2 size={24} />} 
          color="emerald" 
          onClick={() => navigate('stocks-list')}
        />
        <StatCard 
          title="En Değerli Stok" 
          value="Plastik Kapak" 
          icon={<TrendingUp size={24} />} 
          color="blue" 
          onClick={() => navigate('stocks-list')}
        />
        <StatCard 
          title="Ort. Devir Hızı" 
          value="4.2 Gün" 
          icon={<Truck size={24} />} 
          color="orange" 
          onClick={() => navigate('stocks-analytics')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Value BarChart */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <Box size={16} className="text-blue-500" />
            Kategori Bazlı Değer Dağılımı
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_VALUE_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  tickFormatter={(val) => `₺${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[10, 10, 0, 0]}
                  onClick={() => navigate('stocks-reports')}
                >
                  {CATEGORY_VALUE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30D Movement AreaChart */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <TrendingUp size={16} className="text-emerald-500" />
            Son 30 Gün Stok Hareketi
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOVEMENT_HISTORY_30D}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
                <Area type="monotone" dataKey="in" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="out" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warehouse Capacity RadialBarChart */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <Truck size={16} className="text-orange-500" />
            Depo Doluluk Oranı
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={15} data={WAREHOUSE_CAPACITY}>
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Movements */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
              <History size={16} className="text-cyan-500" />
              Son Hareketler
            </h3>
            <button onClick={() => navigate('stocks-reports')} className="text-xs font-mono text-blue-400 hover:underline">Tümünü Gör</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Tarih</th>
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Stok Adı</th>
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Tip</th>
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Miktar</th>
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest text-right">Kullanıcı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RECENT_MOVEMENTS.map((mov) => (
                  <tr key={mov.id} onClick={() => navigate('stocks-reports')} className="group hover:bg-white/2 cursor-pointer transition-colors">
                    <td className="py-4 text-xs font-mono text-text-secondary">{mov.date}</td>
                    <td className="py-4 text-xs font-bold text-white">{mov.stockName}</td>
                    <td className="py-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-md text-[9px] font-black tracking-widest",
                        mov.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {mov.type}
                      </span>
                    </td>
                    <td className={clsx("py-4 text-xs font-mono font-bold", mov.color === 'emerald' ? "text-emerald-400" : "text-rose-400")}>{mov.amount}</td>
                    <td className="py-4 text-xs text-text-secondary text-right font-mono">{mov.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle size={16} className="text-orange-500" />
              Kritik Stok Uyarıları
            </h3>
            <button onClick={() => navigate('stocks-list')} className="text-xs font-mono text-orange-400 hover:underline">Filtrele</button>
          </div>
          <div className="space-y-6">
            {CRITICAL_STOCKS.map((stock, i) => (
              <div key={i} className="group p-4 rounded-3xl bg-white/2 border border-white/5 hover:border-white/10 transition-all cursor-pointer" onClick={() => navigate('stocks-list')}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-white text-xs font-bold">{stock.name}</h4>
                    <p className="text-[10px] font-mono text-text-secondary mt-1">Mevcut: <span className={clsx(stock.color === 'rose' ? "text-rose-400" : "text-orange-400")}>{stock.current}</span> / Min: {stock.min}</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[9px] font-black tracking-widest uppercase transition-all">Sipariş Talebi</button>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stock.progress}%` }}
                    className={clsx(
                      "h-full rounded-full",
                      stock.color === 'rose' ? "bg-rose-500" : "bg-orange-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="p-10 rounded-[40px] bg-gradient-to-r from-blue-900/40 via-skel-space/40 to-purple-900/40 border border-white/10 flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <RefreshCw size={32} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-white text-sm font-bold uppercase tracking-tight">Sistem Çevrimiçi</p>
            </div>
            <p className="text-text-secondary text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">Son Senkronizasyon: 2 dk önce | Aktif: 12 Kullanıcı</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => navigate('stocks-list')}
            className="px-6 h-14 rounded-2xl bg-blue-600 text-white font-display font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 flex items-center gap-3 hover:scale-105 transition-all"
          >
            <Plus size={16} /> Yeni Stok Ekle
          </button>
          <button className="px-6 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/10 transition-all">
            <Download size={16} /> Rapor İndir
          </button>
          <button className="px-6 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/10 transition-all">
            <RotateCcw size={16} /> Stok Sayımı Başlat
          </button>
        </div>
      </div>
    </div>
  );
};
