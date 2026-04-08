import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Activity, 
  ShieldCheck, 
  LayoutGrid, 
  Plus, 
  Search, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Layers, 
  Zap, 
  MoreHorizontal,
  Filter,
  Download,
  GanttChartSquare,
  ClipboardList,
  Cpu,
  History
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
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import clsx from 'clsx';
import { PlanWizardModal } from './PlanWizardModal';

// Mock Data
const MOCK_STATS = [
  { id: 1, label: 'Aktif Planlar', value: '0', change: '0', trend: 'up', icon: <Target size={20} />, color: 'text-focus-neon' },
  { id: 2, label: 'Bekleyen Görevler', value: '0', change: '0%', trend: 'up', icon: <Layers size={20} />, color: 'text-nrg-sun' },
  { id: 3, label: 'Kapasite Kullanımı', value: '%0', change: '0%', trend: 'up', icon: <Cpu size={20} />, color: 'text-grow-main' },
  { id: 4, label: 'Planlama Hızı', value: '0s', change: '0s', trend: 'down', icon: <Zap size={20} />, color: 'text-ai-bright' },
];

const MOCK_MILESTONES: any[] = [];

const CAPACITY_DATA: any[] = [];

const RESOURCE_DATA: any[] = [];

export const PlannerDashboard = () => {
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
              <Zap size={12} className="animate-pulse" /> AI Planlama Aktif
            </motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-1.5 rounded-full bg-grow-main/10 border border-grow-main/20 text-grow-main label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-grow-main/5"
            >
              <ShieldCheck size={12} /> Veri Bütünlüğü
            </motion.div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              {getGreeting()}, <span className="text-focus-neon">{settings.user_name.split(' ')[0]}</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg tracking-tight opacity-70">Planlama operasyonel zekasını yönetin.</p>
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
            YENİ PLAN OLUŞTUR
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-skel-matte/5 border border-skel-metal/10 rounded-2xl text-text-secondary hover:bg-skel-matte/10 hover:text-text-primary transition-all group" title="Zaman Çizelgesi">
            <GanttChartSquare size={20} className="group-hover:scale-110 transition-transform" />
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
        {/* Planning Milestones Table */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 bento-card overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-skel-metal/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-focus-main/10 flex items-center justify-center text-focus-neon">
                <ClipboardList size={20} />
              </div>
              <div>
                <h3 className="text-lg font-display font-black text-text-primary tracking-tight">Planlama Kilometre Taşları</h3>
                <p className="text-[10px] label-mono opacity-50 uppercase tracking-widest">Kritik teslimat ve onay süreçleri</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-skel-matte/5 text-text-secondary transition-colors">
                <Search size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-skel-matte/5 text-text-secondary transition-colors">
                <Filter size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-skel-matte/5 border-b border-skel-metal/5">
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">Plan ID / Başlık</th>
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">Sorumlu</th>
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">Öncelik</th>
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">İlerleme</th>
                  <th className="px-6 py-4 label-mono text-[10px] opacity-50 uppercase tracking-widest">Hedef Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-skel-metal/5">
                {MOCK_MILESTONES.map((milestone) => (
                  <tr key={milestone.id} className="hover:bg-skel-matte/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-focus-neon font-bold">{milestone.id}</span>
                        <span className="text-sm font-display font-bold text-text-primary tracking-tight">{milestone.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-text-secondary">{milestone.owner}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter",
                        milestone.priority === 'Kritik' ? "bg-crit-blood/10 text-crit-vivid" :
                        milestone.priority === 'Yüksek' ? "bg-nrg-sun/10 text-nrg-sun" :
                        "bg-focus-neon/10 text-focus-neon"
                      )}>
                        {milestone.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-skel-matte/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${milestone.progress}%` }}
                            className={clsx(
                              "h-full rounded-full",
                              milestone.progress > 80 ? "bg-grow-main" : 
                              milestone.progress > 40 ? "bg-focus-neon" : 
                              "bg-nrg-sun"
                            )}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-text-primary">{milestone.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-text-secondary opacity-60">{milestone.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-skel-metal/5 text-center">
            <button className="text-[10px] font-black text-focus-neon uppercase tracking-widest hover:underline">
              TÜM PLANLAMA TAKVİMİNİ GÖRÜNTÜLE
            </button>
          </div>
        </motion.div>

        {/* Analytics Section */}
        <div className="space-y-8">
          {/* Capacity Load Chart */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-display font-black text-text-primary tracking-tight">Kapasite Yükü</h3>
                <p className="text-[10px] label-mono opacity-50 uppercase tracking-widest">Anlık kaynak kullanım analizi</p>
              </div>
              <div className="text-grow-main flex items-center gap-1 text-[10px] font-black">
                <Zap size={14} /> %92 Verim
              </div>
            </div>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CAPACITY_DATA}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#70A1FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#70A1FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#151619', 
                      border: '1px solid rgba(112, 161, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="load" stroke="#70A1FF" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E9299' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Resource Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bento-card p-6"
          >
            <h3 className="text-lg font-display font-black text-text-primary tracking-tight mb-6">Kaynak Dağılımı</h3>
            <div className="flex items-center gap-4">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={RESOURCE_DATA}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {RESOURCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {RESOURCE_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-text-secondary">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-text-primary">%{Math.round(item.value / 1000 * 100)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <PlanWizardModal 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSave={() => {
          setIsWizardOpen(false);
          // Optional: refresh data
        }}
      />
    </div>
  );
};
