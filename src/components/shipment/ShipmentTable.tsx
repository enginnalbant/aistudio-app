import { useState } from 'react';
import { Shipment } from '../../types/shipment';
import { MoreVertical, Truck, Clock, XCircle, RotateCcw, CheckCircle, Edit2, Trash2, ChevronRight, ChevronLeft, Info, MapPin, Calendar, Package as PackageIcon, User, Box, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useShipments } from '../../context/ShipmentContext';
import { ShipmentTrackingModal } from './ShipmentTrackingModal';

interface ShipmentTableProps {
  shipments: Shipment[];
  onEdit: (shipment: Shipment) => void;
}

export function ShipmentTable({ shipments, onEdit }: ShipmentTableProps) {
  const { updateStatus, deleteShipment } = useShipments();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ id: string, status: Shipment['status'] } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trackingModal, setTrackingModal] = useState<Shipment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(shipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = shipments.slice(startIndex, startIndex + itemsPerPage);

  const selectedShipment = shipments.find(s => s.id === selectedId);

  const getStatusBadge = (status: Shipment['status']) => {
    const configs = {
      pending: { theme: 'nrg-sun', icon: <Clock size={12} />, label: 'Beklemede' },
      'in-transit': { theme: 'focus-neon', icon: <Truck size={12} />, label: 'Yolda' },
      delivered: { theme: 'grow-main', icon: <CheckCircle size={12} />, label: 'Teslim Edildi' },
      cancelled: { theme: 'crit-vivid', icon: <XCircle size={12} />, label: 'İptal' },
      postponed: { theme: 'skel-metal', icon: <RotateCcw size={12} />, label: 'Ertelendi' }
    };

    const config = configs[status] || configs.pending;
    const themeColor = config.theme;

    return (
      <motion.span 
        whileHover={{ scale: 1.05, y: -2 }}
        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border"
        style={{
          backgroundColor: `var(--${themeColor}-val)1a`, // 10% opacity
          color: `var(--${themeColor}-val)`,
          borderColor: `var(--${themeColor}-val)33` // 20% opacity
        }}
      >
        <span 
          className="w-1.5 h-1.5 rounded-full animate-pulse" 
          style={{ backgroundColor: `var(--${themeColor}-val)` }}
        />
        {config.label}
      </motion.span>
    );
  };

  const handleStatusChange = (id: string, status: Shipment['status']) => {
    if (status === 'in-transit') {
      setConfirmModal({ id, status });
    } else {
      updateStatus(id, status);
    }
    setActiveDropdown(null);
  };

  const confirmStatusChange = () => {
    if (confirmModal) {
      updateStatus(confirmModal.id, confirmModal.status);
      setConfirmModal(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="bento-card flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-skel-space/90 backdrop-blur-md">
              <tr className="text-skel-metal text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="p-5 border-b border-skel-metal/10">Sevkiyat / Alıcı</th>
                <th className="p-5 border-b border-skel-metal/10">Lojistik Plan</th>
                <th className="p-5 border-b border-skel-metal/10">Zamanlama</th>
                <th className="p-5 border-b border-skel-metal/10">Kapasite</th>
                <th className="p-5 border-b border-skel-metal/10">Durum</th>
                <th className="p-5 border-b border-skel-metal/10 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-skel-metal/5">
              {paginatedShipments.map((shipment) => (
                <tr 
                  key={shipment.id} 
                  className={`group transition-all cursor-pointer hover:bg-focus-main/5 ${
                    selectedId === shipment.id ? 'bg-focus-main/10' : ''
                  }`}
                  onClick={() => setSelectedId(shipment.id)}
                  onDoubleClick={() => onEdit(shipment)}
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-skel-matte/5 flex items-center justify-center text-skel-metal group-hover:bg-focus-main/10 group-hover:text-focus-main transition-colors">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-skel-glass group-hover:text-focus-main transition-colors">{shipment.recipient?.name}</div>
                        <div className="text-[10px] font-mono text-skel-metal mt-0.5 tracking-wider">#{shipment.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-skel-glass text-xs font-medium">
                      <Truck size={14} className="text-skel-metal" />
                      {shipment.carrier?.name}
                    </div>
                    <div className="text-[10px] text-skel-metal mt-1 flex items-center gap-1">
                      <MapPin size={10} />
                      {shipment.carrier?.vehicleInfo || 'Araç Bilgisi Yok'}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-[11px] font-bold text-skel-glass flex items-center gap-2">
                        <Calendar size={12} className="text-nrg-sun" />
                        {shipment.departureDate}
                      </div>
                      <div className="text-[11px] font-bold text-skel-glass flex items-center gap-2">
                        <CheckCircle size={12} className="text-grow-main" />
                        {shipment.deliveryDate}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-skel-glass flex items-center gap-1">
                          <Box size={14} className="text-focus-neon" />
                          {shipment.pallets?.length || 0} Palet
                        </div>
                        <div className="text-[10px] text-skel-metal mt-1">
                          {shipment.pallets?.reduce((acc, p) => acc + (p.products?.length || 0), 0) || 0} Ürün Toplam
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    {getStatusBadge(shipment.status)}
                  </td>
                  <td className="p-5 text-right" onClick={e => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === shipment.id ? null : shipment.id)}
                        className="p-2 hover:bg-skel-metal/10 rounded-lg transition-colors text-skel-metal hover:text-focus-main"
                      >
                        <MoreVertical size={18} />
                      </button>

                      <AnimatePresence>
                        {activeDropdown === shipment.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-0 mt-2 w-56 bg-skel-space border border-skel-metal/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                            >
                              <div className="p-3 border-b border-skel-metal/5 text-[9px] font-black text-skel-metal uppercase tracking-widest">Durum Yönetimi</div>
                              <div className="p-1">
                                <button onClick={() => handleStatusChange(shipment.id, 'pending')} className="w-full p-2.5 text-left text-xs font-bold hover:bg-amber-500/5 text-amber-600 dark:text-amber-400 flex items-center gap-3 rounded-xl transition-colors">
                                  <Clock size={16} /> Beklemede
                                </button>
                                <button onClick={() => handleStatusChange(shipment.id, 'in-transit')} className="w-full p-2.5 text-left text-xs font-bold hover:bg-blue-500/5 text-blue-600 dark:text-blue-400 flex items-center gap-3 rounded-xl transition-colors">
                                  <Truck size={16} /> Yola Çıktı
                                </button>
                                <button onClick={() => handleStatusChange(shipment.id, 'delivered')} className="w-full p-2.5 text-left text-xs font-bold hover:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 rounded-xl transition-colors">
                                  <CheckCircle size={16} /> Teslim Edildi
                                </button>
                                <button onClick={() => handleStatusChange(shipment.id, 'postponed')} className="w-full p-2.5 text-left text-xs font-bold hover:bg-skel-metal/5 text-skel-metal flex items-center gap-3 rounded-xl transition-colors">
                                  <RotateCcw size={16} /> Ertelendi
                                </button>
                                <button onClick={() => handleStatusChange(shipment.id, 'cancelled')} className="w-full p-2.5 text-left text-xs font-bold hover:bg-red-500/5 text-red-600 dark:text-red-400 flex items-center gap-3 rounded-xl transition-colors">
                                  <XCircle size={16} /> İptal Et
                                </button>
                              </div>
                              
                              <div className="p-3 border-t border-skel-metal/5 text-[9px] font-black text-skel-metal uppercase tracking-widest">Kayıt İşlemleri</div>
                              <div className="p-1">
                                <button onClick={() => { setTrackingModal(shipment); setActiveDropdown(null); }} className="w-full p-2.5 text-left text-xs font-bold hover:bg-focus-neon/5 text-focus-neon flex items-center gap-3 rounded-xl transition-colors">
                                  <Map size={16} /> Takip Et
                                </button>
                                <button onClick={() => { onEdit(shipment); setActiveDropdown(null); }} className="w-full p-2.5 text-left text-xs font-bold hover:bg-focus-main/5 text-skel-glass flex items-center gap-3 rounded-xl transition-colors">
                                  <Edit2 size={16} className="text-focus-main" /> Düzenle
                                </button>
                                <button onClick={() => { deleteShipment(shipment.id); setActiveDropdown(null); }} className="w-full p-2.5 text-left text-xs font-bold hover:bg-red-500/5 text-red-600 dark:text-red-500 flex items-center gap-3 rounded-xl transition-colors">
                                  <Trash2 size={16} /> Sil
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar & Pagination */}
      <div className="bento-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-focus-main/10 text-focus-main">
            <Info size={20} />
          </div>
          {selectedShipment ? (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="text-xs font-bold text-skel-glass">
                Seçili: <span className="text-focus-main">#{selectedShipment.id}</span> - {selectedShipment.recipient?.name}
              </div>
              <div className="h-4 w-px bg-skel-metal/20" />
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(selectedShipment)} className="p-2 rounded-lg bg-focus-main/10 text-focus-main hover:bg-focus-main/20 transition-all" title="Düzenle">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleStatusChange(selectedShipment.id, 'delivered')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all" title="Teslim Edildi">
                  <CheckCircle size={16} />
                </button>
                <button onClick={() => deleteShipment(selectedShipment.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all" title="Sil">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs font-medium text-skel-metal italic">İşlem yapmak için bir sevkiyat seçin.</div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-[10px] font-black text-skel-metal uppercase tracking-widest">
            Sayfa <span className="text-skel-glass">{currentPage}</span> / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 rounded-xl bg-skel-matte/5 text-skel-metal hover:bg-skel-matte/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNum 
                        ? 'bg-focus-main text-white shadow-lg shadow-focus-main/20' 
                        : 'bg-skel-matte/5 text-skel-metal hover:bg-skel-matte/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-skel-metal px-1">...</span>}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-xl bg-skel-matte/5 text-skel-metal hover:bg-skel-matte/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-skel-space border border-skel-metal/10 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl"
            >
              <div className="w-20 h-20 bg-focus-neon/10 text-focus-neon rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <Truck size={40} />
              </div>
              <h3 className="text-2xl font-display font-black text-skel-glass text-center mb-2 tracking-tight">Sevkiyat Yola Çıkıyor</h3>
              <p className="text-skel-metal text-center mb-8 font-medium">Bu sevkiyatı "Yolda" durumuna getirmek istediğinizden emin misiniz? Bu işlem sevkiyatı yoldakiler listesine taşıyacaktır.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 p-4 rounded-2xl bg-skel-matte/5 text-skel-glass font-bold hover:bg-skel-matte/10 transition-all"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={confirmStatusChange}
                  className="flex-1 p-4 rounded-2xl bg-focus-main text-white font-bold shadow-lg shadow-focus-main/30 hover:bg-focus-deep transition-all"
                >
                  Onayla ve Gönder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingModal && (
          <ShipmentTrackingModal 
            shipment={trackingModal} 
            onClose={() => setTrackingModal(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
