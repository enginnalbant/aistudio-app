import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Building2, Save, CheckCircle2, ArrowRight, ShoppingCart, Info, Package, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface PurchasingQuotesWizardProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export function PurchasingQuotesWizard({ onClose, onSave }: PurchasingQuotesWizardProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [plans, setPlans] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    notes: '',
    items: [] as any[]
  });

  useEffect(() => {
    fetch('/api/purchase-plans')
      .then(res => res.json())
      .then(data => {
        setPlans(Array.isArray(data) ? data.filter((p: any) => p.status !== 'ordered' && p.status !== 'cancelled') : []);
      })
      .catch(() => setPlans([]));
      
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(Array.isArray(data) ? data.filter((a: any) => a.type === 'supplier') : []))
      .catch(() => setAccounts([]));
  }, []);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setFormData({
      supplier_id: '',
      notes: '',
      items: plan.items.map((i: any) => ({
        stock_id: i.stock_id,
        stock_name: i.stock_name,
        stock_code: i.stock_code,
        unit: i.unit,
        qty: i.qty,
        price: 0
      }))
    });
    setStep(2);
  };

  const handleUpdatePrice = (stockId: string, price: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => i.stock_id === stockId ? { ...i, price } : i)
    }));
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await onSave({
        plan_id: selectedPlan.id,
        date: new Date().toISOString().split('T')[0],
        ...formData
      });
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

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.qty * (item.price || 0)), 0);
  const filteredPlans = plans.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()));

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
              <FileText className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fiyat Teklifi Sihirbazı</h2>
              <p className="text-slate-500 text-sm font-medium">Planlarınız için tedarikçilerden aldığınız fiyatları girin.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-all p-2 hover:bg-slate-100 rounded-xl">
            <X size={24} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-4 bg-white border-b border-slate-50 flex items-center gap-4 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { step: 1, label: 'Plan Seçimi', icon: Package },
            { step: 2, label: 'Fiyat Girişi', icon: Building2 },
            { step: 3, label: 'Özet & Kayıt', icon: Save }
          ].map((s, idx) => (
            <div key={s.step} className="flex items-center gap-4 shrink-0">
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
                  <h3 className="text-3xl font-black text-slate-900">Teklif Başarıyla Kaydedildi!</h3>
                  <p className="text-slate-500 text-lg font-medium">Fiyat teklifi sisteme eklendi ve karşılaştırmaya hazır.</p>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Info size={20} className="text-indigo-500" />
                    Aktif Satınalma Planları
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Plan Ara..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlans.length === 0 ? (
                    <div className="col-span-full p-12 text-center bg-white border border-slate-200 border-dashed rounded-3xl">
                      <Package size={48} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-500 font-medium">Bekleyen satınalma planı bulunamadı.</p>
                    </div>
                  ) : (
                    filteredPlans.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan)}
                        className="flex flex-col text-left bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start w-full mb-4">
                          <div>
                            <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{plan.title}</h4>
                            <div className="text-xs font-mono text-slate-400 mt-1">{plan.id}</div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <ArrowRight size={20} />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><Package size={16} /> {plan.item_count} Kalem</span>
                          <span className="flex items-center gap-1.5">
                            <div className={clsx(
                              "w-2 h-2 rounded-full",
                              plan.status === 'confirmed' ? "bg-emerald-500" : "bg-amber-500"
                            )} />
                            {plan.status === 'confirmed' ? 'Onaylı' : 'Taslak'}
                          </span>
                        </div>
                      </button>
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
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tedarikçi (Cari Hesap)</label>
                  <select
                    value={formData.supplier_id}
                    onChange={e => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Tedarikçi Seçiniz...</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Package size={20} className="text-indigo-500" />
                      Kalem Fiyatları
                    </h3>
                    <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                      Ara Toplam: {totalAmount.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, idx) => (
                      <div key={item.stock_id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                        <div className="flex-1">
                          <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">KALEM #{idx + 1}</div>
                          <div className="font-bold text-slate-900">{item.stock_name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{item.stock_code}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Miktar</div>
                            <div className="font-black text-slate-700">{item.qty} {item.unit}</div>
                          </div>
                          <div className="w-px h-10 bg-slate-200 hidden sm:block" />
                          <div className="w-full sm:w-48">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Birim Fiyat (₺)</label>
                            <input
                              type="number"
                              min="0"
                              value={item.price || ''}
                              onChange={e => handleUpdatePrice(item.stock_id, Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all text-right"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6">
                        <Info size={24} className="text-indigo-600" />
                        Teklif Özeti
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plan</div>
                            <div className="font-black text-slate-900">{selectedPlan?.title}</div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tedarikçi</div>
                            <div className="font-black text-slate-900">
                              {accounts.find(a => a.id === formData.supplier_id)?.name || 'Seçilmedi'}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700">Teklif Notları</label>
                          <textarea
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 h-32 resize-none font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                            placeholder="Tedarikçinin ilettiği özel şartlar, teslimat süreleri vb..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-6">Fiyat Özeti</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium opacity-80">Toplam Kalem:</span>
                          <span className="text-lg font-black">{formData.items.length} Adet</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-widest opacity-60">Toplam Tutar</span>
                          <div className="text-3xl font-black">{totalAmount.toLocaleString('tr-TR')} ₺</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Fiyatlandırılan Kalemler</h4>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {formData.items.map(item => (
                          <div key={item.stock_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">{item.stock_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.qty} {item.unit} x {item.price} ₺</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] font-black text-indigo-600">{(item.qty * item.price).toLocaleString('tr-TR')} ₺</div>
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
                  disabled={step === 1 ? !selectedPlan : step === 2 ? !formData.supplier_id : false}
                  className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                  Sonraki Adım
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Teklifi Kaydet
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
