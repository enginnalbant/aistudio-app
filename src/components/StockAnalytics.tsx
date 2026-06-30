import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  BrainCircuit, 
  ArrowRight,
  TrendingDown,
  Clock,
  History,
  Target,
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Box,
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
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import clsx from 'clsx';

/* ------------------------------- Mock Data ------------------------------- */

const TEMPLATES = [
  // Tahminleme & Projeksiyon
  { id: 'DEMAND', title: "Talep Tahmin Analizi", desc: "Geçmiş verilere dayalı gelecek 6 aylık talep projeksiyonu.", category: 'Tahmin', icon: <Target size={20} /> },
  { id: 'DEPLETION', title: "Stok Tükenim Öngörüsü", desc: "Hangi ürünlerin ne zaman tükenmeye başlayacağının analizi.", category: 'Tahmin', icon: <Clock size={20} /> },
  { id: 'SEASONAL', title: "Mevsimsel Trend Analizi", desc: "Yıllık bazda mevsimsel talep dalgalanmalarının dökümü.", category: 'Tahmin', icon: <Activity size={20} /> },
  
  // Verimlilik & Maliyet
  { id: 'ABC_DEEP', title: "Derinlemesine ABC Analizi", desc: "Envanter değerinin Pareto prensibiyle sınıfsal dağılım raporu.", category: 'Verimlilik', icon: <BarChart3 size={20} /> },
  { id: 'TURNOVER_DET', title: "Detaylı Devir Hızı", desc: "Ürün grubu bazlı stok sirkülasyon performans dökümü.", category: 'Verimlilik', icon: <Zap size={20} /> },
  { id: 'HOLDING_COST', title: "Stok Tutma Maliyeti", desc: "Depolama ve sermaye bağlama maliyetlerinin kalem bazlı analizi.", category: 'Verimlilik', icon: <DollarSign size={20} /> },
  { id: 'SPACE_UTIL', title: "Depo Alan Kullanımı", desc: "Hangi ürünlerin ne kadar alan kapladığının verimlilik analizi.", category: 'Verimlilik', icon: <Layers size={20} /> },
  
  // Risk & Sağlık
  { id: 'AGING_DET', title: "Detaylı Yaşlanma Raporu", desc: "90+ gün hareket görmeyen ürünlerin maliyet ve risk dökümü.", category: 'Sağlık', icon: <History size={20} /> },
  { id: 'EXPIRE_RISK', title: "SKT ve Raf Ömrü Riski", desc: "Son kullanma tarihi yaklaşan veya raf ömrü dolanların analizi.", category: 'Sağlık', icon: <AlertTriangle size={20} /> },
  { id: 'SAFETY_CALC', title: "Emniyet Stoku Ölçümü", desc: "Tedarik risklerine karşı gerekli emniyet stok seviye analizi.", category: 'Sağlık', icon: <ShieldCheck size={20} /> },

  // Tedarik & Performans
  { id: 'SUPPLIER_SCORE', title: "Tedarikçi Puan Kartı", desc: "Hız, kalite ve maliyet bazlı tedarikçi performans dökümü.", category: 'Performans', icon: <Truck size={20} /> },
  { id: 'PURCHASE_TREND', title: "Satınalma Trendleri", desc: "Hammadde fiyat değişimleri ve alım periyotlarının analizi.", category: 'Performans', icon: <TrendingUp size={20} /> },
  { id: 'LEAD_TIME', title: "Tedarik Süre Analizi", desc: "Siparişten teslime geçen gerçek sürelerin istatistiksel raporu.", category: 'Performans', icon: <Monitor size={20} /> },
  
  // Stratejik
  { id: 'OPPORTUNITY', title: "Kayıp Fırsat Analizi", desc: "Stok yokluğu (out of stock) nedeniyle kaçırılan satış öngörüsü.", category: 'Stratejik', icon: <TrendingDown size={20} /> },
  { id: 'ORDER_QUANT', title: "EOQ - Ekonomik Sipariş", desc: "Minimum maliyet için optimum sipariş miktarı hesapları.", category: 'Stratejik', icon: <BrainCircuit size={20} /> },
];

const AI_INSIGHTS = [
  { 
    title: 'Otomatik Tükenim Tahmini', 
    desc: 'Şu anki trendlere göre 8 ürün 30 gün içinde tükenecek. Tedarik süreci hemen başlatılmalı.',
    icon: <Clock className="text-blue-400" />,
    color: 'blue'
  },
  { 
    title: 'Optimizasyon Önerisi', 
    desc: 'ABC analizi: A grubu 23 ürün toplam stok değerinin %78’ini oluşturuyor. Stok maliyeti %12 düşürülebilir.',
    icon: <BrainCircuit className="text-purple-400" />,
    color: 'purple'
  },
  { 
    title: 'Tedarik Zinciri Riski', 
    desc: '3 ana tedarikçiden beklenen 5 sevkiyat için lojistik gecikme riski %65. Alternatif aranmalı.',
    icon: <AlertTriangle className="text-orange-400" />,
    color: 'orange'
  }
];

const ABC_DATA = [
  { x: 10, y: 80, z: 200, group: 'A', name: 'Motor X1' },
  { x: 15, y: 75, z: 150, group: 'A', name: 'Profil A2' },
  { x: 40, y: 15, z: 80, group: 'B', name: 'Vida M8' },
  { x: 45, y: 10, z: 70, group: 'B', name: 'Kapak 60' },
  { x: 80, y: 5, z: 30, group: 'C', name: 'Etiket' },
  { x: 85, y: 3, z: 20, group: 'C', name: 'Koli' },
];

const DEVIR_HIZI = [
  { category: 'Mamul', gun: 4.2 },
  { category: 'Hammadde', gun: 12.5 },
  { category: 'Ambalaj', gun: 2.8 },
  { category: 'Yarı Mamul', gun: 6.4 },
  { category: 'Sarf', gun: 18.2 },
];

const YASLANMA_DATA = [
  { name: '0-30 Gün', value: 450, color: '#10b981' },
  { name: '30-90 Gün', value: 300, color: '#3b82f6' },
  { name: '90+ Gün', value: 250, color: '#f43f5e' },
];

const FORECAST_DATA = [
  { ay: 'Ocak', reel: 400, tahmin: 400 },
  { ay: 'Şubat', reel: 300, tahmin: 320 },
  { ay: 'Mart', reel: 200, tahmin: 210 },
  { ay: 'Nisan', reel: 278, tahmin: 260 },
  { ay: 'Mayıs', reel: 189, tahmin: 200 },
  { ay: 'Haziran', reel: 239, tahmin: 250 },
  { ay: 'Temmuz', tahmin: 280, range: [240, 320] },
  { ay: 'Ağustos', tahmin: 310, range: [260, 360] },
  { ay: 'Eylül', tahmin: 290, range: [240, 340] },
];

const BEST_PERFORMERS = [
  { name: 'Motor 1.5kW', devir: '1.2 gün', trend: 'up' },
  { name: 'Profil S-12', devir: '2.5 gün', trend: 'up' },
  { name: 'Rulman X8', devir: '3.1 gün', trend: 'up' },
  { name: 'Vida M12', devir: '3.8 gün', trend: 'up' },
  { name: 'Sensör T4', devir: '4.0 gün', trend: 'up' },
];

const WORST_PERFORMERS = [
  { name: 'Yağlama Gres', son: '42 gün', suggestion: 'Sipariş Durdur' },
  { name: 'Boya Beyaz', son: '38 gün', suggestion: 'Sayım Yap' },
  { name: 'Karton Kutu', son: '35 gün', suggestion: 'İndirim Tanımla' },
  { name: 'Kapak 40mm', son: '30 gün', suggestion: 'Sayım Yap' },
  { name: 'Hidrolik ISO', son: '28 gün', suggestion: 'Sipariş Durdur' },
];

/* ------------------------------- Components ------------------------------ */

const navigate = (moduleId: string) => {
  if ((window as any).setActiveModule) {
    (window as any).setActiveModule(moduleId);
  }
};

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
              <p className="text-text-secondary text-[10px] uppercase tracking-widest opacity-60">Matematiksel modeller işleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tighter mb-2 underline decoration-purple-500/50">FORMAT SEÇİN</h3>
                <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                  {templateTitle} <br/> <span className="opacity-40 italic">Çıktı formatını belirleyin</span>
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-secondary">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { id: 'pdf', label: 'PDF Analiz Dosyası', desc: 'Resmi raporlar ve sunumlar için', icon: <FileText size={24} />, color: 'bg-rose-500/10 text-rose-400' },
                { id: 'excel', label: 'E-Tablo (XLSX)', desc: 'Ek veri manipülasyonu için', icon: <FileSpreadsheet size={24} />, color: 'bg-emerald-500/10 text-emerald-400' },
                { id: 'png', label: 'Görsel (PNG)', desc: 'Analiz grafiklerini paylaşmak için', icon: <FileImage size={24} />, color: 'bg-blue-500/10 text-blue-400' },
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
              Seçilen formatta veri ve grafikler optimize edilecektir
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export const StockAnalytics = () => {
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
    reportContent += `   STOK YÖNETİM SİSTEMİ - İLERİ ANALİTİK SERVİSİ\n`;
    reportContent += `========================================================\n\n`;
    reportContent += `ANALİZ ADI:   ${template.title.toUpperCase()}\n`;
    reportContent += `MODÜL:        ${template.category.toUpperCase()} ANALİTİĞİ\n`;
    reportContent += `TARİH:        ${new Date().toLocaleString()}\n`;
    reportContent += `MODEL:        ALGORİTMİK TAHMİNLEME V4.2\n`;
    reportContent += `--------------------------------------------------------\n\n`;

    switch (template.id) {
      case 'DEMAND':
        reportContent += `TALEP ÖNGÖRÜSÜ:\n- Güven Aralığı: %95\n- Trend Yönü: Pozitif (+%12)\n- Kritik Pik Dönemi: Temmuz 2026\n`;
        break;
      case 'ABC_DEEP':
        reportContent += `ABC SEGMENTASYON SONUÇLARI:\n- [A] Grubu (23 Ürün): Toplam Ciro %78\n- [B] Grubu (45 Ürün): Toplam Ciro %15\n- [C] Grubu (150 Ürün): Toplam Ciro %7\n`;
        break;
      case 'HOLDING_COST':
        reportContent += `MALİYET ETKİ ANALİZİ:\n- Aylık Ortalama Tutma Maliyeti: ₺42,500\n- Fırsat Maliyeti Endeksi: 1.4\n- Optimizasyon Potansiyeli: ₺5,200/Ay\n`;
        break;
      default:
        reportContent += `${template.desc}\n\nİstatistiki veriler ve grafikler dosyaya eklenmiştir.\n`;
    }

    reportContent += `\n--------------------------------------------------------\n`;
    reportContent += `* Bu analiz yapay zeka destekli algoritmalarla oluşturulmuştur.\n`;
    reportContent += `========================================================\n`;

    let blob: Blob;
    let extension: string;

    if (format === 'excel') {
      const csvContent = "Veri Kalemi,Analiz Değeri,Referans\n" + 
                         `Kategori,${template.category},Sistem\n` +
                         `Analiz Tipi,${template.title},Zeka\n`;
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
            STOK <span className="text-purple-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">ANAlİZLER</span>
          </h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.3em] opacity-60 flex items-center gap-2">
            <Zap size={14} className="text-purple-400" />
            YAPAY ZEKA DESTEKLİ ENVANTER ANALİZİ
          </p>
        </div>
      </div>

      {/* AI Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AI_INSIGHTS.map((insight, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className={clsx(
              "p-6 rounded-[32px] bg-skel-space/30 border-2 backdrop-blur-xl group cursor-pointer transition-all",
              insight.color === 'blue' ? "border-blue-500/20 hover:border-blue-500/50" :
              insight.color === 'purple' ? "border-purple-500/20 hover:border-purple-500/50" : "border-orange-500/20 hover:border-orange-500/50"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {insight.icon}
              </div>
              <h3 className="text-white font-bold text-sm tracking-tight">{insight.title}</h3>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed opacity-80 mb-6">{insight.desc}</p>
            <button 
              onClick={() => navigate('stocks-reports')}
              className="flex items-center gap-2 text-white text-[9px] font-black tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity"
            >
              Detayı Gör <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* ABC Analysis Section */}
      <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
            <BarChart3 size={16} className="text-rose-500" />
            ABC Analiz Grafiği (Değer vs Miktar)
          </h3>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-[9px] font-mono text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500" /> A GRUBU (KRİTİK)</span>
            <span className="flex items-center gap-2 text-[9px] font-mono text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500" /> B GRUBU (ORTA)</span>
            <span className="flex items-center gap-2 text-[9px] font-mono text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> C GRUBU (DÜŞÜK)</span>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="x" name="Ciro Payı %" unit="%" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis type="number" dataKey="y" name="Miktar Payı %" unit="%" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
              <Scatter name="A" data={ABC_DATA.filter(d => d.group === 'A')} fill="#f43f5e" onClick={() => navigate('stocks-list')} />
              <Scatter name="B" data={ABC_DATA.filter(d => d.group === 'B')} fill="#f59e0b" onClick={() => navigate('stocks-list')} />
              <Scatter name="C" data={ABC_DATA.filter(d => d.group === 'C')} fill="#10b981" onClick={() => navigate('stocks-list')} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <Activity size={16} className="text-blue-500" />
            Devir Hızı Analizi (Gün)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEVIR_HIZI} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
                <Bar dataKey="gun" fill="#3b82f6" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <PieIcon size={16} className="text-emerald-500" />
            Stok Yaşlanma Analizi
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={YASLANMA_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {YASLANMA_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <LineIcon size={16} className="text-purple-500" />
            Tahmin vs Gerçekleşen
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FORECAST_DATA.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="reel" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tahmin" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <TrendingUp size={16} className="text-emerald-400" />
            En Hızlı Döngülü Stoklar
          </h3>
          <div className="space-y-4">
            {BEST_PERFORMERS.map((st, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('stocks-list')}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Box size={18} />
                  </div>
                  <span className="text-white text-xs font-bold">{st.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-mono font-black text-emerald-400">{st.devir}</span>
                  <span className="text-[8px] font-mono text-text-secondary uppercase opacity-40 tracking-widest">Ort. Devir Süresi</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <TrendingDown size={16} className="text-rose-400" />
            Hareketsiz / Yavaş Stoklar
          </h3>
          <div className="space-y-4">
            {WORST_PERFORMERS.map((st, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('stocks-list')}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <History size={18} />
                  </div>
                  <span className="text-white text-xs font-bold">{st.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-1 rounded-md bg-rose-500/20 text-rose-500 text-[8px] font-black uppercase tracking-widest">{st.suggestion}</span>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-black text-rose-400 block">{st.son}</span>
                    <span className="text-[8px] font-mono text-text-secondary uppercase opacity-40 tracking-widest">Son Hareket</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demand Forecast Shaded Chart */}
      <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/10 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3 mb-2">
              <Target size={16} className="text-cyan-400" />
              Talep Tahmin Projeksiyonu
            </h3>
            <p className="text-text-secondary text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">Mevcut Sipariş ve Üretim Planlarına Göre Tahminleme</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary text-[10px] font-mono uppercase">Son 12 Ay</div>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={FORECAST_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }} />
              <Line type="monotone" dataKey="reel" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="tahmin" stroke="#06b6d4" strokeWidth={3} strokeDasharray="8 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ready Analysis Templates Section */}
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
            <BrainCircuit size={16} className="text-purple-400" />
            Hazır Analiz Şablonları
          </h3>
          <div className="flex gap-2">
            {['Tahmin', 'Verimlilik', 'Sağlık', 'Performans', 'Stratejik'].map(cat => (
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
