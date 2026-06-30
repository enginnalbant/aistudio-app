import React from 'react';
import { 
  Users, 
  DollarSign, 
  AlertCircle, 
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
  Clock,
  User,
  ArrowRight,
  CreditCard,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Target
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import clsx from 'clsx';

/* ------------------------------- Mock Data ------------------------------- */

const CARI_DISTRIBUTION = [
  { name: 'Müşteriler', value: 450, color: '#3b82f6' },
  { name: 'Tedarikçiler', value: 120, color: '#8b5cf6' },
  { name: 'Personel', value: 35, color: '#06b6d4' },
  { name: 'Resmi Kurum', value: 15, color: '#f59e0b' },
];

const BALANCE_TREND_30D = [
  { day: '1', alacak: 450, borc: 300 },
  { day: '5', alacak: 520, borc: 400 },
  { day: '10', alacak: 380, borc: 650 },
  { day: '15', alacak: 850, borc: 420 },
  { day: '20', alacak: 480, borc: 380 },
  { day: '25', alacak: 620, borc: 550 },
  { day: '30', alacak: 550, borc: 480 },
];

const PAYMENT_AGING = [
  { name: 'Vadesi Geçen', value: 125000, color: '#ef4444' },
  { name: '0-30 Gün', value: 450000, color: '#3b82f6' },
  { name: '30-60 Gün', value: 280000, color: '#8b5cf6' },
  { name: '60+ Gün', value: 150000, color: '#f59e0b' },
];

const RECENT_TRANSACTIONS = [
  { id: 1, date: '12.05.2026 14:20', contactName: 'Global Lojistik A.Ş', type: 'ÖDEME', amount: '-₺45,000', user: 'Ahmet Y.', color: 'rose' },
  { id: 2, date: '12.05.2026 13:15', contactName: 'Tekno Market LTD', type: 'TAHSİLAT', amount: '+₺10,250', user: 'Mehmet S.', color: 'emerald' },
  { id: 3, date: '12.05.2026 11:45', contactName: 'Mavi İnşaat Grubu', type: 'SATIŞ FAT.', amount: '+₺500,000', user: 'Can K.', color: 'emerald' },
  { id: 4, date: '12.05.2026 10:30', contactName: 'Özdemir Metal', type: 'ALIŞ FAT.', amount: '-₺120,000', user: 'Ayşe B.', color: 'rose' },
  { id: 5, date: '12.05.2026 09:12', contactName: 'Personel Maaş Öd.', type: 'ÖDEME', amount: '-₺40,000', user: 'Demir T.', color: 'rose' },
];

const RISK_ALERTS = [
  { name: 'Global Lojistik A.Ş', balance: '₺245,000', limit: '₺200,000', status: 'LİMİT AŞIMI', color: 'rose', progress: 122 },
  { name: 'Yılmazlar Gıda', balance: '₺85,000', limit: '₺100,000', status: 'VADE GEÇİKMESİ', color: 'orange', progress: 85 },
  { name: 'Delta Yazılım', balance: '₺12,000', limit: '₺50,000', status: 'RİSKLİ CARİ', color: 'rose', progress: 24 },
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

export const ContactDashboard = () => {
  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-display font-black text-white italic tracking-tighter uppercase mb-2 shadow-purple-500/20"
          >
            CARİLER <span className="text-purple-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">DASHBOARD</span>
          </motion.h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.3em] opacity-60">Müşteri & Tedarikçi Finansal Paneli</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:block text-right">
            <p className="text-white font-mono text-sm">12 Mayıs 2026</p>
            <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest">Salı | 11:25</p>
          </div>
          <button 
            onClick={() => navigate('contacts-list')}
            className="px-8 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 group"
          >
             Cari Listesine Git
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Toplam Cari Sayısı" 
          value="620" 
          icon={<Users size={24} />} 
          color="blue" 
          trend={{ value: "+24 Yeni", up: true }}
          onClick={() => navigate('contacts-list')}
        />
        <StatCard 
          title="Toplam Alacak" 
          value="₺1.8M" 
          icon={<ArrowDownRight size={24} />} 
          color="emerald" 
          trend={{ value: "+12%", up: true }}
          onClick={() => navigate('contacts-reports')}
        />
        <StatCard 
          title="Toplam Borç" 
          value="₺840k" 
          icon={<ArrowUpRight size={24} />} 
          color="rose" 
          trend={{ value: "-4%", up: false }}
          onClick={() => navigate('contacts-reports')}
        />
        <StatCard 
          title="Vadesi Geçen" 
          value="₺125k" 
          icon={<AlertCircle size={24} />} 
          color="orange" 
          trend={{ value: "+₺12k", up: true }}
          onClick={() => navigate('contacts-list')}
        />
        <StatCard 
          title="Bekleyen Tahsilat" 
          value="18" 
          icon={<CreditCard size={24} />} 
          color="cyan" 
          onClick={() => navigate('contacts-reports')}
        />
        <StatCard 
          title="Aktif Tedarikçi" 
          value="112" 
          icon={<Building2 size={24} />} 
          color="purple" 
          onClick={() => navigate('contacts-list')}
        />
        <StatCard 
          title="Müşteri Sadakati" 
          value="%88" 
          icon={<Target size={24} />} 
          color="pink" 
          onClick={() => navigate('contacts-analytics')}
        />
        <StatCard 
          title="Riskli Cariler" 
          value="4" 
          icon={<ShieldCheck size={24} />} 
          color="orange" 
          onClick={() => navigate('contacts-list')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cari Distribution PieChart */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <Users size={16} className="text-blue-500" />
            Cari Tip Dağılımı
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CARI_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CARI_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance Trend AreaChart */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <TrendingUp size={16} className="text-emerald-500" />
            Borç / Alacak Trendi (30 G)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BALANCE_TREND_30D}>
                <defs>
                  <linearGradient id="colorAlacak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBorc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `₺${v}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
                <Area type="monotone" dataKey="alacak" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAlacak)" />
                <Area type="monotone" dataKey="borc" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorBorc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Aging BarChart */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <Clock size={16} className="text-orange-500" />
            Ödeme Yaşlandırma Analizi
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PAYMENT_AGING}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `₺${v/1000}k`} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {PAYMENT_AGING.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
              <History size={16} className="text-cyan-500" />
              Son Finansal Hareketler
            </h3>
            <button onClick={() => navigate('contacts-reports')} className="text-xs font-mono text-purple-400 hover:underline">Tümünü Gör</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Tarih</th>
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Cari Adı</th>
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">İşlem</th>
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Tutar</th>
                  <th className="pb-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest text-right">Kullanıcı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RECENT_TRANSACTIONS.map((txn) => (
                  <tr key={txn.id} onClick={() => navigate('contacts-reports')} className="group hover:bg-white/2 cursor-pointer transition-colors">
                    <td className="py-4 text-xs font-mono text-text-secondary">{txn.date}</td>
                    <td className="py-4 text-xs font-bold text-white">{txn.contactName}</td>
                    <td className="py-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-md text-[9px] font-black tracking-widest",
                        txn.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {txn.type}
                      </span>
                    </td>
                    <td className={clsx("py-4 text-xs font-mono font-bold", txn.color === 'emerald' ? "text-emerald-400" : "text-rose-400")}>{txn.amount}</td>
                    <td className="py-4 text-xs text-text-secondary text-right font-mono">{txn.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={16} className="text-orange-500" />
              Cari Risk Uyarıları
            </h3>
            <button onClick={() => navigate('contacts-list')} className="text-xs font-mono text-orange-400 hover:underline">Hepsini İncele</button>
          </div>
          <div className="space-y-6">
            {RISK_ALERTS.map((cari, i) => (
              <div key={i} className="group p-4 rounded-3xl bg-white/2 border border-white/5 hover:border-white/10 transition-all cursor-pointer" onClick={() => navigate('contacts-list')}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-white text-xs font-bold">{cari.name}</h4>
                    <p className="text-[10px] font-mono text-text-secondary mt-1">Bakiye: <span className={clsx(cari.color === 'rose' ? "text-rose-400" : "text-orange-400")}>{cari.balance}</span> / Limit: {cari.limit}</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[9px] font-black tracking-widest uppercase transition-all">{cari.status}</button>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(cari.progress, 100)}%` }}
                    className={clsx(
                      "h-full rounded-full shadow-[0_0_10px_currentColor]",
                      cari.color === 'rose' ? "bg-rose-500 text-rose-500" : "bg-orange-500 text-orange-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="p-10 rounded-[40px] bg-gradient-to-r from-purple-900/40 via-skel-space/40 to-blue-900/40 border border-white/10 flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <RefreshCw size={32} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-white text-sm font-bold uppercase tracking-tight">Finansal Senkronizasyon Aktif</p>
            </div>
            <p className="text-text-secondary text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">Son Veri Güncelleme: Anlık | 24 Cari Hareket Algılandı</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => navigate('contacts-list')}
            className="px-6 h-14 rounded-2xl bg-purple-600 text-white font-display font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/30 flex items-center gap-3 hover:scale-105 transition-all"
          >
            <Plus size={16} /> Yeni Cari Tanımla
          </button>
          <button className="px-6 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/10 transition-all">
            <CreditCard size={16} /> Toplu Ödeme Yap
          </button>
          <button className="px-6 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/10 transition-all">
            <RotateCcw size={16} /> Mutabakat Başlat
          </button>
        </div>
      </div>
    </div>
  );
};
