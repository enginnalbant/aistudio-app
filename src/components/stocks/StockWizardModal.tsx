import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Save,
  Package,
  FileUp,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Trash2,
  Edit2,
  DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StockWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stocks: any[]) => void;
  initialScenario?: 'MANUAL' | 'BULK' | null;
  editingStock?: any | null;
}

interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  barcode?: string;
  brand?: string;
  model?: string;
  purchasePrice?: number;
  salePrice?: number;
  taxRate?: number;
  location?: string;
  description?: string;
}

export function StockWizardModal({ isOpen, onClose, onSave, initialScenario, editingStock }: StockWizardModalProps) {
  const [scenario, setScenario] = useState<'MANUAL' | 'BULK' | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (editingStock) {
        setScenario('MANUAL');
        setStep(1);
        setManualStock({
          id: editingStock.id,
          code: editingStock.code,
          name: editingStock.name,
          category: editingStock.category,
          unit: editingStock.unit,
          minStock: editingStock.critical_level,
          barcode: editingStock.barcode || '',
          brand: editingStock.brand || '',
          model: editingStock.model || '',
          purchasePrice: editingStock.purchase_price || 0,
          salePrice: editingStock.sale_price || 0,
          taxRate: editingStock.tax_rate || 18,
          location: editingStock.location || '',
          description: editingStock.description || ''
        });
      } else if (initialScenario) {
        setScenario(initialScenario);
        setStep(1);
        resetManualStock();
      } else {
        setScenario(null);
        setStep(0);
        resetManualStock();
      }
      setManualStep(1);
    }
  }, [isOpen, initialScenario, editingStock]);

  const resetManualStock = () => {
    setManualStock({
      code: `STK-${Math.floor(Math.random() * 10000)}`,
      name: '',
      category: 'Mamul',
      unit: 'Adet',
      minStock: 0,
      barcode: '',
      brand: '',
      model: '',
      purchasePrice: 0,
      salePrice: 0,
      taxRate: 18,
      location: '',
      description: ''
    });
  };
  
  // Manual Form State
  const [manualStock, setManualStock] = useState<Partial<StockItem>>({
    code: `STK-${Math.floor(Math.random() * 10000)}`,
    name: '',
    category: 'Mamul',
    unit: 'Adet',
    minStock: 0,
    barcode: '',
    brand: '',
    model: '',
    purchasePrice: 0,
    salePrice: 0,
    taxRate: 18,
    location: '',
    description: ''
  });
  const [manualStep, setManualStep] = useState(1); // Sub-steps for manual entry

  // Bulk State
  const [bulkItems, setBulkItems] = useState<StockItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScenarioSelect = (type: 'MANUAL' | 'BULK') => {
    setScenario(type);
    setStep(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      
      const mapped = json.map((row: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        code: row['Stok Kodu'] || row['Code'] || `STK-${Math.floor(Math.random() * 10000)}`,
        name: row['Stok Adı'] || row['Name'] || 'İsimsiz Stok',
        category: row['Kategori'] || row['Category'] || 'Genel',
        unit: row['Birim'] || row['Unit'] || 'Adet',
        minStock: Number(row['Min Stok'] || row['Min Stock']) || 0,
        barcode: row['Barkod'] || row['Barcode'] || '',
        brand: row['Marka'] || row['Brand'] || '',
        model: row['Model'] || '',
        purchasePrice: Number(row['Alış Fiyatı'] || row['Purchase Price']) || 0,
        salePrice: Number(row['Satış Fiyatı'] || row['Sale Price']) || 0,
        taxRate: Number(row['KDV'] || row['Tax Rate']) || 18,
        location: row['Konum'] || row['Location'] || '',
        description: row['Açıklama'] || row['Description'] || ''
      }));
      
      setBulkItems(mapped);
      setStep(2);
    };
    reader.readAsBinaryString(file);
  };

  const handleManualSave = async () => {
    if (manualStock.name && manualStock.code) {
      try {
        const url = editingStock ? `/api/stocks/${editingStock.id}` : '/api/stocks';
        const method = editingStock ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: manualStock.code,
            name: manualStock.name,
            category: manualStock.category,
            unit: manualStock.unit,
            critical_level: manualStock.minStock,
            barcode: manualStock.barcode,
            brand: manualStock.brand,
            model: manualStock.model,
            purchase_price: manualStock.purchasePrice,
            sale_price: manualStock.salePrice,
            tax_rate: manualStock.taxRate,
            location: manualStock.location,
            description: manualStock.description
          })
        });
        
        if (response.ok) {
          onSave([]); // Trigger refresh
          onClose();
        }
      } catch (error) {
        console.error('Error saving stock:', error);
      }
    }
  };

  const handleBulkSave = () => {
    if (bulkItems.length > 0) {
      onSave(bulkItems);
      onClose();
    }
  };

  const reset = () => {
    setScenario(null);
    setStep(0);
    setManualStock({
      code: `STK-${Math.floor(Math.random() * 10000)}`,
      name: '',
      category: 'Mamul',
      unit: 'Adet',
      minStock: 0
    });
    setBulkItems([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-text-primary tracking-tighter">Stok Sihirbazı</h2>
                <p className="label-mono text-[10px] mt-0.5">
                  {step === 0 ? 'Yöntem Seçimi' : scenario === 'MANUAL' ? 'Manuel Stok Girişi' : 'Dosyadan İçe Aktar'}
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

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full items-center py-10">
                <button 
                  onClick={() => handleScenarioSelect('MANUAL')}
                  className="h-64 rounded-3xl border border-skel-metal/10 bg-skel-matte/5 hover:bg-skel-matte/10 hover:border-focus-neon/30 transition-all flex flex-col items-center justify-center gap-6 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-24 h-24 rounded-3xl bg-focus-neon/10 flex items-center justify-center text-focus-neon group-hover:scale-110 transition-transform shadow-lg shadow-focus-neon/5">
                    <Edit2 size={48} />
                  </div>
                  <div className="text-center px-6">
                    <h3 className="text-xl font-display font-black text-text-primary mb-2 tracking-tight">Manuel Giriş</h3>
                    <p className="label-mono text-[10px] opacity-60">Tek tek stok kartı oluşturun</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleScenarioSelect('BULK')}
                  className="h-64 rounded-3xl border border-skel-metal/10 bg-skel-matte/5 hover:bg-skel-matte/10 hover:border-grow-main/30 transition-all flex flex-col items-center justify-center gap-6 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-24 h-24 rounded-3xl bg-grow-main/10 flex items-center justify-center text-grow-main group-hover:scale-110 transition-transform shadow-lg shadow-grow-main/5">
                    <FileUp size={48} />
                  </div>
                  <div className="text-center px-6">
                    <h3 className="text-xl font-display font-black text-text-primary mb-2 tracking-tight">Toplu İçe Aktar</h3>
                    <p className="label-mono text-[10px] opacity-60">Excel veya CSV dosyasından yükleyin</p>
                  </div>
                </button>
              </div>
            )}

            {step === 1 && scenario === 'MANUAL' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Manual Entry Progress */}
                <div className="flex items-center justify-between mb-8 px-4">
                  {[
                    { s: 1, label: 'Genel Bilgiler' },
                    { s: 2, label: 'Fiyatlandırma' },
                    { s: 3, label: 'Detaylar' }
                  ].map((item) => (
                    <div key={item.s} className="flex flex-col items-center gap-2 relative flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        manualStep >= item.s ? 'bg-focus-neon text-skel-dark' : 'bg-skel-matte/20 text-skel-metal'
                      }`}>
                        {item.s}
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${
                        manualStep >= item.s ? 'text-skel-glass' : 'text-skel-matte'
                      }`}>{item.label}</span>
                      {item.s < 3 && (
                        <div className={`absolute top-4 left-[60%] w-[80%] h-[1px] ${
                          manualStep > item.s ? 'bg-focus-neon' : 'bg-skel-matte/30'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {manualStep === 1 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Stok Kodu</label>
                        <input 
                          type="text" 
                          value={manualStock.code}
                          onChange={(e) => setManualStock({...manualStock, code: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Stok Adı</label>
                        <input 
                          type="text" 
                          value={manualStock.name}
                          onChange={(e) => setManualStock({...manualStock, name: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="Örn: Metal Boru 20mm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Kategori</label>
                        <select 
                          value={manualStock.category}
                          onChange={(e) => setManualStock({...manualStock, category: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all appearance-none"
                        >
                          <option value="Mamul">Mamul</option>
                          <option value="Yarı Mamul">Yarı Mamul</option>
                          <option value="Hammadde">Hammadde</option>
                          <option value="Hizmet">Hizmet</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Birim</label>
                        <select 
                          value={manualStock.unit}
                          onChange={(e) => setManualStock({...manualStock, unit: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all appearance-none"
                        >
                          <option value="Adet">Adet</option>
                          <option value="Kg">Kg</option>
                          <option value="Metre">Metre</option>
                          <option value="Paket">Paket</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Min. Stok Seviyesi</label>
                        <input 
                          type="number" 
                          value={manualStock.minStock}
                          onChange={(e) => setManualStock({...manualStock, minStock: Number(e.target.value)})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {manualStep === 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Alış Fiyatı (₺)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3.5 text-skel-matte" size={16} />
                          <input 
                            type="number" 
                            step="0.01"
                            value={manualStock.purchasePrice}
                            onChange={(e) => setManualStock({...manualStock, purchasePrice: Number(e.target.value)})}
                            className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Satış Fiyatı (₺)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3.5 text-skel-matte" size={16} />
                          <input 
                            type="number" 
                            step="0.01"
                            value={manualStock.salePrice}
                            onChange={(e) => setManualStock({...manualStock, salePrice: Number(e.target.value)})}
                            className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">KDV Oranı (%)</label>
                        <select 
                          value={manualStock.taxRate}
                          onChange={(e) => setManualStock({...manualStock, taxRate: Number(e.target.value)})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all appearance-none"
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {manualStep === 3 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Barkod</label>
                        <input 
                          type="text" 
                          value={manualStock.barcode}
                          onChange={(e) => setManualStock({...manualStock, barcode: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="EAN-13 / UPC"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Depo Konumu</label>
                        <input 
                          type="text" 
                          value={manualStock.location}
                          onChange={(e) => setManualStock({...manualStock, location: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="Raf A-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Marka</label>
                        <input 
                          type="text" 
                          value={manualStock.brand}
                          onChange={(e) => setManualStock({...manualStock, brand: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-skel-metal">Model</label>
                        <input 
                          type="text" 
                          value={manualStock.model}
                          onChange={(e) => setManualStock({...manualStock, model: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-skel-metal">Açıklama</label>
                      <textarea 
                        value={manualStock.description}
                        onChange={(e) => setManualStock({...manualStock, description: e.target.value})}
                        rows={3}
                        className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 1 && scenario === 'BULK' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center py-12"
              >
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) processFile(file);
                  }}
                  className={`w-full max-w-md aspect-video border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
                    isDragging ? 'border-grow-main bg-grow-main/5 scale-105' : 'border-skel-matte/20 bg-skel-matte/10 hover:bg-skel-matte/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-grow-main/10 flex items-center justify-center text-grow-main">
                    <UploadCloud size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-skel-glass font-bold">Dosyayı Buraya Sürükleyin</p>
                    <p className="text-sm text-skel-metal mt-1">veya tıklayarak dosya seçin</p>
                  </div>
                  <p className="text-[10px] text-skel-matte uppercase tracking-widest mt-4">XLSX, XLS veya CSV</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".xlsx,.xls,.csv"
                />
                
                <div className="mt-8 p-4 rounded-xl bg-nrg-sun/10 border border-nrg-sun/20 flex gap-3 max-w-md">
                  <AlertCircle size={20} className="text-nrg-sun shrink-0" />
                  <p className="text-xs text-nrg-sun/90 leading-relaxed">
                    Dosyanızda <strong>Stok Kodu, Stok Adı, Kategori, Birim</strong> ve <strong>Min Stok</strong> sütunlarının bulunduğundan emin olun.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && scenario === 'BULK' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 flex flex-col h-full"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-skel-glass">Yüklenecek Kayıtlar ({bulkItems.length})</h3>
                  <button 
                    onClick={() => { setBulkItems([]); setStep(1); }}
                    className="text-xs text-crit-vivid hover:underline"
                  >
                    Dosyayı Değiştir
                  </button>
                </div>
                
                <div className="flex-1 border border-skel-matte/20 rounded-xl overflow-hidden bg-skel-space/20">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-skel-space/50 border-b border-skel-matte/20">
                      <tr>
                        <th className="p-3 font-medium text-skel-metal">Kod</th>
                        <th className="p-3 font-medium text-skel-metal">Ad</th>
                        <th className="p-3 font-medium text-skel-metal">Kategori</th>
                        <th className="p-3 font-medium text-skel-metal">Birim</th>
                        <th className="p-3 font-medium text-skel-metal text-right">Min</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bulkItems.slice(0, 50).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 text-skel-glass font-mono">{item.code}</td>
                          <td className="p-3 text-skel-glass">{item.name}</td>
                          <td className="p-3 text-skel-metal">{item.category}</td>
                          <td className="p-3 text-skel-metal">{item.unit}</td>
                          <td className="p-3 text-right text-skel-metal">{item.minStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bulkItems.length > 50 && (
                    <div className="p-3 text-center text-[10px] text-skel-matte border-t border-skel-matte/20">
                      ve {bulkItems.length - 50} kayıt daha...
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {step > 0 && (
            <div className="p-6 border-t border-skel-metal/10 bg-skel-matte/5 flex justify-between items-center shrink-0">
              <button 
                onClick={() => {
                  if (scenario === 'MANUAL' && manualStep > 1) {
                    setManualStep(manualStep - 1);
                  } else {
                    if (step === 1) setStep(0);
                    else if (step === 2) setStep(1);
                  }
                }}
                className="os-btn os-btn-secondary"
              >
                <ChevronLeft size={18} />
                Geri
              </button>

              {scenario === 'MANUAL' ? (
                manualStep < 3 ? (
                  <button 
                    onClick={() => setManualStep(manualStep + 1)}
                    disabled={manualStep === 1 && !manualStock.name}
                    className="os-btn os-btn-primary px-10"
                  >
                    İleri
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={handleManualSave}
                    disabled={!manualStock.name}
                    className="os-btn os-btn-primary px-10"
                  >
                    <Save size={18} />
                    Stok Kartını Oluştur
                  </button>
                )
              ) : step === 2 ? (
                <button 
                  onClick={handleBulkSave}
                  className="os-btn bg-grow-main text-pure-white hover:bg-grow-main/90 px-10 shadow-lg shadow-grow-main/20"
                >
                  <CheckCircle2 size={18} />
                  {bulkItems.length} Kaydı İçe Aktar
                </button>
              ) : null}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
