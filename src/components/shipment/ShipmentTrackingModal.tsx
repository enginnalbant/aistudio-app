import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, MapPin, Plus, X } from 'lucide-react';
import { Shipment, Movement } from '../../types/shipment';
import { useShipments } from '../../context/ShipmentContext';

interface ShipmentTrackingModalProps {
  shipment: Shipment;
  onClose: () => void;
}

export function ShipmentTrackingModal({ shipment, onClose }: ShipmentTrackingModalProps) {
  const { addMovement } = useShipments();
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [movementDate, setMovementDate] = useState(new Date().toISOString().slice(0, 16));
  const [filePaths, setFilePaths] = useState<string[]>([]);

  const handleAddMovement = () => {
    if (!status || !location) return;
    addMovement(shipment.id, { status, location, description, movementDate, filePaths } as Movement);
    setStatus('');
    setLocation('');
    setDescription('');
    setMovementDate(new Date().toISOString().slice(0, 16));
    setFilePaths([]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-skel-space border border-skel-metal/10 p-8 rounded-[2.5rem] max-w-2xl w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-display font-black text-skel-glass tracking-tight">Sevkiyat Takibi: #{shipment.id}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-skel-matte/10 text-skel-metal">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-skel-glass">Yeni Hareket Ekle</h4>
            <input 
              type="datetime-local" 
              className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
              value={movementDate} 
              onChange={e => setMovementDate(e.target.value)} 
            />
            <input 
              type="text" 
              className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
              placeholder="Durum (Örn: Araca Yüklendi)"
              value={status} 
              onChange={e => setStatus(e.target.value)} 
            />
            <input 
              type="text" 
              className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
              placeholder="Konum (Örn: İstanbul Depo)"
              value={location} 
              onChange={e => setLocation(e.target.value)} 
            />
            <textarea 
              className="os-input w-full h-24 resize-none bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
              placeholder="Açıklama..."
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
            <input 
              type="file" 
              className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  setFilePaths(prev => [...prev, e.target.files![0].name]);
                }
              }}
            />
            <button onClick={handleAddMovement} className="os-btn os-btn-primary w-full">
              <Plus size={20} /> Hareket Ekle
            </button>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold text-skel-glass">Hareket Geçmişi</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {[...(shipment.movements || [])].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()).map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-skel-matte/5 border border-skel-metal/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-focus-neon">{m.status}</span>
                    <span className="text-[10px] text-skel-metal">{new Date(m.createdAt || '').toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="text-xs text-skel-glass flex items-center gap-2">
                    <MapPin size={14} className="text-skel-metal" /> {m.location}
                  </div>
                  {m.description && <div className="text-xs text-skel-metal mt-2">{m.description}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
