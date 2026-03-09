import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  MoreHorizontal,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  FileText,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  Activity,
  Trash2,
  Archive
} from 'lucide-react';
import { HighlightText } from '../common/HighlightText';
import { smartFilter } from '../../utils/searchUtils';
import { JobWizardModal } from './JobWizardModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function OpenJobs() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfig, setFilterConfig] = useState<{
    supplierId: string;
    status: string;
    startDate: string;
    endDate: string;
  }>({
    supplierId: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [expandedStat, setExpandedStat] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());

  const fetchJobs = () => {
    fetch('/api/jobs/open')
      .then(res => res.json())
      .then(data => {
        setOpenJobs(data);
        setSelectedJobIds(new Set());
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const totalOpenQty = useMemo(() => {
    return openJobs.reduce((acc, curr) => {
      const qty = curr.items.reduce((sum: number, item: any) => sum + (item.qty - item.received_qty), 0);
      return acc + qty;
    }, 0);
  }, [openJobs]);

  const filteredJobs = useMemo(() => {
    let result = smartFilter(
      openJobs,
      searchTerm,
      ['receipt_no', 'supplier_name'],
      {
        no: 'receipt_no',
        cari: 'supplier_name',
        stok: (job) => job.items.map((i: any) => i.stock_name).join(' '),
        durum: 'status'
      }
    ).filter(job => {
      const matchesSupplier = !filterConfig.supplierId || job.supplier_name === filterConfig.supplierId;
      const matchesStatus = !filterConfig.status || job.status === filterConfig.status;
      
      const jobDate = new Date(job.date);
      const matchesStartDate = !filterConfig.startDate || jobDate >= new Date(filterConfig.startDate);
      const matchesEndDate = !filterConfig.endDate || jobDate <= new Date(filterConfig.endDate);

      return matchesSupplier && matchesStatus && matchesStartDate && matchesEndDate;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'qty') {
          aValue = a.items.reduce((sum: number, item: any) => sum + (item.qty - item.received_qty), 0);
          bValue = b.items.reduce((sum: number, item: any) => sum + (item.qty - item.received_qty), 0);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [openJobs, searchTerm, sortConfig, filterConfig]);

  const handleQuickFilter = (type: 'supplier' | 'stock', value: string) => {
    if (type === 'supplier') {
      setFilterConfig(prev => ({ ...prev, supplierId: value }));
    } else {
      setSearchTerm(value);
    }
    // Scroll to table
    const tableElement = document.getElementById('jobs-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setFilterConfig({
      supplierId: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    const data = filteredJobs.map(job => ({
      'İş Emri No': job.receipt_no,
      'Tedarikçi': job.supplier_name,
      'Stoklar': job.items.map((i: any) => i.stock_name).join(', '),
      'Kalan Miktar': job.items.reduce((sum: number, item: any) => sum + (item.qty - item.received_qty), 0),
      'Tarih': new Date(job.date).toLocaleDateString('tr-TR'),
      'Durum': job.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Açık İşler');
    XLSX.writeFile(wb, 'Acik_Isler.xlsx');
    setIsExportMenuOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["İş Emri No", "Tedarikçi", "Kalan Miktar", "Tarih", "Durum"];
    const tableRows = filteredJobs.map(job => [
      job.receipt_no,
      job.supplier_name,
      job.items.reduce((sum: number, item: any) => sum + (item.qty - item.received_qty), 0),
      new Date(job.date).toLocaleDateString('tr-TR'),
      job.status
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [20, 20, 20] }
    });

    doc.text("Açık İşler Listesi", 14, 15);
    doc.save("Acik_Isler.pdf");
    setIsExportMenuOpen(false);
  };

  const handleSaveJob = () => {
    fetchJobs();
    setEditingJob(null);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setEditingJob(null);
  };

  const handleDeleteJob = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bu iş emrini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm bağlı hareketler silinecektir.')) return;
    
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchJobs();
        setActiveActionMenu(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Silme işlemi başarısız oldu.');
      }
    } catch (err) {
      console.error(err);
      alert('Bir hata oluştu.');
    }
  };

  const handleArchiveJob = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bu iş emrini arşivlemek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch(`/api/jobs/${id}/archive`, { method: 'POST' });
      if (res.ok) {
        fetchJobs();
        setActiveActionMenu(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Arşivleme işlemi başarısız oldu.');
      }
    } catch (err) {
      console.error(err);
      alert('Bir hata oluştu.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobIds.size === 0) return;
    if (!window.confirm(`${selectedJobIds.size} adet iş emrini silmek istediğinize emin misiniz?`)) return;

    try {
      const promises = Array.from(selectedJobIds).map(id => 
        fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      );
      await Promise.all(promises);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert('Bazı kayıtlar silinemedi.');
    }
  };

  const handleBulkArchive = async () => {
    if (selectedJobIds.size === 0) return;
    if (!window.confirm(`${selectedJobIds.size} adet iş emrini arşivlemek istediğinize emin misiniz?`)) return;

    try {
      const promises = Array.from(selectedJobIds).map(id => 
        fetch(`/api/jobs/${id}/archive`, { method: 'POST' })
      );
      await Promise.all(promises);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert('Bazı kayıtlar arşivlenemedi.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.size === filteredJobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(filteredJobs.map(j => j.id)));
    }
  };

  const toggleSelectJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedJobIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedJobIds(newSelected);
  };

  const supplierBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    openJobs.forEach(job => {
      breakdown[job.supplier_name] = (breakdown[job.supplier_name] || 0) + 1;
    });
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  }, [openJobs]);

  const stockBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    openJobs.forEach(job => {
      job.items.forEach((item: any) => {
        breakdown[item.stock_name] = (breakdown[item.stock_name] || 0) + (item.qty - item.received_qty);
      });
    });
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [openJobs]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Compact */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-border bg-bg-card/30 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-display font-black tracking-tight text-text-primary">Açık İşler</h1>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-70">Tedarikçideki Aktif İş Emirleri</p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="os-btn os-btn-primary py-2 px-5 text-sm"
        >
          <PlusCircle size={18} />
          Yeni İş Emri
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-bg-app/20">
        {/* KPI Row - Very Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 shrink-0">
          {[
            { 
              title: 'Açık İş', 
              value: openJobs.length.toString(), 
              icon: <Clock size={16} />, 
              color: 'text-accent',
              bg: 'bg-accent/10'
            },
            { 
              title: 'Geciken', 
              value: '0', 
              icon: <AlertTriangle size={16} />, 
              color: 'text-rose-500',
              bg: 'bg-rose-500/10'
            },
            { 
              title: 'Toplam Adet', 
              value: totalOpenQty.toLocaleString(), 
              icon: <ArrowRight size={16} />, 
              color: 'text-amber-500',
              bg: 'bg-amber-500/10'
            },
            { 
              title: 'Kısmi Teslim', 
              value: openJobs.filter(j => j.status === 'Kısmi').length.toString(), 
              icon: <TableIcon size={16} />, 
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10'
            },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card p-4 flex items-center gap-4 hover:bg-bg-card transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-0.5">{stat.title}</p>
                <h3 className="text-xl font-display font-black text-text-primary">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area - Full Width */}
        <div className="flex-1 flex flex-col min-h-0 px-6 pb-6 overflow-hidden">
          {/* Table Section - The Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col bento-card overflow-hidden border-border/40 shadow-2xl"
          >
            {/* Table Controls */}
            <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-bg-card/50">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-80 group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="İş Emri, Cari veya Stok Ara... (no:, cari:, stok:)" 
                    className="os-input w-full pl-12 pr-10 py-2.5 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchTerm && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {selectedJobIds.size > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl"
                    >
                      <span className="text-xs font-black text-accent uppercase tracking-widest">
                        {selectedJobIds.size} Seçili
                      </span>
                      <div className="w-px h-4 bg-accent/20 mx-2" />
                      <button 
                        onClick={handleBulkArchive}
                        className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title="Seçilenleri Arşivle"
                      >
                        <Archive size={16} />
                      </button>
                      <button 
                        onClick={handleBulkDelete}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Seçilenleri Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="os-btn os-btn-secondary py-2 px-4 text-xs flex-1 md:flex-none"
                >
                  <Filter size={14} />
                  Filtrele
                </button>
                <div className="relative flex-1 md:flex-none">
                  <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="os-btn os-btn-secondary py-2 px-4 text-xs w-full"
                  >
                    <Download size={14} />
                    Aktar
                  </button>
                  <AnimatePresence>
                    {isExportMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsExportMenuOpen(false)}></div>
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-40 bg-bg-card border border-border rounded-xl shadow-2xl z-20 overflow-hidden"
                        >
                          <button onClick={exportToExcel} className="w-full px-4 py-3 text-left text-xs font-bold text-text-primary hover:bg-bg-app flex items-center gap-3 transition-colors">
                            <TableIcon size={14} className="text-emerald-500" /> Excel
                          </button>
                          <button onClick={exportToPDF} className="w-full px-4 py-3 text-left text-xs font-bold text-text-primary hover:bg-bg-app flex items-center gap-3 transition-colors">
                            <FileText size={14} className="text-rose-500" /> PDF
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-bg-card/95 backdrop-blur-md z-10">
                  <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-text-secondary font-black">
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedJobIds.size === filteredJobs.length && filteredJobs.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-bg-app"
                      />
                    </th>
                    <th className="p-4 cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('receipt_no')}>
                      İş Emri No {sortConfig?.key === 'receipt_no' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4 cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('supplier_name')}>
                      Tedarikçi {sortConfig?.key === 'supplier_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4">Stok İçeriği</th>
                    <th className="p-4 text-right cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('qty')}>
                      Kalan Miktar {sortConfig?.key === 'qty' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4">Durum</th>
                    <th className="p-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredJobs.map((job, i) => (
                    <tr 
                      key={i} 
                      className={`hover:bg-bg-app/50 transition-all group cursor-pointer ${selectedJobIds.has(job.id) ? 'bg-accent/5' : ''}`}
                    >
                      <td className="p-4 w-10" onClick={(e) => toggleSelectJob(job.id, e)}>
                        <input 
                          type="checkbox" 
                          checked={selectedJobIds.has(job.id)}
                          onChange={() => {}} // Handled by cell click
                          className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-bg-app"
                        />
                      </td>
                      <td className="p-4" onClick={() => handleEditJob(job)}>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                          <span className="font-mono font-black text-text-primary text-sm">
                            <HighlightText text={job.receipt_no} highlight={searchTerm} />
                          </span>
                        </div>
                      </td>
                      <td className="p-4" onClick={() => handleEditJob(job)}>
                        <span className="font-display font-bold text-text-primary text-sm group-hover:text-accent transition-colors">
                          <HighlightText text={job.supplier_name} highlight={searchTerm} />
                        </span>
                      </td>
                      <td className="p-4" onClick={() => handleEditJob(job)}>
                        <div className="flex flex-wrap gap-1.5">
                          {job.items.map((item: any) => (
                            <span key={item.id} className="px-2 py-0.5 rounded-md bg-bg-app border border-border text-[10px] font-black uppercase tracking-wider text-text-secondary">
                              {item.stock_name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right" onClick={() => handleEditJob(job)}>
                        <span className="font-mono font-black text-accent text-lg">
                          {job.items.reduce((sum: number, item: any) => sum + (item.qty - item.received_qty), 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4" onClick={() => handleEditJob(job)}>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          job.status === 'Kısmi' 
                            ? 'text-amber-600 bg-amber-500/10 border-amber-500/20'
                            : 'text-accent bg-accent/10 border-accent/20'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleEditJob(job)}
                            className="p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-bg-app"
                            title="Düzenle"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={() => handleArchiveJob(job.id)}
                            className="p-2 text-amber-500/70 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/5"
                            title="Arşivle"
                          >
                            <Archive size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-rose-500/70 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/5"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredJobs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-text-secondary opacity-40">
                  <Search size={48} className="mb-4" />
                  <p className="font-display font-bold">Kayıt bulunamadı</p>
                </div>
              )}
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-border flex justify-between items-center bg-bg-card/30 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Toplam <span className="text-text-primary">{filteredJobs.length}</span> İş Emri
              </p>
              <div className="flex gap-2">
                <button className="os-btn os-btn-secondary py-1.5 px-4 text-[10px] uppercase font-black tracking-widest opacity-50 cursor-not-allowed">Önceki</button>
                <button className="os-btn os-btn-secondary py-1.5 px-4 text-[10px] uppercase font-black tracking-widest opacity-50 cursor-not-allowed">Sonraki</button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <JobWizardModal 
        isOpen={isWizardOpen} 
        onClose={handleCloseWizard} 
        onSave={handleSaveJob} 
        editingJob={editingJob}
      />

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute inset-0 bg-bg-app/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-bg-app/30">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <Filter size={20} className="text-accent" />
                  Gelişmiş Filtreleme
                </h2>
                <button onClick={() => setIsFilterModalOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label-mono">Tedarikçi</label>
                    <select 
                      value={filterConfig.supplierId}
                      onChange={(e) => setFilterConfig(prev => ({ ...prev, supplierId: e.target.value }))}
                      className="os-input w-full"
                    >
                      <option value="">Tümü</option>
                      {supplierBreakdown.map(([name]) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-mono">Durum</label>
                    <select 
                      value={filterConfig.status}
                      onChange={(e) => setFilterConfig(prev => ({ ...prev, status: e.target.value }))}
                      className="os-input w-full"
                    >
                      <option value="">Tümü</option>
                      <option value="Açık">Tamamı Açık</option>
                      <option value="Kısmi">Kısmi Teslimat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label-mono">Başlangıç Tarihi</label>
                    <input 
                      type="date" 
                      value={filterConfig.startDate}
                      onChange={(e) => setFilterConfig(prev => ({ ...prev, startDate: e.target.value }))}
                      className="os-input w-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-mono">Bitiş Tarihi</label>
                    <input 
                      type="date" 
                      value={filterConfig.endDate}
                      onChange={(e) => setFilterConfig(prev => ({ ...prev, endDate: e.target.value }))}
                      className="os-input w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-bg-app/30 border-t border-border flex justify-between gap-3">
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2.5 text-sm text-text-secondary hover:text-text-primary font-bold transition-colors"
                >
                  Temizle
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="os-btn os-btn-primary px-8"
                >
                  Filtreleri Uygula
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

