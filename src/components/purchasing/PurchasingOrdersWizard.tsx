import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, Building2, Save, CheckCircle2, ArrowRight, ShoppingCart, Info, Package, Search, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface PurchasingOrdersWizardProps {
  onClose: () => void;
  onSave: () => void;
}

export function PurchasingOrdersWizard({ onClose, onSave }: PurchasingOrdersWizardProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [plans, setPlans] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedBids, setSelectedBids] = useState<Record<string, { quote_id: string, supplier_id: string, price: number }>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/purchase-plans').then(res => res.json()),
      fetch('/api/purchase-quotes').then(res => res.json()),
      fetch('/api/accounts').then(res => res.json())
    ]).then(([plansData, quotesData, accountsData]) => {
      const validQuotes = Array.isArray(quotesData) ? quotesData : [];
      setQuotes(validQuotes);
      
      // Sadece teklif girilmiş ve henüz siparişe dönüşmemiş planları listele
      const validPlans = Array.isArray(plansData) ? plansData.filter((p: any) => {
        const hasQuotes = validQuotes.some(q => q.plan_id === p.id);
        return hasQuotes && p.status !== 'ordered' && p.status !== 'cancelled';
      }) : [];
      setPlans(validPlans);
      
      setAccounts(Array.isArray(accountsData) ? accountsData.filter((a: any) => a.type === 'supplier') : []);
    });
  }, []);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    
    // Otomatik olarak en düşük fiyatları seç
    const planQuotes = quotes.filter(q => q.plan_id === plan.id);
    const initialBids: Record<string, any> = {};
    
    plan.items.forEach((item: any) => {
      let lowestPrice = Infinity;
      let bestBid = null;
      
      planQuotes.forEach(q => {
        const qi = q.items.find((i: any) => i.stock_id === item.stock_id);
        if (qi && qi.price > 0 && qi.price < lowestPrice) {
          lowestPrice = qi.price;
          bestBid = { quote_id: q.id, supplier_id: q.supplier_id, price: qi.price };
        }
      });
      
      if (bestBid) {
        initialBids[item.stock_id] = bestBid;
      }
    });
    
    setSelectedBids(initialBids);
    setStep(2);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    
    const ordersBySupplier: Record<string, any> = {};
    
    Object.entries(selectedBids).forEach(([stockId, bid]) => {
      if (!ordersBySupplier[bid.supplier_id]) {
        ordersBySupplier[bid.supplier_id] = {
          supplier_id: bid.supplier_id,
          notes: `Plan: ${selectedPlan.title} istinaden oluşturuldu.`,
          items: []
        };
      }
      
      const planItem = selectedPlan.items.find((i: any) => i.stock_id === stockId);
      if (planItem) {
        ordersBySupplier[bid.supplier_id].items.push({
          stock_id: stockId,
          qty: planItem.qty,
          price: bid.price
        });
      }
    });

    const orders = Object.values(ordersBySupplier);

    try {
      const response = await fetch('/api/purchase-orders/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          orders
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        onSave();
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating orders:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPlans = plans.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()));
  const planQuotes = selectedPlan ? quotes.filter(q => q.plan_id === selectedPlan.id) : [];

  // Sipariş özeti için gruplama
  const summaryOrders = Object.values(selectedBids).reduce((acc: any, bid: any) => {
    if (!acc[bid.supplier_id]) {
      acc[bid.supplier_id] = {
        supplier_name: accounts.find(a => a.id === bid.supplier_id)?.name || 'Bilinmeyen Tedarikçi',
        items: [],
        total: 0
      };
    }
    const planItem = selectedPlan?.items.find((i: any) => i.stock_id === Object.keys(selectedBids).find(k => selectedBids[k] === bid));
    if (planItem) {
      acc[bid.supplier_id].items.push(planItem);
      acc[bid.supplier_id].total += (planItem.qty * bid.price);
    }
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShoppingCart className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sipariş Oluşturma Sihirbazı</h2>
              <p className="text-slate-500 text-sm font-medium">Teklifleri karşılaştırın ve en uygun tedarikçilere sipariş geçin.</p>
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
            { step: 2, label: 'Teklif Değerlendirme', icon: Building2 },
            { step: 3, label: 'Sipariş Özeti', icon: Truck }
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
                  <h3 className="text-3xl font-black text-slate-900">Siparişler Başarıyla Oluşturuldu!</h3>
                  <p className="text-slate-500 text-lg font-medium">Seçilen tedarikçilere göre sipariş fişleri otomatik olarak oluşturuldu.</p>
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
                    Teklif Girilmiş Planlar
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
                      <p className="text-slate-500 font-medium">Siparişe dönüştürülebilecek teklif girilmiş plan bulunamadı.</p>
                    </div>
                  ) : (
                    filteredPlans.map(plan => {
                      const pQuotes = quotes.filter(q => q.plan_id === plan.id);
                      return (
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
                            <span className="flex items-center gap-1.5"><Building2 size={16} /> {pQuotes.length} Teklif</span>
                          </div>
                        </button>
                      );
                    })
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
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-[60vh]">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Building2 size={20} className="text-indigo-500" />
                      Teklif Karşılaştırma Matrisi
                    </h3>
                    <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Info size={14} className="text-indigo-500" />
                      Sistem en düşük fiyatları otomatik seçti. Değiştirmek için fiyatlara tıklayın.
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr>
                          <th className="p-4 border-b-2 border-slate-100 font-black text-slate-400 uppercase tracking-wider text-xs sticky left-0 bg-white z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            Kalem / Miktar
                          </th>
                          {planQuotes.map(quote => (
                            <th key={quote.id} className="p-4 border-b-2 border-slate-100 font-black text-slate-900 text-center min-w-[150px] bg-white sticky top-0 z-0">
                              {quote.supplier_name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPlan.items.map((item: any) => {
                          let lowestPrice = Infinity;
                          planQuotes.forEach(q => {
                            const qi = q.items.find((i: any) => i.stock_id === item.stock_id);
                            if (qi && qi.price < lowestPrice && qi.price > 0) lowestPrice = qi.price;
                          });

                          return (
                            <tr key={item.stock_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                <div className="font-bold text-slate-900">{item.stock_name}</div>
                                <div className="text-xs text-slate-500">{item.qty} {item.unit}</div>
                              </td>
                              {planQuotes.map(quote => {
                                const quoteItem = quote.items.find((i: any) => i.stock_id === item.stock_id);
                                const price = quoteItem?.price || 0;
                                const isLowest = price === lowestPrice && price > 0;
                                const isSelected = selectedBids[item.stock_id]?.quote_id === quote.id;

                                return (
                                  <td key={quote.id} className="p-4 text-center">
                                    {price > 0 ? (
                                      <button
                                        onClick={() => setSelectedBids(prev => ({
                                          ...prev,
                                          [item.stock_id]: { quote_id: quote.id, supplier_id: quote.supplier_id, price }
                                        }))}
                                        className={clsx(
                                          "w-full p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1",
                                          isSelected 
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm" 
                                            : isLowest 
                                              ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300" 
                                              : "border-slate-100 hover:border-slate-300 bg-white"
                                        )}
                                      >
                                        <span className="font-black text-lg">{price.toLocaleString('tr-TR')} ₺</span>
                                        {isLowest && !isSelected && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">En İyi Fiyat</span>}
                                        {isSelected && <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Seçildi</span>}
                                      </button>
                                    ) : (
                                      <span className="text-slate-300 text-sm">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <Truck size={24} className="text-indigo-600" />
                    Oluşturulacak Siparişler
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(summaryOrders).map((order: any, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-lg text-slate-900">{order.supplier_name}</h4>
                            <div className="text-sm text-slate-500">{order.items.length} Kalem</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sipariş Tutarı</div>
                            <div className="text-xl font-black text-indigo-600">{order.total.toLocaleString('tr-TR')} ₺</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-slate-700 font-medium">{item.stock_name}</span>
                              <span className="text-slate-500">{item.qty} {item.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                    <AlertCircle className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-indigo-900 font-medium">
                      Onayladığınızda, yukarıdaki her bir tedarikçi için ayrı ayrı sipariş fişi oluşturulacak ve planın durumu "Sipariş Verildi" olarak güncellenecektir.
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
                  onClick={() => {
                    if (step === 2 && Object.keys(selectedBids).length === 0) {
                      alert('Lütfen en az bir kalem için seçim yapın.');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  disabled={step === 1 ? !selectedPlan : false}
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
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Siparişleri Oluştur
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
