import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Activity, 
  ShieldCheck, 
  LayoutGrid, 
  Truck, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  MapPin, 
  Timer,
  Navigation,
  MoreHorizontal,
  Filter,
  Download,
  History,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import clsx from 'clsx';
import { ShipmentWizard } from './ShipmentWizard';

// Mock Data
const MOCK_STATS = [
  { id: 1, label: 'Aktif Sevkiyat', value: '0', change: '0', trend: 'up', icon: <Truck size={20} />, color: 'text-focus-neon' },
  { id: 2, label: 'Bugün Teslim', value: '0', change: '0%', trend: 'up', icon: <CheckCircle2 size={20} />, color: 'text-grow-main' },
  { id: 3, label: 'Gecikenler', value: '0', change: '0', trend: 'down', icon: <AlertTriangle size={20} />, color: 'text-crit-vivid' },
  { id: 4, label: 'Ort. Teslimat', value: '0 Gün', change: '0', trend: 'down', icon: <Timer size={20} />, color: 'text-ai-bright' },
];

const MOCK_SHIPMENTS: any[] = [];

const VOLUME_DATA: any[] = [];

const REGION_DATA: any[] = [];

export function ShipmentDashboard() {
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'GÜNAYDIN';
    if (hour < 18) return 'TÜNAYDIN';
    return 'İYİ AKŞAMLAR';
  };

  return (
    <div className="space-y-8 pb-20 h-full pr-2 overflow-y-auto custom-scrollbar">
      {/* Hero Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-1.5 rounded-full bg-focus-main/10 border border-focus-neon/20 text-focus-neon label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-focus-neon/5"
            >
              <Navigation size={12} className="animate-pulse" /> Canlı Takip Aktif
            </motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-1.5 rounded-full bg-grow-main/10 border border-grow-main/20 text-grow-main label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-grow-main/5"
            >
              <ShieldCheck size={12} /> Güvenli Lojistik
            </motion.div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              {getGreeting()}, <span className="text-focus-neon">{settings.user_name.split(' ')[0]}</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg tracking-tight opacity-70">Sevkiyat operasyonel zekasını yönetin.</p>
          </div>
          <div className="flex items-center gap-4 text-text-secondary font-bold">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-skel-matte/5 rounded-xl border border-skel-metal/10">
              <Clock size={16} className="text-focus-neon" /> 
              <span className="font-display tracking-tight text-sm">{currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <span className="w-1.5 h-1.5 bg-skel-metal/20 rounded-full" />
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-skel-matte/5 rounded-xl border border-skel-metal/10">
              <Calendar size={16} className="text-focus-neon" />
              <span className="font-display tracking-tight text-sm">{currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-focus-main text-pure-white rounded-2xl font-display font-black text-sm tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-lg shadow-focus-main/20 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            YENİ SEVKİYAT
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-skel-matte/5 border border-skel-metal/10 rounded-2xl text-text-secondary hover:bg-skel-matte/10 hover:text-text-primary transition-all group" title="Takip No Sorgula">
            <Search size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-skel-matte/5 border border-skel-metal/10 rounded-2xl text-text-secondary hover:bg-skel-matte/10 hover:text-text-primary transition-all group" title="Geçmiş">
            <History size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {MOCK_STATS.map((stat, idx) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onMouseEnter={() => setHoveredStat(stat.id)}
            onMouseLeave={() => setHoveredStat(null)}
            className="bento-card p-6 group cursor-pointer relative overflow-hidden"
          >
            <div className={clsx(
              "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-focus-neon/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-700",
              hoveredStat === stat.id ? "scale-150" : "scale-100"
            )} />
            
            <div className="flex items-start justify-between relative z-10">
              <div className={clsx("p-3 rounded-2xl bg-skel-matte/5 border border-skel-metal/5", stat.color)}>
                {stat.icon}
              </div>
              <div className={clsx(
                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
                stat.trend === 'up' ? "bg-grow-main/10 text-grow-main" : "bg-crit-blood/10 text-crit-vivid"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            
            <div className="mt-6 relative z-10">
              <div className="text-3xl font-display font-black text-text-primary tracking-tighter">{stat.value}</div>
              <div className="label-mono text-[10px] opacity-50 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Shipments Table */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 bento-card overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-skel-metal/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-focus-main/10 flex items-center justify-center text-focus-neon">
                <Package size={20} />
              </div>
              <div>
                <h3 className="text-lg font-display font-black text-text-primary tracking-tight">Aktif Sevkiyat Takibi</h3>
                <p className="text-[10px] label-mono opacity-50 uppercase tracking-widest">Gerçek zamanlı lojistik durumu</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-skel-matte/5 text-text-secondary transition-colors">
                <Filter size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-skel-matte/5 text-text-secondary transition-colors">
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-skel-matte/5 border-b border-skel-metal/5">
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">Takip ID / Varış</th>
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">Taşıyıcı</th>
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">Durum</th>
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">İlerleme</th>
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">Tahmini Varış</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-skel-metal/5">
                {MOCK_SHIPMENTS.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-skel-matte/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-focus-neon font-bold">{shipment.id}</span>
                        <div className="flex items-center gap-1.5 text-sm font-display font-bold text-text-primary tracking-tight">
                          <MapPin size={12} className="text-skel-metal" />
                          {shipment.destination}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-text-secondary">{shipment.carrier}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter",
                        shipment.status === 'Teslim Edildi' ? "bg-grow-main/10 text-grow-main" :
                        shipment.status === 'Gecikmeli' ? "bg-crit-blood/10 text-crit-vivid" :
                        shipment.status === 'Yolda' ? "bg-focus-neon/10 text-focus-neon" :
                        "bg-skel-matte/10 text-text-secondary"
                      )}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-skel-matte/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${shipment.progress}%` }}
                            className={clsx(
                              "h-full rounded-full",
                              shipment.status === 'Teslim Edildi' ? "bg-grow-main" : 
                              shipment.status === 'Gecikmeli' ? "bg-crit-vivid" : 
                              "bg-focus-neon"
                            )}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-text-primary">{shipment.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-text-secondary opacity-60">{shipment.eta}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-skel-metal/5 text-center">
            <button className="text-[10px] font-black text-focus-neon uppercase tracking-widest hover:underline">
              TÜM SEVKİYAT LİSTESİNİ GÖRÜNTÜLE
            </button>
          </div>
        </motion.div>

        {/* Analytics Section */}
        <div className="space-y-8">
          {/* Shipment Volume Chart */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-display font-black text-text-primary tracking-tight">Sevkiyat Hacmi</h3>
                <p className="text-[10px] label-mono opacity-50 uppercase tracking-widest">Haftalık lojistik yoğunluğu</p>
              </div>
              <div className="text-grow-main flex items-center gap-1 text-[10px] font-black">
                <ArrowUpRight size={14} /> %12 Artış
              </div>
            </div>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VOLUME_DATA}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ED573" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2ED573" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#151619', 
                      border: '1px solid rgba(46, 213, 115, 0.1)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#2ED573" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E9299' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Regional Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bento-card p-6"
          >
            <h3 className="text-lg font-display font-black text-text-primary tracking-tight mb-6">Bölgesel Dağılım</h3>
            <div className="flex items-center gap-4">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={REGION_DATA}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {REGION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {REGION_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-text-secondary">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-text-primary">%{Math.round(item.value / 1100 * 100)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {isWizardOpen && (
        <ShipmentWizard 
          onClose={() => setIsWizardOpen(false)}
          onSave={() => {
            setIsWizardOpen(false);
            // Optional: refresh data
          }}
        />
      )}
    </div>
  );
}
