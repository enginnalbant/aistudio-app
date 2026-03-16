import { motion } from 'motion/react';
import { Truck, Clock, MapPin, Package, BarChart3, Settings, Activity, ClipboardList, Users } from 'lucide-react';
import { useShipments } from '../../context/ShipmentContext';

interface ShipmentDashboardProps {
  setActiveModule: (module: string) => void;
}

export function ShipmentDashboard({ setActiveModule }: ShipmentDashboardProps) {
  const { shipments } = useShipments();

  const stats = {
    pending: shipments.filter(s => s.status === 'pending' || s.status === 'postponed').length,
    transit: shipments.filter(s => s.status === 'in-transit').length,
    total: shipments.length,
    delivered: shipments.filter(s => s.status === 'delivered').length
  };

  const cards = [
    { id: 'shipment-pending', title: 'Bekleyen Sevkiyatlar', icon: <Clock size={24} />, value: stats.pending.toString(), color: 'text-amber-400' },
    { id: 'shipment-transit', title: 'Yoldakiler', icon: <MapPin size={24} />, value: stats.transit.toString(), color: 'text-blue-400' },
    { id: 'shipment-all', title: 'Tüm Sevkiyatlar', icon: <Package size={24} />, value: stats.total.toString(), color: 'text-focus-neon' },
    { id: 'shipment-reports', title: 'Raporlar', icon: <BarChart3 size={24} />, value: 'Görüntüle', color: 'text-emerald-400' },
    { id: 'shipment-settings', title: 'Ayarlar', icon: <Settings size={24} />, value: 'Yapılandır', color: 'text-skel-metal' },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
      {/* System Pulse Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-skel-space border border-focus-neon/10 rounded-2xl p-4 flex items-center gap-6 overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-focus-neon/5 via-transparent to-focus-neon/5 animate-pulse" />
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-grow-phosphor animate-ping" />
          <span className="text-[10px] font-mono font-black text-grow-phosphor uppercase tracking-[0.2em]">Sistem Canlı</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.div 
            animate={{ x: ['100%', '-100%'] }}
            transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
            className="whitespace-nowrap text-[10px] font-mono text-skel-metal uppercase tracking-[0.2em]"
          >
            Sevkiyat Takip Sistemi Aktif • Lojistik Verileri Güncel • {stats.transit} Sevkiyat Yolda • {stats.pending} Sevkiyat Beklemede • Güvenlik Katmanı: Apex-X Aktif
          </motion.div>
        </div>
      </motion.div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
            <Truck className="text-focus-neon" size={32} />
            Sevkiyat Takip
          </h1>
          <p className="text-skel-glass mt-1">Lojistik süreçlerinizin genel özeti</p>
        </div>
      </div>

      {/* Quick Insights Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Bekleyen', value: stats.pending, icon: ClipboardList, color: 'text-amber-400' },
          { label: 'Yoldakiler', value: stats.transit, icon: Truck, color: 'text-blue-400' },
          { label: 'Teslim Edilen', value: stats.delivered, icon: Package, color: 'text-emerald-400' },
          { label: 'Toplam', value: stats.total, icon: Activity, color: 'text-focus-neon' },
        ].map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + (i * 0.05) }}
            className="bento-card p-5 flex items-center gap-4 group"
          >
            <div className={`w-12 h-12 rounded-2xl bg-skel-matte/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-500`}>
              <item.icon size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black text-skel-metal uppercase tracking-[0.2em]">{item.label}</div>
              <div className="text-xl font-black text-skel-glass">{item.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setActiveModule(card.id)}
            className="bento-card p-6 flex flex-col items-start gap-4 hover:scale-[1.02] transition-transform text-left group"
          >
            <div className={`p-3 rounded-xl bg-skel-matte/50 ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-skel-glass font-medium">{card.title}</h3>
              <div className="text-2xl font-display font-bold text-pure-white mt-1">{card.value}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
