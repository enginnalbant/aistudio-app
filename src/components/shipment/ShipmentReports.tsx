import { useState } from 'react';
import { BarChart3, TrendingUp, Package, Truck, Clock, Calendar, Filter, Download, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart, Line } from 'recharts';
import { useShipments } from '../../context/ShipmentContext';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#6B7280'];

export function ShipmentReports() {
  const { shipments } = useShipments();
  const [dateRange, setDateRange] = useState('30d');

  const stats = {
    pending: shipments.filter(s => s.status === 'pending' || s.status === 'postponed').length,
    transit: shipments.filter(s => s.status === 'in-transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    total: shipments.length
  };

  const statusData = [
    { name: 'Bekleyen', value: stats.pending },
    { name: 'Yolda', value: stats.transit },
    { name: 'Teslim Edilen', value: stats.delivered },
  ];

  const trendData = [
    { name: 'Pzt', teslimat: 40, hata: 2 },
    { name: 'Sal', teslimat: 30, hata: 1 },
    { name: 'Çar', teslimat: 50, hata: 3 },
    { name: 'Per', teslimat: 45, hata: 0 },
    { name: 'Cum', teslimat: 60, hata: 2 },
    { name: 'Cmt', teslimat: 35, hata: 1 },
    { name: 'Paz', teslimat: 20, hata: 0 },
  ];

  const deliveryTimeData = [
    { day: '1', time: 24 }, { day: '2', time: 22 }, { day: '3', time: 25 }, { day: '4', time: 20 },
    { day: '5', time: 23 }, { day: '6', time: 19 }, { day: '7', time: 21 },
  ];

  const carriers = [
    { name: 'Apex Lojistik', performance: '99.2%', shipments: 1250 },
    { name: 'Hızlı Kargo', performance: '97.5%', shipments: 890 },
    { name: 'Global Nakliye', performance: '95.1%', shipments: 450 },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
          <BarChart3 className="text-emerald-400" size={32} />
          Sevkiyat Analitik Raporu
        </h1>
        <div className="flex gap-2">
          <button className="os-btn os-btn-secondary text-xs flex items-center gap-2"><Filter size={14} /> Filtrele</button>
          <button className="os-btn os-btn-primary text-xs flex items-center gap-2"><Download size={14} /> Dışa Aktar</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Toplam Sevkiyat', value: stats.total, icon: Package, color: 'text-focus-neon' },
          { label: 'Teslimat Başarısı', value: '%98.2', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Aktif Yoldakiler', value: stats.transit, icon: Truck, color: 'text-blue-400' },
          { label: 'Bekleyen İşler', value: stats.pending, icon: Clock, color: 'text-amber-400' },
        ].map((item) => (
          <div key={item.label} className="bento-card p-6 flex items-center gap-4 hover:border-focus-neon/30 transition-all">
            <div className={`p-3 rounded-xl bg-skel-matte/50 ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-skel-metal uppercase tracking-[0.2em]">{item.label}</div>
              <div className="text-2xl font-black text-pure-white">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bento-card p-6 lg:col-span-2">
          <h2 className="text-lg font-display font-bold text-pure-white mb-6">Haftalık Teslimat Performansı</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                <Legend />
                <Bar dataKey="teslimat" fill="#10B981" name="Teslimat" />
                <Line type="monotone" dataKey="hata" stroke="#EF4444" name="Hata/İade" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bento-card p-6">
          <h2 className="text-lg font-display font-bold text-pure-white mb-6">Durum Dağılımı</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bento-card p-6 lg:col-span-2">
          <h2 className="text-lg font-display font-bold text-pure-white mb-6">Teslimat Süresi Analizi (Saat)</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deliveryTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Area type="monotone" dataKey="time" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bento-card p-6">
          <h2 className="text-lg font-display font-bold text-pure-white mb-6">Taşıyıcı Performansı</h2>
          <div className="space-y-4">
            {carriers.map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-skel-matte/5 border border-skel-metal/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-skel-matte/50 text-focus-neon"><User size={16} /></div>
                  <div>
                    <div className="text-sm font-bold text-pure-white">{c.name}</div>
                    <div className="text-[10px] text-skel-metal">{c.shipments} Sevkiyat</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-400">{c.performance}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          'Sevkiyat Hacmi (Bölge)',
          'En İyi Müşteriler',
          'Depo Kullanım Oranı',
          'Palet Tipi Dağılımı',
          'Maliyet Analizi',
          'Gecikme Nedenleri'
        ].map(title => (
          <div key={title} className="bento-card p-6">
            <h2 className="text-sm font-display font-bold text-pure-white mb-4">{title}</h2>
            <div className="h-[100px] flex items-center justify-center text-skel-metal border-2 border-dashed border-skel-metal/20 rounded-xl">
              Grafik Verisi Bekleniyor
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
