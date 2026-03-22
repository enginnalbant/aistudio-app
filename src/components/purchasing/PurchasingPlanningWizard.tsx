import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Save, Search, AlertCircle, Package, CheckCircle2, ListChecks, ArrowRight, ShoppingCart, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface PurchasingPlanningWizardProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export function PurchasingPlanningWizard({ onClose, onSave }: PurchasingPlanningWizardProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    id: `PLN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    date: new Date().toISOString().split('T')[0],
    title: '',
    status: 'draft',
    notes: '',
    items: [] as any[]
  });

  useEffect(() => {
    // Fetch pending purchase requests
    fetch('/api/purchase-requests')
      .then(res => res.json())
      .then(data => {
        // Filter only pending or approved requests that are not yet fully planned
        setRequests(Array.isArray(data) ? data.filter((r: any) => r.status === 'pending' || r.status === 'approved') : []);
      })
      .catch(() => setRequests([]));
      
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(Array.isArray(data) ? data.filter((a: any) => a.type === 'supplier') : []))
      .catch(() => setAccounts([]));
  }, []);

  const handleSelectItem = (request: any, item: any) => {
    const exists = formData.items.find(i => i.request_item_id === item.id);
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          request_item_id: item.id,
          request_id: request.id,
          stock_id: item.stock_id,
          stock_name: item.stock_name,
          stock_code: item.stock_code,
          unit: item.unit,
          qty: item.qty,
          estimated_price: item.estimated_price || 0,
          supplier_id: item.supplier_id || ''
        }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(i => i.request_item_id !== item.id)
      }));
    }
  };

  const handleUpdateItem = (requestItemId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => i.request_item_id === requestItemId ? { ...i, [field]: value } : i)
    }));
  };

  const handleRemoveItem = (requestItemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.request_item_id !== requestItemId)
    }));
  };

  const handleComplete = async () => {
    setIsSaving(true);
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

  const totalCost = formData.items.reduce((sum, item) => sum + (item.qty * (item.estimated_price || 0)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <ListChecks className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Satınalma Planlama Sihirbazı</h2>
              <p className="text-slate-500 text-sm font-medium">Talepleri birleştirin ve satın alma planınızı oluşturun.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-all p-2 hover:bg-slate-100 rounded-xl">
            <X size={24} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-4 bg-white border-b border-slate-50 flex items-center gap-4 shrink-0">
          {[
            { step: 1, label: 'Talep Seçimi', icon: ShoppingCart },
            { step: 2, label: 'Miktar & Detay', icon: Package },
            { step: 3, label: 'Onay & Kayıt', icon: Save }
          ].map((s, idx) => (
            <div key={s.step} className="flex items-center gap-4">
              <div className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                step === s.step ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105" : 
                step > s.step ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
              )}>
                <s.icon size={18} />
                <span className="text-sm font-bold whitespace-nowrap">{s.label}</span>
              </div>
              {idx < 2 && <ArrowRight size={16} className="text-slate-300" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
              >
                <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-100">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900">Plan Başarıyla Kaydedildi!</h3>
                  <p className="text-slate-500 text-lg font-medium">Satınalma planınız oluşturuldu ve listelendi. {formData.id}</p>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest pt-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Yönlendiriliyorsunuz...
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Info size={20} className="text-indigo-500" />
                    Bekleyen Talepler
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Talep veya Stok Ara..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {requests.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-slate-200 border-dashed rounded-3xl">
                      <Package size={48} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-500 font-medium">Bekleyen satınalma talebi bulunamadı.</p>
                    </div>
                  ) : (
                    requests.map(request => (
                      <div key={request.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">{request.id}</span>
                            <span className="text-sm font-bold text-slate-700">{request.requested_by}</span>
                            <span className="text-xs text-slate-400">{request.department}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{new Date(request.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {request.items.map((item: any) => {
                            const isSelected = formData.items.find(i => i.request_item_id === item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSelectItem(request, item)}
                                className={clsx(
                                  "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                                  isSelected 
                                    ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10" 
                                    : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                                )}
                              >
                                <div className="flex-1">
                                  <div className="font-bold text-slate-900 text-sm">{item.stock_name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.stock_code}</div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-700">{item.qty} {item.unit}</span>
                                    {item.estimated_price > 0 && (
                                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                        {item.estimated_price.toLocaleString('tr-TR')} ₺
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className={clsx(
                                  "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                  isSelected ? "bg-indigo-600 text-white scale-110" : "bg-slate-100 text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                )}>
                                  {isSelected ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Package size={20} className="text-indigo-500" />
                    Plan Listesi ve Detaylar
                  </h3>
                  <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                    Toplam Tahmini Tutar: {totalCost.toLocaleString('tr-TR')} ₺
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, idx) => (
                    <div key={item.request_item_id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group hover:border-indigo-200 transition-all">
                      <button 
                        onClick={() => handleRemoveItem(item.request_item_id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                          <Package size={24} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">KALEM #{idx + 1}</div>
                          <h4 className="text-lg font-bold text-slate-900">{item.stock_name}</h4>
                          <div className="text-xs text-slate-400 font-mono">{item.stock_code} • Kaynak Talep: {item.request_id}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700">Planlanan Miktar ({item.unit})</label>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleUpdateItem(item.request_item_id, 'qty', Math.max(1, item.qty - 1))}
                              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.qty}
                              onChange={e => handleUpdateItem(item.request_item_id, 'qty', Number(e.target.value))}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center font-black text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
                            />
                            <button 
                              onClick={() => handleUpdateItem(item.request_item_id, 'qty', item.qty + 1)}
                              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700">Tahmini Birim Fiyat (₺)</label>
                          <input
                            type="number"
                            value={item.estimated_price}
                            onChange={e => handleUpdateItem(item.request_item_id, 'estimated_price', Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700">Tedarikçi Seçimi</label>
                          <select
                            value={item.supplier_id}
                            onChange={e => handleUpdateItem(item.request_item_id, 'supplier_id', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Tedarikçi Seçiniz...</option>
                            {accounts.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <Info size={24} className="text-indigo-600" />
                        Plan Bilgileri
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700">Plan Başlığı</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-lg font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                            placeholder="Örn: 2024 Mart Hammadde Alımı"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Plan Tarihi</label>
                            <input
                              type="date"
                              value={formData.date}
                              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Başlangıç Durumu</label>
                            <select
                              value={formData.status}
                              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                            >
                              <option value="draft">Taslak</option>
                              <option value="confirmed">Onaylandı</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700">Plan Notları</label>
                          <textarea
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 h-32 resize-none font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                            placeholder="Plan ile ilgili stratejik notlar..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-6">Plan Özeti</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium opacity-80">Toplam Kalem:</span>
                          <span className="text-lg font-black">{formData.items.length} Adet</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium opacity-80">Toplam Miktar:</span>
                          <span className="text-lg font-black">
                            {formData.items.reduce((sum, item) => sum + item.qty, 0)} Birim
                          </span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-widest opacity-60">Toplam Tahmini Bütçe</span>
                          <div className="text-3xl font-black">{totalCost.toLocaleString('tr-TR')} ₺</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Seçili Kalemler</h4>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {formData.items.map(item => (
                          <div key={item.request_item_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">{item.stock_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.qty} {item.unit}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] font-black text-indigo-600">{(item.qty * item.estimated_price).toLocaleString('tr-TR')} ₺</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="p-8 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex gap-3">
              {[1, 2, 3].map(s => (
                <div key={s} className={clsx(
                  "h-1.5 rounded-full transition-all",
                  step === s ? "w-8 bg-indigo-600" : "w-4 bg-slate-100"
                )} />
              ))}
            </div>
            <div className="flex gap-4">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={isSaving}
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Geri Dön
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? formData.items.length === 0 : false}
                  className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                  Sonraki Adım
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSaving || !formData.title}
                  className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Plan Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Planı Tamamla ve Kaydet
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
