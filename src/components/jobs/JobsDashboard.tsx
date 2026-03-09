import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  Calendar,
  Zap,
  ChevronRight,
  MoreVertical,
  Filter,
  ClipboardList,
  Plus
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
import { JobWizardModal } from './JobWizardModal';

import { useSettings } from '../../context/SettingsContext';

export function JobsDashboard({ setActiveModule }: { setActiveModule: (module: string) => void }) {
  const { settings } = useSettings();
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allRes, openRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/jobs/open')
      ]);
      const allData = await allRes.json();
      const openData = await openRes.json();
      
      if (allData.error) throw new Error(allData.error);
      if (openData.error) throw new Error(openData.error);

      setAllJobs(allData);
      setOpenJobs(openData);
    } catch (error: any) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = () => {
    setEditingJob(null);
    fetchData();
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setEditingJob(null);
  };

  // --- Calculations ---
  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString('tr-TR');
    
    const totalOpenQty = openJobs.reduce((acc, curr) => {
      return acc + curr.items.reduce((sum: number, item: any) => sum + (item.qty - item.received_qty), 0);
    }, 0);
    
    const totalClosedQty = allJobs.filter(j => j.status === 'Tamamlandı').reduce((acc, curr) => {
      return acc + curr.items.reduce((sum: number, item: any) => sum + item.qty, 0);
    }, 0);

    const delayedJobs = openJobs.filter(job => {
      const deadline = new Date(job.date);
      deadline.setDate(deadline.getDate() + 7); 
      return deadline < new Date();
    });

    const efficiency = allJobs.length > 0 
      ? Math.round((allJobs.filter(j => j.status === 'Tamamlandı').length / allJobs.length) * 100)
      : 0;

    const newToday = openJobs.filter(j => new Date(j.date).toLocaleDateString('tr-TR') === today).length;
    const closedToday = allJobs.filter(j => j.status === 'Tamamlandı' && new Date(j.date).toLocaleDateString('tr-TR') === today).length;

    return {
      openQty: totalOpenQty,
      closedQty: totalClosedQty,
      delayedCount: delayedJobs.length,
      efficiency,
      totalSuppliers: new Set([...allJobs, ...openJobs].map(j => j.supplier_name)).size,
      newToday,
      closedToday
    };
  }, [allJobs, openJobs]);

  // --- Chart Data ---
  const flowData = useMemo(() => {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const dateStr = date.toLocaleDateString('tr-TR');
      const dayName = days[date.getDay()];
      
      const openCount = openJobs.filter(j => 
        new Date(j.date).toLocaleDateString('tr-TR') === dateStr
      ).length;

      const closedCount = allJobs.filter(j => 
        new Date(j.date).toLocaleDateString('tr-TR') === dateStr && j.status === 'Tamamlandı'
      ).length;

      return {
        name: dayName,
        open: openCount,
        closed: closedCount
      };
    });
  }, [allJobs, openJobs]);

  const statusData = useMemo(() => [
    { name: 'Tamamlandı', value: allJobs.filter(j => j.status === 'Tamamlandı').length, color: '#10b981' },
    { name: 'Açık', value: openJobs.filter(j => j.status === 'Açık').length, color: 'var(--accent)' },
    { name: 'Kısmi', value: openJobs.filter(j => j.status === 'Kısmi').length, color: '#f59e0b' },
  ], [allJobs, openJobs]);

  const recentActivity = useMemo(() => {
    return [...allJobs, ...openJobs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [allJobs, openJobs]);

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
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-8">
        {/* Header */}
        <div className="md:col-span-4 lg:col-span-4 flex flex-col justify-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">İş Emirleri</h1>
        <p className="text-text-secondary max-w-md text-sm font-medium">
          Üretim ve sevkiyat süreçlerinin anlık performans analizi.
        </p>
      </div>

      {/* Actions */}
      <div className="md:col-span-4 lg:col-span-2 bento-card p-5 flex flex-col justify-between bg-accent text-bg-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Operasyonlar</span>
          <ClipboardList size={18} />
        </div>
        <button onClick={() => setIsWizardOpen(true)} className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-bold">
          Yeni İş Emri Oluştur <Plus size={16} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="md:col-span-2 lg:col-span-2 bento-card p-5 flex flex-col justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Bekleyen Üretim</span>
        <div>
          <div className="text-3xl font-bold tracking-tighter">{stats.openQty}</div>
          <p className="text-[10px] text-text-secondary font-bold mt-0.5 uppercase tracking-wider">Açık İş Emirleri</p>
        </div>
      </div>

      <div className="md:col-span-2 lg:col-span-2 bento-card p-5 flex flex-col justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Geciken İşler</span>
        <div>
          <div className="text-3xl font-bold tracking-tighter text-rose-600">{stats.delayedCount}</div>
          <p className="text-[10px] text-rose-600 font-bold mt-0.5 uppercase tracking-wider">Kritik Durum</p>
        </div>
      </div>

      <div className="md:col-span-2 lg:col-span-2 bento-card p-5 flex flex-col justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Süreç Verimliliği</span>
        <div>
          <div className="text-3xl font-bold tracking-tighter">%{stats.efficiency}</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5 uppercase tracking-wider">Tamamlanma Oranı</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="md:col-span-4 lg:col-span-4 bento-card p-6 min-h-[350px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">İş Akışı</span>
            <h2 className="text-xl font-bold mt-0.5">Haftalık Trend</h2>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold uppercase opacity-50">Açılan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase opacity-50">Kapatılan</span>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
            <AreaChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--border)', 
                  borderRadius: '12px'
                }}
              />
              <Area type="monotone" dataKey="open" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.05} />
              <Area type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.05} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="md:col-span-2 lg:col-span-2 bento-card p-6 flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-6">Durum Dağılımı</span>
        <div className="flex-1 relative min-h-[180px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold">{allJobs.length}</span>
            <span className="text-[9px] text-text-secondary uppercase font-bold tracking-widest">Toplam</span>
          </div>
        </div>
        <div className="space-y-1.5 mt-6">
          {statusData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-medium">{item.name}</span>
              </div>
              <span className="text-[11px] font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="md:col-span-4 lg:col-span-6 bento-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight">Son Hareketler</h2>
          <button className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:text-accent transition-colors">Tüm Geçmiş</button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {recentActivity.map((job, idx) => (
            <div 
              key={idx} 
              onClick={() => handleEditJob(job)}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent transition-all cursor-pointer group"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                job.status === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-600'
              }`}>
                {job.status === 'Tamamlandı' ? <CheckCircle2 size={18} /> : <Package size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold truncate group-hover:text-accent transition-colors">
                    {job.receipt_no} — {job.supplier_name}
                  </h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                    {new Date(job.date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary truncate mt-0.5">
                  {job.items.map((i: any) => i.stock_name).join(', ')}
                </p>
              </div>
              <ChevronRight size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      <JobWizardModal 
        isOpen={isWizardOpen} 
        onClose={handleCloseWizard} 
        onSave={handleSaveJob} 
        editingJob={editingJob}
      />
      </div>
    </div>
  );
}
