import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Send as SendIcon,
  Building2,
  Layers,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Sliders,
  Sparkles,
  Search
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { supabaseService } from '../../services/supabaseService';

export interface FasonOrder {
  id: string;
  firmName: string;
  productName: string;
  quantity: number;
  unitCost: number;
  sentDate: string;
  status: 'Gönderildi' | 'Fasoncuda' | 'Tamamlandı' | 'İptal';
  notes?: string;
  created_at?: string;
}

// ------------------- Helper Mock Data Injector -------------------
const INITIAL_FASON: FasonOrder[] = [
  { id: 'fas-1', firmName: 'Yıldız Galvaniz A.Ş.', productName: 'Alüminyum Profil Kaplama', quantity: 2500, unitCost: 4.5, sentDate: '2026-05-10', status: 'Fasoncuda' },
  { id: 'fas-2', firmName: 'Özdemir Isıl İşlem', productName: 'Çelik Rulman Sertleştirme', quantity: 500, unitCost: 12.0, sentDate: '2026-05-12', status: 'Gönderildi' },
  { id: 'fas-3', firmName: 'Ege CNC Sanayi', productName: 'M8 Diş Açma & Tornalama', quantity: 1200, unitCost: 7.2, sentDate: '2026-05-08', status: 'Tamamlandı' }
];

export const FasonDashboard = () => {
  const [orders, setOrders] = useLocalStorage<FasonOrder[]>('fason_orders', INITIAL_FASON);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [firmName, setFirmName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [unitCost, setUnitCost] = useState(5.0);
  const [sentDate, setSentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Stats calculation
  const totalQuantity = orders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const totalCost = orders.reduce((sum, o) => sum + (Number(o.quantity || 0) * Number(o.unitCost || 0)), 0);
  const activeCount = orders.filter(o => o.status === 'Gönderildi' || o.status === 'Fasoncuda').length;
  const completedCount = orders.filter(o => o.status === 'Tamamlandı').length;

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmName || !productName) return;

    const newOrder: FasonOrder = {
      id: 'fas-' + crypto.randomUUID().substring(0, 8),
      firmName,
      productName,
      quantity,
      unitCost,
      sentDate,
      status: 'Gönderildi',
      notes,
      created_at: new Date().toISOString()
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);

    // Sync to Supabase in the background
    await supabaseService.insertRecord('fason_orders', newOrder, 'fason_orders');

    // Reset Form
    setFirmName('');
    setProductName('');
    setQuantity(100);
    setUnitCost(5.0);
    setNotes('');
    setIsAddOpen(false);
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Fason siparişini silmek istediğinize emin misiniz?')) {
      const filtered = orders.filter(o => o.id !== id);
      setOrders(filtered);
      await supabaseService.deleteRecord('fason_orders', id, 'fason_orders');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: FasonOrder['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);

    const target = updated.find(o => o.id === id);
    if (target) {
      await supabaseService.insertRecord('fason_orders', target, 'fason_orders');
    }
  };

  const filteredOrders = orders.filter(o =>
    o.firmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-text-primary max-w-6xl mx-auto p-1">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            Fason İşler Yönetim Merkezi
          </h1>
          <p className="text-xs text-text-secondary font-mono uppercase tracking-widest opacity-60">
            Fasona giden, işlenen ve teslim alınan operasyonların takibi
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-focus-main hover:bg-focus-neon text-white font-display font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={14} /> Yeni İş Gönder
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Aktif Operasyonlar</span>
          <span className="text-2xl font-mono font-black text-focus-neon block mt-1">{activeCount} İş</span>
          <div className="absolute right-3 bottom-3 text-focus-neon/10"><Clock size={40} /></div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Toplam Gönderilen</span>
          <span className="text-2xl font-mono font-black text-white block mt-1">{totalQuantity.toLocaleString('tr-TR')} Adet</span>
          <div className="absolute right-3 bottom-3 text-white/10"><Layers size={40} /></div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Toplam Fason Maliyeti</span>
          <span className="text-2xl font-mono font-black text-white block mt-1">₺{totalCost.toLocaleString('tr-TR')}</span>
          <div className="absolute right-3 bottom-3 text-white/10"><DollarSign size={40} /></div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Tamamlanan</span>
          <span className="text-2xl font-mono font-black text-emerald-400 block mt-1">{completedCount} Operasyon</span>
          <div className="absolute right-3 bottom-3 text-emerald-400/10"><CheckCircle size={40} /></div>
        </div>
      </div>

      {/* Add New Job Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white"
              >
                <Trash2 size={16} />
              </button>

              <h3 className="font-display font-black text-base text-white uppercase tracking-wider">Fasona Yeni İş Gönder</h3>

              <form onSubmit={handleAddOrder} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-secondary font-bold block uppercase">Fasoncu Firma Adı</label>
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Örn: Özdemir Galvaniz"
                    className="w-full bg-black/40 border border-white/5 focus:border-focus-neon focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-secondary font-bold block uppercase">İşlenecek Ürün / Operasyon</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Örn: Elektrostatik Toz Boya"
                    className="w-full bg-black/40 border border-white/5 focus:border-focus-neon focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-secondary font-bold block uppercase">Miktar (Adet/Kg)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/5 focus:border-focus-neon focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-secondary font-bold block uppercase">Birim İşçilik Maliyeti (₺)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      value={unitCost}
                      onChange={(e) => setUnitCost(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/5 focus:border-focus-neon focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-secondary font-bold block uppercase">Sevk Tarihi</label>
                  <input
                    type="date"
                    required
                    value={sentDate}
                    onChange={(e) => setSentDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 focus:border-focus-neon focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-secondary font-bold block uppercase">Notlar & Açıklama</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kalite standartları, paketleme koşulları..."
                    rows={2}
                    className="w-full bg-black/40 border border-white/5 focus:border-focus-neon focus:outline-none rounded-xl px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-focus-main hover:bg-focus-neon text-white font-display font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  Gönderimi Kaydet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Jobs Table / Cards */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-white/5 pb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3.5 text-text-secondary" size={14} />
            <input
              type="text"
              placeholder="Firma veya ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/5 focus:border-focus-neon focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        {/* Desktop Table view */}
        <div className="overflow-x-auto">
          {filteredOrders.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 text-text-secondary font-mono text-[9px] uppercase tracking-widest">Sevk Tarihi</th>
                  <th className="pb-3 text-text-secondary font-mono text-[9px] uppercase tracking-widest">Firma</th>
                  <th className="pb-3 text-text-secondary font-mono text-[9px] uppercase tracking-widest">Operasyon</th>
                  <th className="pb-3 text-text-secondary font-mono text-[9px] uppercase tracking-widest">Miktar</th>
                  <th className="pb-3 text-text-secondary font-mono text-[9px] uppercase tracking-widest">Birim Fiyat</th>
                  <th className="pb-3 text-text-secondary font-mono text-[9px] uppercase tracking-widest">Toplam Tutar</th>
                  <th className="pb-3 text-text-secondary font-mono text-[9px] uppercase tracking-widest">Durum</th>
                  <th className="pb-3 text-text-secondary font-mono text-[9px] uppercase tracking-widest text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 text-xs font-mono text-text-secondary">{ord.sentDate}</td>
                    <td className="py-4 font-bold text-white text-xs">{ord.firmName}</td>
                    <td className="py-4 text-xs text-white/90">{ord.productName}</td>
                    <td className="py-4 text-xs font-mono text-white/80">{ord.quantity.toLocaleString('tr-TR')} Adet</td>
                    <td className="py-4 text-xs font-mono text-white/80">₺{ord.unitCost.toFixed(2)}</td>
                    <td className="py-4 text-xs font-mono font-black text-white">₺{(ord.quantity * ord.unitCost).toLocaleString('tr-TR')}</td>
                    <td className="py-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/40 border focus:outline-none ${
                          ord.status === 'Gönderildi' ? 'text-focus-neon border-focus-neon/30' :
                          ord.status === 'Fasoncuda' ? 'text-nrg-sun border-nrg-sun/30' :
                          ord.status === 'Tamamlandı' ? 'text-emerald-400 border-emerald-500/30' :
                          'text-text-secondary border-white/10'
                        }`}
                      >
                        <option value="Gönderildi" className="bg-neutral-900 text-focus-neon">Gönderildi</option>
                        <option value="Fasoncuda" className="bg-neutral-900 text-nrg-sun">Fasoncuda</option>
                        <option value="Tamamlandı" className="bg-neutral-900 text-emerald-400">Tamamlandı</option>
                        <option value="İptal" className="bg-neutral-900 text-text-secondary">İptal</option>
                      </select>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="p-2 text-text-secondary hover:text-crit-vivid rounded-lg hover:bg-crit-vivid/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-text-secondary space-y-2">
              <AlertCircle className="mx-auto text-white/15" size={32} />
              <p className="text-xs">Fason kaydı bulunamadı. Hemen yeni bir iş gönderebilirsiniz.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const FasonOutgoing = () => <FasonDashboard />;
export const FasonAll = () => <FasonDashboard />;
export const FasonReports = () => <FasonDashboard />;
export const FasonAnalytics = () => <FasonDashboard />;
