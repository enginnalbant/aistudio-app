import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Box,
  Truck,
  History,
  DollarSign,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FileText,
  PieChart as PieIcon,
  BarChart as BarIcon,
  X,
  RotateCcw,
  Check,
  FileSpreadsheet,
  FileImage,
  FileJson,
  FileDown,
  Monitor,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  Target
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
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

/* ------------------------------- Mock Data ------------------------------- */

const TEMPLATES = [
  // Genel Raporlar
  { id: 'AYLIK', title: "Aylık Envanter Raporu", desc: "Ay içindeki tüm giriş-çıkış hareketleri ve stok kapanış değerleri.", category: 'Genel', icon: <FileText size={20} /> },
  { id: 'KRİTİK', title: "Kritik Stok Raporu", desc: "Anlık olarak kritik seviye altındaki ürünlerin listesi ve tedarik durumu.", category: 'Genel', icon: <ShieldCheck size={20} /> },
  { id: 'DAILY', title: "Günlük Hareket Özeti", desc: "Son 24 saat içindeki tüm depo operasyonlarının kronolojik listesi.", category: 'Genel', icon: <Activity size={20} /> },
  { id: 'VALUATION', title: "Envanter Değerleme", desc: "FIFO/LIFO yöntemlerine göre güncel stok maliyet ve pazar değeri analizi.", category: 'Genel', icon: <DollarSign size={20} /> },
  { id: 'USER_LOGS', title: "Kullanıcı İşlem Kayıtları", desc: "Hangi kullanıcının hangi stok üzerinde ne zaman işlem yaptığının dökümü.", category: 'Genel', icon: <Monitor size={20} /> },
  
  // Analiz Raporları
  { id: 'DEVİR', title: "Devir Hızı Analizi", desc: "Stokların depoda kalış süreleri ve sirkülasyon hızlarının karşılaştırmalı raporu.", category: 'Analiz', icon: <Zap size={20} /> },
  { id: 'ABC', title: "Envanter ABC Analizi", desc: "Cironun %80'ini oluşturan kritik 'A' grubu stokların derinlemesine analizi.", category: 'Analiz', icon: <Target size={20} /> },
  { id: 'AGING', title: "Stok Yaşlanma Raporu", desc: "90 gün ve üzeri süredir hareket görmeyen 'ölü stok' tespiti.", category: 'Analiz', icon: <Layers size={20} /> },
  { id: 'FORECAST', title: "Talep Tahmin Raporu", desc: "Yapay zeka destekli gelecek 3 aylık stok ihtiyaç projeksiyonu.", category: 'Analiz', icon: <TrendingUp size={20} /> },
  { id: 'EFFICIENCY', title: "Depo Verimlilik Analizi", desc: "Alan kullanımı ve sipariş hazırlama sürelerinin performans raporu.", category: 'Analiz', icon: <PieIcon size={20} /> },

  // Stok Bazlı Raporlar
  { id: 'ITEM_HISTORY', title: "Ürün Yaşam Döngüsü", desc: "Seçili bir ürünün sisteme girişinden bugüne tüm tarihsel gelişimi.", category: 'Özel', icon: <History size={20} /> },
  { id: 'SUPPLIER_PERF', title: "Tedarikçi Performansı", desc: "Tedarikçilerin termin süreleri ve kalite standartlarına uyum raporu.", category: 'Özel', icon: <Truck size={20} /> },
  { id: 'RETURNS', title: "İade ve Defolu Stok", desc: "Hasarlı veya iade edilen ürünlerin kategorize edilmiş dökümü.", category: 'Özel', icon: <RotateCcw size={20} /> },
  { id: 'SERIAL_TRACK', title: "Seri No / Lot Takibi", desc: "Lot bazlı üretim ve son kullanma tarihi yaklaşan ürünlerin listesi.", category: 'Özel', icon: <Check size={20} /> },
  { id: 'ADJUSTMENT', title: "Sayım Fark Raporu", desc: "Sistem ve fiziki stok arasındaki farkların ve firelerin analizi.", category: 'Özel', icon: <Filter size={20} /> },
];

const CATEGORIES = ['Hammadde', 'Yarı Mamul', 'Mamul', 'Sarf Malzeme', 'Ambalaj'];
const TYPES = ['Giriş', 'Çıkış', 'Sayım', 'Transfer'];

const STOCK_ITEMS = [
  'Alüminyum Profil',
  'Elektrik Motoru',
  'Paslanmaz Vida',
  'Karton Kutu',
  'Boya Beyaz',
  'Rulman 6204',
  'Hidrolik Yağ',
  'Kapak 60mm'
];

const REPORT_STATS = [
  { label: 'TOPLAM GİRİŞ DEĞERİ', value: '₺845,200', icon: <ArrowUpRight className="text-emerald-400" />, trend: '+15.2%' },
  { label: 'TOPLAM ÇIKIŞ DEĞERİ', value: '₺620,150', icon: <ArrowDownRight className="text-rose-400" />, trend: '+8.4%' },
  { label: 'NET DEĞER DEĞİŞİMİ', value: '+₺225,050', icon: <DollarSign className="text-blue-400" />, trend: 'Pozitif' },
  { label: 'EN ÇOK HAREKET EDEN', value: 'Vida M8', icon: <TrendingUp className="text-purple-400" />, trend: '12,500 Adet' },
];

const WEEKLY_DATA = [
  { name: 'Pzt', in: 45, out: 30 },
  { name: 'Sal', in: 52, out: 40 },
  { name: 'Çar', in: 38, out: 65 },
  { name: 'Per', in: 85, out: 42 },
  { name: 'Cum', in: 48, out: 38 },
  { name: 'Cmt', in: 62, out: 15 },
  { name: 'Paz', in: 15, out: 10 },
];

const CATEGORY_DIST = [
  { name: 'Hammadde', value: 400, color: '#3b82f6' },
  { name: 'Yarı Mamul', value: 300, color: '#8b5cf6' },
  { name: 'Mamul', value: 300, color: '#06b6d4' },
  { name: 'Ambalaj', value: 200, color: '#ec4899' },
];

const WAREHOUSES = ['Ana Depo', 'Bölge Depo', 'Sarf Depo'];

const MOVEMENT_LOGS = Array.from({ length: 20 }).map((_, i) => {
  const categories = CATEGORIES;
  return {
    id: i + 1,
    date: `2026-05-${String(10 + (i % 5)).padStart(2, '0')} ${10 + (i % 5)}:${10 + i}`,
    code: `ST-00${(i % 9) + 1}`,
    name: STOCK_ITEMS[i % STOCK_ITEMS.length],
    category: categories[i % categories.length],
    type: TYPES[i % 4],
    amount: (i % 2 === 0 ? '+' : '-') + (Math.floor(Math.random() * 500) + 10),
    unit: ['Adet', 'Kg', 'Metre'][i % 3],
    value: `₺${Math.floor(Math.random() * 5000) + 500}`,
    warehouse: WAREHOUSES[i % WAREHOUSES.length],
    user: ['Ahmet Y.', 'Mehmet S.', 'Ayşe B.', 'Can K.'][i % 4],
    notes: 'Standart operasyon',
    isCritical: i % 7 === 0
  };
});

/* ------------------------------- Components ------------------------------ */

const navigate = (moduleId: string) => {
  if ((window as any).setActiveModule) {
    (window as any).setActiveModule(moduleId);
  }
};

const ReportTemplateCard = ({ title, desc, icon, onClick }: { title: string, desc: string, icon: React.ReactNode, onClick: () => void }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer group flex flex-col h-full"
  >
    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
      {icon}
    </div>
    <h4 className="text-white font-bold text-[13px] mb-2 line-clamp-1">{title}</h4>
    <p className="text-text-secondary text-[10px] uppercase tracking-widest leading-relaxed opacity-60 mb-6 line-clamp-2">{desc}</p>
    <div className="mt-auto">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="flex items-center gap-2 text-blue-400 text-[10px] font-black tracking-widest uppercase hover:gap-4 transition-all"
      >
        OLUŞTUR <ArrowRight size={14} />
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
                  className="text-cyan-500 transition-all duration-100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-black text-white italic">
                %{progress}
              </div>
            </div>
            <div>
              <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-2 italic">Rapor Hazırlanıyor</h3>
              <p className="text-text-secondary text-[10px] uppercase tracking-widest opacity-60">Lütfen tarayıcıyı kapatmayın...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tighter mb-2">FORMAT SEÇİN</h3>
                <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                  {templateTitle} <br/> <span className="opacity-40 italic">Dışa aktarma formatını belirleyin</span>
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-secondary">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { id: 'pdf', label: 'PDF Dökümanı', desc: 'Resmi raporlar ve sunumlar için', icon: <FileDown size={24} />, color: 'bg-rose-500/10 text-rose-400' },
                { id: 'excel', label: 'Excel (XLSX)', desc: 'Veri analizi ve düzenleme için', icon: <FileSpreadsheet size={24} />, color: 'bg-emerald-500/10 text-emerald-400' },
                { id: 'png', label: 'PNG Görsel', desc: 'Sunum slaytları ve hızlı paylaşım için', icon: <FileImage size={24} />, color: 'bg-blue-500/10 text-blue-400' },
              ].map((f) => (
                <button 
                  key={f.id}
                  onClick={() => handleExport(f.id)}
                  className="w-full p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/50 hover:bg-white/10 transition-all group flex items-center gap-4"
                >
                  <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", f.color)}>
                    {f.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-bold uppercase tracking-tight">{f.label}</p>
                    <p className="text-[9px] text-text-secondary font-mono uppercase tracking-widest opacity-60">{f.desc}</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>

            <p className="text-[9px] text-center text-text-secondary font-mono uppercase opacity-30 tracking-[0.2em]">
              Vektörel çıktı kalitesi her formatta korunur
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export const StockReports = () => {
  const [activeReport, setActiveReport] = useState<{ type: string, name: string | null }>({ type: 'GENEL', name: null });
  
  // Filter States
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [stockSearch, setStockSearch] = useState<string>('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
  
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('Tüm Kategoriler');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Tüm Depolar');
  
  // Table States
  const [tableSearch, setTableSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: 'date', direction: 'desc' });

  // Applied Filter State (to decouple dropdowns from the actual filter button if needed, but here we can just reactive filter)
  const [isFiltering, setIsFiltering] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Export Modal State
  const [exportModal, setExportModal] = useState<{ isOpen: boolean, template: any | null }>({ isOpen: false, template: null });

  const handleTemplateClick = (template: any) => {
    setExportModal({ isOpen: true, template });
  };

  const handleConfirmExport = (format: string) => {
    const template = exportModal.template;
    if (!template) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${template.title.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;

    // Template Specific Data Processing logic
    let reportData = [...MOVEMENT_LOGS];
    let reportContent = `========================================================\n`;
    reportContent += `   STOK YÖNETİM SİSTEMİ - STRATEJİK RAPOR SERVİSİ\n`;
    reportContent += `========================================================\n\n`;
    reportContent += `RAPOR ADI:    ${template.title.toUpperCase()}\n`;
    reportContent += `KATEGORİ:     ${template.category.toUpperCase()}\n`;
    reportContent += `TARİH:        ${new Date().toLocaleString()}\n`;
    reportContent += `DURUM:        RESMİ DÖKÜMAN / ONAYLANDI\n`;
    reportContent += `--------------------------------------------------------\n\n`;

    // Template Specific Logic
    switch (template.id) {
      case 'AYLIK':
        reportContent += `AYLIK ÖZET:\n- Toplam İşlem: ${reportData.length}\n- Değer Değişimi: +₺225,050\n- Depo Verimliliği: %94\n`;
        break;
      case 'KRİTİK':
        reportData = reportData.filter(l => l.isCritical);
        reportContent += `ACİL EYLEM GEREKEN KRİTİK ÜRÜNLER (TOPLAM: ${reportData.length}):\n`;
        break;
      case 'ABC':
        reportContent += `ABC SINIFLANDIRMASI:\n- A Grubu: %80 Değer / %20 Hacim\n- B Grubu: %15 Değer / %30 Hacim\n- C Grubu: %5 Değer / %50 Hacim\n`;
        break;
      case 'DEVİR':
        reportContent += `SİRKÜLASYON ANALİZİ:\n- Ortalama Raf Ömrü: 12.4 Gün\n- En Hızlı Ürün: Elektrik Motoru\n- En Yavaş Ürün: Yağlama Gres\n`;
        break;
      case 'SUPPLIER_PERF':
        reportContent += `TEDARİKÇİ PUANLARI:\n- Lojistik A.Ş: 9.8/10\n- Global Üretim: 8.5/10\n- Teknik Sanayi: 7.2/10 (Gecikme Riski!)\n`;
        break;
      default:
        reportContent += `GENEL VERİ DÖKÜMÜ VE ANALİZİ BAŞLATILDI...\n`;
    }

    reportContent += `\nVERİ TABLOSU:\n`;
    reportContent += `--------------------------------------------------------\n`;
    
    let blob: Blob;
    let extension: string;

    if (format === 'excel') {
      const csvHeader = template.id === 'ADJUSTMENT' 
        ? ['Tarih', 'Ürün', 'Sistem', 'Fiziki', 'Fark', 'Neden']
        : ['Tarih', 'Stok Kodu', 'Ürün', 'Tip', 'Miktar', 'Değer', 'Depo'];
      
      const csvRows = reportData.map(l => [l.date, l.code, l.name, l.type, l.amount, l.value, l.warehouse]);
      const csvContent = [csvHeader, ...csvRows].map(e => e.join(",")).join("\n");
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      extension = 'csv';
    } else {
      // PDF/PNG simulation via structured text
      reportData.slice(0, 15).forEach(l => {
        reportContent += `${l.date.split(' ')[0]} | ${l.name.padEnd(20)} | ${l.type.padEnd(8)} | ${l.amount.padEnd(8)}\n`;
      });
      reportContent += `\n--------------------------------------------------------\n`;
      reportContent += `* Bu rapor sistem tarafından otomatik oluşturulmuştur.\n`;
      reportContent += `========================================================\n`;
      
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

  const handleStockSelect = (stockName: string) => {
    setSelectedStock(stockName);
    setStockSearch('');
    setIsStockDropdownOpen(false);
    if (stockName) {
      setActiveReport({ type: 'STOK_BAZLI', name: stockName });
    } else {
      setActiveReport({ type: 'GENEL', name: null });
    }
  };

  const itemsForStockSelector = useMemo(() => {
    if (!stockSearch) return STOCK_ITEMS;
    return STOCK_ITEMS.filter(item => item.toLowerCase().includes(stockSearch.toLowerCase()));
  }, [stockSearch]);

  const toggleSort = (key: string) => {
    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === 'asc') return { key, direction: 'desc' };
        if (current.direction === 'desc') return { key: 'date', direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredLogs = useMemo(() => {
    let logs = [...MOVEMENT_LOGS];
    
    // Core Logic Filters (Custom Report Templates)
    if (activeReport.type === 'KRİTİK') {
      logs = logs.filter(l => l.isCritical);
    }

    // Top Filter Bar Filters
    if (selectedStock) {
      logs = logs.filter(l => l.name === selectedStock);
    }
    
    if (selectedCategory !== 'Tüm Kategoriler') {
      logs = logs.filter(l => l.category === selectedCategory);
    }

    if (selectedWarehouse !== 'Tüm Depolar') {
      logs = logs.filter(l => l.warehouse === selectedWarehouse);
    }

    if (dateRange.start) {
      logs = logs.filter(l => l.date >= dateRange.start);
    }
    if (dateRange.end) {
      logs = logs.filter(l => l.date <= dateRange.end + ' 23:59');
    }

    // Table Search
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      logs = logs.filter(l => 
        (l.name || '').toLowerCase().includes(q) || 
        (l.code || '').toLowerCase().includes(q) || 
        (l.user || '').toLowerCase().includes(q) ||
        (l.warehouse || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortConfig.direction) {
      logs.sort((a: any, b: any) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return logs;
  }, [activeReport, selectedStock, selectedCategory, selectedWarehouse, dateRange, tableSearch, sortConfig]);

  const handleExport = () => {
    const csv = [
      ['Tarih', 'Ürün', 'Kod', 'Tip', 'Miktar', 'Birim', 'Değer', 'Depo', 'Sorumlu'],
      ...filteredLogs.map(l => [l.date, l.name, l.code, l.type, l.amount, l.unit, l.value, l.warehouse, l.user])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'stok_raporu.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reportTitleMap: Record<string, string> = {
    'GENEL': 'Genel Stok Hareket Raporu',
    'AYLIK': 'Aylık Envanter Raporu',
    'KRİTİK': 'Kritik Stok Durum Raporu',
    'DEVİR': 'Stok Devir Hızı Analizi',
    'ABC': 'Envanter ABC Analizi',
    'STOK_BAZLI': `${activeReport.name} - Özel Hareket Raporu`
  };

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase mb-2">
            STOK <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">RAPORLARI</span>
          </h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.3em] opacity-60">Operasyonel Stok Hareket Kayıtları</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {activeReport.type !== 'GENEL' && (
              <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => {
                  setActiveReport({ type: 'GENEL', name: null });
                  setSelectedStock('');
                }}
                className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-text-secondary hover:text-white font-display font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
              >
                <RotateCcw size={14} /> Genel Görünüme Dön
              </motion.button>
            )}
          </AnimatePresence>
          <button className="px-8 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-3">
            <Download size={18} /> Rapor Üret
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-[32px] bg-skel-space/30 border border-white/5 backdrop-blur-xl flex flex-wrap items-center gap-4 relative z-50">
        {/* Searchable Stock Item Selector */}
        <div className="min-w-[280px] relative">
          <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary z-10" size={18} />
          <div className="relative">
            <input 
              type="text"
              placeholder={selectedStock || "Stok Yazın veya Seçin..."}
              value={stockSearch}
              onChange={(e) => {
                setStockSearch(e.target.value);
                setIsStockDropdownOpen(true);
              }}
              onFocus={() => setIsStockDropdownOpen(true)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl h-12 pl-12 pr-10 text-white text-xs font-mono focus:outline-none focus:border-cyan-500/50"
            />
            <ChevronDown 
              size={16} 
              className={clsx("absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition-transform", isStockDropdownOpen && "rotate-180")} 
            />
          </div>

          <AnimatePresence>
            {isStockDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100] max-h-[300px] overflow-y-auto"
              >
                <div className="p-2">
                  <button 
                    onClick={() => handleStockSelect('')}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-[10px] font-mono text-text-secondary hover:text-white flex items-center justify-between"
                  >
                    Tüm Stoklar
                    {!selectedStock && <Check size={14} className="text-cyan-400" />}
                  </button>
                  {itemsForStockSelector.map(item => (
                    <button 
                      key={item}
                      onClick={() => handleStockSelect(item)}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-[10px] font-mono text-text-secondary hover:text-white flex items-center justify-between"
                    >
                      {item}
                      {selectedStock === item && <Check size={14} className="text-cyan-400" />}
                    </button>
                  ))}
                  {itemsForStockSelector.length === 0 && (
                    <div className="px-4 py-6 text-center text-text-secondary text-[10px] uppercase tracking-widest font-mono italic">
                      Sonuç bulunamadı
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Smart Date Range Picker (Themed Input for now, but logical) */}
        <div className="flex-1 min-w-[300px] flex items-center gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              placeholder="Başlangıç"
              className="w-full bg-black/40 border border-white/10 rounded-2xl h-12 pl-12 pr-4 text-white text-[10px] font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="text-white/20">-</div>
          <div className="relative flex-1">
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              placeholder="Bitiş"
              className="w-full bg-black/40 border border-white/10 rounded-2xl h-12 px-4 text-white text-[10px] font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-2xl h-12 px-4 text-white text-xs font-mono focus:outline-none focus:border-cyan-500/50 appearance-none min-w-[150px]"
        >
          <option>Tüm Kategoriler</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-2xl h-12 px-4 text-white text-xs font-mono focus:outline-none focus:border-cyan-500/50 appearance-none min-w-[150px]"
        >
          <option>Tüm Depolar</option>
          {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        
        <button 
          onClick={() => {
            setIsFiltering(true);
            setTimeout(() => setIsFiltering(false), 800);
          }}
          className={clsx(
            "px-8 h-12 rounded-2xl font-display font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2",
            isFiltering ? "bg-cyan-500 text-white" : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
          )}
        >
          {isFiltering ? <RotateCcw size={14} className="animate-spin" /> : <Filter size={14} />}
          {isFiltering ? "GÜNCELLENİYOR..." : "FİLTRELE"}
        </button>
      </div>

      {/* Stats Grid - Always Visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {REPORT_STATS.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="p-6 rounded-[32px] bg-skel-space/30 border border-white/5 backdrop-blur-xl flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all">
                {stat.icon}
              </div>
              <div>
                <p className="text-text-secondary text-[10px] uppercase tracking-widest font-mono mb-1">{stat.label}</p>
                <h4 className="text-white font-display font-black text-xl italic">{stat.value}</h4>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
          </motion.div>
        ))}
      </div>

      {/* Movement Table */}
      <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl overflow-hidden relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
              <History size={16} className="text-cyan-400" />
              {reportTitleMap[activeReport.type]}
            </h3>
            {activeReport.type !== 'GENEL' && (
              <span className="text-[9px] font-mono text-cyan-400 lowercase italic opacity-60">Filtrelenmiş Veri Kümesi</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <input 
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl h-10 pl-9 pr-4 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500/50 w-48 transition-all focus:w-64" 
                placeholder="Listede Ara..." 
              />
            </div>
            <button 
              onClick={handleExport}
              className="p-2 bg-white/5 rounded-xl border border-white/10 text-text-secondary hover:text-white transition-all tooltip"
              title="Dışa Aktar"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 px-4 text-text-secondary font-mono text-[9px] uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('date')}>
                  <div className="flex items-center gap-2">
                    Tarih
                    {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                  </div>
                </th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[9px] uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">
                    Ürün
                    {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                  </div>
                </th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[9px] uppercase tracking-[0.2em]">Tip</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[9px] uppercase tracking-[0.2em]">Miktar</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[9px] uppercase tracking-[0.2em]">Değer</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[9px] uppercase tracking-[0.2em]">Depo</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[9px] uppercase tracking-[0.2em]">Sorumlu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="group hover:bg-white/[0.02] cursor-pointer transition-all" onClick={() => navigate('stocks-list')}>
                  <td className="py-4 px-4 text-[10px] font-mono text-text-secondary">
                    {item.date}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-bold">{item.name}</span>
                      <span className="text-[9px] font-mono text-text-secondary uppercase opacity-60 tracking-wider font-bold italic">{item.code}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase",
                      item.type === 'Giriş' ? "bg-emerald-500/10 text-emerald-400" :
                      item.type === 'Çıkış' ? "bg-rose-500/10 text-rose-400" :
                      item.type === 'Transfer' ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"
                    )}>
                      {item.type}
                    </span>
                  </td>
                  <td className={clsx(
                    "py-4 px-4 text-xs font-mono font-bold tracking-tight shadow-md",
                    item.amount.startsWith('+') ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]" : "text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]"
                  )}>
                    {item.amount} <span className="text-[9px] opacity-60 font-normal font-sans ml-1 uppercase">{item.unit}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-white opacity-80 italic">{item.value}</td>
                  <td className="py-4 px-4 text-[10px] font-mono text-text-secondary uppercase tracking-tighter shadow-sm">{item.warehouse}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[9px] font-black text-text-secondary uppercase">
                        {item.user.charAt(0)}
                      </div>
                      <span className="text-[10px] font-mono text-text-secondary">{item.user}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Box size={48} className="text-white/10" />
                      <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">Bu kriterlere uygun kayıt bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5">
          <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest opacity-40">{filteredLogs.length} kayıttan 1-{Math.min(filteredLogs.length, 20)} arası gösteriliyor</p>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-cyan-500 border border-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 text-[10px] font-mono">1</button>
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Reports Charts - Always Visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <BarIcon size={16} className="text-blue-500" />
            Haftalık Giriş/Çıkış Karşılaştırması
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                <Bar name="Giriş" dataKey="in" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Çıkış" dataKey="out" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
            <PieIcon size={16} className="text-purple-500" />
            Kategoriye Göre Hareket Dağılımı
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DIST}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DIST.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 10, paddingLeft: 40 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ready Templates Section */}
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
            <FileText size={16} className="text-emerald-400" />
            Hazır Rapor Şablonları
          </h3>
          <div className="flex gap-2">
            {['Genel', 'Analiz', 'Özel'].map(cat => (
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
