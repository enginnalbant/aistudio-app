import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Target, 
  AlertTriangle, 
  Clock, 
  BrainCircuit, 
  ArrowRight,
  TrendingDown,
  History,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Users,
  Activity,
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  X,
  ChevronRight,
  Search,
  Filter,
  ShieldCheck,
  Layers,
  Monitor,
  Truck,
  RotateCcw,
  DollarSign,
  Heart,
  Ban
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

/* ------------------------------- Mock Data ------------------------------- */

const TEMPLATES = [
  // Finansal İstihbarat
  { id: 'PAYMENT_BEH', title: "Ödeme Alışkanlık Analizi", desc: "Müşterilerin ortalama ödeme günleri ve gecikme trendleri analizi.", category: 'İstihbarat', icon: <Clock size={20} /> },
  { id: 'CREDIT_SCORE', title: "Cari Kredi Skoru", desc: "Finansal verilere dayalı içsel kredi notu ve güvenirlik raporu.", category: 'İstihbarat', icon: <ShieldCheck size={20} /> },
  { id: 'PROFITABILITY', title: "Müşteri Karlılık Analizi", desc: "Ciro bağımsız, net karlılık ve operasyonel maliyet dökümü.", category: 'İstihbarat', icon: <DollarSign size={20} /> },
  
  // Segmentasyon & Değer
  { id: 'RFM_DEEP', title: "RFM Segmentasyon Raporu", desc: "Yenilik, Sıklık ve Parasal değer temelli müşteri sınıfları.", category: 'Segmentasyon', icon: <Target size={20} /> },
  { id: 'LIFETIME_VAL', title: "Müşteri Ömür Boyu Değeri", desc: "CLV modeli ile gelecek dönem getiri potansiyeli öngörüsü.", category: 'Segmentasyon', icon: <Activity size={20} /> },
  { id: 'CHURN_RISK', title: "Kayıp (Churn) Riski", desc: "Yapay zeka ile hareketleri azalan müşterilerin tespit raporu.", category: 'Segmentasyon', icon: <AlertTriangle size={20} /> },
  
  // Tedarik Zinciri
  { id: 'SUPP_RELIABILITY', title: "Tedarikçi Güvenirlik", desc: "Termin süreleri ve eksik teslimat oranlarının performans raporu.", category: 'Tedarik', icon: <Truck size={20} /> },
  { id: 'PRICE_HISTORY', title: "Alım Fiyat Analizi", desc: "Tedarikçiler arası fiyat karşılaştırması ve maliyet trendleri.", category: 'Tedarik', icon: <TrendingDown size={20} /> },
  { id: 'CONCENTRATION', title: "Tedarik Yoğunlaşma Riski", desc: "Belirli tedarikçilere olan bağımlılık ve alternatif analizi.", category: 'Tedarik', icon: <Ban size={20} /> },

  // Stratejik Öngörüler
  { id: 'CROSS_SELL', title: "Çapraz Satış Fırsatları", desc: "Mevcut müşteriler için ürün öneri ve potansiyel satış analizi.", category: 'Strateji', icon: <Zap size={20} /> },
  { id: 'BUDGET_COMP', title: "Bütçe vs Gerçekleşen", desc: "Cari bazlı satış hedefleri ve gerçekleşme oranları takibi.", category: 'Strateji', icon: <BarChart3 size={20} /> },
];

const CONTACT_AI_INSIGHTS = [
  { 
    title: 'Tahsilat Risk Uyarısı', 
    desc: 'Bora Lojistik son 3 ödemesinde ortalama 12 gün gecikmeye düştü. Cari limitinin %15 düşürülmesi önerilir.', 
    type: 'risk',
    icon: <AlertTriangle size={18} />
  },
  { 
    title: 'Büyüme Potansiyeli', 
    desc: 'Tekno Market alımları geçen yıla göre %45 arttı. Özel kampanya segmentine dahil edilebilir.', 
    type: 'growth',
    icon: <TrendingUp size={18} />
  },
  { 
    title: 'Stratejik Tedarikçi', 
    desc: 'Mavi Metal termin sürelerinde %100 başarı sağladı. Ana tedarikçi statüsü korunmalı.', 
    type: 'info',
    icon: <ShieldCheck size={18} />
  }
];

const SEGMENT_DATA = [
  { name: 'VIP', value: 15, color: '#8b5cf6' },
  { name: 'Sadık', value: 35, color: '#3b82f6' },
  { name: 'Potansiyel', value: 25, color: '#06b6d4' },
  { name: 'Riskli', value: 15, color: '#f59e0b' },
  { name: 'Kayıp', value: 10, color: '#ef4444' },
];

const PROFIT_TREND = [
  { month: 'Oca', profit: 42000, revenue: 150000 },
  { month: 'Şub', profit: 48000, revenue: 165000 },
  { month: 'Mar', profit: 35000, revenue: 180000 },
  { month: 'Nis', profit: 54000, revenue: 210000 },
  { month: 'May', profit: 62000, revenue: 245000 },
];

/* ------------------------------- Components ------------------------------ */

const ReportTemplateCard = ({ title, desc, icon, onClick }: { title: string, desc: string, icon: React.ReactNode, onClick: () => void }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all cursor-pointer group flex flex-col h-full"
  >
    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
      {icon}
    </div>
    <h4 className="text-white font-bold text-[13px] mb-2 line-clamp-1 italic">{title}</h4>
    <p className="text-text-secondary text-[10px] uppercase tracking-widest leading-relaxed opacity-60 mb-6 line-clamp-2">{desc}</p>
    <div className="mt-auto">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="flex items-center gap-2 text-purple-400 text-[10px] font-black tracking-widest uppercase hover:gap-4 transition-all"
      >
        ANALİZ ET <ArrowRight size={14} />
      </button>
    </div>
  </motion.div>
);

const ExportFormatModal = ({ isOpen, onClose, templateTitle, onConfirm }: { isOpen: boolean, onClose: () => void, templateTitle: string, onConfirm: (format: string) => void }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = (format: string) => {
    setIsExporting(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExporting(false);
          setProgress(0);
          onConfirm(format);
          onClose();
        }, 500);
      }
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-[40px] shadow-2xl p-8 overflow-hidden"
      >
        {isExporting ? (
          <div className="py-10 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * progress) / 100}
                  className="text-purple-500 transition-all duration-100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-black text-white italic">
                %{progress}
              </div>
            </div>
            <div>
              <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-2 italic">Analiz Hazırlanıyor</h3>
              <p className="text-text-secondary text-[10px] uppercase tracking-widest opacity-60">Finansal algoritmalar çalıştırılıyor...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tighter mb-2 underline decoration-purple-500/50">FORMAT SEÇİN</h3>
                <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                  {templateTitle} <br/> <span className="opacity-40 italic">Analiz çıktı formatını belirleyin</span>
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-secondary">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { id: 'pdf', label: 'PDF Strateji Dosyası', desc: 'Resmi raporlar ve sunumlar için', icon: <FileText size={24} />, color: 'bg-rose-500/10 text-rose-400' },
                { id: 'excel', label: 'Veri Analizi (XLSX)', desc: 'Ek veri manipülasyonu için', icon: <FileSpreadsheet size={24} />, color: 'bg-emerald-500/10 text-emerald-400' },
                { id: 'png', label: 'İnfografik (PNG)', desc: 'Analiz grafiklerini paylaşmak için', icon: <FileImage size={24} />, color: 'bg-blue-500/10 text-blue-400' },
              ].map((f) => (
                <button 
                  key={f.id}
                  onClick={() => handleExport(f.id)}
                  className="w-full p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all group flex items-center gap-4"
                >
                  <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", f.color)}>
                    {f.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-bold uppercase tracking-tight">{f.label}</p>
                    <p className="text-[9px] text-text-secondary font-mono uppercase tracking-widest opacity-60">{f.desc}</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-purple-400 transition-colors" />
                </button>
              ))}
            </div>

            <p className="text-[9px] text-center text-text-secondary font-mono uppercase opacity-30 tracking-[0.2em]">
              Zeka tabanlı veri işleme süreci her formatta uygulanır
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export const ContactAnalytics = () => {
  const [exportModal, setExportModal] = useState<{ isOpen: boolean, template: any | null }>({ isOpen: false, template: null });

  const handleTemplateClick = (template: any) => {
    setExportModal({ isOpen: true, template });
  };

  const handleConfirmExport = (format: string) => {
    const template = exportModal.template;
    if (!template) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${template.title.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;

    let reportContent = `========================================================\n`;
    reportContent += `   CARİ YÖNETİM SİSTEMİ - İLERİ ANALİTİK ZEKA\n`;
    reportContent += `========================================================\n\n`;
    reportContent += `ANALİZ ADI:   ${template.title.toUpperCase()}\n`;
    reportContent += `KATEGORİ:     ${template.category.toUpperCase()} ZEKASI\n`;
    reportContent += `TARİH:        ${new Date().toLocaleString()}\n`;
    reportContent += `ALGORİTMA:    PREDICTIVE FINANCE V5.0\n`;
    reportContent += `--------------------------------------------------------\n\n`;

    switch (template.id) {
        case 'PAYMENT_BEH':
          reportContent += `ÖDEME ANALİZİ:\n- Ortalama Tahsilat Süresi: 34 Gün\n- Gecikme Sıklığı: %12\n- En Düzenli Grup: Tedarikçiler\n`;
          break;
        case 'CHURN_RISK':
          reportContent += `MÜŞTERİ KAYIP TAHMİNİ:\n- Kritik Riskli Müşteri: 12\n- Potansiyel Ciro Kaybı: ₺450,000\n- Ana Nedenler: Rakip Fiyat Rekabeti, Hizmet Gecikmeleri\n`;
          break;
        case 'RFM_DEEP':
          reportContent += `RFM PUANLAMA:\n- Recency (Yenilik): 8.4/10\n- Frequency (Sıklık): 7.2/10\n- Monetary (Parasal): 9.1/10\n- Genel Segment: Sadık Şampiyonlar\n`;
          break;
        default:
          reportContent += `${template.desc}\n\nStratejik kararlar için gerekli matematiksel modeller dökümana eklenmiştir.\n`;
      }

    reportContent += `\n--------------------------------------------------------\n`;
    reportContent += `* Bu analiz veriye dayalı stratejik öngörüler içerir.\n`;
    reportContent += `========================================================\n`;

    let blob: Blob;
    let extension: string;

    if (format === 'excel') {
      const csvContent = "Metrik,Değer,Hedef,Durum\n" + 
                         `Tahsilat Hizi,34 Gun,30 Gun,Dikkat\n` +
                         `Risk Skoru,85/100,75/100,Iyi\n`;
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      extension = 'csv';
    } else {
      blob = new Blob([reportContent], { type: 'text/plain' });
      extension = format;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase mb-2">
            FİNANSAL <span className="text-purple-500 underline decoration-purple-500/30">İSTİHBARAT</span>
          </h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.3em] opacity-60">Cari Davranış ve Risk Modelleme Servisi</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 h-12 rounded-2xl bg-skel-space/40 border border-white/10 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-mono text-[10px] uppercase tracking-widest">AI Modelleri Güncel</span>
          </div>
        </div>
      </div>

      {/* AI Insights - Staggered Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {CONTACT_AI_INSIGHTS.map((insight, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={clsx(
              "p-6 rounded-[32px] border relative overflow-hidden group",
              insight.type === 'risk' ? "bg-rose-500/5 border-rose-500/20" : 
              insight.type === 'growth' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                insight.type === 'risk' ? "bg-rose-500/20 text-rose-400" : 
                insight.type === 'growth' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
              )}>
                {insight.icon}
              </div>
              <h4 className="text-white font-bold text-sm tracking-tight">{insight.title}</h4>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed line-clamp-3">
              {insight.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profitability Trend */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <TrendingUp size={16} className="text-emerald-500" />
            Karlılık / Ciro Korelasyonu
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROFIT_TREND}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.1} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segment Distribution */}
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <PieIcon size={16} className="text-purple-500" />
            Müşteri Segment Dağılım Analizi
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SEGMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {SEGMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ready Analysis Templates Section */}
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
            <BrainCircuit size={16} className="text-purple-400" />
            Hazır Cari Analiz Şablonları
          </h3>
          <div className="flex gap-2">
            {['İstihbarat', 'Segmentasyon', 'Tedarik', 'Strateji'].map(cat => (
              <span key={cat} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-text-secondary uppercase tracking-widest">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {TEMPLATES.map((template) => (
            <ReportTemplateCard 
              key={template.id}
              title={template.title} 
              desc={template.desc} 
              icon={template.icon}
              onClick={() => handleTemplateClick(template)}
            />
          ))}
        </div>
      </div>

      <ExportFormatModal 
        isOpen={exportModal.isOpen}
        onClose={() => setExportModal({ isOpen: false, template: null })}
        templateTitle={exportModal.template?.title || ''}
        onConfirm={handleConfirmExport}
      />
    </div>
  );
};
