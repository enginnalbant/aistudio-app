import { motion } from 'motion/react';
import { MoreVertical, Eye, Trash2, CheckCircle2, Clock, AlertCircle, Calendar, FileText, Package } from 'lucide-react';
import { clsx } from 'clsx';

interface PurchasePlanTableProps {
  plans: any[];
  onView: (plan: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export function PurchasePlanTable({ plans, onView, onDelete, onStatusChange }: PurchasePlanTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-50">
            <CheckCircle2 size={12} />
            Onaylandı
          </span>
        );
      case 'ordered':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm shadow-indigo-50">
            <Package size={12} />
            Sipariş Edildi
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm shadow-rose-50">
            <AlertCircle size={12} />
            İptal
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm shadow-slate-50">
            <Clock size={12} />
            Taslak
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Plan Bilgisi</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tarih</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kalemler</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Toplam Tutar</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Durum</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {plans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-slate-600">Henüz satınalma planı oluşturulmadı.</p>
                    <p className="text-sm mt-1">Sihirbazı kullanarak yeni bir plan oluşturun.</p>
                  </div>
                </td>
              </tr>
            ) : (
              plans.map((plan) => {
                const totalCost = plan.items?.reduce((sum: number, item: any) => sum + (item.qty * (item.estimated_price || 0)), 0) || 0;
                
                return (
                  <motion.tr 
                    key={plan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{plan.title || 'İsimsiz Plan'}</div>
                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{plan.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(plan.date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{plan.item_count || 0}</span>
                        <span className="text-xs font-bold text-slate-400">Kalem</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-slate-900">
                        {totalCost.toLocaleString('tr-TR')} ₺
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(plan.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => onView(plan)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Görüntüle"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => onDelete(plan.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="relative group/menu">
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                            <MoreVertical size={18} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 hidden group-hover/menu:block z-20 overflow-hidden">
                            <div className="p-2 space-y-1">
                              {['draft', 'confirmed', 'ordered', 'cancelled'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => onStatusChange(plan.id, status)}
                                  className={clsx(
                                    "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all capitalize",
                                    plan.status === status ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                                  )}
                                >
                                  {status === 'draft' ? 'Taslak Yap' : 
                                   status === 'confirmed' ? 'Onayla' : 
                                   status === 'ordered' ? 'Sipariş Verildi' : 'İptal Et'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
