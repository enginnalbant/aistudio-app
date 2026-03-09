import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Save,
  Calendar,
  FileText,
  User,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Edit2,
  RotateCcw
} from 'lucide-react';

interface JobWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingJob?: any;
}

interface JobItem {
  id: string;
  stockId: string;
  stockName: string;
  qty: number;
  price: number;
}

interface OpenJobItem {
  id: string;
  jobId: string;
  stockId: string;
  stockName: string;
  qty: number;
  receivedQty: number;
  price: number;
  incomingQty: number; // For the form
}

interface OpenJob {
  id: string;
  receipt_no: string;
  date: string;
  supplier_name: string;
  items: OpenJobItem[];
}

export function JobWizardModal({ isOpen, onClose, onSave, editingJob }: JobWizardModalProps) {
  const [scenario, setScenario] = useState<'OUTGOING' | 'INCOMING' | null>(null);
  const [step, setStep] = useState(0); // 0 is scenario selection
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptNo, setReceiptNo] = useState(`FS-${Math.floor(Math.random() * 10000)}`);
  const [supplierId, setSupplierId] = useState('');
  
  const [items, setItems] = useState<JobItem[]>([]);
  const [currentStockId, setCurrentStockId] = useState('');
  const [currentQty, setCurrentQty] = useState<number | ''>('');
  const [currentPrice, setCurrentPrice] = useState<number | ''>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Incoming State
  const [openJobs, setOpenJobs] = useState<OpenJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [incomingItems, setIncomingItems] = useState<OpenJobItem[]>([]);

  // Data sources
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/accounts').then(res => res.json()).then(data => {
        setSuppliers(data);
        if (data.length > 0) setSupplierId(data[0].id);
      });
      fetch('/api/stocks').then(res => res.json()).then(data => {
        setStocks(data);
        if (data.length > 0) setCurrentStockId(data[0].id);
      });
      fetch('/api/jobs/open').then(res => res.json()).then(data => {
        // Map data to OpenJob format
        const mappedJobs = data.map((j: any) => ({
          id: j.id,
          receipt_no: j.receipt_no,
          date: j.date,
          supplier_name: j.supplier_name,
          items: j.items.map((i: any) => ({
            id: i.id,
            jobId: j.id,
            stockId: i.stock_id,
            stockName: i.stock_name,
            qty: i.qty,
            receivedQty: i.received_qty,
            price: i.price,
            incomingQty: 0
          }))
        }));
        setOpenJobs(mappedJobs);
      });
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingJob) {
        // Populate for editing
        const jobType = editingJob.type || 'OUTGOING';
        setScenario(jobType as 'OUTGOING' | 'INCOMING');
        setStep(1);
        setDate(new Date(editingJob.date).toISOString().split('T')[0]);
        setReceiptNo(editingJob.receipt_no);
        
        // Find supplier ID from name
        const supplier = suppliers.find(s => s.name === editingJob.supplier_name);
        if (supplier) setSupplierId(supplier.id);

        if (jobType === 'OUTGOING') {
          setItems(editingJob.items.map((i: any) => ({
            id: i.id,
            stockId: i.stock_id,
            stockName: i.stock_name,
            qty: i.qty,
            price: i.price
          })));
        } else {
          // For incoming, we populate incomingItems
          setIncomingItems(editingJob.items.map((i: any) => ({
            id: i.id,
            jobId: editingJob.id,
            stockId: i.stock_id,
            stockName: i.stock_name,
            qty: i.qty,
            receivedQty: 0, // Not applicable for editing an archive record usually
            price: i.price,
            incomingQty: i.qty
          })));
        }
      } else {
        setScenario(null);
        setStep(0);
        setDate(new Date().toISOString().split('T')[0]);
        setReceiptNo(`FS-${Math.floor(Math.random() * 10000)}`);
        setItems([]);
        setCurrentQty('');
        setCurrentPrice('');
        setEditingItemId(null);
        setSelectedJobId('');
        setIncomingItems([]);
      }
    }
  }, [isOpen, editingJob, suppliers]);

  const handleScenarioSelect = (type: 'OUTGOING' | 'INCOMING') => {
    setScenario(type);
    setStep(1);
  };

  const handleAddItem = () => {
    if (currentStockId && currentQty && Number(currentQty) > 0) {
      const stock = stocks.find(s => s.id === currentStockId);
      
      if (editingItemId) {
        setItems(items.map(item => item.id === editingItemId ? {
          ...item,
          stockId: currentStockId,
          stockName: stock?.name || '',
          qty: Number(currentQty),
          price: Number(currentPrice) || 0
        } : item));
        setEditingItemId(null);
      } else {
        setItems([...items, {
          id: Math.random().toString(36).substr(2, 9),
          stockId: currentStockId,
          stockName: stock?.name || '',
          qty: Number(currentQty),
          price: Number(currentPrice) || 0
        }]);
      }
      
      setCurrentQty('');
      setCurrentPrice('');
    }
  };

  const handleEditItem = (item: JobItem) => {
    setEditingItemId(item.id);
    setCurrentStockId(item.stockId);
    setCurrentQty(item.qty);
    setCurrentPrice(item.price);
  };

  const handleCancelItemEdit = () => {
    setEditingItemId(null);
    setCurrentQty('');
    setCurrentPrice('');
    if (stocks.length > 0) setCurrentStockId(stocks[0].id);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = openJobs.find(j => j.id === jobId);
    if (job) {
      // Set supplier ID to the job's supplier
      const supplier = suppliers.find(s => s.name === job.supplier_name);
      if (supplier) {
        setSupplierId(supplier.id);
      }
      // Only include items that haven't been fully received
      setIncomingItems(job.items.filter(i => i.receivedQty < i.qty).map(i => ({...i, incomingQty: 0})));
    } else {
      setIncomingItems([]);
    }
  };

  const handleIncomingQtyChange = (itemId: string, qty: number) => {
    setIncomingItems(prev => prev.map(i => {
      if (i.id === itemId) {
        const maxAllowed = i.qty - i.receivedQty;
        const validQty = Math.min(Math.max(0, qty), maxAllowed);
        return { ...i, incomingQty: validQty };
      }
      return i;
    }));
  };

  const handleSave = async () => {
    const method = editingJob ? 'PUT' : 'POST';
    const url = editingJob ? `/api/jobs/${editingJob.id}` : (scenario === 'OUTGOING' ? '/api/jobs/outgoing' : '/api/jobs/incoming');

    if (scenario === 'OUTGOING') {
      const jobData = {
        date,
        receiptNo,
        accountId: supplierId,
        items: items.map(i => ({ stockId: i.stockId, qty: i.qty, price: i.price }))
      };
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
    } else if (scenario === 'INCOMING') {
      // Incoming edits are complex, usually we just create new ones, 
      // but if we are editing an existing incoming job:
      const jobData = {
        date,
        receiptNo,
        accountId: supplierId,
        items: incomingItems.filter(i => i.incomingQty > 0).map(i => ({
          originalJobId: i.jobId,
          originalJobItemId: i.id,
          stockId: i.stockId,
          qty: i.incomingQty,
          price: i.price
        }))
      };
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
    }
    
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-skel-dark/80 backdrop-blur-3xl"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl layer-3d rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-skel-metal/10 flex justify-between items-center bg-skel-matte/5 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-focus-neon/10 text-focus-neon flex items-center justify-center shadow-lg shadow-focus-neon/5">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-text-primary tracking-tighter">İş Emri Sihirbazı</h2>
                <p className="label-mono text-[10px] mt-0.5">
                  {step === 0 ? 'Senaryo Seçimi' : `Adım ${step} / 3: ${step === 1 ? 'Genel Bilgiler' : step === 2 ? 'Kalem Girişi' : 'Özet ve Onay'}`}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-skel-matte/10 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          {step > 0 && (
            <div className="h-1 bg-border w-full shrink-0">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: '33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {step === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full items-center"
              >
                <button 
                  onClick={() => handleScenarioSelect('OUTGOING')}
                  className="h-64 rounded-3xl border border-skel-metal/10 bg-skel-matte/5 hover:bg-skel-matte/10 hover:border-amber-500/30 transition-all flex flex-col items-center justify-center gap-6 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-24 h-24 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/5">
                    <ArrowUpRight size={48} />
                  </div>
                  <div className="text-center px-6">
                    <h3 className="text-xl font-display font-black text-text-primary mb-2 tracking-tight">Ürün Gidişi</h3>
                    <p className="label-mono text-[10px] opacity-60">Tedarikçiye işlem için ürün gönderimi</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleScenarioSelect('INCOMING')}
                  className="h-64 rounded-3xl border border-skel-metal/10 bg-skel-matte/5 hover:bg-skel-matte/10 hover:border-emerald-500/30 transition-all flex flex-col items-center justify-center gap-6 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/5">
                    <ArrowDownRight size={48} />
                  </div>
                  <div className="text-center px-6">
                    <h3 className="text-xl font-display font-black text-text-primary mb-2 tracking-tight">Ürün Gelişi</h3>
                    <p className="label-mono text-[10px] opacity-60">Tedarikçiden işlem görmüş ürün kabulü</p>
                  </div>
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {scenario === 'INCOMING' ? (
                  <div className="space-y-3 shrink-0">
                    <label className="label-mono text-[10px] flex items-center gap-2 ml-1">
                      <FileText size={14} className="text-accent" /> Açık İş Emri Seçin
                    </label>
                    <select 
                      value={selectedJobId}
                      onChange={(e) => handleJobSelect(e.target.value)}
                      className="os-input w-full py-4 text-sm font-bold"
                    >
                      <option value="" disabled>İş Emri Seçin...</option>
                      {openJobs.map(job => (
                        <option key={job.id} value={job.id}>
                          {job.receipt_no} - {job.supplier_name} ({new Date(job.date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="label-mono text-[10px] flex items-center gap-2 ml-1">
                          <Calendar size={14} className="text-accent" /> Tarih
                        </label>
                        <input 
                          type="date" 
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="os-input w-full py-4 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="label-mono text-[10px] flex items-center gap-2 ml-1">
                          <FileText size={14} className="text-accent" /> Fiş Numarası
                        </label>
                        <input 
                          type="text" 
                          value={receiptNo}
                          onChange={(e) => setReceiptNo(e.target.value)}
                          className="os-input w-full py-4 text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="label-mono text-[10px] flex items-center gap-2 ml-1">
                        <User size={14} className="text-accent" /> Tedarikçi (Cari)
                      </label>
                      <select 
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                        className="os-input w-full py-4 text-sm font-bold"
                      >
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {step === 2 && scenario === 'OUTGOING' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex flex-col h-full"
              >
                  <div className="flex flex-col sm:flex-row gap-4 items-end shrink-0">
                    <div className="space-y-2 flex-1 w-full">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                        <Package size={14} /> Stok Seçimi
                      </label>
                      <select 
                        value={currentStockId}
                        onChange={(e) => setCurrentStockId(e.target.value)}
                        className="os-input w-full"
                      >
                        {stocks.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 w-full sm:w-28 shrink-0">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Miktar</label>
                      <input 
                        type="number" 
                        min="1"
                        value={currentQty}
                        onChange={(e) => setCurrentQty(e.target.value ? Number(e.target.value) : '')}
                        className="os-input w-full text-right"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2 w-full sm:w-32 shrink-0">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1"><DollarSign size={12}/> Fiyat</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value ? Number(e.target.value) : '')}
                        className="os-input w-full text-right"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={handleAddItem}
                        disabled={!currentStockId || !currentQty || Number(currentQty) <= 0}
                        className={`os-btn flex-1 sm:flex-none h-[42px] disabled:opacity-50 disabled:cursor-not-allowed ${editingItemId ? 'bg-blue-600 text-white border-transparent' : 'os-btn-primary'}`}
                      >
                        {editingItemId ? <Save size={18} /> : <Plus size={18} />}
                        {editingItemId ? 'Güncelle' : 'Ekle'}
                      </button>
                      {editingItemId && (
                        <button 
                          onClick={handleCancelItemEdit}
                          className="os-btn os-btn-secondary h-[42px]"
                          title="Vazgeç"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                <div className="flex-1 border border-border rounded-2xl overflow-hidden bg-bg-app/30 flex flex-col min-h-[250px]">
                  <div className="p-4 border-b border-border bg-bg-app/50 flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Eklenen Kalemler ({items.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-text-secondary/50 text-sm gap-2">
                        <Package size={32} className="opacity-20" />
                        <p className="font-medium">Henüz kalem eklenmedi.</p>
                      </div>
                    ) : (
                      items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-bg-card border border-border group hover:border-border-strong transition-all shadow-sm">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-lg bg-bg-app flex items-center justify-center text-xs font-bold text-text-secondary border border-border">
                              {index + 1}
                            </span>
                            <div>
                              <span className="text-text-primary font-bold block">{item.stockName}</span>
                              <span className="text-[10px] text-text-secondary font-mono">₺{item.price.toFixed(2)} / birim</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-accent font-mono font-bold text-sm bg-bg-app px-3 py-1 rounded-lg border border-border">{item.qty} Adet</span>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleEditItem(item)}
                                className="text-text-secondary hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Düzenle"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-text-secondary hover:text-rose-600 transition-colors p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                title="Sil"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && scenario === 'INCOMING' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex flex-col h-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} /> Geliş Tarihi
                    </label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="os-input w-full py-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} /> Geliş Fiş Numarası
                    </label>
                    <input 
                      type="text" 
                      value={receiptNo}
                      onChange={(e) => setReceiptNo(e.target.value)}
                      className="os-input w-full py-3"
                    />
                  </div>
                </div>

                {selectedJobId && (
                  <div className="flex-1 border border-border rounded-2xl overflow-hidden bg-bg-app/30 flex flex-col min-h-[250px]">
                    <div className="p-4 border-b border-border bg-bg-app/50 flex justify-between items-center shrink-0">
                      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Gelen Miktarları Girin</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {incomingItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary/50 text-sm gap-2">
                          <Package size={32} className="opacity-20" />
                          <p className="font-medium">Bu iş emrinde bekleyen kalem bulunmuyor.</p>
                        </div>
                      ) : (
                        incomingItems.map((item, index) => (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-bg-card border border-border gap-4 shadow-sm">
                            <div className="flex items-center gap-4">
                              <span className="w-8 h-8 rounded-lg bg-bg-app flex items-center justify-center text-xs font-bold text-text-secondary border border-border shrink-0">
                                {index + 1}
                              </span>
                              <div>
                                <span className="text-text-primary font-bold block">{item.stockName}</span>
                                <span className="text-[10px] text-text-secondary font-medium">Bekleyen: {item.qty - item.receivedQty} Adet</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 self-end sm:self-auto">
                              <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Gelen:</label>
                                <input 
                                  type="number"
                                  min="0"
                                  max={item.qty - item.receivedQty}
                                  value={item.incomingQty || ''}
                                  onChange={(e) => handleIncomingQtyChange(item.id, Number(e.target.value))}
                                  className="os-input w-28 text-right font-bold"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl border border-border bg-bg-app/30 space-y-6">
                  <h3 className="text-lg font-bold text-text-primary border-b border-border pb-4 flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${scenario === 'OUTGOING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {scenario === 'OUTGOING' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    {scenario === 'OUTGOING' ? 'İş Emri Özeti (Gidiş)' : 'İş Emri Özeti (Geliş)'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Tarih</p>
                      <p className="text-text-primary font-bold">{new Date(date).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Fiş Numarası</p>
                      <p className="text-text-primary font-mono font-bold">{receiptNo}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Tedarikçi (Cari)</p>
                      <p className="text-text-primary font-bold text-lg">
                        {scenario === 'OUTGOING' 
                          ? suppliers.find(s => s.id === supplierId)?.name 
                          : openJobs.find(j => j.id === selectedJobId)?.supplier_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <Package size={14} />
                    İşlenecek Kalemler ({scenario === 'OUTGOING' ? items.length : incomingItems.filter(i => i.incomingQty > 0).length})
                  </h4>
                  <div className="border border-border rounded-2xl overflow-hidden bg-bg-card shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-bg-app/50 border-b border-border">
                        <tr className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                          <th className="p-4">Stok</th>
                          {scenario === 'OUTGOING' && <th className="p-4 text-right">Fiyat</th>}
                          <th className="p-4 text-right">Miktar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {scenario === 'OUTGOING' ? items.map((item) => (
                          <tr key={item.id} className="hover:bg-bg-app/30 transition-colors">
                            <td className="p-4 text-text-primary font-bold">{item.stockName}</td>
                            <td className="p-4 text-right text-text-secondary font-mono font-medium">₺{item.price.toFixed(2)}</td>
                            <td className="p-4 text-right font-mono font-bold text-amber-600">{item.qty}</td>
                          </tr>
                        )) : incomingItems.filter(i => i.incomingQty > 0).map((item) => (
                          <tr key={item.id} className="hover:bg-bg-app/30 transition-colors">
                            <td className="p-4 text-text-primary font-bold">{item.stockName}</td>
                            <td className="p-4 text-right font-mono font-bold text-emerald-600">+{item.incomingQty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {step > 0 && (
            <div className="p-6 border-t border-skel-metal/10 bg-skel-matte/5 flex justify-between items-center shrink-0">
              <button 
                onClick={() => setStep(step - 1)}
                className="os-btn os-btn-secondary"
              >
                <ChevronLeft size={18} />
                Geri
              </button>

              {step < 3 ? (
                <button 
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && scenario === 'OUTGOING' && !supplierId) || 
                    (step === 1 && scenario === 'INCOMING' && !selectedJobId) ||
                    (step === 2 && scenario === 'OUTGOING' && items.length === 0) ||
                    (step === 2 && scenario === 'INCOMING' && (!selectedJobId || incomingItems.filter(i => i.incomingQty > 0).length === 0))
                  }
                  className="os-btn os-btn-primary px-10"
                >
                  İleri
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  className="os-btn bg-grow-main text-pure-white hover:bg-grow-main/90 px-10 shadow-lg shadow-grow-main/20"
                >
                  <Save size={18} />
                  Kaydet ve Onayla
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
