import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Clock, 
  Search,
  Filter,
  Trash2,
  Check,
  Zap,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    if (!confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) return;
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle size={24} />;
      case 'success': return <CheckCircle2 size={24} />;
      case 'info': return <Info size={24} />;
      case 'system': return <Zap size={24} />;
      default: return <Bell size={24} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = 
      filter === 'Tümü' || 
      (filter === 'Okunmamış' && !n.is_read) ||
      (filter === 'Kritik Uyarılar' && n.type === 'alert') ||
      (filter === 'Sistem' && n.type === 'system') ||
      (filter === 'Aktiviteler' && n.type === 'info');
    
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 h-full overflow-y-auto custom-scrollbar pr-2">
      {/* Apex Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-focus-main/10 border border-focus-neon/20 text-focus-neon label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-focus-neon/5">
              <Activity size={12} /> Akış Aktif
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              BİLDİRİM <span className="text-focus-neon">MERKEZİ</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg tracking-tight opacity-70 max-w-2xl">
              Sistem genelindeki tüm uyarılar, güncellemeler ve aktiviteler Apex Neural Engine tarafından anlık olarak işlenir.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={markAllAsRead} 
            className="os-btn os-btn-secondary h-[54px]"
          >
            <Check size={18} /> <span>Tümünü Okundu İşaretle</span>
          </button>
          <button 
            onClick={clearAll} 
            className="os-btn bg-crit-blood/10 text-crit-vivid border border-crit-blood/20 hover:bg-crit-blood/20 h-[54px]"
          >
            <Trash2 size={18} /> <span>Tümünü Temizle</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
          <div className="lg:col-span-3 space-y-8">
          <div className="bento-card p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Filter size={40} className="text-focus-neon" />
            </div>
            <h3 className="label-mono mb-6 tracking-[0.3em]">Filtreleme Katmanları</h3>
            <div className="space-y-2">
              {['Tümü', 'Okunmamış', 'Kritik Uyarılar', 'Sistem', 'Aktiviteler'].map((f, i) => (
                <button 
                  key={i}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "w-full p-4 rounded-2xl text-left font-display font-black tracking-tight transition-all duration-500 flex items-center justify-between group relative overflow-hidden",
                    filter === f 
                      ? "bg-focus-main/10 text-focus-neon border border-focus-neon/20 shadow-sm shadow-focus-neon/5" 
                      : "text-text-secondary hover:bg-skel-matte/5 hover:text-text-primary border border-transparent"
                  )}
                >
                  {f}
                  {filter === f && <ChevronRight size={16} className="text-focus-neon" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bento-card p-8">
            <h3 className="label-mono mb-6">Nöral Arama</h3>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-skel-metal group-focus-within:text-focus-neon transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sistemde ara..."
                className="w-full bg-skel-space/50 border border-skel-metal/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-skel-glass font-medium focus:outline-none focus:border-focus-neon focus:bg-skel-space/80 transition-all"
              />
            </div>
          </div>

          <div className="bento-card p-8 bg-focus-main/5 border-focus-neon/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={40} className="text-focus-neon" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-focus-main text-void-white flex items-center justify-center shadow-[0_0_15px_rgba(0,102,255,0.4)]">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-display font-bold text-void-white">Akıllı Özet</h3>
            </div>
            <p className="text-sm text-skel-metal leading-relaxed font-medium">
              Bugün <span className="text-focus-neon font-bold">{notifications.filter(n => !n.is_read).length}</span> yeni veri girişi tespit edildi. 
              {notifications.some(n => n.type === 'alert' && !n.is_read) ? 
                " Kritik sistem uyarıları acil müdahale protokolü gerektiriyor." : 
                " Tüm operasyonel parametreler Apex standartlarında seyrediyor."}
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-9 space-y-6">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-8 bento-card">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-focus-neon/10 rounded-2xl" />
                <div className="absolute inset-0 border-4 border-t-focus-neon rounded-2xl animate-spin" />
              </div>
              <p className="text-skel-metal font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Veri Akışı Senkronize Ediliyor...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    className={clsx(
                      "bento-card p-8 border-l-4 transition-all duration-500 group relative cursor-pointer overflow-hidden",
                      notif.type === 'alert' ? 'border-l-crit-vivid' :
                      notif.type === 'success' ? 'border-l-grow-phosphor' :
                      notif.type === 'info' ? 'border-l-focus-neon' :
                      'border-l-nrg-sun',
                      !notif.is_read ? 'bg-focus-main/[0.03] border-focus-neon/20' : 'bg-skel-space/20'
                    )}
                  >
                    {/* Patina Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-void-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="flex gap-8 relative z-10">
                      <div className={clsx(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                        notif.type === 'alert' ? 'bg-crit-blood/10 text-crit-vivid border-crit-blood/20' :
                        notif.type === 'success' ? 'bg-grow-main/10 text-grow-phosphor border-grow-main/20' :
                        notif.type === 'info' ? 'bg-focus-main/10 text-focus-neon border-focus-main/20' :
                        'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'
                      )}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-2xl font-display font-black text-skel-glass group-hover:text-void-white transition-colors flex items-center gap-4 tracking-tighter">
                              {notif.title}
                              {!notif.is_read && (
                                <motion.span 
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-2.5 h-2.5 bg-focus-neon rounded-full shadow-[0_0_10px_rgba(130,177,255,0.8)]" 
                                />
                              )}
                            </h4>
                            <div className="flex items-center gap-6 mt-2">
                              <span className="text-[10px] font-mono text-skel-metal flex items-center gap-2 font-bold uppercase tracking-[0.2em]">
                                <Clock size={12} className="text-focus-neon" /> {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[10px] font-mono text-skel-metal font-bold uppercase tracking-[0.2em]">
                                {new Date(notif.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-skel-space/50 border border-skel-metal/10 text-skel-metal opacity-0 group-hover:opacity-100 transition-all hover:text-focus-neon hover:border-focus-neon/30 hover:scale-110">
                            <ArrowRight size={20} />
                          </div>
                        </div>
                        <p className="text-base text-skel-metal leading-relaxed max-w-4xl font-medium">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-32 text-center bento-card flex flex-col items-center justify-center gap-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-focus-main/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="w-24 h-24 rounded-3xl bg-skel-space border border-skel-metal/10 flex items-center justify-center text-skel-metal/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                <Bell size={48} />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-display font-black text-void-white tracking-tighter">BİLDİRİM AKIŞI BOŞ</p>
                <p className="text-skel-metal font-medium mt-2 max-w-sm mx-auto">Sistem parametreleri optimal seviyede. Yeni bir veri girişi olduğunda Apex sizi bilgilendirecektir.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
