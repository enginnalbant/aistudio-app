import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Plus, X, CheckCircle2, Package, Save, 
  ArrowRight, Search, TrendingDown, AlertCircle, Building2, ShoppingCart, TrendingUp
} from 'lucide-react';
import { clsx } from 'clsx';
import { PurchasingQuotesWizard } from './PurchasingQuotesWizard';

export function PurchasingQuotes() {
  const [plans, setPlans] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showQuoteWizard, setShowQuoteWizard] = useState(false);

  const fetchData = async () => {
    const [plansRes, quotesRes, accRes] = await Promise.all([
      fetch('/api/purchase-plans'),
      fetch('/api/purchase-quotes'),
      fetch('/api/accounts')
    ]);
    
    const plansData = await plansRes.json();
    const quotesData = await quotesRes.json();
    const accData = await accRes.json();
    
    setPlans(Array.isArray(plansData) ? plansData.filter(p => p.status !== 'ordered' && p.status !== 'cancelled') : []);
    setQuotes(Array.isArray(quotesData) ? quotesData : []);
    setAccounts(Array.isArray(accData) ? accData.filter(a => a.type === 'supplier') : []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveQuote = async (data: any) => {
    try {
      const response = await fetch('/api/purchase-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setShowQuoteWizard(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  const getPlanQuotes = (planId: string) => quotes.filter(q => q.plan_id === planId);

  const stats = [
    { 
      label: 'Bekleyen Planlar', 
      value: plans.length, 
      icon: Package, 
      color: 'bg-indigo-50 text-indigo-600',
    },
    { 
      label: 'Toplam Teklif', 
      value: quotes.length, 
      icon: FileText, 
      color: 'bg-emerald-50 text-emerald-600',
    },
    { 
      label: 'Aktif Tedarikçiler', 
      value: new Set(quotes.map(q => q.supplier_id)).size, 
      icon: Building2, 
      color: 'bg-amber-50 text-amber-600',
    },
    { 
      label: 'En İyi Fiyatlar', 
      value: quotes.reduce((sum, q) => sum + q.items.length, 0), 
      icon: TrendingUp, 
      color: 'bg-blue-50 text-blue-600',
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Fiyat Teklifleri
          </h1>
          <p className="text-slate-500 font-medium text-lg">Planlarınız için tedarikçilerden gelen teklifleri toplayın ve en uygun olanları seçin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowQuoteWizard(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Yeni Teklif Sihirbazı
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={80} />
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className={clsx("p-3 rounded-2xl shadow-sm", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {plans.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aktif Plan Bulunamadı</h3>
            <p className="text-slate-500">Teklif toplamak için önce Satınalma Planlaması sayfasından bir plan oluşturun.</p>
          </div>
        ) : (
          plans.map(plan => {
            const planQuotes = getPlanQuotes(plan.id);
            return (
              <div key={plan.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{plan.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><Package size={16} /> {plan.item_count} Kalem</span>
                      <span className="flex items-center gap-1.5"><Building2 size={16} /> {planQuotes.length} Teklif</span>
                    </div>
                  </div>
                </div>
                
                {planQuotes.length > 0 ? (
                  <div className="p-6 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Alınan Teklifler</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {planQuotes.map(quote => {
                        const total = quote.items.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0);
                        return (
                          <div key={quote.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div className="font-bold text-slate-900">{quote.supplier_name}</div>
                              <div className="text-xs text-slate-400">{new Date(quote.date).toLocaleDateString('tr-TR')}</div>
                            </div>
                            <div className="text-2xl font-black text-indigo-600">{total.toLocaleString('tr-TR')} ₺</div>
                            <div className="text-xs text-slate-500 mt-1">{quote.items.length} kalem için fiyat verildi.</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50/50 text-center text-slate-500 text-sm font-medium">
                    Henüz bu plan için teklif girilmemiş. Sağ üstteki butondan yeni teklif girebilirsiniz.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quote Entry Wizard */}
      <AnimatePresence>
        {showQuoteWizard && (
          <PurchasingQuotesWizard 
            onClose={() => setShowQuoteWizard(false)}
            onSave={handleSaveQuote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

