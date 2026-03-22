import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  Sparkles,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ListChecks,
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { PurchasingPlanningWizard } from './PurchasingPlanningWizard';
import { PurchasePlanTable } from './PurchasePlanTable';

export function PurchasingPlanning() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/purchase-plans');
      const data = await response.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    
    // Mock AI Insights for planning
    setAiInsights([
      {
        id: '1',
        type: 'optimization',
        title: 'Tedarikçi Birleştirme Fırsatı',
        content: '3 farklı talebi tek bir tedarikçiden (ABC Metal) alarak %12 lojistik tasarrufu sağlayabilirsiniz.',
        priority: 'high',
        icon: Sparkles
      },
      {
        id: '2',
        type: 'warning',
        title: 'Kritik Stok Seviyesi',
        content: 'Hammadde-X stokları kritik seviyenin altında. Mevcut taleplerin acilen planlanması önerilir.',
        priority: 'urgent',
        icon: AlertCircle
      },
      {
        id: '3',
        type: 'trend',
        title: 'Fiyat Artış Beklentisi',
        content: 'Bakır fiyatlarında önümüzdeki ay %5 artış bekleniyor. Planlanan alımların öne çekilmesi karlı olabilir.',
        priority: 'medium',
        icon: TrendingUp
      }
    ]);
  }, []);

  const handleSavePlan = async (formData: any) => {
    try {
      const response = await fetch('/api/purchase-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchPlans();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving plan:', error);
      return false;
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Bu planı silmek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(`/api/purchase-plans/${id}`, { method: 'DELETE' });
      if (response.ok) fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/purchase-plans/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) fetchPlans();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredPlans = plans.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { 
      label: 'Aktif Planlar', 
      value: plans.filter(p => p.status === 'draft' || p.status === 'confirmed').length, 
      icon: ListChecks, 
      color: 'bg-indigo-50 text-indigo-600',
      trend: '+2 bu hafta',
      trendType: 'up'
    },
    { 
      label: 'Onaylanan Bütçe', 
      value: `${plans.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.items.reduce((s: number, i: any) => s + (i.qty * i.estimated_price), 0), 0).toLocaleString('tr-TR')} ₺`, 
      icon: TrendingUp, 
      color: 'bg-emerald-50 text-emerald-600',
      trend: '%12 tasarruf',
      trendType: 'up'
    },
    { 
      label: 'Bekleyen Kalemler', 
      value: plans.filter(p => p.status === 'draft').reduce((sum, p) => sum + (p.item_count || 0), 0), 
      icon: Clock, 
      color: 'bg-amber-50 text-amber-600',
      trend: '4 acil kalem',
      trendType: 'down'
    },
    { 
      label: 'Tamamlanan Alımlar', 
      value: plans.filter(p => p.status === 'ordered').length, 
      icon: CheckCircle2, 
      color: 'bg-blue-50 text-blue-600',
      trend: '%85 verimlilik',
      trendType: 'up'
    }
  ];

  const chartData = [
    { name: 'Pzt', plans: 2, budget: 45000 },
    { name: 'Sal', plans: 5, budget: 120000 },
    { name: 'Çar', plans: 3, budget: 85000 },
    { name: 'Per', plans: 8, budget: 210000 },
    { name: 'Cum', plans: 4, budget: 95000 },
    { name: 'Cmt', plans: 1, budget: 25000 },
    { name: 'Paz', plans: 0, budget: 0 }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Satınalma Planlama
            <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
              Beta
            </div>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Talepleri birleştirin, bütçenizi yönetin ve stratejik alımlar yapın.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Planlama Sihirbazı
          </button>
          <button className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={80} />
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className={clsx("p-3 rounded-2xl shadow-sm", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={clsx(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                stat.trendType === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts & AI */}
        <div className="lg:col-span-1 space-y-8">
          {/* AI Insights Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-500/20 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">AI Planlama Asistanı</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      Aktif Analiz
                    </div>
                  </div>
                </div>
                <button className="text-white/40 hover:text-white transition-colors">
                  <Sparkles size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div 
                    key={insight.id}
                    className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/insight"
                  >
                    <div className="flex items-start gap-4">
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                        insight.priority === 'urgent' ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                        insight.priority === 'high' ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" :
                        "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      )}>
                        <insight.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-black text-white group-hover/insight:text-indigo-400 transition-colors">{insight.title}</h4>
                          <ArrowUpRight size={14} className="text-white/20 group-hover/insight:text-white transition-all" />
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">{insight.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2">
                Tüm Analizleri Gör
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Budget Chart */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Haftalık Bütçe Dağılımı</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Planlanan vs Onaylanan</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '16px',
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorBudget)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Table & Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl w-full sm:w-auto overflow-x-auto custom-scrollbar no-scrollbar">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'draft', label: 'Taslaklar' },
                { id: 'confirmed', label: 'Onaylananlar' },
                { id: 'ordered', label: 'Siparişler' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
                    activeFilter === filter.id 
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Plan Ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Table */}
          <PurchasePlanTable 
            plans={filteredPlans}
            onView={(plan) => console.log('View plan:', plan)}
            onDelete={handleDeletePlan}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <PurchasingPlanningWizard 
            onClose={() => setShowWizard(false)}
            onSave={handleSavePlan}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
