import { useState, useMemo, useRef } from 'react';
import { Clock, Plus, Package, Truck, AlertCircle, TrendingUp, Bell, Filter, Search, BarChart3, Globe, Download, FileText, FileSpreadsheet, Image as ImageIcon, ChevronRight, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shipment } from '../../types/shipment';
import { ShipmentWizard } from './ShipmentWizard';
import { ShipmentTable } from './ShipmentTable';
import { useShipments } from '../../context/ShipmentContext';
import { generateShipmentReport } from '../../utils/reportGenerator';
import html2canvas from 'html2canvas';

export function PendingShipments() {
  const { shipments, addShipment, updateShipment } = useShipments();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Hepsi');
  const [isExporting, setIsExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const pendingShipments = useMemo(() => {
    let filtered = shipments.filter(s => 
      (s.status === 'pending' || s.status === 'postponed') &&
      (s.recipient?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       s.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (activeFilter === 'Bugün Çıkacaklar') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(s => s.scheduledDate === today);
    } else if (activeFilter === 'Gecikenler') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(s => s.scheduledDate < today);
    } else if (activeFilter === 'Yüksek Öncelikli') {
      filtered = filtered.filter(s => s.priority === 'high');
    } else if (activeFilter === 'Büyük Sevkiyatlar') {
      filtered = filtered.filter(s => (s.pallets || []).length > 3);
    }

    return filtered;
  }, [shipments, searchQuery, activeFilter]);

  const handleExportPDF = () => generateShipmentReport(pendingShipments, 'pdf', 'Bekleyen Sevkiyatlar');
  const handleExportExcel = () => generateShipmentReport(pendingShipments, 'excel', 'Bekleyen Sevkiyatlar');

  const handleExportPNG = async () => {
    if (!tableRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `sevkiyat-gorunum-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('PNG Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleSave = (shipment: Shipment) => {
    if (editingShipment) {
      updateShipment(shipment);
    } else {
      addShipment(shipment);
    }
    setIsWizardOpen(false);
    setEditingShipment(null);
  };

  const handleEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsWizardOpen(true);
  };

  const statusCounts = {
    pending: shipments.filter(s => s.status === 'pending' || s.status === 'postponed').length,
    transit: shipments.filter(s => s.status === 'in-transit').length,
    total: shipments.length
  };

  // Mock data for the chart
  const chartData = useMemo(() => [
    { name: 'Pzt', volume: 40 },
    { name: 'Sal', volume: 30 },
    { name: 'Çar', volume: 65 },
    { name: 'Per', volume: 45 },
    { name: 'Cum', volume: 90 },
    { name: 'Cmt', volume: 20 },
    { name: 'Paz', volume: 15 },
  ], []);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-skel-glass flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/5">
              <Clock size={32} />
            </div>
            Bekleyen Sevkiyatlar
          </h1>
          <p className="text-skel-metal mt-2 font-medium">Lojistik operasyonlarınızı ve bekleyen sevkiyat planlarını yönetin.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-skel-metal group-focus-within:text-focus-neon transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Sevkiyat Ara..." 
              className="os-input pl-12 w-64 bg-skel-matte/10 border-skel-metal/20 focus:bg-skel-matte/20 text-skel-glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingShipment(null); setIsWizardOpen(true); }} 
            className="os-btn os-btn-primary whitespace-nowrap"
          >
            <Plus size={20} />
            Yeni Planlama
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle size={80} />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-skel-metal uppercase tracking-[0.2em] mb-1">Beklemede</div>
            <div className="text-4xl font-black text-skel-glass">{statusCounts.pending}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500">
              <TrendingUp size={14} />
              <span>Aktif Planlar</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
            <Truck size={80} />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-skel-metal uppercase tracking-[0.2em] mb-1">Yoldakiler</div>
            <div className="text-4xl font-black text-skel-glass">{statusCounts.transit}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-500">
              <TrendingUp size={14} />
              <span>Teslimat Sürecinde</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-focus-neon">
            <Package size={80} />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-skel-metal uppercase tracking-[0.2em] mb-1">Toplam Kayıt</div>
            <div className="text-4xl font-black text-skel-glass">{statusCounts.total}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-focus-neon">
              <TrendingUp size={14} />
              <span>Genel Hacim</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bento-card p-6 bg-focus-main/5 border-focus-main/20"
        >
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black text-focus-main uppercase tracking-[0.2em]">Hızlı İşlemler</div>
              <Download size={16} className="text-focus-main" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-focus-main text-white text-[10px] font-bold hover:bg-focus-deep transition-colors"
              >
                <FileText size={14} />
                PDF Rapor
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-skel-matte/20 text-skel-glass text-[10px] font-bold hover:bg-skel-matte/30 transition-colors"
              >
                <FileSpreadsheet size={14} />
                Excel Aktar
              </button>
              <button 
                onClick={handleExportPNG}
                className="col-span-2 flex items-center justify-center gap-2 p-2 rounded-lg bg-skel-matte/10 border border-skel-metal/10 text-skel-glass text-[10px] font-bold hover:bg-skel-matte/20 transition-colors"
              >
                <ImageIcon size={14} />
                Görünümü Kaydet (PNG)
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Middle Interactive Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bento-card p-6 cursor-pointer hover:border-focus-neon/30 transition-all group"
          onClick={() => window.open('/analytics', '_blank')}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-focus-neon/10 text-focus-neon group-hover:bg-focus-neon group-hover:text-white transition-colors">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-skel-glass">Sevkiyat Hacim Analizi</h3>
                <p className="text-[10px] text-skel-metal">Haftalık sevkiyat yoğunluğu ve kapasite kullanımı</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <TrendingUp size={12} /> +12%
              </span>
              <ExternalLink size={14} className="text-skel-metal opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-focus-neon)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-focus-neon)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-skel-metal)" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-skel-metal)', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-skel-space)', 
                    border: '1px solid var(--color-skel-metal-20)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--color-skel-glass)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="var(--color-focus-neon)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card p-6 cursor-pointer hover:border-blue-500/30 transition-all group"
          onClick={() => window.open('/routes', '_blank')}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-skel-glass">Aktif Rotalar</h3>
                <p className="text-[10px] text-skel-metal">En çok sevkiyat yapılan bölgeler</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-skel-metal opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-4">
            {[
              { city: 'İstanbul', count: 12, progress: 85, color: 'bg-blue-500' },
              { city: 'Ankara', count: 8, progress: 60, color: 'bg-focus-neon' },
              { city: 'İzmir', count: 5, progress: 40, color: 'bg-amber-500' },
              { city: 'Bursa', count: 3, progress: 25, color: 'bg-emerald-500' },
            ].map((route) => (
              <div key={route.city} className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-skel-glass">{route.city}</span>
                  <span className="text-skel-metal">{route.count} Sevkiyat</span>
                </div>
                <div className="h-1.5 w-full bg-skel-matte/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${route.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${route.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 rounded-xl bg-skel-matte/5 text-skel-metal text-[10px] font-black uppercase tracking-widest hover:bg-skel-matte/10 transition-all">
            Tüm Rotaları Gör
          </button>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Sidebar Panels */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-skel-glass flex items-center gap-2">
                <Filter size={16} className="text-focus-neon" />
                Hızlı Filtreler
              </h3>
            </div>
            <div className="space-y-2">
              {['Hepsi', 'Bugün Çıkacaklar', 'Gecikenler', 'Yüksek Öncelikli', 'Büyük Sevkiyatlar'].map((filter) => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                    activeFilter === filter 
                      ? 'bg-focus-neon text-white shadow-lg shadow-focus-neon/20' 
                      : 'text-skel-metal hover:bg-skel-matte/10 hover:text-focus-neon'
                  }`}
                >
                  {filter}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                    activeFilter === filter ? 'bg-white/20' : 'bg-skel-matte/10 group-hover:bg-focus-neon group-hover:text-white'
                  }`}>
                    {filter === 'Hepsi' ? shipments.filter(s => s.status === 'pending' || s.status === 'postponed').length : 
                     filter === 'Bugün Çıkacaklar' ? shipments.filter(s => s.status === 'pending' && s.scheduledDate === new Date().toISOString().split('T')[0]).length :
                     filter === 'Gecikenler' ? shipments.filter(s => (s.status === 'pending' || s.status === 'postponed') && s.scheduledDate < new Date().toISOString().split('T')[0]).length :
                     filter === 'Yüksek Öncelikli' ? shipments.filter(s => s.priority === 'high').length :
                     filter === 'Büyük Sevkiyatlar' ? shipments.filter(s => (s.pallets || []).length > 3).length : 0}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bento-card p-5 flex flex-col gap-4 flex-1"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-skel-glass flex items-center gap-2">
                <Bell size={16} className="text-amber-500" />
                Son Aktiviteler
              </h3>
              <button className="text-[10px] font-black text-focus-neon hover:underline">Tümünü Gör</button>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
              {[
                { type: 'create', user: 'Ahmet Y.', text: 'Yeni sevkiyat planladı', time: '10dk önce', link: '#' },
                { type: 'status', user: 'Sistem', text: 'SV-102 yola çıktı', time: '25dk önce', link: '#' },
                { type: 'edit', user: 'Mehmet K.', text: 'SV-105 güncellendi', time: '1sa önce', link: '#' },
                { type: 'cancel', user: 'Zeynep A.', text: 'SV-108 iptal edildi', time: '2sa önce', link: '#' },
              ].map((activity, i) => (
                <div 
                  key={i} 
                  className="flex gap-3 items-start p-2 rounded-xl hover:bg-skel-matte/5 transition-colors cursor-pointer group"
                  onClick={() => window.open(activity.link, '_blank')}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    activity.type === 'create' ? 'bg-emerald-500' : 
                    activity.type === 'status' ? 'bg-blue-500' : 
                    activity.type === 'edit' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="text-[11px] font-bold text-skel-glass">{activity.user}</div>
                      <ChevronRight size={12} className="text-skel-metal opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="text-[10px] text-skel-metal">{activity.text}</div>
                    <div className="text-[9px] text-skel-metal/60 mt-0.5">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Table Area */}
        <div className="xl:col-span-3 flex flex-col min-h-0" ref={tableRef}>
          {pendingShipments.length === 0 ? (
            <div className="bento-card flex-1 p-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-skel-matte/5 flex items-center justify-center text-skel-metal/20">
                <Package size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-skel-glass">Kayıt Bulunamadı</h3>
                <p className="text-skel-metal max-w-xs mx-auto mt-2">Arama kriterlerinize uygun veya bekleyen bir sevkiyat kaydı bulunmuyor.</p>
              </div>
              <button 
                onClick={() => { setEditingShipment(null); setIsWizardOpen(true); }}
                className="os-btn os-btn-secondary mt-4"
              >
                Yeni Kayıt Oluştur
              </button>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ShipmentTable shipments={pendingShipments} onEdit={handleEdit} />
            </div>
          )}
        </div>
      </div>

      {isWizardOpen && (
        <ShipmentWizard 
          onSave={handleSave} 
          onClose={() => { setIsWizardOpen(false); setEditingShipment(null); }} 
          initialData={editingShipment || undefined}
        />
      )}
    </div>
  );
}
