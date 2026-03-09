import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Download,
  Calendar,
  Filter,
  FileText,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  Database,
  Search
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const performanceData = [
  { name: 'Ocak', verimlilik: 78 },
  { name: 'Şubat', verimlilik: 82 },
  { name: 'Mart', verimlilik: 85 },
  { name: 'Nisan', verimlilik: 81 },
  { name: 'Mayıs', verimlilik: 88 },
  { name: 'Haziran', verimlilik: 92 },
];

const supplierData = [
  { name: 'Metal İş', hacim: 450 },
  { name: 'Plastik Kalıp', hacim: 320 },
  { name: 'Boya Sanayi', hacim: 280 },
  { name: 'ZG Boya', hacim: 210 },
  { name: 'Otomotiv A.Ş', hacim: 150 },
];

const COLORS = ['#00F2FF', '#00D1FF', '#7000FF', '#FF00E5', '#FFD600'];

export function ReportsDashboard({ setActiveModule }: { setActiveModule: (module: string) => void }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-focus-neon/20 border-t-focus-neon rounded-full animate-spin" />
        <p className="text-skel-metal animate-pulse font-medium">Analitik veriler hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-skel-glass mb-1 flex items-center gap-3">
            <BarChart3 size={32} className="text-focus-neon" />
            Raporlar & Analitik
          </h1>
          <p className="text-skel-metal text-sm">Sistem genelindeki tüm verilerin derinlemesine analizleri ve raporları.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="os-btn os-btn-secondary">
            <Calendar size={16} /> Son 6 Ay
          </button>
          <button className="os-btn os-btn-primary bg-focus-neon text-skel-dark border-transparent hover:bg-focus-neon/90 shadow-lg shadow-focus-neon/20">
            <Download size={16} /> PDF Raporu İndir
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Toplam Rapor', 
            value: '124', 
            icon: <FileText size={24} className="text-focus-neon" />, 
            trend: 'Aylık Özet', 
            color: 'from-focus-main/20 to-transparent', 
            border: 'border-focus-main/30',
            target: 'reports'
          },
          { 
            title: 'Veri Doğruluğu', 
            value: '%99.8', 
            icon: <CheckCircle2 size={24} className="text-grow-main" />, 
            trend: 'Gerçek Zamanlı', 
            color: 'from-grow-main/20 to-transparent', 
            border: 'border-grow-main/30',
            target: 'main-dashboard'
          },
          { 
            title: 'Sistem Çalışma', 
            value: '%100', 
            icon: <Activity size={24} className="text-nrg-sun" />, 
            trend: 'Kesintisiz', 
            color: 'from-nrg-sun/20 to-transparent', 
            border: 'border-nrg-sun/30',
            target: 'main-dashboard'
          },
          { 
            title: 'Analiz Hızı', 
            value: '1.2s', 
            icon: <Zap size={24} className="text-crit-vivid" />, 
            trend: 'Optimize Edildi', 
            color: 'from-crit-vivid/20 to-transparent', 
            border: 'border-crit-vivid/30',
            target: 'reports'
          },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveModule(stat.target)}
            className={`layer-3d p-6 relative overflow-hidden border-t-4 ${stat.border} group hover:translate-y-[-12px] transition-all duration-500 cursor-pointer bg-white`}
            style={{ 
              boxShadow: 'var(--depth-2-shadow)',
              borderRadius: '24px'
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-white shadow-[0_8px_16px_rgba(0,0,0,0.05)] border border-skel-matte/10 group-hover:scale-110 transition-transform duration-500">
                {stat.icon}
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/80 border border-white/60 shadow-sm text-skel-metal uppercase tracking-wider">
                {stat.trend}
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-mono font-black text-skel-glass mb-2 tracking-tighter group-hover:text-focus-neon transition-colors">{stat.value}</h3>
              <p className="text-[10px] text-skel-metal font-black uppercase tracking-[0.25em] opacity-70">{stat.title}</p>
            </div>
            
            {/* 3D Glass Highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 layer-3d p-6 flex flex-col min-h-[400px]"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-bold text-skel-glass flex items-center gap-2">
                <TrendingUp size={18} className="text-focus-neon" />
                Üretim Verimliliği Trendi
              </h2>
              <p className="text-xs text-skel-metal mt-1">Son 6 ayın operasyonel verimlilik yüzdesi.</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-skel-matte/20 text-skel-metal hover:text-skel-glass transition-colors">
                <Filter size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVerim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00F2FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="verimlilik" stroke="#00F2FF" strokeWidth={3} fillOpacity={1} fill="url(#colorVerim)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Volume Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="layer-3d p-6 flex flex-col"
        >
          <h2 className="text-lg font-bold text-skel-glass flex items-center gap-2 mb-6">
            <Database size={18} className="text-grow-main" />
            Tedarikçi İşlem Hacmi
          </h2>
          <div className="flex-1 min-h-[250px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
              <BarChart data={supplierData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="hacim" fill="#00FF88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
            {supplierData.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-skel-matte/10 border border-skel-matte/20">
                <span className="text-xs text-skel-glass font-medium">{item.name}</span>
                <span className="text-xs font-mono font-bold text-skel-glass">{item.hacim} İşlem</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ready Reports List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="layer-3d p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-skel-glass flex items-center gap-2">
              <PieChartIcon size={18} className="text-ai-bright" />
              Hazır Raporlar
            </h2>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {[
              { name: 'Aylık Stok Hareketleri', desc: 'Giriş/Çıkış özetleri', type: 'PDF' },
              { name: 'Tedarikçi Performans Analizi', desc: 'Gecikme ve fire oranları', type: 'Excel' },
              { name: 'Kritik Stok Uyarıları', desc: 'Minimum seviye altı stoklar', type: 'PDF' },
              { name: 'İş Emri Maliyet Özeti', desc: 'Tahmini maliyet analizleri', type: 'Excel' },
              { name: 'Yıllık Genel Değerlendirme', desc: 'Tüm modüllerin özeti', type: 'PDF' },
            ].map((report, i) => (
              <button key={i} className="w-full p-4 rounded-2xl border border-skel-matte/20 bg-skel-matte/10 flex items-center justify-between group hover:bg-skel-matte/20 transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-skel-matte/20 flex items-center justify-center text-skel-metal group-hover:text-focus-neon transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-skel-glass font-bold text-sm mb-0.5 group-hover:text-focus-neon transition-colors">{report.name}</h4>
                    <p className="text-[10px] text-skel-metal uppercase font-bold tracking-widest">{report.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-bold px-2 py-1 rounded bg-skel-matte/20 text-skel-metal border border-skel-matte/20">
                    {report.type}
                  </div>
                  <ChevronRight size={16} className="text-skel-metal opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* System Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="layer-3d p-8 bg-white border border-skel-matte/20 relative overflow-hidden group"
          style={{ 
            boxShadow: 'var(--depth-3-shadow)',
            borderRadius: '32px'
          }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-ai-royal/5 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-skel-glass uppercase tracking-[0.15em] flex items-center gap-3">
                  <Zap size={24} className="text-nrg-sun animate-bounce" style={{ animationDuration: '3s' }} />
                  Sistem Analitiği
                </h2>
                <p className="text-xs text-skel-metal font-bold mt-1">Veri bütünlüğü ve operasyonel verimlilik</p>
              </div>
              <span className="text-[10px] font-black text-ai-bright bg-ai-bright/10 px-4 py-1.5 rounded-full border border-ai-bright/20">SİSTEM ANALİZİ</span>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-skel-space/50 border border-skel-matte/10 hover:bg-white hover:shadow-depth-1 transition-all flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-focus-ice text-focus-neon shadow-sm">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="text-skel-glass font-black text-sm uppercase tracking-wider mb-1.5">Veri Bütünlüğü</h4>
                  <p className="text-xs text-skel-metal leading-relaxed font-medium">
                    Tüm modüller arasındaki veri senkronizasyonu %100 başarıyla tamamlandı. Kayıp veri tespit edilmedi.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-skel-space/50 border border-skel-matte/10 hover:bg-white hover:shadow-depth-1 transition-all flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-grow-mint text-grow-main shadow-sm">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="text-skel-glass font-black text-sm uppercase tracking-wider mb-1.5">Büyüme Analizi</h4>
                  <p className="text-xs text-skel-metal leading-relaxed font-medium">
                    İşlem hacmi geçen yılın aynı dönemine göre %24 artış gösterdi. Operasyonel kapasite yeterli düzeyde.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-skel-space/50 border border-skel-matte/10 hover:bg-white hover:shadow-depth-1 transition-all flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-nrg-sun/10 text-nrg-sun shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-skel-glass font-black text-sm uppercase tracking-wider mb-1.5">Zaman Tasarrufu</h4>
                  <p className="text-xs text-skel-metal leading-relaxed font-medium">
                    Otomatik raporlama ve AI asistan kullanımı sayesinde haftalık 12 saatlik manuel veri girişi tasarrufu sağlandı.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
