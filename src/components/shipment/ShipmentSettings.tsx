import { useState } from 'react';
import { Settings, Package, Truck, MapPin, Bell, Save, Plus, Trash2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export function ShipmentSettings() {
  const [activeTab, setActiveTab] = useState('genel');
  const [pallets, setPallets] = useState([
    { id: '1', name: 'Euro Palet', width: 80, length: 120, height: 15 },
    { id: '2', name: 'Endüstriyel Palet', width: 100, length: 120, height: 15 },
  ]);
  const [carriers, setCarriers] = useState([
    { id: '1', name: 'Apex Lojistik', active: true },
    { id: '2', name: 'Hızlı Kargo', active: true },
  ]);
  const [warehouses, setWarehouses] = useState([
    { id: '1', name: 'İstanbul Merkez', location: 'İstanbul' },
  ]);
  const [genSettings, setGenSettings] = useState({
    autoDelivered: true,
    currency: 'TRY',
    timezone: 'GMT+3',
    language: 'TR',
    unit: 'cm',
    priority: 'Normal',
  });
  const [statusSettings, setStatusSettings] = useState({
    notifyTransit: true,
    emailAlerts: true,
    pushAlerts: true,
    smsAlerts: false,
    dailyReport: true,
  });

  const menuItems = [
    { id: 'genel', label: 'Genel Ayarlar', icon: Settings },
    { id: 'palet', label: 'Palet Yönetimi', icon: Package },
    { id: 'tasimaci', label: 'Taşıyıcılar', icon: Truck },
    { id: 'depo', label: 'Depolar', icon: MapPin },
    { id: 'bildirim', label: 'Bildirimler', icon: Bell },
  ];

  const handleSave = () => {
    alert('Ayarlar başarıyla kaydedildi!');
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <Settings className="text-skel-metal" size={32} />
        Sevkiyat Ayarları
      </h1>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <nav className="w-64 flex flex-col gap-2 shrink-0">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border",
                activeTab === item.id 
                  ? "bg-skel-space border-focus-neon/30 text-focus-neon shadow-lg" 
                  : "bg-skel-matte/5 border-transparent text-skel-metal hover:bg-skel-matte/10 hover:text-pure-white"
              )}
            >
              <item.icon size={18} />
              {item.label}
              {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <main className="flex-1 bento-card p-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'genel' && (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold text-pure-white">Genel Sevkiyat Kuralları</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-skel-metal">Otomatik Teslimat</span>
                  <select value={genSettings.autoDelivered ? 'true' : 'false'} onChange={(e) => setGenSettings({...genSettings, autoDelivered: e.target.value === 'true'})} className="bg-skel-matte/10 border border-skel-metal/20 rounded-xl p-3 text-pure-white">
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-skel-metal">Varsayılan Para Birimi</span>
                  <input type="text" value={genSettings.currency} onChange={(e) => setGenSettings({...genSettings, currency: e.target.value})} className="bg-skel-matte/10 border border-skel-metal/20 rounded-xl p-3 text-pure-white" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-skel-metal">Zaman Dilimi</span>
                  <input type="text" value={genSettings.timezone} onChange={(e) => setGenSettings({...genSettings, timezone: e.target.value})} className="bg-skel-matte/10 border border-skel-metal/20 rounded-xl p-3 text-pure-white" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-skel-metal">Dil</span>
                  <input type="text" value={genSettings.language} onChange={(e) => setGenSettings({...genSettings, language: e.target.value})} className="bg-skel-matte/10 border border-skel-metal/20 rounded-xl p-3 text-pure-white" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'palet' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-display font-bold text-pure-white">Palet Ölçüleri ve Şablonlar</h2>
                <button className="os-btn os-btn-secondary text-xs"><Plus size={14} /> Yeni Palet</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {pallets.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-skel-matte/5 border border-skel-metal/10">
                    <input type="text" value={p.name} onChange={(e) => setPallets(pallets.map(pal => pal.id === p.id ? {...pal, name: e.target.value} : pal))} className="bg-transparent border-none text-pure-white font-medium flex-1" />
                    <input type="number" value={p.width} onChange={(e) => setPallets(pallets.map(pal => pal.id === p.id ? {...pal, width: Number(e.target.value)} : pal))} className="w-20 bg-skel-matte/10 rounded-lg p-2 text-pure-white" />
                    <input type="number" value={p.length} onChange={(e) => setPallets(pallets.map(pal => pal.id === p.id ? {...pal, length: Number(e.target.value)} : pal))} className="w-20 bg-skel-matte/10 rounded-lg p-2 text-pure-white" />
                    <button className="text-crit-vivid hover:text-crit-blood"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasimaci' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-display font-bold text-pure-white">Taşıyıcı Yönetimi</h2>
                <button className="os-btn os-btn-secondary text-xs"><Plus size={14} /> Yeni Taşıyıcı</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {carriers.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-skel-matte/5 border border-skel-metal/10">
                    <input type="text" value={c.name} onChange={(e) => setCarriers(carriers.map(car => car.id === c.id ? {...car, name: e.target.value} : car))} className="bg-transparent border-none text-pure-white font-medium" />
                    <button onClick={() => setCarriers(carriers.map(car => car.id === c.id ? {...car, active: !car.active} : car))} className={clsx("text-xs font-bold px-3 py-1 rounded-full", c.active ? "bg-emerald-500/20 text-emerald-400" : "bg-crit-blood/20 text-crit-vivid")}>{c.active ? 'Aktif' : 'Pasif'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'depo' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-display font-bold text-pure-white">Depo Lokasyonları</h2>
                <button className="os-btn os-btn-secondary text-xs"><Plus size={14} /> Yeni Depo</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {warehouses.map(w => (
                  <div key={w.id} className="flex items-center gap-4 p-4 rounded-xl bg-skel-matte/5 border border-skel-metal/10">
                    <input type="text" value={w.name} onChange={(e) => setWarehouses(warehouses.map(wh => wh.id === w.id ? {...wh, name: e.target.value} : wh))} className="bg-transparent border-none text-pure-white font-medium flex-1" />
                    <input type="text" value={w.location} onChange={(e) => setWarehouses(warehouses.map(wh => wh.id === w.id ? {...wh, location: e.target.value} : wh))} className="bg-skel-matte/10 rounded-lg p-2 text-pure-white flex-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bildirim' && (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold text-pure-white">Bildirim Tercihleri</h2>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(statusSettings).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between p-4 rounded-xl bg-skel-matte/5 border border-skel-metal/10 cursor-pointer">
                    <span className="text-sm text-skel-glass capitalize">{key}</span>
                    <input type="checkbox" checked={value as boolean} onChange={() => setStatusSettings({...statusSettings, [key]: !value})} className="accent-focus-neon" />
                  </label>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-skel-metal/10">
        <button onClick={handleSave} className="os-btn os-btn-primary"><Save size={16} /> Değişiklikleri Kaydet</button>
      </div>
    </div>
  );
}
