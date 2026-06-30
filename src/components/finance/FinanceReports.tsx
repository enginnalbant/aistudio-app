import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  Calendar, 
  X, 
  Tag, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  PieChart as PieChartIcon, 
  Activity, 
  FileText, 
  Download, 
  Printer, 
  Edit3, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  ShieldCheck,
  Building,
  CreditCard,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie 
} from 'recharts';

interface FinanceReport {
  id: string;
  title: string;
  period: string; // YYYY-MM
  createdAt: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  personalNotes: string;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
  netSavings: number;
  incomeBreakdown: { name: string; value: number }[];
  expenseBreakdown: { name: string; value: number }[];
  activeDebtsCount: number;
  totalRemainingDebt: number;
  subscriptionsCount: number;
  totalSubscriptionCost: number;
  goalsProgress: { title: string; current: number; target: number }[];
  checkedActions?: string[];
}

// Prefilled high-quality realistic reports for the history page
const DEFAULT_REPORTS: FinanceReport[] = [
  {
    id: 'rep-1',
    title: 'Mayıs 2026 Dönemi Kapsamlı Finansal Analiz Raporu',
    period: '2026-05',
    createdAt: '2026-05-31',
    grade: 'A',
    personalNotes: 'Bu ay bütçe planlamasına büyük oranda sadık kalındı. Serbest çalışan gelirlerindeki artış tasarruf oranını %30 hedefinin üzerine çıkardı. Eğlence ve dışarıda yemek harcamaları kontrol altındaydı ancak faturalarda ufak bir artış göze çarptı. Yatırım portföyüne planlandığı gibi ₺10,000 ekleme yapıldı.',
    totalIncome: 52000,
    totalExpense: 34500,
    savingsRate: 33.6,
    netSavings: 17500,
    incomeBreakdown: [
      { name: 'Maaş', value: 38000 },
      { name: 'Serbest Çalışma', value: 10000 },
      { name: 'Yatırım Getirisi', value: 4000 }
    ],
    expenseBreakdown: [
      { name: 'Barınma', value: 12000 },
      { name: 'Gıda', value: 7500 },
      { name: 'Fatura', value: 4200 },
      { name: 'Ulaşım', value: 2800 },
      { name: 'Eğlence', value: 3500 },
      { name: 'Sağlık', value: 1500 },
      { name: 'Diğer', value: 3000 }
    ],
    activeDebtsCount: 2,
    totalRemainingDebt: 45000,
    subscriptionsCount: 4,
    totalSubscriptionCost: 980,
    goalsProgress: [
      { title: 'Acil Durum Fonu', current: 40000, target: 50000 },
      { title: 'Yeni Araba Peşinatı', current: 85000, target: 200000 }
    ],
    checkedActions: ['Gıda bütçesini sınırla', 'Yatırım payını otomatik fona aktar']
  },
  {
    id: 'rep-2',
    title: 'Nisan 2026 Dönemi Finansal Performans Analizi',
    period: '2026-04',
    createdAt: '2026-04-30',
    grade: 'B',
    personalNotes: 'Nisan ayında araç bakım masrafı ve sağlık sigortası yenilemesi nedeniyle beklenmedik acil harcamalar oluştu. Bu harcamalar bütçede "Diğer" kalemini şişirdi ve tasarruf oranımızı bir miktar düşürdü. Aboneliklerden kullanılmayan iki platform iptal edilerek tasarrufa katkı sağlandı.',
    totalIncome: 46000,
    totalExpense: 36200,
    savingsRate: 21.3,
    netSavings: 9800,
    incomeBreakdown: [
      { name: 'Maaş', value: 38000 },
      { name: 'Serbest Çalışma', value: 5000 },
      { name: 'Yatırım Getirisi', value: 3000 }
    ],
    expenseBreakdown: [
      { name: 'Barınma', value: 12000 },
      { name: 'Gıda', value: 6800 },
      { name: 'Fatura', value: 3900 },
      { name: 'Ulaşım', value: 2200 },
      { name: 'Eğlence', value: 4100 },
      { name: 'Sağlık', value: 4500 },
      { name: 'Diğer', value: 2700 }
    ],
    activeDebtsCount: 2,
    totalRemainingDebt: 52000,
    subscriptionsCount: 6,
    totalSubscriptionCost: 1420,
    goalsProgress: [
      { title: 'Acil Durum Fonu', current: 35000, target: 50000 },
      { title: 'Yeni Araba Peşinatı', current: 75000, target: 200000 }
    ],
    checkedActions: ['Abonelik sızıntılarını durdur']
  }
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444', '#64748b'];

export const FinanceReports = () => {
  // Pull data from local storages to auto-generate reports
  const [incomes] = useLocalStorage<any[]>('finance_incomes', []);
  const [expenses] = useLocalStorage<any[]>('finance_expenses', []);
  const [debts] = useLocalStorage<any[]>('finance_debts', []);
  const [subscriptions] = useLocalStorage<any[]>('finance_subscriptions', []);
  const [savings] = useLocalStorage<any[]>('finance_savings', []);

  // Saved reports database
  const [reports, setReports] = useLocalStorage<FinanceReport[]>('finance_reports', DEFAULT_REPORTS);

  // Interface States
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('Tümü');
  
  // Custom interactive editing for active report's notes
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  // Toast / Status overlay
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Report Creation Form States
  const [formPeriod, setFormPeriod] = useState('2026-06');
  const [formTitle, setFormTitle] = useState('Haziran 2026 Dönemi Kapsamlı Finansal Analiz Raporu');
  const [formNotes, setFormNotes] = useState('');
  const [formGrade, setFormGrade] = useState<'S' | 'A' | 'B' | 'C' | 'D' | 'F'>('A');
  const [useAutoData, setUseAutoData] = useState(true);

  // Manual input state (if useAutoData is false)
  const [manualIncome, setManualIncome] = useState(48000);
  const [manualExpense, setManualExpense] = useState(32000);

  const triggerAlert = (text: string, type: 'success' | 'info' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // Find the selected report object
  const activeReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  // Compute stats dynamically when period changes in modal
  const autoComputedStats = useMemo(() => {
    const yearMonth = formPeriod; // e.g. "2026-06"
    
    // Filter incomes
    const periodIncomes = incomes.filter(inc => {
      if (!inc.date) return false;
      return inc.date.startsWith(yearMonth) && (inc.status === 'Tamamlandı' || inc.status === undefined);
    });
    const totalInc = periodIncomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // Filter expenses
    const periodExpenses = expenses.filter(exp => {
      if (!exp.date) return false;
      return exp.date.startsWith(yearMonth) && (exp.status === 'Gerçekleşti' || exp.status === undefined);
    });
    const totalExp = periodExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // Net savings
    const netSav = totalInc - totalExp;
    const savRate = totalInc > 0 ? Number(((netSav / totalInc) * 100).toFixed(1)) : 0;

    // Build income breakdown by category
    const incCatMap: { [key: string]: number } = {};
    periodIncomes.forEach(inc => {
      const cat = inc.category || 'Diğer';
      incCatMap[cat] = (incCatMap[cat] || 0) + Number(inc.amount || 0);
    });
    const incBreakdown = Object.entries(incCatMap).map(([name, value]) => ({ name, value }));

    // Build expense breakdown by category
    const expCatMap: { [key: string]: number } = {};
    periodExpenses.forEach(exp => {
      const cat = exp.category || 'Diğer';
      expCatMap[cat] = (expCatMap[cat] || 0) + Number(exp.amount || 0);
    });
    const expBreakdown = Object.entries(expCatMap).map(([name, value]) => ({ name, value }));

    // Snapshot of Active Debts
    const totalRemainingDebt = debts.reduce((sum, d) => sum + Number(d.remainingAmount || d.amount || 0), 0);
    
    // Snapshot of Subscriptions
    const totalSubCost = subscriptions.reduce((sum, s) => {
      const amount = Number(s.price || s.amount || 0);
      return sum + amount;
    }, 0);

    // Snapshot of Goals
    const goalsProgress = savings.map(g => ({
      title: g.title || g.name || 'Tasarruf Hedefi',
      current: Number(g.currentAmount || g.saved || 0),
      target: Number(g.targetAmount || g.target || 10000)
    }));

    // Auto-grade recommendation
    let recommendedGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    if (savRate >= 40) recommendedGrade = 'S';
    else if (savRate >= 30) recommendedGrade = 'A';
    else if (savRate >= 20) recommendedGrade = 'B';
    else if (savRate >= 10) recommendedGrade = 'C';
    else if (savRate > 0) recommendedGrade = 'D';
    else recommendedGrade = 'F';

    return {
      totalIncome: totalInc,
      totalExpense: totalExp,
      netSavings: netSav,
      savingsRate: savRate,
      incomeBreakdown: incBreakdown.length > 0 ? incBreakdown : [{ name: 'Maaş (Varsayılan)', value: totalInc || 40000 }],
      expenseBreakdown: expBreakdown.length > 0 ? expBreakdown : [{ name: 'Giderler (Varsayılan)', value: totalExp || 25000 }],
      activeDebtsCount: debts.length,
      totalRemainingDebt,
      subscriptionsCount: subscriptions.length,
      totalSubscriptionCost: totalSubCost,
      goalsProgress,
      recommendedGrade
    };
  }, [incomes, expenses, debts, subscriptions, savings, formPeriod]);

  // Adjust Form title and prefill notes when period changes
  const handlePeriodChange = (newPeriod: string) => {
    setFormPeriod(newPeriod);
    
    // Format period to local Month Year (e.g. "Haziran 2026")
    const date = new Date(newPeriod + '-02');
    const label = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    
    setFormTitle(`${capitalizedLabel} Dönemi Kapsamlı Finansal Analiz Raporu`);
  };

  // Generate Report Form Submission
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalReport: FinanceReport = {
      id: 'rep-' + Date.now(),
      title: formTitle,
      period: formPeriod,
      createdAt: new Date().toISOString().split('T')[0],
      grade: formGrade,
      personalNotes: formNotes || `${formPeriod} dönemi için kaydedilmiş finansal özet ve değerlendirme notu.`,
      totalIncome: useAutoData ? autoComputedStats.totalIncome : manualIncome,
      totalExpense: useAutoData ? autoComputedStats.totalExpense : manualExpense,
      savingsRate: useAutoData ? autoComputedStats.savingsRate : Number((((manualIncome - manualExpense) / manualIncome) * 100).toFixed(1)),
      netSavings: useAutoData ? autoComputedStats.netSavings : (manualIncome - manualExpense),
      incomeBreakdown: useAutoData ? autoComputedStats.incomeBreakdown : [
        { name: 'Ana Gelir', value: manualIncome }
      ],
      expenseBreakdown: useAutoData ? autoComputedStats.expenseBreakdown : [
        { name: 'Sabit Giderler', value: Math.round(manualExpense * 0.6) },
        { name: 'Değişken Giderler', value: Math.round(manualExpense * 0.4) }
      ],
      activeDebtsCount: useAutoData ? autoComputedStats.activeDebtsCount : debts.length,
      totalRemainingDebt: useAutoData ? autoComputedStats.totalRemainingDebt : debts.reduce((s, d) => s + (d.remainingAmount || 0), 0),
      subscriptionsCount: useAutoData ? autoComputedStats.subscriptionsCount : subscriptions.length,
      totalSubscriptionCost: useAutoData ? autoComputedStats.totalSubscriptionCost : subscriptions.reduce((s, sub) => s + (sub.price || 0), 0),
      goalsProgress: useAutoData ? autoComputedStats.goalsProgress : savings.map(s => ({ title: s.title, current: s.currentAmount, target: s.targetAmount })),
      checkedActions: []
    };

    setReports([finalReport, ...reports]);
    setIsCreateModalOpen(false);
    
    // Clean fields
    setFormNotes('');
    
    triggerAlert(`"${finalReport.title}" başarıyla eklendi!`, 'success');
  };

  // Delete a report
  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu raporu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      setReports(reports.filter(r => r.id !== id));
      if (selectedReportId === id) {
        setSelectedReportId(null);
      }
      triggerAlert('Rapor silindi.', 'info');
    }
  };

  // Save updated notes in reports detail panel
  const handleSaveNotes = () => {
    if (!activeReport) return;
    const updated = reports.map(r => {
      if (r.id === activeReport.id) {
        return { ...r, personalNotes: editedNotes };
      }
      return r;
    });
    setReports(updated);
    setIsEditingNotes(false);
    triggerAlert('Kişisel değerlendirme notu güncellendi.');
  };

  // Toggle checklist item action
  const handleToggleAction = (action: string) => {
    if (!activeReport) return;
    const currentActions = activeReport.checkedActions || [];
    const updatedActions = currentActions.includes(action)
      ? currentActions.filter(a => a !== action)
      : [...currentActions, action];
    
    const updated = reports.map(r => {
      if (r.id === activeReport.id) {
        return { ...r, checkedActions: updatedActions };
      }
      return r;
    });
    setReports(updated);
  };

  // Filter and search reports list
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = (r.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                            (r.personalNotes || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesGrade = filterGrade === 'Tümü' || r.grade === filterGrade;
      return matchesSearch && matchesGrade;
    });
  }, [reports, searchTerm, filterGrade]);

  // Overall statistics for metrics block
  const overallStats = useMemo(() => {
    if (reports.length === 0) return { avgRate: 0, bestPeriod: '-', count: 0 };
    const totalRate = reports.reduce((sum, r) => sum + r.savingsRate, 0);
    const best = [...reports].sort((a, b) => b.savingsRate - a.savingsRate)[0];
    
    return {
      avgRate: Number((totalRate / reports.length).toFixed(1)),
      bestPeriod: best ? best.title.split(' ')[0] + ' ' + best.title.split(' ')[1] : '-',
      count: reports.length
    };
  }, [reports]);

  // Advisor commentary engine based on report stats
  const getAdvisorComments = (report: FinanceReport) => {
    const rate = report.savingsRate;
    if (rate >= 40) {
      return {
        title: 'Mükemmel Finansal Disiplin',
        desc: 'Tasarruf oranınız olağanüstü seviyede! Gelirinizin neredeyse yarısını biriktiriyorsunuz. Bu tempoyla finansal özgürlük hedefinize öngörülenden çok daha erken ulaşabilirsiniz. Yatırımlarınızı hisse senedi ve Eurobond gibi enflasyon korumalı enstrümanlarla çeşitlendirmeye devam edin.',
        color: 'text-focus-neon bg-focus-neon/5 border-focus-neon/20',
        icon: ShieldCheck
      };
    } else if (rate >= 25) {
      return {
        title: 'Sağlıklı ve Sürdürülebilir Gelişim',
        desc: 'Finansal standartlara göre ideal oran olan %20 tasarruf eşiğini başarıyla geçtiniz. Bütçeniz oldukça dengeli. Aktif borçları azaltmaya ve abonelik harcamalarını optimize etmeye devam ederseniz bu oranı %35 seviyelerine rahatlıkla çekebilirsiniz.',
        color: 'text-ai-bright bg-ai-bright/5 border-ai-bright/20',
        icon: Activity
      };
    } else if (rate >= 10) {
      return {
        title: 'Geliştirilebilir Orta Düzey Tasarruf',
        desc: 'Bütçeniz artı veriyor ancak tasarruf potansiyeliniz tam olarak kullanılmıyor. Harcamalarınızda esnek / keyfi kategorileri (eğlence, dışarıda yeme, lüks alışveriş) %15 oranında optimize ederek daha sağlam adımlarla ilerleyebilirsiniz. Acil durum fonunuzu güçlendirmeyi ihmal etmeyin.',
        color: 'text-nrg-sun bg-nrg-sun/5 border-nrg-sun/20',
        icon: Clock
      };
    } else {
      return {
        title: 'Yüksek Riskli Bütçe Baskısı',
        desc: 'Tasarruf oranınız kritik seviyede! Aylık gelir ve gider dengeniz neredeyse eşitlenmiş durumda. Beklenmedik bir acil durum harcamasında borçlanmak zorunda kalabilirsiniz. Aboneliklerinizi derhal denetleyin, sabit fatura giderlerinizi azaltacak önlemler alın ve acil durum bütçesi oluşturun.',
        color: 'text-crit-vivid bg-crit-vivid/5 border-crit-vivid/20',
        icon: AlertTriangle
      };
    }
  };

  // Simulation controls
  const handleExportJSON = (report: FinanceReport) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.period}-finansal-rapor.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerAlert('JSON formatında indirme başlatıldı.');
  };

  const handleExportTXT = (report: FinanceReport) => {
    const text = `
=========================================
${report.title}
=========================================
Dönem: ${report.period}
Oluşturulma Tarihi: ${report.createdAt}
Finansal Sağlık Notu: ${report.grade}

ÖZET VERİLER:
- Toplam Gelir: ₺${report.totalIncome.toLocaleString('tr-TR')}
- Toplam Gider: ₺${report.totalExpense.toLocaleString('tr-TR')}
- Net Tasarruf: ₺${report.netSavings.toLocaleString('tr-TR')}
- Tasarruf Oranı: %${report.savingsRate}

AKTİF YAPILAR:
- Aktif Borç Kalemleri: ${report.activeDebtsCount} Adet (Toplam: ₺${report.totalRemainingDebt.toLocaleString('tr-TR')})
- Aktif Abonelik Giderleri: ${report.subscriptionsCount} Adet (Aylık: ₺${report.totalSubscriptionCost.toLocaleString('tr-TR')})

KİŞİSEL DEĞERLENDİRME:
"${report.personalNotes}"

DANIŞMAN GÖRÜŞÜ:
${getAdvisorComments(report).desc}
    `;
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(text.trim());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.period}-finansal-rapor.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerAlert('TXT raporu indirildi.');
  };

  const handleSimulatePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 pb-24 text-text-primary"
    >
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl border font-bold text-sm shadow-2xl ${
              alertMessage.type === 'success' 
                ? 'bg-focus-neon/10 border-focus-neon/30 text-focus-neon' 
                : 'bg-white/10 border-white/20 text-white'
            }`}
          >
            {alertMessage.type === 'success' ? <CheckCircle2 size={16} /> : <Activity size={16} />}
            <span>{alertMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Page Layout */}
      {activeReport ? (
        <div className="space-y-6">
          {/* Detailed Header with breadcrumb and actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <button 
                onClick={() => { setSelectedReportId(null); setIsEditingNotes(false); }}
                className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition-colors uppercase tracking-wider mb-2"
              >
                <ArrowLeft size={14} /> Rapor Listesine Dön
              </button>
              <h1 className="text-xl md:text-2xl font-display font-black text-white">{activeReport.title}</h1>
              <div className="flex flex-wrap gap-2.5 items-center text-xs text-text-secondary pt-1">
                <span className="flex items-center gap-1"><Calendar size={13} /> Dönem: {activeReport.period}</span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1"><Clock size={13} /> Kayıt: {activeReport.createdAt}</span>
              </div>
            </div>

            {/* Print and Export Buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => handleExportJSON(activeReport)}
                title="JSON İndir"
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold text-white rounded-xl border border-white/10 transition-colors"
              >
                <Download size={14} /> JSON
              </button>
              <button 
                onClick={() => handleExportTXT(activeReport)}
                title="TXT İndir"
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold text-white rounded-xl border border-white/10 transition-colors"
              >
                <FileText size={14} /> Metin
              </button>
              <button 
                onClick={handleSimulatePrint}
                title="Yazdır"
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold text-white rounded-xl border border-white/10 transition-colors"
              >
                <Printer size={14} /> Yazdır
              </button>
            </div>
          </div>

          {/* Report Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 relative">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Toplam Gelir</span>
              <span className="text-2xl font-mono font-black text-white block mt-1">
                ₺{activeReport.totalIncome.toLocaleString('tr-TR')}
              </span>
              <span className="text-xs text-text-secondary mt-1 block">Tüm tamamlanan kaynaklar.</span>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 relative">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Toplam Harcama</span>
              <span className="text-2xl font-mono font-black text-white block mt-1">
                ₺{activeReport.totalExpense.toLocaleString('tr-TR')}
              </span>
              <span className="text-xs text-text-secondary mt-1 block">Tüm gerçekleşen giderler.</span>
            </div>

            <div className="bg-gradient-to-br from-focus-neon/10 to-black/30 border border-focus-neon/30 rounded-2xl p-5 relative">
              <span className="text-[10px] font-bold text-focus-neon uppercase tracking-wider block">Net Tasarruf / Kalan</span>
              <span className="text-2xl font-mono font-black text-focus-neon block mt-1">
                ₺{activeReport.netSavings.toLocaleString('tr-TR')}
              </span>
              <span className="text-xs text-text-secondary mt-1 block">Bütçe fazlası / birikim potansiyeli.</span>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Bütçe Notu</span>
                <span className="text-3xl font-mono font-black text-ai-bright block mt-1">
                  {activeReport.grade}
                </span>
                <span className="text-xs text-text-secondary mt-1 block">Tasarruf oranına göre.</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-ai-bright/10 border border-ai-bright/20 flex items-center justify-center font-bold text-ai-bright text-lg">
                {activeReport.savingsRate}%
              </div>
            </div>
          </div>

          {/* Bento Grid: Notes, Advisor Insight, Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Personal Notes & Executive Comment */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 size={14} className="text-ai-bright" /> Yönetici Değerlendirmesi
                  </h4>
                  {!isEditingNotes ? (
                    <button 
                      onClick={() => { setEditedNotes(activeReport.personalNotes); setIsEditingNotes(true); }}
                      className="text-xs text-ai-bright hover:underline font-bold flex items-center gap-1"
                    >
                      Düzenle
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveNotes}
                        className="text-xs text-focus-neon hover:underline font-bold"
                      >
                        Kaydet
                      </button>
                      <button 
                        onClick={() => setIsEditingNotes(false)}
                        className="text-xs text-text-secondary hover:underline font-bold"
                      >
                        İptal
                      </button>
                    </div>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={6}
                    className="w-full bg-black/40 text-xs text-white p-3 rounded-xl border border-white/10 focus:border-ai-bright focus:outline-none focus:ring-1 focus:ring-ai-bright/30"
                    placeholder="Bu ayki bütçe performansınızı değerlendirin..."
                  />
                ) : (
                  <p className="text-xs text-text-secondary leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 italic">
                    "{activeReport.personalNotes}"
                  </p>
                )}
              </div>

              {/* Savings Rate Progress */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary font-bold">Dönemlik Tasarruf Oranı</span>
                  <span className="text-white font-mono font-bold">%{activeReport.savingsRate}</span>
                </div>
                <div className="w-full h-3.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-ai-bright to-focus-neon rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(0, activeReport.savingsRate))}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[9px] text-text-secondary font-mono">
                  <span>%0 Kritik</span>
                  <span>%20 Sağlıklı</span>
                  <span>%40 Mükemmel</span>
                </div>
              </div>
            </div>

            {/* Column 2: AI / Advisor Insight */}
            {(() => {
              const insight = getAdvisorComments(activeReport);
              const AdvisorIcon = insight.icon;
              return (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <AdvisorIcon size={14} className={insight.color.split(' ')[0]} /> Danışman Analiz Görüşü
                    </h4>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${insight.color}`}>
                      {insight.title}
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed pt-2">
                      {insight.desc}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-text-secondary flex items-start gap-2">
                    <AlertTriangle size={14} className="text-nrg-sun shrink-0 mt-0.5" />
                    <span>Önerilen aksiyonlar tamamen sistem verileriniz uyarınca akıllı bütçe kurallarına göre derlenmiştir.</span>
                  </div>
                </div>
              );
            })()}

            {/* Column 3: Tactical Actions */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-focus-neon" /> Rapor Sonrası Aksiyon Adımları
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Bu döneme ait hedeflere ulaşmak ve bütçe sızıntılarını kesmek için eylem planı oluşturun:
              </p>

              <div className="space-y-2.5">
                {[
                  'Abonelik sızıntılarını durdur',
                  'Gıda bütçesini sınırla',
                  'Borç kartopu ödemesini gerçekleştir',
                  'Yatırım payını otomatik fona aktar'
                ].map((action, index) => {
                  const isChecked = (activeReport.checkedActions || []).includes(action);
                  return (
                    <button
                      key={index}
                      onClick={() => handleToggleAction(action)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 text-left transition-all hover:border-white/10"
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-focus-neon border-focus-neon text-black' 
                          : 'border-white/20 hover:border-white/30 text-transparent'
                      }`}>
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className={`text-xs ${isChecked ? 'line-through text-text-secondary' : 'text-white'}`}>
                        {action}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Income vs Expense Comparative Bar Chart */}
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-ai-bright" /> Gelir ve Gider Kıyaslama Grafiği
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Gelir', miktar: activeReport.totalIncome, fill: '#10b981' },
                    { name: 'Gider', miktar: activeReport.totalExpense, fill: '#ef4444' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} tickFormatter={(v) => `₺${v.toLocaleString('tr-TR')}`} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      formatter={(v) => [`₺${Number(v).toLocaleString('tr-TR')}`, 'Miktar']}
                    />
                    <Bar dataKey="miktar" radius={[8, 8, 0, 0]}>
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Pie Chart */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PieChartIcon size={16} className="text-ai-bright" /> Kategori Harcama Payı
              </h4>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeReport.expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {activeReport.expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      formatter={(v) => [`₺${Number(v).toLocaleString('tr-TR')}`, 'Gider']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legends */}
              <div className="grid grid-cols-2 gap-2 text-[10px] max-h-24 overflow-y-auto">
                {activeReport.expenseBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-text-secondary">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate">{item.name}: <strong className="text-white">₺{item.value.toLocaleString('tr-TR')}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions & Debt snapshot detailed card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Subscriptions Spot */}
            <div className="bg-black/20 border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={14} className="text-ec-pink" /> Sabit Abonelik Analizi (Sızıntı Tespiti)
                </h4>
                <span className="text-[10px] font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {activeReport.subscriptionsCount} Aktif Abonelik
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Bu dönem zarfında iptal edilmeyen ve aylık olarak otomatik yenilenen üyeliklerinizin toplam bütçe ayak izi:
              </p>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Abonelik Aylık Yükü</span>
                  <span className="text-xl font-mono font-black text-white block mt-0.5">
                    ₺{activeReport.totalSubscriptionCost.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="text-right text-[10px] text-text-secondary">
                  Yıllık Karşılığı: <strong className="text-white font-mono">₺{(activeReport.totalSubscriptionCost * 12).toLocaleString('tr-TR')}</strong>
                </div>
              </div>
            </div>

            {/* Debts progress Spot */}
            <div className="bg-black/20 border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={14} className="text-nrg-sun" /> Aktif Borçlar & Yükümlülükler
                </h4>
                <span className="text-[10px] font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {activeReport.activeDebtsCount} Borç Kalemi
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Bu rapor dönemindeki toplam bekleyen anapara borç bakiyeniz ve yükümlülükleriniz:
              </p>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Toplam Borç Bakiye</span>
                  <span className="text-xl font-mono font-black text-white block mt-0.5">
                    ₺{activeReport.totalRemainingDebt.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="text-right text-[10px] text-text-secondary">
                  Borç/Gelir Oranı: <strong className="text-white font-mono">%{activeReport.totalIncome > 0 ? Math.round((activeReport.totalRemainingDebt / activeReport.totalIncome) * 100) : 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Report Listing and Dashboard */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight flex items-center gap-2">
                <FileText className="text-ai-bright" /> Dönemlik Finansal Raporlar
              </h1>
              <p className="text-sm text-text-secondary">
                Sistemdeki tüm bütçe verilerinizden otomatik derlenen veya manuel eklenen detaylı dönem analiz raporları.
              </p>
            </div>

            {/* Create Report Button (Rapor Ekle) */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ai-bright to-focus-neon hover:opacity-90 text-black font-black text-sm rounded-xl transition-all shadow-lg"
            >
              <Plus size={16} className="stroke-[3]" /> Rapor Ekle / Oluştur
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-ai-bright/10 border border-ai-bright/20 flex items-center justify-center text-ai-bright">
                <FileText size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase">Toplam Rapor Sayısı</span>
                <span className="text-xl font-mono font-black text-white block">{overallStats.count} Adet</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-focus-neon/10 border border-focus-neon/20 flex items-center justify-center text-focus-neon">
                <Activity size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase">Ort. Tasarruf Oranı</span>
                <span className="text-xl font-mono font-black text-focus-neon block">%{overallStats.avgRate}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-nrg-sun/10 border border-nrg-sun/20 flex items-center justify-center text-nrg-sun">
                <TrendingUp size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase">En Başarılı Dönem</span>
                <span className="text-xl font-mono font-black text-white block truncate max-w-[150px]">{overallStats.bestPeriod}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase">Bütçe Sağlık Skoru</span>
                <span className="text-xl font-mono font-black text-white block">
                  {overallStats.avgRate >= 30 ? 'Mükemmel (A)' : overallStats.avgRate >= 20 ? 'Sağlıklı (B)' : 'Geliştirilebilir (C)'}
                </span>
              </div>
            </div>
          </div>

          {/* Search, Filters, and List */}
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input
                  type="text"
                  placeholder="Rapor başlığı veya içeriğinde ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-ai-bright focus:outline-none focus:ring-1 focus:ring-ai-bright/20"
                />
              </div>

              {/* Grade Filter Dropdown */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter size={14} className="text-text-secondary shrink-0" />
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="w-full md:w-44 bg-black/40 text-xs text-white px-3.5 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-ai-bright cursor-pointer"
                >
                  <option value="Tümü">Tüm Bütçe Notları</option>
                  <option value="S">S Sınıfı Raporlar</option>
                  <option value="A">A Sınıfı Raporlar</option>
                  <option value="B">B Sınıfı Raporlar</option>
                  <option value="C">C Sınıfı Raporlar</option>
                  <option value="D">D Sınıfı Raporlar</option>
                  <option value="F">F Sınıfı Raporlar</option>
                </select>
              </div>
            </div>

            {/* Reports Cards Grid */}
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 shadow-md"
                    whileHover={{ y: -3 }}
                  >
                    {/* Top line with period and delete button */}
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-text-secondary bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Calendar size={11} /> {report.period}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${
                          report.grade === 'S' || report.grade === 'A' 
                            ? 'bg-focus-neon/10 border border-focus-neon/20 text-focus-neon' 
                            : report.grade === 'B' 
                            ? 'bg-ai-bright/10 border border-ai-bright/20 text-ai-bright'
                            : 'bg-nrg-sun/10 border border-nrg-sun/20 text-nrg-sun'
                        }`}>
                          {report.grade}
                        </span>
                        <button 
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          className="p-1.5 text-text-secondary hover:text-crit-vivid rounded-lg hover:bg-white/5 transition-colors"
                          title="Raporu Sil"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Notes snippet */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-white text-sm group-hover:text-ai-bright transition-colors line-clamp-1">{report.title}</h3>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed italic">
                        "{report.personalNotes}"
                      </p>
                    </div>

                    {/* Mini Stats and progress */}
                    <div className="space-y-2 pt-3 border-t border-white/5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-secondary">Tasarruf Oranı:</span>
                        <span className="text-white font-bold">%{report.savingsRate}</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-ai-bright to-focus-neon rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(0, report.savingsRate))}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] font-mono pt-1 text-text-secondary">
                        <span>Net Birikim: <strong className="text-white">₺{report.netSavings.toLocaleString('tr-TR')}</strong></span>
                        <span className="flex items-center gap-0.5 text-ai-bright group-hover:underline">Detayı Gör <ChevronRight size={12} /></span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-text-secondary bg-black/20 rounded-2xl border border-white/5 space-y-3">
                <FileText size={36} className="mx-auto text-text-secondary/40" />
                <p className="text-sm">Eşleşen finansal rapor bulunamadı.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-xs text-ai-bright hover:underline font-bold"
                >
                  Yeni Rapor Ekle / Oluştur
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rapor Ekle/Oluştur Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 sticky top-0 bg-[#121214] z-10">
              <div>
                <h3 className="font-bold text-white text-base">Yeni Finansal Rapor Ekle</h3>
                <p className="text-xs text-text-secondary mt-0.5">Dönem bütçesini otomatik derleyin veya manuel girdiler yapın.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateReport} className="p-6 space-y-6">
              
              {/* Period and Data Mode selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Rapor Dönemi (Ay/Yıl)</label>
                  <select
                    value={formPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="w-full bg-black/40 text-xs text-white px-3.5 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-ai-bright cursor-pointer font-mono"
                  >
                    <option value="2026-06">Haziran 2026</option>
                    <option value="2026-05">Mayıs 2026</option>
                    <option value="2026-04">Nisan 2026</option>
                    <option value="2026-03">Mart 2026</option>
                    <option value="2026-02">Şubat 2026</option>
                    <option value="2026-01">Ocak 2026</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Veri Alım Yöntemi</label>
                  <div className="grid grid-cols-2 gap-2 h-11">
                    <button
                      type="button"
                      onClick={() => setUseAutoData(true)}
                      className={`text-xs font-bold rounded-xl border flex items-center justify-center gap-1 ${
                        useAutoData 
                          ? 'bg-ai-bright/10 border-ai-bright text-ai-bright' 
                          : 'bg-black/30 border-white/10 text-text-secondary hover:border-white/20'
                      }`}
                    >
                      <CheckCircle2 size={13} /> Veri Tabanı
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseAutoData(false)}
                      className={`text-xs font-bold rounded-xl border flex items-center justify-center gap-1 ${
                        !useAutoData 
                          ? 'bg-ai-bright/10 border-ai-bright text-ai-bright' 
                          : 'bg-black/30 border-white/10 text-text-secondary hover:border-white/20'
                      }`}
                    >
                      Manuel Girdi
                    </button>
                  </div>
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Rapor Başlığı</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Örn: Haziran 2026 Kapsamlı Performans Analizi"
                  className="w-full bg-black/40 text-xs text-white px-4 py-3 rounded-xl border border-white/10 focus:border-ai-bright focus:outline-none"
                />
              </div>

              {/* Auto Generated Preview Stats or Manual Fields */}
              {useAutoData ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Activity size={13} className="text-ai-bright" /> Otomatik Derlenen Taslak İstatistikler ({formPeriod})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="text-[9px] text-text-secondary uppercase block">Toplam Gelir</span>
                      <span className="text-sm font-mono font-bold text-white block mt-0.5">
                        ₺{autoComputedStats.totalIncome.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="text-[9px] text-text-secondary uppercase block">Toplam Gider</span>
                      <span className="text-sm font-mono font-bold text-white block mt-0.5">
                        ₺{autoComputedStats.totalExpense.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="text-[9px] text-text-secondary uppercase block">Net Tasarruf</span>
                      <span className="text-sm font-mono font-bold text-focus-neon block mt-0.5">
                        ₺{autoComputedStats.netSavings.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="text-[9px] text-text-secondary uppercase block">Tasarruf Oranı</span>
                      <span className="text-sm font-mono font-bold text-ai-bright block mt-0.5">
                        %{autoComputedStats.savingsRate}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed italic">
                    * Veri tabanı seçeneğinde sistem o ay içerisindeki tüm "Tamamlandı" statüsündeki gelirlerinizi ve "Gerçekleşti" statüsündeki giderlerinizi tarar.
                  </p>
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Edit3 size={13} className="text-ai-bright" /> Manuel Performans Girdileri
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Aylık Toplam Gelir (₺)</label>
                      <input
                        type="number"
                        min="0"
                        value={manualIncome}
                        onChange={(e) => setManualIncome(Number(e.target.value))}
                        className="w-full bg-black/40 text-xs text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-ai-bright focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Aylık Toplam Gider (₺)</label>
                      <input
                        type="number"
                        min="0"
                        value={manualExpense}
                        onChange={(e) => setManualExpense(Number(e.target.value))}
                        className="w-full bg-black/40 text-xs text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-ai-bright focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Notes (Executive evaluation comments) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Dönem Değerlendirmesi / Kişisel Yorumlar</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={4}
                  required
                  placeholder="Bu ayki bütçe davranışlarınızı, hedeflerinizi ve sapma nedenlerini buraya not edin..."
                  className="w-full bg-black/40 text-xs text-white p-3 rounded-xl border border-white/10 focus:border-ai-bright focus:outline-none focus:ring-1 focus:ring-ai-bright/20"
                />
              </div>

              {/* Health Grade Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-text-secondary uppercase">Finansal Sağlık Notu (Grade)</label>
                  {useAutoData && (
                    <span className="text-[10px] text-ai-bright font-bold">
                      Sistem Önerisi: <strong className="underline">{autoComputedStats.recommendedGrade} Sınıfı</strong>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {(['S', 'A', 'B', 'C', 'D', 'F'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormGrade(g)}
                      className={`py-2 rounded-xl font-mono font-bold text-sm border transition-all ${
                        formGrade === g 
                          ? 'bg-gradient-to-b from-ai-bright to-focus-neon border-transparent text-black shadow-lg scale-105' 
                          : 'bg-black/30 border-white/10 text-text-secondary hover:border-white/20'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text-secondary leading-normal">
                  S: %40+ tasarruf, A: %30+ tasarruf, B: %20+ tasarruf, C: %10+ tasarruf, D: Pozitif tasarruf, F: Negatif bütçe / tasarrufsuz.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold text-white rounded-xl border border-white/10 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-ai-bright to-focus-neon hover:opacity-95 text-black font-black text-xs rounded-xl transition-all shadow-md"
                >
                  Raporu Oluştur ve Kaydet
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
