import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Save, Search, AlertCircle, Package, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface PurchaseRequestWizardProps {
  onClose: () => void;
  onSave: (data: any) => void;
  initialStockId?: string | null;
}

export function PurchaseRequestWizard({ onClose, onSave, initialStockId }: PurchaseRequestWizardProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    id: `PRQ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    date: new Date().toISOString().split('T')[0],
    requested_by: '',
    department: '',
    priority: 'normal',
    notes: '',
    items: [] as any[]
  });

  const totalCost = formData.items.reduce((sum, item) => sum + (item.qty * (item.estimated_price || 0)), 0);

  const handleAddItem = (stock: any) => {
    if (!formData.items.find(i => i.stock_id === stock.id)) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          stock_id: stock.id,
          stock_name: stock.name,
          stock_code: stock.code,
          unit: stock.unit,
          qty: 1,
          estimated_price: 0,
          supplier_id: ''
        }]
      }));
    }
  };

  const handleRemoveItem = (stockId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.stock_id !== stockId)
    }));
  };

  const handleUpdateItem = (stockId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => i.stock_id === stockId ? { ...i, [field]: value } : i)
    }));
  };

  const handleComplete = async () => {
    setIsSaving(true);
    // Simulate a bit of delay for the "smart" feel
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await onSave(formData);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetch('/api/stocks/summary')
      .then(res => res.json())
      .then(data => {
        const stocksList = Array.isArray(data) ? data : [];
        setStocks(stocksList);
        
        // Handle initial stock pre-selection
        if (initialStockId && stocksList.length > 0) {
          const stock = stocksList.find((s: any) => s.id === initialStockId);
          if (stock) {
            handleAddItem(stock);
            setStep(2); // Jump to item selection step
          }
        }
      })
      .catch(() => setStocks([]));
      
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]));
  }, [initialStockId]);

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Plus className="text-white" size={24} />
              </div>
              Yeni Satınalma Talebi
            </h2>
            <div className="flex items-center gap-2 mt-4 px-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                    step >= s ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {s}
                  </div>
                  {s < 3 && <div className={clsx("w-8 h-0.5 rounded-full", step > s ? "bg-indigo-600" : "bg-slate-200")} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Talep Başarıyla Oluşturuldu!</h3>
                <p className="text-slate-500 font-medium">Talebiniz yönetici onayına gönderildi. PRQ-{formData.id}</p>
              </div>
              <div className="pt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Yönlendiriliyorsunuz...
                </div>
              </div>
            </motion.div>
          ) : step === 1 ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Talep Eden</label>
                  <input
                    type="text"
                    value={formData.requested_by}
                    onChange={e => setFormData(prev => ({ ...prev, requested_by: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                    placeholder="Ad Soyad"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Departman</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                    placeholder="Örn: Üretim, AR-GE"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Öncelik</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="low">Düşük</option>
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Tarih</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Açıklama / Notlar</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all h-32 resize-none placeholder:text-slate-400"
                  placeholder="Talep ile ilgili ek bilgiler..."
                />
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 h-full flex flex-col"
            >
              <div className="flex flex-col md:flex-row gap-6 h-full min-h-[400px]">
                {/* Stock Selection */}
                <div className="w-full md:w-1/3 flex flex-col border-r-0 md:border-r border-slate-100 pr-0 md:pr-6">
                  <div className="mb-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Akıllı Öneriler</h4>
                    <div className="flex flex-wrap gap-2">
                      {stocks.filter(s => s.balance <= s.critical_level).slice(0, 3).map(stock => (
                        <button
                          key={stock.id}
                          onClick={() => handleAddItem(stock)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-1.5"
                        >
                          <AlertCircle size={12} />
                          {stock.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative mb-4 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Stok Ara..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredStocks.map(stock => (
                      <div 
                        key={stock.id}
                        className={clsx(
                          "p-4 rounded-xl border transition-all relative group",
                          formData.items.find(i => i.stock_id === stock.id)
                            ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-semibold">{stock.name}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddItem(stock);
                            }}
                            className={clsx(
                              "p-1.5 rounded-lg transition-all",
                              formData.items.find(i => i.stock_id === stock.id)
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white"
                            )}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-xs opacity-70 flex justify-between mt-2">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{stock.code}</span>
                          <span className={clsx("font-medium", stock.balance <= stock.critical_level ? "text-red-600" : "text-emerald-600")}>
                            Mevcut: {stock.balance} {stock.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Items */}
                <div className="w-full md:w-2/3 flex flex-col">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Package size={20} className="text-indigo-600" />
                      Talep Edilen Kalemler
                    </h3>
                    {formData.items.length > 0 && (
                      <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        Ara Toplam: {totalCost.toLocaleString('tr-TR')} ₺
                      </div>
                    )}
                  </div>
                  {formData.items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                      <AlertCircle size={48} className="mb-4 opacity-20" />
                      <p className="font-medium text-slate-600">Henüz kalem eklenmedi.</p>
                      <p className="text-sm mt-1">Sol taraftan stok seçerek başlayın.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {formData.items.map(item => (
                        <div key={item.stock_id} className="bg-white rounded-xl p-5 border border-slate-200 relative group hover:border-indigo-200 transition-colors shadow-sm">
                          <button 
                            onClick={() => handleRemoveItem(item.stock_id)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg"
                            title="Kaldır"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="font-bold text-slate-900 mb-4 pr-8">
                            {item.stock_name} 
                            <span className="text-xs text-slate-500 ml-3 font-mono bg-slate-100 px-2 py-1 rounded">{item.stock_code}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-600">Miktar ({item.unit})</label>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleUpdateItem(item.stock_id, 'qty', Math.max(1, item.qty - 1))}
                                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={e => handleUpdateItem(item.stock_id, 'qty', Number(e.target.value))}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm text-center font-bold"
                                />
                                <button 
                                  onClick={() => handleUpdateItem(item.stock_id, 'qty', item.qty + 1)}
                                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-600">Tahmini Fiyat (₺)</label>
                              <input
                                type="number"
                                min="0"
                                value={item.estimated_price}
                                onChange={e => handleUpdateItem(item.stock_id, 'estimated_price', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-600">Önerilen Tedarikçi</label>
                              <select
                                value={item.supplier_id}
                                onChange={e => handleUpdateItem(item.stock_id, 'supplier_id', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm appearance-none cursor-pointer"
                              >
                                <option value="">Seçiniz...</option>
                                {(Array.isArray(accounts) ? accounts : []).filter(a => a.type === 'supplier').map(a => (
                                  <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-900">Talep Özeti</h3>
                  <p className="text-sm text-indigo-700 mt-1">Lütfen talebinizi onaylamadan önce detayları kontrol edin.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Genel Bilgiler</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Talep No:</span>
                        <span className="text-sm font-bold text-slate-900">{formData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Talep Eden:</span>
                        <span className="text-sm font-bold text-slate-900">{formData.requested_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Departman:</span>
                        <span className="text-sm font-bold text-slate-900">{formData.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Öncelik:</span>
                        <span className={clsx(
                          "text-xs font-bold px-2 py-0.5 rounded-md uppercase",
                          formData.priority === 'urgent' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                        )}>
                          {formData.priority === 'urgent' ? 'ACİL' : 'NORMAL'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notlar</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{formData.notes}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Kalemler ({formData.items.length})</h4>
                  <div className="flex-1 space-y-3">
                    {formData.items.map(item => (
                      <div key={item.stock_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{item.stock_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.stock_code}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900">{item.qty} {item.unit}</div>
                          <div className="text-[10px] font-bold text-indigo-600">{(item.qty * (item.estimated_price || 0)).toLocaleString('tr-TR')} ₺</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Toplam Tahmini Tutar</span>
                    <span className="text-xl font-black text-indigo-600">
                      {formData.items.reduce((sum, item) => sum + (item.qty * (item.estimated_price || 0)), 0).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {!isSuccess && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={clsx("w-2.5 h-2.5 rounded-full transition-colors", step === s ? "bg-indigo-600" : "bg-slate-200")} />
              ))}
            </div>
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Geri
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? (!formData.requested_by || !formData.department) : formData.items.length === 0}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-200"
                >
                  İleri
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Talebi Tamamla
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
