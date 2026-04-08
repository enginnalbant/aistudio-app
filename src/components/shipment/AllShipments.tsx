import { useState, useMemo, useRef } from 'react';
import { Package, Plus, Search, Download, FileText, FileSpreadsheet, Image as ImageIcon, TrendingUp, Truck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Shipment } from '../../types/shipment';
import { ShipmentWizard } from './ShipmentWizard';
import { ShipmentTable } from './ShipmentTable';
import { useShipments } from '../../context/ShipmentContext';
import { generateShipmentReport } from '../../utils/reportGenerator';
import html2canvas from 'html2canvas';

export function AllShipments() {
  const { shipments, addShipment, updateShipment } = useShipments();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const filteredShipments = useMemo(() => {
    const safeShipments = Array.isArray(shipments) ? shipments : [];
    return safeShipments.filter(s => 
      s.recipient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.carrier?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shipments, searchQuery]);

  const handleExportPDF = () => generateShipmentReport(filteredShipments, 'pdf', 'Tüm Sevkiyatlar');
  const handleExportExcel = () => generateShipmentReport(filteredShipments, 'excel', 'Tüm Sevkiyatlar');

  const handleExportPNG = async () => {
    if (!tableRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `tum-sevkiyatlar-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('PNG Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleSave = (shipment: Shipment) => {
    if (editingShipment) {
      updateShipment(shipment);
    } else {
      addShipment(shipment);
    }
    setIsWizardOpen(false);
    setEditingShipment(null);
  };

  const handleEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsWizardOpen(true);
  };

  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const statusCounts = {
    pending: safeShipments.filter(s => s.status === 'pending' || s.status === 'postponed').length,
    transit: safeShipments.filter(s => s.status === 'in-transit').length,
    total: safeShipments.length
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-skel-glass flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-focus-neon/10 text-focus-neon shadow-lg shadow-focus-neon/5">
              <Package size={32} />
            </div>
            Tüm Sevkiyatlar
          </h1>
          <p className="text-skel-metal mt-2 font-medium">Sistemdeki tüm sevkiyat kayıtlarını yönetin.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-skel-metal group-focus-within:text-focus-neon transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Sevkiyat Ara..." 
              className="os-input pl-12 w-64 bg-skel-matte/10 border-skel-metal/20 focus:bg-skel-matte/20 text-skel-glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingShipment(null); setIsWizardOpen(true); }} 
            className="os-btn os-btn-primary whitespace-nowrap"
          >
            <Plus size={20} />
            Yeni Kayıt
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
            <AlertCircle size={80} />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-skel-metal uppercase tracking-[0.2em] mb-1">Beklemede</div>
            <div className="text-4xl font-black text-skel-glass">{statusCounts.pending}</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
            <Truck size={80} />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-skel-metal uppercase tracking-[0.2em] mb-1">Yoldakiler</div>
            <div className="text-4xl font-black text-skel-glass">{statusCounts.transit}</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card p-6 bg-focus-main/5 border-focus-main/20"
        >
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black text-focus-main uppercase tracking-[0.2em]">Hızlı İşlemler</div>
              <Download size={16} className="text-focus-main" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-focus-main text-white text-[10px] font-bold hover:bg-focus-deep transition-colors"
              >
                <FileText size={14} />
                PDF Rapor
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-skel-matte/20 text-skel-glass text-[10px] font-bold hover:bg-skel-matte/30 transition-colors"
              >
                <FileSpreadsheet size={14} />
                Excel Aktar
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table Area */}
      <div className="flex-1 min-h-0" ref={tableRef}>
        {filteredShipments.length === 0 ? (
          <div className="bento-card flex-1 p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-skel-matte/5 flex items-center justify-center text-skel-metal/20">
              <Package size={48} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-skel-glass">Kayıt Bulunamadı</h3>
              <p className="text-skel-metal max-w-xs mx-auto mt-2">Arama kriterlerinize uygun sevkiyat kaydı bulunmuyor.</p>
            </div>
          </div>
        ) : (
          <ShipmentTable shipments={filteredShipments} onEdit={handleEdit} />
        )}
      </div>

      {isWizardOpen && (
        <ShipmentWizard 
          onSave={handleSave} 
          onClose={() => { setIsWizardOpen(false); setEditingShipment(null); }} 
          initialData={editingShipment || undefined}
        />
      )}
    </div>
  );
}
