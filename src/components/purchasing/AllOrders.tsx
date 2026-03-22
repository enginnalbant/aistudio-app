import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Search, Filter, Download, 
  CheckCircle2, XCircle, Clock, Truck, Building2,
  ArrowUpRight, ArrowDownRight, FileText, ChevronRight,
  TrendingUp, Calendar as CalendarIcon
} from 'lucide-react';
import { clsx } from 'clsx';

export function AllOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/purchase-orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    if (!confirm(`Sipariş durumunu '${status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}' olarak değiştirmek istediğinize emin misiniz?`)) return;
    
    try {
      const response = await fetch(`/api/purchase-orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.supplier_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { 
      label: 'Toplam Sipariş', 
      value: orders.length, 
      icon: Package, 
      color: 'bg-indigo-50 text-indigo-600',
      trend: 'Tüm zamanlar',
      trendType: 'neutral'
    },
    { 
      label: 'Açık Siparişler', 
      value: orders.filter(o => o.status === 'open').length, 
      icon: Clock, 
      color: 'bg-amber-50 text-amber-600',
      trend: 'Devam eden',
      trendType: 'neutral'
    },
    { 
      label: 'Tamamlanan', 
      value: orders.filter(o => o.status === 'completed').length, 
      icon: CheckCircle2, 
      color: 'bg-emerald-50 text-emerald-600',
      trend: 'Teslim alınan',
      trendType: 'up'
    },
    { 
      label: 'İptal Edilen', 
      value: orders.filter(o => o.status === 'cancelled').length, 
      icon: XCircle, 
      color: 'bg-rose-50 text-rose-600',
      trend: 'İptal edilen',
      trendType: 'down'
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Tüm Siparişler
            <div className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-black uppercase tracking-widest">
              Arşiv
            </div>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Sisteme girilmiş tüm siparişlerin geçmişini ve durumunu görüntüleyin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-sm">
            <Download size={20} />
            Dışa Aktar
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
              <div className={clsx(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                stat.trendType === 'up' ? "bg-emerald-50 text-emerald-600" : 
                stat.trendType === 'down' ? "bg-rose-50 text-rose-600" : 
                "bg-slate-100 text-slate-600"
              )}>
                {stat.trendType === 'up' ? <ArrowUpRight size={12} /> : 
                 stat.trendType === 'down' ? <ArrowDownRight size={12} /> : null}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl w-full sm:w-auto overflow-x-auto custom-scrollbar no-scrollbar">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'open', label: 'Açık Siparişler' },
            { id: 'completed', label: 'Tamamlananlar' },
            { id: 'cancelled', label: 'İptal Edilenler' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
                activeFilter === filter.id 
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Sipariş Ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sipariş Bulunamadı</h3>
            <p className="text-slate-500">Arama kriterlerinize uygun sipariş bulunmuyor.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const totalAmount = order.items.reduce((sum: number, i: any) => sum + (i.qty * i.price), 0);
            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center gap-6">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    order.status === 'open' ? "bg-amber-50 text-amber-600" :
                    order.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                    "bg-rose-50 text-rose-600"
                  )}>
                    {order.status === 'open' ? <Clock size={24} /> : 
                     order.status === 'completed' ? <CheckCircle2 size={24} /> : 
                     <XCircle size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-black text-slate-900">{order.supplier_name}</h3>
                      <span className={clsx(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        order.status === 'open' ? "bg-amber-100 text-amber-700" :
                        order.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        {order.status === 'open' ? 'Açık' : order.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><FileText size={16} /> Sipariş No: {order.id.slice(0,8)}</span>
                      <span className="flex items-center gap-1.5"><CalendarIcon size={16} /> {new Date(order.date).toLocaleDateString('tr-TR')}</span>
                      <span className="flex items-center gap-1.5"><Package size={16} /> {order.items.length} Kalem</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Toplam Tutar</div>
                    <div className="text-2xl font-black text-slate-900">{totalAmount.toLocaleString('tr-TR')} ₺</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-start mb-8 shrink-0">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    selectedOrder.status === 'open' ? "bg-amber-50 text-amber-600" :
                    selectedOrder.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                    "bg-rose-50 text-rose-600"
                  )}>
                    <Truck size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedOrder.supplier_name}</h2>
                    <div className="flex items-center gap-3 mt-1 text-slate-500 font-medium">
                      <span>Sipariş No: {selectedOrder.id.slice(0,8)}</span>
                      <span>•</span>
                      <span>Tarih: {new Date(selectedOrder.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar min-h-0 mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b-2 border-slate-100 font-black text-slate-400 uppercase tracking-wider text-xs">Stok Kodu</th>
                      <th className="p-4 border-b-2 border-slate-100 font-black text-slate-400 uppercase tracking-wider text-xs">Ürün Adı</th>
                      <th className="p-4 border-b-2 border-slate-100 font-black text-slate-400 uppercase tracking-wider text-xs text-right">Miktar</th>
                      <th className="p-4 border-b-2 border-slate-100 font-black text-slate-400 uppercase tracking-wider text-xs text-right">Birim Fiyat</th>
                      <th className="p-4 border-b-2 border-slate-100 font-black text-slate-400 uppercase tracking-wider text-xs text-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono text-sm text-slate-500">{item.stock_code}</td>
                        <td className="p-4 font-bold text-slate-900">{item.stock_name}</td>
                        <td className="p-4 text-right font-medium text-slate-700">{item.qty} {item.unit}</td>
                        <td className="p-4 text-right font-medium text-slate-700">{item.price.toLocaleString('tr-TR')} ₺</td>
                        <td className="p-4 text-right font-black text-indigo-600">{(item.qty * item.price).toLocaleString('tr-TR')} ₺</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="p-4 text-right font-bold text-slate-400 uppercase tracking-wider">Genel Toplam</td>
                      <td className="p-4 text-right font-black text-2xl text-slate-900">
                        {selectedOrder.items.reduce((sum: number, i: any) => sum + (i.qty * i.price), 0).toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {selectedOrder.notes && (
                  <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Sipariş Notları</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 shrink-0 flex justify-between items-center">
                <div className="flex gap-3">
                  {selectedOrder.status === 'open' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(selectedOrder.id, 'completed')}
                        className="px-6 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 size={18} /> Tamamlandı Olarak İşaretle
                      </button>
                      <button 
                        onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                        className="px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <XCircle size={18} /> İptal Et
                      </button>
                    </>
                  )}
                </div>
                <button onClick={() => setSelectedOrder(null)} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-lg shadow-slate-200">
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
