import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipments } from '../../context/ShipmentContext';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';

export function MovementDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shipments } = useShipments();
  const shipment = shipments.find(s => s.id === id);

  if (!shipment) return <div>Sevkiyat bulunamadı.</div>;

  const movements = [...(shipment.movements || [])].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-skel-metal hover:text-focus-main mb-6">
        <ArrowLeft size={20} /> Geri Dön
      </button>

      <h1 className="text-3xl font-display font-black text-pure-white mb-8">Sevkiyat Hareket Detayları: #{shipment.id}</h1>

      <div className="space-y-4">
        {movements.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bento-card p-6 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-focus-neon">{m.status}</span>
              <span className="text-sm font-mono text-skel-metal flex items-center gap-2">
                <Calendar size={16} /> {new Date(m.createdAt || '').toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="text-sm text-skel-glass flex items-center gap-2">
              <MapPin size={16} className="text-skel-metal" /> {m.location}
            </div>
            {m.description && <div className="text-sm text-skel-metal mt-2 p-4 bg-skel-matte/5 rounded-xl">{m.description}</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
