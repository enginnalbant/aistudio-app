import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid,
  Activity,
  Package,
  Truck,
  ShoppingCart,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  ChevronRight,
  MoreVertical,
  MapPin,
  TrendingUp,
  BarChart3,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import clsx from 'clsx';

// --- Mock Data & Types ---

type ModuleType = 'İşler' | 'Planlama' | 'Sevkiyatlar' | 'Satınalma';
type StatusType = 'Açık' | 'Devam Ediyor' | 'Tamamlandı' | 'Gecikti' | 'Yolda' | 'Beklemede';
type PriorityType = 'Düşük' | 'Orta' | 'Yüksek' | 'Acil';

interface DashboardItem {
  id: string;
  module: ModuleType;
  title: string;
  status: StatusType;
  priority: PriorityType;
  progress: number;
  startDate: string;
  endDate: string;
  location?: string;
  assignedTo?: string;
  supplier?: string;
  delayDays?: number;
}

const MOCK_DATA: DashboardItem[] = [
  { id: 'JOB-001', module: 'İşler', title: 'CNC Parça Üretimi - Seri A', status: 'Devam Ediyor', priority: 'Yüksek', progress: 65, startDate: '2026-03-15', endDate: '2026-03-22', assignedTo: 'Ahmet Y.' },
  { id: 'PLN-002', module: 'Planlama', title: 'Haftalık Üretim Çizelgesi', status: 'Tamamlandı', priority: 'Orta', progress: 100, startDate: '2026-03-10', endDate: '2026-03-17', assignedTo: 'Zeynep K.' },
  { id: 'SHP-003', module: 'Sevkiyatlar', title: 'Almanya İhracat Sevkiyatı', status: 'Yolda', priority: 'Acil', progress: 45, startDate: '2026-03-18', endDate: '2026-03-25', location: 'Gümrük - Kapıkule' },
  { id: 'PUR-004', module: 'Satınalma', title: 'Hammadde Tedariği (Alüminyum)', status: 'Gecikti', priority: 'Yüksek', progress: 20, startDate: '2026-03-05', endDate: '2026-03-15', supplier: 'AluCorp Inc.', delayDays: 4 },
  { id: 'JOB-005', module: 'İşler', title: 'Lazer Kesim - Proje X', status: 'Açık', priority: 'Orta', progress: 0, startDate: '2026-03-20', endDate: '2026-03-28', assignedTo: 'Mehmet S.' },
  { id: 'SHP-006', module: 'Sevkiyatlar', title: 'Yurtiçi Dağıtım - Ege Bölgesi', status: 'Gecikti', priority: 'Yüksek', progress: 80, startDate: '2026-03-12', endDate: '2026-03-18', location: 'Afyon Aktarma', delayDays: 1 },
  { id: 'PUR-007', module: 'Satınalma', title: 'Yedek Parça Siparişi', status: 'Beklemede', priority: 'Düşük', progress: 10, startDate: '2026-03-19', endDate: '2026-03-30', supplier: 'TeknoMarket' },
  { id: 'PLN-008', module: 'Planlama', title: 'Bakım Planı - Makine 4', status: 'Açık', priority: 'Acil', progress: 0, startDate: '2026-03-21', endDate: '2026-03-21', assignedTo: 'Teknik Ekip' },
  { id: 'SHP-009', module: 'Sevkiyatlar', title: 'Müşteri İadesi - Arıza', status: 'Tamamlandı', priority: 'Düşük', progress: 100, startDate: '2026-03-14', endDate: '2026-03-16', location: 'Depo A' },
  { id: 'JOB-010', module: 'İşler', title: 'Montaj Hattı - Ünite 7', status: 'Devam Ediyor', priority: 'Orta', progress: 30, startDate: '2026-03-17', endDate: '2026-03-24', assignedTo: 'Caner T.' },
];

export function MainDashboard() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ModuleType | 'Tümü'>('Tümü');
  const [activeScenario, setActiveScenario] = useState<'Tümü' | 'Gecikenler' | 'Acil' | 'Yolda'>('Tümü');

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = activeFilter === 'Tümü' || item.module === activeFilter;
      const matchesScenario = 
        activeScenario === 'Tümü' || 
        (activeScenario === 'Gecikenler' && item.status === 'Gecikti') ||
        (activeScenario === 'Acil' && item.priority === 'Acil') ||
        (activeScenario === 'Yolda' && item.status === 'Yolda');
      
      return matchesSearch && matchesModule && matchesScenario;
    });
  }, [searchTerm, activeFilter, activeScenario]);

  const stats = useMemo(() => ({
    totalJobs: MOCK_DATA.filter(i => i.module === 'İşler' && i.status !== 'Tamamlandı').length,
    delayedItems: MOCK_DATA.filter(i => i.status === 'Gecikti').length,
    activeShipments: MOCK_DATA.filter(i => i.module === 'Sevkiyatlar' && i.status === 'Yolda').length,
    pendingPurchases: MOCK_DATA.filter(i => i.module === 'Satınalma' && i.status === 'Beklemede').length,
  }), []);

  return (
    <div className="space-y-8 pb-20 h-full pr-2">
      {/* Apex Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-10 relative">
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <div className="px-3 lg:px-4 py-1.5 rounded-full bg-focus-main/10 border border-focus-neon/20 text-focus-neon label-mono text-[8px] lg:text-[9px] flex items-center gap-2 shadow-sm shadow-focus-neon/5">
              <Activity size={10} className="lg:w-3 lg:h-3" /> OPERASYONEL ZEKA MERKEZİ
            </div>
            <div className="px-3 lg:px-4 py-1.5 rounded-full bg-grow-phosphor/10 border border-grow-phosphor/20 text-grow-phosphor label-mono text-[8px] lg:text-[9px] flex items-center gap-2 shadow-sm shadow-grow-phosphor/5">
              <Zap size={10} className="lg:w-3 lg:h-3" /> APEX CORE v4.2 AKTİF
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              MERKEZİ <span className="text-focus-neon">DASHBOARD</span>
            </h1>
            <p className="text-text-secondary font-medium text-sm lg:text-lg tracking-tight opacity-70 max-w-2xl">
              İşler, Planlama, Sevkiyat ve Satınalma süreçlerini tek bir akıllı panel üzerinden raporlayın ve yönetin.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="os-btn border border-skel-metal/20 hover:bg-skel-matte/5 h-12 lg:h-[54px] px-4 lg:px-6 text-xs lg:text-sm">
            <Download size={16} className="lg:w-[18px] lg:h-[18px]" />
            <span>Raporu Dışa Aktar</span>
          </button>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-focus-main text-pure-white flex items-center justify-center shadow-lg shadow-focus-main/20">
            <TrendingUp size={20} className="lg:w-6 lg:h-6" />
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'AÇIK İŞLER', value: stats.totalJobs, icon: <Package size={24} />, color: 'focus-neon', trend: '+2%', trendUp: true, desc: 'Aktif üretim emirleri' },
          { label: 'GECİKENLER', value: stats.delayedItems, icon: <AlertCircle size={24} />, color: 'drop-crimson', trend: '-12%', trendUp: false, desc: 'Kritik gecikme raporu' },
          { label: 'AKTİF SEVKİYAT', value: stats.activeShipments, icon: <Truck size={24} />, color: 'grow-phosphor', trend: '+5%', trendUp: true, desc: 'Yoldaki sevkiyatlar' },
          { label: 'BEKLEYEN SATINALMA', value: stats.pendingPurchases, icon: <ShoppingCart size={24} />, color: 'focus-neon', trend: 'Sabit', trendUp: true, desc: 'Onay bekleyen siparişler' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bento-card p-6 group hover:border-focus-neon/30 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {stat.icon}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center bg-skel-matte/5", `text-${stat.color}`)}>
                {stat.icon}
              </div>
              <div className={clsx("flex items-center gap-1 text-[10px] font-black", stat.trendUp ? "text-grow-phosphor" : "text-drop-crimson")}>
                {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="label-mono text-[10px] opacity-50 tracking-[0.2em]">{stat.label}</h3>
              <div className="text-4xl font-display font-black tracking-tighter text-text-primary">{stat.value}</div>
              <p className="text-[10px] text-text-secondary font-medium">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Reporting Panel */}
      <div className="bento-card p-0 overflow-hidden flex flex-col min-h-[600px]">
        {/* Panel Header & Filters */}
        <div className="p-4 lg:p-8 border-b border-skel-metal/10 space-y-6 lg:space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-skel-matte/5 flex items-center justify-center text-focus-neon">
                <BarChart3 size={20} className="lg:w-6 lg:h-6" />
              </div>
              <div>
                <h2 className="text-lg lg:text-2xl font-display font-black tracking-tight text-text-primary">OPERASYONEL RAPORLAMA</h2>
                <p className="text-[10px] lg:text-xs text-text-secondary font-medium">Tüm modüllerden gelen gerçek zamanlı veriler</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-50" size={16} />
                <input 
                  type="text" 
                  placeholder="İş, Sevkiyat veya ID ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-6 py-2.5 lg:py-3 rounded-xl border border-skel-metal/10 bg-skel-matte/5 focus:border-focus-neon focus:ring-0 transition-all text-xs lg:text-sm font-medium w-full lg:w-64"
                />
              </div>
              <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl border border-skel-metal/10 bg-skel-matte/5 flex items-center justify-center text-text-secondary hover:text-focus-neon transition-colors shrink-0">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
              <span className="label-mono text-[8px] lg:text-[10px] opacity-50 mr-2 shrink-0">MODÜL:</span>
              {['Tümü', 'İşler', 'Planlama', 'Sevkiyatlar', 'Satınalma'].map((m) => (
                <button 
                  key={m}
                  onClick={() => setActiveFilter(m as any)}
                  className={clsx(
                    "px-3 lg:px-4 py-1.5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                    activeFilter === m 
                      ? "bg-focus-main text-pure-white border-focus-neon shadow-lg shadow-focus-main/20" 
                      : "bg-skel-matte/5 text-text-secondary border-skel-metal/10 hover:border-focus-neon/30"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="hidden lg:block h-8 w-px bg-skel-metal/10" />

            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
              <span className="label-mono text-[8px] lg:text-[10px] opacity-50 mr-2 shrink-0">SENARYO:</span>
              {['Tümü', 'Gecikenler', 'Acil', 'Yolda'].map((s) => (
                <button 
                  key={s}
                  onClick={() => setActiveScenario(s as any)}
                  className={clsx(
                    "px-3 lg:px-4 py-1.5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                    activeScenario === s 
                      ? "bg-drop-crimson text-pure-white border-drop-crimson shadow-lg shadow-drop-crimson/20" 
                      : "bg-skel-matte/5 text-text-secondary border-skel-metal/10 hover:border-drop-crimson/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-skel-matte/5 border-b border-skel-metal/10">
                <th className="p-6 text-left label-mono text-[10px] opacity-50 tracking-widest">ID / MODÜL</th>
                <th className="p-6 text-left label-mono text-[10px] opacity-50 tracking-widest">BAŞLIK / DETAY</th>
                <th className="p-6 text-left label-mono text-[10px] opacity-50 tracking-widest">DURUM</th>
                <th className="p-6 text-left label-mono text-[10px] opacity-50 tracking-widest">ÖNCELİK</th>
                <th className="p-6 text-left label-mono text-[10px] opacity-50 tracking-widest">İLERLEME</th>
                <th className="p-6 text-left label-mono text-[10px] opacity-50 tracking-widest">TARİH / KONUM</th>
                <th className="p-6 text-right label-mono text-[10px] opacity-50 tracking-widest">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-skel-metal/5">
              <AnimatePresence mode="popLayout">
                {filteredData.map((item) => (
                  <motion.tr 
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-skel-matte/5 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="text-xs font-black text-text-primary">{item.id}</div>
                        <div className="text-[10px] font-bold text-focus-neon uppercase tracking-widest">{item.module}</div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-text-primary">{item.title}</div>
                        <div className="text-[10px] text-text-secondary font-medium">
                          {item.assignedTo && `Sorumlu: ${item.assignedTo}`}
                          {item.supplier && `Tedarikçi: ${item.supplier}`}
                          {item.location && `Konum: ${item.location}`}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                        item.status === 'Tamamlandı' ? "bg-grow-phosphor/10 text-grow-phosphor" :
                        item.status === 'Gecikti' ? "bg-drop-crimson/10 text-drop-crimson" :
                        item.status === 'Yolda' ? "bg-focus-main/10 text-focus-neon" :
                        "bg-skel-metal/10 text-text-secondary"
                      )}>
                        {item.status === 'Tamamlandı' && <CheckCircle2 size={12} />}
                        {item.status === 'Gecikti' && <AlertCircle size={12} />}
                        {item.status === 'Yolda' && <Truck size={12} />}
                        {item.status === 'Devam Ediyor' && <Clock size={12} />}
                        {item.status}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={clsx(
                        "text-[10px] font-black uppercase tracking-widest",
                        item.priority === 'Acil' ? "text-drop-crimson" :
                        item.priority === 'Yüksek' ? "text-focus-neon" :
                        "text-text-secondary"
                      )}>
                        {item.priority}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="w-32 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>%{item.progress}</span>
                        </div>
                        <div className="h-1.5 w-full bg-skel-metal/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className={clsx(
                              "h-full rounded-full",
                              item.progress === 100 ? "bg-grow-phosphor" : "bg-focus-neon"
                            )}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                          <Calendar size={12} className="text-text-secondary" />
                          {item.endDate}
                        </div>
                        {item.delayDays && (
                          <div className="text-[10px] font-black text-drop-crimson uppercase tracking-widest">
                            {item.delayDays} GÜN GECİKME
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary">
                            <MapPin size={10} />
                            {item.location}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button className="w-10 h-10 rounded-xl hover:bg-skel-matte/10 flex items-center justify-center text-text-secondary transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Search size={48} className="text-skel-metal mb-4" />
              <p className="text-lg font-display font-bold text-skel-metal uppercase tracking-widest">Sonuç Bulunamadı</p>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-6 bg-skel-matte/5 border-t border-skel-metal/10 flex items-center justify-between">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            TOPLAM {filteredData.length} KAYIT GÖSTERİLİYOR
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-skel-metal/10 text-[10px] font-black uppercase tracking-widest hover:bg-skel-matte/10 transition-colors">Önceki</button>
            <button className="px-4 py-2 rounded-lg border border-skel-metal/10 text-[10px] font-black uppercase tracking-widest hover:bg-skel-matte/10 transition-colors">Sonraki</button>
          </div>
        </div>
      </div>
    </div>
  );
}
