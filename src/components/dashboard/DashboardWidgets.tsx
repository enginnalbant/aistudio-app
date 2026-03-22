import React from 'react';
import { 
  Users, 
  Package, 
  ClipboardList, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  Clock,
  Activity,
  ChevronRight,
  Box,
  Plus,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Layers,
  ShieldCheck,
  ZapOff,
  LayoutGrid,
  Sparkles,
  Cpu,
  Globe,
  Database,
  Terminal,
  ShoppingCart,
  Truck,
  CheckSquare,
  Wallet
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
  Cell
} from 'recharts';

import { motion } from 'motion/react';
import { GenerativeWidget } from './GenerativeWidget';

export type WidgetType = 
  | 'net_balance' 
  | 'open_jobs' 
  | 'critical_stocks' 
  | 'completed_jobs' 
  | 'financial_flow' 
  | 'category_dist' 
  | 'job_trends' 
  | 'upcoming_deadlines' 
  | 'recent_movements' 
  | 'top_accounts' 
  | 'top_stocks' 
  | 'account_type_dist' 
  | 'total_stock_value' 
  | 'system_status' 
  | 'quick_actions' 
  | 'ai_insights'
  | 'avg_completion'
  | 'total_overdue'
  | 'system_console'
  | 'generative'
  | 'purchasing_summary'
  | 'active_shipments'
  | 'pending_tasks'
  | 'budget_status';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  gridSpan: string; // e.g., 'col-span-3', 'col-span-6', 'col-span-12'
  generativeConfig?: any;
}

export const WIDGET_DEFAULTS: WidgetConfig[] = [
  { id: 'w1', type: 'net_balance', title: 'Net Bakiye', description: 'Güncel finansal durum özeti', gridSpan: 'md:col-span-3' },
  { id: 'w2', type: 'open_jobs', title: 'Açık İşler', description: 'Aktif üretim emirleri', gridSpan: 'md:col-span-3' },
  { id: 'w3', type: 'critical_stocks', title: 'Kritik Stoklar', description: 'Acil tedarik bekleyen ürünler', gridSpan: 'md:col-span-3' },
  { id: 'w4', type: 'completed_jobs', title: 'Tamamlanan İşler', description: 'Son 30 günde biten işler', gridSpan: 'md:col-span-3' },
  { id: 'w5', type: 'financial_flow', title: 'Finansal Akış', description: 'Borç ve ödeme dengesi analizi', gridSpan: 'md:col-span-8' },
  { id: 'w6', type: 'quick_actions', title: 'Hızlı İşlemler', description: 'Sık kullanılan operasyonlar', gridSpan: 'md:col-span-4' },
  { id: 'w7', type: 'recent_movements', title: 'Son Hareketler', description: 'En son stok giriş ve çıkışları', gridSpan: 'md:col-span-4' },
  { id: 'w8', type: 'top_accounts', title: 'En Yüksek Bakiyeli Cariler', description: 'Finansal risk ve hacim odağı', gridSpan: 'md:col-span-4' },
  { id: 'w9', type: 'top_stocks', title: 'En Çok Hareket Gören Stoklar', description: 'Operasyonel yoğunluk analizi', gridSpan: 'md:col-span-4' },
  { id: 'w10', type: 'category_dist', title: 'Kategori Dağılımı', description: 'Stok kalemlerinin sektörel dağılımı', gridSpan: 'md:col-span-4' },
  { id: 'w11', type: 'job_trends', title: 'Aylık İş Trendi', description: 'Üretim hacmi ve performans takibi', gridSpan: 'md:col-span-8' },
  { id: 'w12', type: 'upcoming_deadlines', title: 'Zaman Çizelgesi', description: 'Yaklaşan teslimat ve iş emirleri', gridSpan: 'md:col-span-12' },
  { id: 'w13', type: 'purchasing_summary', title: 'Satın Alma Özeti', description: 'Bekleyen talepler ve siparişler', gridSpan: 'md:col-span-4' },
  { id: 'w14', type: 'active_shipments', title: 'Aktif Sevkiyatlar', description: 'Devam eden lojistik operasyonlar', gridSpan: 'md:col-span-4' },
  { id: 'w15', type: 'pending_tasks', title: 'Bekleyen Görevler', description: 'Tamamlanmamış iş kalemleri', gridSpan: 'md:col-span-4' },
  { id: 'w16', type: 'budget_status', title: 'Bütçe Durumu', description: 'Aktif bütçe harcama oranı', gridSpan: 'md:col-span-4' },
  { id: 'w17', type: 'system_status', title: 'Sistem Durumu', description: 'Nexus OS operasyonel sağlık raporu', gridSpan: 'md:col-span-4' },
  { id: 'w18', type: 'ai_insights', title: 'Apex AI Analitiği', description: 'Yapay zeka destekli sistem öngörüleri', gridSpan: 'md:col-span-12' },
];

interface WidgetRendererProps {
  widget: WidgetConfig;
  data: any;
  onClick: (widget: WidgetConfig) => void;
  onRemove: (id: string) => void;
  setActiveModule: (module: string) => void;
  setIsJobModalOpen: (open: boolean) => void;
  setIsStockModalOpen: (open: boolean) => void;
  setIsAccountModalOpen: (open: boolean) => void;
}

const APEX_COLORS = ['#0066FF', '#82B1FF', '#7B2CBF', '#B983FF', '#00C853', '#69F0AE', '#FFD600', '#FF4D4F'];

export function WidgetRenderer({ 
  widget, 
  data, 
  onClick, 
  onRemove,
  setActiveModule,
  setIsJobModalOpen,
  setIsStockModalOpen,
  setIsAccountModalOpen
}: WidgetRendererProps) {
  
  const renderContent = () => {
    switch (widget.type) {
      case 'net_balance':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-focus-main/10 text-focus-neon flex items-center justify-center border border-focus-neon/20 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-focus-neon/5">
                <DollarSign size={22} />
              </div>
              <div className="px-3 py-1 rounded-full bg-grow-phosphor/10 text-grow-phosphor font-mono text-[10px] font-bold border border-grow-phosphor/20 shadow-sm shadow-grow-phosphor/5">+12.5%</div>
            </div>
            <div>
              <div className="label-mono mb-2 opacity-50 tracking-[0.3em]">{widget.title}</div>
              <div className="text-5xl font-display font-black tracking-tighter text-text-primary leading-none">
                ₺{data.accounts.netBalance.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        );
      case 'open_jobs':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-nrg-sun/10 text-nrg-sun flex items-center justify-center border border-nrg-sun/20 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-nrg-sun/5">
                <ClipboardList size={22} />
              </div>
              <div className="px-3 py-1 rounded-full bg-nrg-sun/10 text-nrg-sun font-mono text-[10px] font-bold border border-nrg-sun/20 shadow-sm shadow-nrg-sun/5">AKTİF</div>
            </div>
            <div>
              <div className="label-mono mb-2 opacity-50 tracking-[0.3em]">{widget.title}</div>
              <div className="text-5xl font-display font-black tracking-tighter text-text-primary leading-none">{data.jobs.open}</div>
            </div>
          </div>
        );
      case 'critical_stocks':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-crit-blood/10 text-crit-vivid flex items-center justify-center border border-crit-blood/20 group-hover:scale-110 transition-transform duration-500">
                <Package size={24} />
              </div>
              <div className="px-3 py-1 rounded-full bg-crit-blood/10 text-crit-vivid font-mono text-[10px] font-bold border border-crit-blood/20 animate-pulse">KRİTİK</div>
            </div>
            <div>
              <div className="label-mono mb-2 opacity-70">{widget.title}</div>
              <div className="text-5xl font-display font-black tracking-tighter text-void-white">{data.stocks.critical}</div>
            </div>
          </div>
        );
      case 'completed_jobs':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-grow-main/10 text-grow-phosphor flex items-center justify-center border border-grow-main/20 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp size={24} />
              </div>
              <div className="px-3 py-1 rounded-full bg-grow-main/10 text-grow-phosphor font-mono text-[10px] font-bold border border-grow-main/20">30 GÜN</div>
            </div>
            <div>
              <div className="label-mono mb-2 opacity-70">{widget.title}</div>
              <div className="text-5xl font-display font-black tracking-tighter text-void-white">{data.jobs.completed}</div>
            </div>
          </div>
        );
      case 'financial_flow':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="label-mono">Performans Analizi</p>
                <h2 className="text-3xl font-display font-black tracking-tighter text-void-white mt-1">{widget.title}</h2>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-focus-neon shadow-[0_0_10px_rgba(130,177,255,0.5)]" />
                  <span className="label-mono opacity-100">Borç</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-grow-phosphor shadow-[0_0_10px_rgba(105,240,174,0.5)]" />
                  <span className="label-mono opacity-100">Ödeme</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full h-[300px] min-w-0 relative">
              <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
                <AreaChart data={[
                  { name: 'Ocak', borc: 45000, odeme: 32000 },
                  { name: 'Şubat', borc: 52000, odeme: 48000 },
                  { name: 'Mart', borc: 48000, odeme: 45000 },
                  { name: 'Nisan', borc: 61000, odeme: 52000 },
                  { name: 'Mayıs', borc: 55000, odeme: 58000 },
                  { name: 'Haziran', borc: 67000, odeme: 62000 },
                ]}>
                  <defs>
                    <linearGradient id="colorBorc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-focus-neon)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-focus-neon)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOdeme" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-grow-phosphor)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-grow-phosphor)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(161, 165, 183, 0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-skel-metal)" fontSize={10} tickLine={false} axisLine={false} dy={15} />
                  <YAxis stroke="var(--color-skel-metal)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-skel-space)', 
                      borderColor: 'rgba(161, 165, 183, 0.1)', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: 'var(--color-skel-glass)',
                      backdropFilter: 'blur(20px)'
                    }}
                  />
                  <Area type="monotone" dataKey="borc" stroke="var(--color-focus-neon)" strokeWidth={3} fillOpacity={1} fill="url(#colorBorc)" />
                  <Area type="monotone" dataKey="odeme" stroke="var(--color-grow-phosphor)" strokeWidth={3} fillOpacity={1} fill="url(#colorOdeme)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'quick_actions':
        return (
          <div className="bg-focus-main text-pure-white p-10 rounded-[inherit] h-full flex flex-col justify-between relative overflow-hidden group/actions shadow-xl shadow-focus-main/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pure-white/10 blur-[60px] rounded-full -mr-20 -mt-20 group-hover/actions:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <p className="label-mono text-pure-white/60 tracking-[0.3em]">{widget.title}</p>
                <Zap size={22} className="animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={(e) => { e.stopPropagation(); setIsJobModalOpen(true); }} className="flex items-center justify-between p-4 rounded-2xl bg-pure-white/10 hover:bg-pure-white/20 transition-all text-sm font-display font-black tracking-tight group/item border border-pure-white/5">
                  Yeni İş Emri 
                  <div className="p-2 rounded-xl bg-pure-white/10 group-hover/item:bg-pure-white/30 transition-colors">
                    <Plus size={16} />
                  </div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsStockModalOpen(true); }} className="flex items-center justify-between p-4 rounded-2xl bg-pure-white/10 hover:bg-pure-white/20 transition-all text-sm font-display font-black tracking-tight group/item border border-pure-white/5">
                  Stok Girişi 
                  <div className="p-2 rounded-xl bg-pure-white/10 group-hover/item:bg-pure-white/30 transition-colors">
                    <Plus size={16} />
                  </div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsAccountModalOpen(true); }} className="flex items-center justify-between p-4 rounded-2xl bg-pure-white/10 hover:bg-pure-white/20 transition-all text-sm font-display font-black tracking-tight group/item border border-pure-white/5">
                  Cari Kaydı 
                  <div className="p-2 rounded-xl bg-pure-white/10 group-hover/item:bg-pure-white/30 transition-colors">
                    <Plus size={16} />
                  </div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setActiveModule('purchasing'); }} className="flex items-center justify-between p-4 rounded-2xl bg-pure-white/10 hover:bg-pure-white/20 transition-all text-sm font-display font-black tracking-tight group/item border border-pure-white/5">
                  Satın Alma 
                  <div className="p-2 rounded-xl bg-pure-white/10 group-hover/item:bg-pure-white/30 transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setActiveModule('shipment'); }} className="flex items-center justify-between p-4 rounded-2xl bg-pure-white/10 hover:bg-pure-white/20 transition-all text-sm font-display font-black tracking-tight group/item border border-pure-white/5">
                  Sevkiyatlar 
                  <div className="p-2 rounded-xl bg-pure-white/10 group-hover/item:bg-pure-white/30 transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setActiveModule('planner'); }} className="flex items-center justify-between p-4 rounded-2xl bg-pure-white/10 hover:bg-pure-white/20 transition-all text-sm font-display font-black tracking-tight group/item border border-pure-white/5">
                  Planlayıcı 
                  <div className="p-2 rounded-xl bg-pure-white/10 group-hover/item:bg-pure-white/30 transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      case 'recent_movements':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <p className="label-mono">{widget.title}</p>
              <Activity size={20} className="text-focus-neon" />
            </div>
            <div className="space-y-5 flex-1 overflow-hidden">
              {data.recentActivities?.movements?.slice(0, 5).map((m: any) => (
                <div key={m.id} className="flex items-start gap-4 group">
                  <div className={`mt-1 p-2 rounded-xl shrink-0 ${m.type === 'IN' ? 'bg-grow-phosphor/10 text-grow-phosphor' : 'bg-nrg-sun/10 text-nrg-sun'}`}>
                    {m.type === 'IN' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-skel-glass truncate group-hover:text-void-white transition-colors">{m.stock_name}</p>
                    <p className="text-[10px] font-mono text-skel-metal truncate uppercase tracking-wider">{m.account_name || 'Genel Stok'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-display font-bold text-skel-glass">{m.qty} {m.unit || 'Adet'}</p>
                    <p className="text-[9px] font-mono text-skel-metal uppercase tracking-widest">{new Date(m.date).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveModule('stocks'); }}
              className="mt-6 w-full py-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-skel-metal hover:text-focus-neon transition-all border-t border-skel-metal/10 pt-6 flex items-center justify-center gap-3 group"
            >
              Tüm Veri Akışı <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        );
      case 'top_accounts':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="label-mono">Finansal Odak</p>
                <h2 className="text-2xl font-display font-black tracking-tighter text-void-white mt-1">{widget.title}</h2>
              </div>
              <Users size={24} className="text-focus-neon" />
            </div>
            <div className="space-y-4 flex-1 overflow-hidden">
              {data.accounts?.top?.slice(0, 4).map((acc: any) => (
                <div key={acc.id} className="flex items-center justify-between p-5 rounded-3xl bg-skel-space/30 border border-skel-metal/5 hover:border-focus-neon/20 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-skel-space border border-skel-metal/10 flex items-center justify-center text-skel-metal group-hover:text-focus-neon transition-colors">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-display font-bold text-skel-glass truncate max-w-[140px]">{acc.name}</p>
                      <p className="text-[10px] font-mono text-skel-metal uppercase tracking-widest">{acc.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono font-bold ${acc.balance > 0 ? 'text-crit-vivid' : 'text-grow-phosphor'}`}>
                      {acc.balance > 0 ? '-' : '+'}₺{Math.abs(acc.balance).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'top_stocks':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="label-mono">Operasyonel Odak</p>
                <h2 className="text-2xl font-display font-black tracking-tighter text-void-white mt-1">{widget.title}</h2>
              </div>
              <Box size={24} className="text-focus-neon" />
            </div>
            <div className="space-y-4 flex-1 overflow-hidden">
              {data.stocks?.top?.slice(0, 4).map((stock: any) => (
                <div key={stock.id} className="flex items-center justify-between p-5 rounded-3xl bg-skel-space/30 border border-skel-metal/5 hover:border-focus-neon/20 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-skel-space border border-skel-metal/10 flex items-center justify-center text-skel-metal group-hover:text-focus-neon transition-colors">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-display font-bold text-skel-glass truncate max-w-[140px]">{stock.name}</p>
                      <p className="text-[10px] font-mono text-skel-metal uppercase tracking-widest">{stock.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-display font-black text-focus-neon">
                      {stock.movement_count}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'category_dist':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="label-mono">Stok Analizi</p>
                <h2 className="text-2xl font-display font-black tracking-tighter text-void-white mt-1">{widget.title}</h2>
              </div>
              <PieChartIcon size={24} className="text-focus-neon" />
            </div>
            <div className="flex-1 w-full h-[250px] min-w-0 relative">
              <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
                <PieChart>
                  <Pie
                    data={data.stocks?.distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data.stocks?.distribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={APEX_COLORS[index % APEX_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-skel-space)', 
                      borderColor: 'rgba(161, 165, 183, 0.1)', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: 'var(--color-skel-glass)',
                      backdropFilter: 'blur(20px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'job_trends':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="label-mono">Üretim Analizi</p>
                <h2 className="text-2xl font-display font-black tracking-tighter text-void-white mt-1">{widget.title}</h2>
              </div>
              <BarChart3 size={24} className="text-focus-neon" />
            </div>
            <div className="flex-1 w-full h-[300px] min-w-0 relative">
              <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
                <BarChart data={data.jobs?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(161, 165, 183, 0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-skel-metal)" fontSize={10} tickLine={false} axisLine={false} dy={15} />
                  <YAxis stroke="var(--color-skel-metal)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(161, 165, 183, 0.05)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-skel-space)', 
                      borderColor: 'rgba(161, 165, 183, 0.1)', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: 'var(--color-skel-glass)',
                      backdropFilter: 'blur(20px)'
                    }}
                  />
                  <Bar dataKey="completed" name="Tamamlanan" fill="var(--color-focus-neon)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="open" name="Bekleyen" fill="rgba(161, 165, 183, 0.1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'upcoming_deadlines':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="label-mono">Zaman Çizelgesi</p>
                <h2 className="text-3xl font-display font-black tracking-tighter text-void-white mt-1">{widget.title}</h2>
              </div>
              <Clock size={24} className="text-focus-neon" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.jobs?.upcoming?.slice(0, 3).map((job: any) => (
                <div key={job.receipt_no} className="p-6 rounded-3xl bg-skel-space/30 border border-skel-metal/5 flex flex-col justify-between group hover:border-focus-neon/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calendar size={40} className="text-focus-neon" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="font-mono text-[10px] font-bold text-skel-metal tracking-widest">{job.receipt_no}</span>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${job.status === 'Kısmi' ? 'bg-nrg-sun/10 text-nrg-sun' : 'bg-crit-blood/10 text-crit-vivid'}`}>
                      {job.status}
                    </div>
                  </div>
                  <h3 className="text-lg font-display font-bold text-skel-glass mb-1 truncate relative z-10">{job.supplier_name}</h3>
                  <div className="flex items-center justify-between mt-6 relative z-10">
                    <div className="flex items-center gap-3 text-skel-metal">
                      <Calendar size={14} className="text-focus-neon" />
                      <span className="text-xs font-display font-bold">{new Date(job.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'total_stock_value':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-grow-phosphor/10 text-grow-phosphor flex items-center justify-center border border-grow-phosphor/20 group-hover:scale-110 transition-transform duration-500">
                <Layers size={24} />
              </div>
              <div className="px-3 py-1 rounded-full bg-grow-phosphor/10 text-grow-phosphor font-mono text-[10px] font-bold border border-grow-phosphor/20">VARLIK</div>
            </div>
            <div>
              <p className="label-mono mb-1">{widget.title}</p>
              <div className="text-4xl font-display font-black tracking-tighter text-void-white">
                ₺{data.stocks.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        );
      case 'system_status':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-grow-phosphor/10 text-grow-phosphor flex items-center justify-center border border-grow-phosphor/20 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={24} />
              </div>
              <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-grow-phosphor/10 text-grow-phosphor text-[10px] font-mono font-bold border border-grow-phosphor/20">
                <div className="w-2 h-2 rounded-full bg-grow-phosphor animate-ping" />
                NOMİNAL
              </div>
            </div>
            <div>
              <p className="label-mono mb-1">{widget.title}</p>
              <div className="flex items-end gap-3 mt-1">
                <div className="text-4xl font-display font-black tracking-tighter text-void-white">99.9%</div>
                <span className="text-[10px] font-mono text-skel-metal mb-2 font-bold tracking-widest">UPTIME</span>
              </div>
              <div className="mt-6 flex gap-1.5">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="flex-1 h-1.5 rounded-full bg-grow-phosphor/30" />
                ))}
              </div>
            </div>
          </div>
        );
      case 'ai_insights':
        return (
          <div className="bg-skel-space text-text-primary p-10 rounded-[inherit] h-full overflow-hidden relative group/ai">
            <div className="absolute top-0 right-0 w-96 h-96 bg-focus-main/10 blur-[120px] rounded-full -mr-48 -mt-48 group-hover/ai:scale-150 transition-transform duration-1000" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-ai-royal/10 blur-[120px] rounded-full -ml-48 -mb-48 group-hover/ai:scale-150 transition-transform duration-1000" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-focus-main text-pure-white flex items-center justify-center shadow-[0_8px_30px_rgba(30,144,255,0.4)] group-hover/ai:rotate-[360deg] transition-transform duration-1000">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black tracking-tighter text-text-primary leading-none">{widget.title}</h2>
                  <p className="text-[10px] text-text-secondary font-mono uppercase tracking-[0.4em] mt-2 opacity-50">Apex Neural Engine v4.2</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-5 p-8 rounded-3xl bg-skel-matte/5 border border-skel-metal/10 hover:bg-skel-matte/10 hover:border-focus-neon/30 transition-all duration-500 group/card shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-focus-neon shadow-[0_0_15px_rgba(112,161,255,0.6)] group-hover/card:scale-125 transition-transform" />
                    <span className="label-mono text-text-primary opacity-90 tracking-widest">Finansal Öngörü</span>
                  </div>
                  <div className="text-sm font-display font-bold leading-relaxed text-text-secondary group-hover/card:text-text-primary transition-colors">
                    {data.accounts.netBalance > 0 
                      ? "Ödemeler dengesi borç yönünde seyrediyor. Apex AI, vadesi dolacak ödemeler için likidite rezervi oluşturulmasını öneriyor."
                      : "Nakit akışı son derece sağlıklı. Mevcut likidite ile yeni yatırım fırsatları değerlendirilebilir."}
                  </div>
                </div>
                <div className="space-y-5 p-8 rounded-3xl bg-skel-matte/5 border border-skel-metal/10 hover:bg-skel-matte/10 hover:border-grow-phosphor/30 transition-all duration-500 group/card shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-grow-phosphor shadow-[0_0_15px_rgba(46,213,115,0.6)] group-hover/card:scale-125 transition-transform" />
                    <span className="label-mono text-text-primary opacity-90 tracking-widest">Operasyonel Zeka</span>
                  </div>
                  <div className="text-sm font-display font-bold leading-relaxed text-text-secondary group-hover/card:text-text-primary transition-colors">
                    {data.jobs.open > 10 
                      ? "İş yükü yoğunluğu kritik eşikte. Apex AI, üretim bantlarında %15'lik bir darboğaz riski tespit etti."
                      : "Operasyonel verimlilik %98.2 seviyesinde. Mevcut iş emirleri planlanan sürenin %12 önünde seyrediyor."}
                  </div>
                </div>
                <div className="space-y-5 p-8 rounded-3xl bg-skel-matte/5 border border-skel-metal/10 hover:bg-skel-matte/10 hover:border-nrg-sun/30 transition-all duration-500 group/card shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-nrg-sun shadow-[0_0_15px_rgba(236,204,104,0.6)] group-hover/card:scale-125 transition-transform" />
                    <span className="label-mono text-text-primary opacity-90 tracking-widest">Stok Optimizasyonu</span>
                  </div>
                  <div className="text-sm font-display font-bold leading-relaxed text-text-secondary group-hover/card:text-text-primary transition-colors">
                    {data.stocks.critical > 0 
                      ? `${data.stocks.critical} kalem ürün kritik seviyede. Apex AI, tedarik zinciri kesintisi riskini %24 olarak hesapladı.`
                      : "Stok devir hızı Apex standartlarında. Tüm materyaller üretim sürekliliği için yeterli seviyede."}
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex items-center justify-between p-6 rounded-3xl bg-skel-matte/5 border border-skel-metal/10">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <Cpu size={16} className="text-focus-neon" />
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] font-bold">CPU: %12</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-ai-bright" />
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] font-bold">RAM: 4.2GB</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-grow-phosphor" />
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] font-bold">Gecikme: 2ms</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-focus-neon font-black uppercase tracking-[0.4em]">Apex Core v4.2.0-Apex</div>
              </div>
            </div>
          </div>
        );
      case 'system_console':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="label-mono">Kernel Stream</p>
                <h2 className="text-2xl font-display font-black tracking-tighter text-void-white mt-1">{widget.title}</h2>
              </div>
              <Terminal size={24} className="text-focus-neon" />
            </div>
            <div className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-[10px] text-focus-neon overflow-hidden relative border border-focus-neon/10">
               <div className="space-y-1">
                 <div className="opacity-50">[{new Date().toLocaleTimeString()}] Build Render Start</div>
                 <div className="text-focus-neon font-bold">[{new Date().toLocaleTimeString()}] Log: CONNECTED</div>
                 <div className="opacity-50">[{new Date().toLocaleTimeString()}] Build Render End</div>
                 <div className="opacity-30">[{new Date().toLocaleTimeString()}] Neural Link: STABLE</div>
                 <div className="opacity-30">[{new Date().toLocaleTimeString()}] Memory: OPTIMIZED</div>
                 <div className="opacity-30">[{new Date().toLocaleTimeString()}] Security: ACTIVE</div>
               </div>
               <motion.div 
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1.5 h-3 bg-focus-neon ml-1 align-middle mt-1"
              />
            </div>
          </div>
        );
      case 'purchasing_summary':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-focus-neon/10 text-focus-neon flex items-center justify-center border border-focus-neon/20 group-hover:scale-110 transition-transform duration-500">
                <ShoppingCart size={24} />
              </div>
              <div className="px-3 py-1 rounded-full bg-focus-neon/10 text-focus-neon font-mono text-[10px] font-bold border border-focus-neon/20">SATIN ALMA</div>
            </div>
            <div>
              <p className="label-mono mb-2 opacity-70">{widget.title}</p>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-display font-black tracking-tighter text-void-white">{data.purchasing?.openOrders || 0}</div>
                <span className="text-[10px] font-mono text-skel-metal mb-2 font-bold tracking-widest">AÇIK SİPARİŞ</span>
              </div>
              <div className="mt-4 text-sm font-mono text-skel-metal">
                Bekleyen Talep: <span className="text-focus-neon font-bold">{data.purchasing?.pendingRequests || 0}</span>
              </div>
            </div>
          </div>
        );
      case 'active_shipments':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-nrg-sun/10 text-nrg-sun flex items-center justify-center border border-nrg-sun/20 group-hover:scale-110 transition-transform duration-500">
                <Truck size={24} />
              </div>
              <div className="px-3 py-1 rounded-full bg-nrg-sun/10 text-nrg-sun font-mono text-[10px] font-bold border border-nrg-sun/20">LOJİSTİK</div>
            </div>
            <div>
              <p className="label-mono mb-2 opacity-70">{widget.title}</p>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-display font-black tracking-tighter text-void-white">{data.shipments?.active || 0}</div>
                <span className="text-[10px] font-mono text-skel-metal mb-2 font-bold tracking-widest">AKTİF</span>
              </div>
            </div>
          </div>
        );
      case 'pending_tasks':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-crit-blood/10 text-crit-vivid flex items-center justify-center border border-crit-blood/20 group-hover:scale-110 transition-transform duration-500">
                <CheckSquare size={24} />
              </div>
              <div className="px-3 py-1 rounded-full bg-crit-blood/10 text-crit-vivid font-mono text-[10px] font-bold border border-crit-blood/20">GÖREVLER</div>
            </div>
            <div>
              <p className="label-mono mb-2 opacity-70">{widget.title}</p>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-display font-black tracking-tighter text-void-white">{data.tasks?.pending || 0}</div>
                <span className="text-[10px] font-mono text-skel-metal mb-2 font-bold tracking-widest">BEKLEYEN</span>
              </div>
            </div>
          </div>
        );
      case 'budget_status':
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-grow-phosphor/10 text-grow-phosphor flex items-center justify-center border border-grow-phosphor/20 group-hover:scale-110 transition-transform duration-500">
                <Wallet size={24} />
              </div>
              <div className="px-3 py-1 rounded-full bg-grow-phosphor/10 text-grow-phosphor font-mono text-[10px] font-bold border border-grow-phosphor/20">BÜTÇE</div>
            </div>
            <div>
              <p className="label-mono mb-2 opacity-70">{widget.title}</p>
              {data.budget?.active ? (
                <>
                  <div className="flex items-end gap-3">
                    <div className="text-3xl font-display font-black tracking-tighter text-void-white">
                      %{(data.budget.spent / data.budget.active.total_amount * 100).toFixed(1)}
                    </div>
                    <span className="text-[10px] font-mono text-skel-metal mb-1 font-bold tracking-widest">KULLANILAN</span>
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-skel-space overflow-hidden">
                      <div 
                        className="h-full bg-grow-phosphor" 
                        style={{ width: `${Math.min(100, (data.budget.spent / data.budget.active.total_amount * 100))}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm font-mono text-skel-metal">Aktif bütçe bulunmuyor.</div>
              )}
            </div>
          </div>
        );
      case 'generative':
        return (
          <GenerativeWidget 
            type={widget.generativeConfig.type}
            title={widget.title}
            data={widget.generativeConfig.data}
            config={widget.generativeConfig.config}
          />
        );
      default:
        return <div>Widget Content</div>;
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onClick={() => onClick(widget)}
      className="bento-card relative group cursor-pointer overflow-hidden h-full"
    >
      {/* Hyper-Material Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-void-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 flex gap-3 translate-y-2 group-hover:translate-y-0">
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(widget.id); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-crit-blood/10 text-crit-vivid hover:bg-crit-blood hover:text-pure-white transition-all shadow-lg border border-crit-blood/20"
          title="Modülü Kaldır"
        >
          <ZapOff size={16} />
        </button>
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-skel-space/80 text-skel-metal border border-skel-metal/20 shadow-lg backdrop-blur-md">
          <LayoutGrid size={16} />
        </div>
      </div>
      
      <div className="p-10 h-full flex flex-col relative z-10">
        {renderContent()}
      </div>
    </motion.div>
  );
}
