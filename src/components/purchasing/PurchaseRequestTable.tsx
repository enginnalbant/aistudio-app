import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MoreVertical, Eye, CheckCircle2, XCircle, Clock, FileText, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PurchaseRequestTableProps {
  requests: any[];
  onUpdateStatus: (id: string, status: string) => void;
  onViewDetails: (request: any) => void;
  statusFilter?: string;
  searchQuery?: string;
}

export function PurchaseRequestTable({ 
  requests, 
  onUpdateStatus, 
  onViewDetails, 
  statusFilter: externalStatusFilter,
  searchQuery: externalSearchQuery 
}: PurchaseRequestTableProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalStatusFilter, setInternalStatusFilter] = useState('all');

  const activeSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const activeStatusFilter = externalStatusFilter || internalStatusFilter;

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      (req.id?.toString() || '').toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      (req.requested_by || '').toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      (req.department || '').toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      req.items?.some((item: any) => item.stock_name.toLowerCase().includes(activeSearchQuery.toLowerCase()));
    
    const matchesStatus = activeStatusFilter === 'all' || req.status === activeStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit uppercase tracking-wider"><Clock size={12} /> Bekleyen</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-fit uppercase tracking-wider"><CheckCircle2 size={12} /> Onaylandı</span>;
      case 'ordered':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 w-fit uppercase tracking-wider"><FileText size={12} /> Sipariş Edildi</span>;
      case 'received':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 w-fit uppercase tracking-wider"><CheckCircle2 size={12} /> Teslim Alındı</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-fit uppercase tracking-wider"><XCircle size={12} /> İptal Edildi</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 w-fit uppercase tracking-wider">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-black bg-rose-600 text-white">Acil</span>;
      case 'high': return <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-black bg-amber-500 text-white">Yüksek</span>;
      case 'normal': return <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-black bg-indigo-500 text-white">Normal</span>;
      case 'low': return <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-black bg-slate-400 text-white">Düşük</span>;
      default: return <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-black bg-slate-400 text-white">{priority}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 bg-white">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Talep, kişi veya departman ara..."
            value={activeSearchQuery}
            onChange={e => setInternalSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400 shrink-0" />
            <select
              value={activeStatusFilter}
              onChange={e => setInternalStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none text-sm font-bold w-full appearance-none cursor-pointer pr-4"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Bekleyenler</option>
              <option value="approved">Onaylananlar</option>
              <option value="ordered">Sipariş Verilenler</option>
              <option value="received">Teslim Alınanlar</option>
              <option value="cancelled">İptal Edilenler</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <th className="p-6 font-black pl-8">Talep No</th>
              <th className="p-6 font-black">Tarih</th>
              <th className="p-6 font-black">Talep Eden</th>
              <th className="p-6 font-black">Departman</th>
              <th className="p-6 font-black">Kalem</th>
              <th className="p-6 font-black">Öncelik</th>
              <th className="p-6 font-black">Durum</th>
              <th className="p-6 font-black text-right pr-8">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                      <Search size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Talep Bulunamadı</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRequests.map((req, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  key={req.id} 
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(req)}
                >
                  <td className="p-6 pl-8">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">#{req.id}</span>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-500">{new Date(req.date).toLocaleDateString('tr-TR')}</td>
                  <td className="p-6 text-sm font-black text-slate-900">{req.requested_by}</td>
                  <td className="p-6 text-sm font-bold text-slate-500">{req.department}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">
                        {req.item_count}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Kalem</span>
                    </div>
                  </td>
                  <td className="p-6">{getPriorityBadge(req.priority)}</td>
                  <td className="p-6">{getStatusBadge(req.status)}</td>
                  <td className="p-6 text-right pr-8" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onViewDetails(req)}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Detayları Gör"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-100">
                          <button 
                            onClick={() => onUpdateStatus(req.id, 'approved')}
                            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Onayla"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => onUpdateStatus(req.id, 'cancelled')}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="İptal Et"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                      <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-300 transition-colors ml-2" />
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
