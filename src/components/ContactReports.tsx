import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  History,
  Calendar,
  ChevronRight,
  BarChart as BarIcon,
  X,
  RotateCcw,
  Check,
  FileSpreadsheet,
  FileImage,
  FileDown,
  Monitor,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  Target,
  Users,
  Building2,
  Clock,
  Briefcase,
  CreditCard,
  PieChart as PieIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

/* ------------------------------- Mock Data ------------------------------- */

const TEMPLATES = [
  // Cari Finansal Raporlar
  { id: 'OZET', title: "Cari Mizan Raporu", desc: "Tüm borç-alacak bakiyelerinin toplu finansal özeti.", category: 'Finansal', icon: <DollarSign size={20} /> },
  { id: 'EKSTRE', title: "Cari Hesap Ekstresi", desc: "Seçili carinin tüm tarihsel hareket dökümü ve bakiye değişimi.", category: 'Finansal', icon: <FileText size={20} /> },
  { id: 'TAHSILAT', title: "Bekleyen Tahsilatlar", desc: "Vadesi gelen ve vadesi geçmiş alacakların detaylı listesi.", category: 'Finansal', icon: <Clock size={20} /> },
  { id: 'ODEME', title: "Ödeme Projeksiyonu", desc: "Gelecek dönem planlanan ödemelerin nakit akış analizi.", category: 'Finansal', icon: <TrendingUp size={20} /> },
  { id: 'KUR_FARK', title: "Döviz / Kur Farkı Raporu", desc: "Dövizli carilerde kur değişiminden kaynaklı kar/zarar analizi.", category: 'Finansal', icon: <RotateCcw size={20} /> },
  
  // Risk & Limit Raporları
  { id: 'RISK', title: "Cari Risk Analizi", desc: "Kredi limitleri ve risk puanlarına göre cari sıralaması.", category: 'Risk', icon: <ShieldCheck size={20} /> },
  { id: 'VADE', title: "Yaşlandırma Raporu", desc: "Borç ve alacakların vade dilimlerine göre dağılım analizi.", category: 'Risk', icon: <Layers size={20} /> },
  { id: 'LIMIT', title: "Limit Aşım Raporu", desc: "Belirlenen risk limitlerini aşan carilerin anlık dökümü.", category: 'Risk', icon: <AlertCircle size={20} /> },

  // Operasyonel Raporlar
  { id: 'MUTABAKAT', title: "Mutabakat Formları", desc: "Toplu mutabakat mektuplarının hazırlanması ve durum takibi.", category: 'Operasyon', icon: <Check size={20} /> },
  { id: 'BORC_LIST', title: "En Borçlu Cariler", desc: "Şirkete en çok borcu olan müşteri ve tedarikçilerin sıralaması.", category: 'Operasyon', icon: <ArrowDownRight size={20} /> },
  { id: 'HAREKET_SIZ', title: "Hareketsiz Cariler", desc: "Son 90 gündür herhangi bir işlem görmeyen pasif cariler.", category: 'Operasyon', icon: <Zap size={20} /> },
  
  // Stratejik & Analitik
  { id: 'SADAKAT', title: "Müşteri Sadakat Analizi", desc: "RFM analizi ile müşteri segmantasyonu ve değerleme raporu.", category: 'Analiz', icon: <Target size={20} /> },
  { id: 'TEDARIKCI', title: "Tedarikçi Karnesi", desc: "Tedarikçi performans skorları, hata oranları ve termin süreleri.", category: 'Analiz', icon: <Building2 size={20} /> },
  { id: 'SECTOR', title: "Sektörel Dağılım", desc: "Cari portföyünün sektörel ve coğrafi dağılım istatistikleri.", category: 'Analiz', icon: <PieIcon size={20} /> },
  { id: 'USER_LOGS', title: "Cari İşlem Logları", desc: "Cari kartlar üzerinde yapılan tüm admin güncellemelerinin dökümü.", category: 'Analiz', icon: <Monitor size={20} /> },
];

const CARI_STATS = [
  { label: 'TOPLAM ALACAK', value: '₺1,845,200', icon: <ArrowUpRight className="text-emerald-400" />, trend: '+15.2%' },
  { label: 'TOPLAM BORÇ', value: '₺620,150', icon: <ArrowDownRight className="text-rose-400" />, trend: '+8.4%' },
  { label: 'NET BAKİYE', value: '₺1,225,050', icon: <DollarSign className="text-blue-400" />, trend: 'Pozitif' },
  { label: 'RİSKLİ BAKİYE', value: '₺125,000', icon: <TrendingUp className="text-purple-400" />, trend: 'Dikkat' },
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
                  className="text-purple-500 transition-all duration-100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-black text-white italic">
                %{progress}
              </div>
            </div>
            <div>
              <h3 className="text-white font-display font-black text-xs uppercase tracking-widest mb-2 italic">Cari Rapor Hazırlanıyor</h3>
              <p className="text-text-secondary text-[10px] uppercase tracking-widest opacity-60">Finansal dökümler işleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tighter mb-2 underline decoration-purple-500/50">FORMAT SEÇİN</h3>
                <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                  {templateTitle} <br/> <span className="opacity-40 italic">Rapor çıktı formatını belirleyin</span>
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-secondary">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { id: 'pdf', label: 'Cari Ekstre (PDF)', desc: 'Resmi paylaşım ve arşivleme için', icon: <FileDown size={24} />, color: 'bg-rose-500/10 text-rose-400' },
                { id: 'excel', label: 'E-Tablo (XLSX)', desc: 'Muhasebe entegrasyonu ve analiz için', icon: <FileSpreadsheet size={24} />, color: 'bg-emerald-500/10 text-emerald-400' },
                { id: 'png', label: 'Görsel (PNG)', desc: 'Hızlı bakış ve sunum dökümanı için', icon: <FileImage size={24} />, color: 'bg-blue-500/10 text-blue-400' },
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
              Vektörel kalite ve tutarlılık her formatta korunur
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export const ContactReports = () => {
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
    reportContent += `   CARİ YÖNETİM SİSTEMİ - FİNANSAL RAPORLAMA\n`;
    reportContent += `========================================================\n\n`;
    reportContent += `RAPOR ADI:    ${template.title.toUpperCase()}\n`;
    reportContent += `KATEGORİ:     ${template.category.toUpperCase()}\n`;
    reportContent += `TARİH:        ${new Date().toLocaleString()}\n`;
    reportContent += `STATÜ:        RESMİ / ONAYLANMIŞ\n`;
    reportContent += `--------------------------------------------------------\n\n`;

    switch (template.id) {
      case 'OZET':
        reportContent += `FİNANSAL ÖZET:\n- Toplam Aktif Borç: ₺620,150\n- Toplam Alacak: ₺1,845,200\n- Ödeme Performansı: %96.4\n`;
        break;
      case 'RISK':
        reportContent += `RİSK ANALİZİ:\n- Kritik Riskli Cari: 4\n- Ortalama Vade Aşımı: 12 Gün\n- Toplam Risk Altındaki Tutar: ₺125,000\n`;
        break;
      case 'SADAKAT':
        reportContent += `MÜŞTERİ SEGMENTLERİ:\n- [VIP] Sadık Müşteriler: 42\n- [NEW] Yeni Kazanım: 15\n- [RISK] Kayıp Riski Olanlar: 8\n`;
        break;
      default:
        reportContent += `${template.desc}\n\nDetaylı veriler ekteki tablolarda sunulmuştur.\n`;
    }

    reportContent += `\n--------------------------------------------------------\n`;
    reportContent += `* Bu rapor muhasebe entegrasyonu ile otomatik oluşturulmuştur.\n`;
    reportContent += `========================================================\n`;

    let blob: Blob;
    let extension: string;

    if (format === 'excel') {
      const csvContent = "Cari Unvan,İşlem Tipi,Tarih,Bakiye,Durum\n" + 
                         `Global Lojistik,Tahsilat,12.05,₺45000,Tamamlandı\n` +
                         `Tekno Market,Satis,11.05,₺12000,Bekliyor\n`;
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase mb-2">
            RAPOR <span className="text-purple-500 underline decoration-purple-500/30">ÜRETİM MERKEZİ</span>
          </h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.3em] opacity-60">Carileriniz için Profesyonel Şablonlar</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} /> Otomatik Rapor Planla
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARI_STATS.map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
              {stat.icon}
            </div>
            <div>
              <p className="text-text-secondary font-mono text-[9px] uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-display font-black text-lg italic">{stat.value}</p>
                <span className="text-[9px] text-emerald-400 font-mono italic">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ready Templates Section */}
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-widest flex items-center gap-3">
            <FileText size={16} className="text-purple-400" />
            Cari Rapor Şablonları
          </h3>
          <div className="flex gap-2">
            {['Finansal', 'Risk', 'Operasyon', 'Analiz'].map(cat => (
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
