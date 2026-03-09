import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Settings as SettingsIcon,
  Zap,
  Package,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

export function NotificationMenu({ onClose, onViewAll }: { onClose: () => void; onViewAll: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle size={16} />;
      case 'success': return <CheckCircle2 size={16} />;
      case 'info': return <Info size={16} />;
      case 'system': return <Zap size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-skel-dark border border-skel-matte/20 overflow-hidden z-50 shadow-2xl rounded-2xl"
    >
      <div className="p-4 border-b border-skel-matte/20 flex items-center justify-between bg-skel-matte/10">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-focus-neon" />
          <h3 className="text-sm font-bold text-skel-glass uppercase tracking-widest">Bildirimler</h3>
        </div>
        {unreadCount > 0 && (
          <span className="text-[10px] font-bold bg-crit-vivid/10 text-crit-vivid px-2 py-0.5 rounded-full border border-crit-vivid/20">
            {unreadCount} Yeni
          </span>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-focus-neon/20 border-t-focus-neon rounded-full animate-spin" />
            <p className="text-[10px] text-skel-metal font-bold uppercase tracking-widest">Yükleniyor...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-4 border-b border-skel-matte/20 hover:bg-skel-matte/10 transition-colors cursor-pointer group relative ${!notif.is_read ? 'bg-focus-neon/[0.02]' : ''}`}
            >
              {!notif.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-focus-neon" />
              )}
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-skel-matte/20 ${
                  notif.type === 'alert' ? 'bg-crit-vivid/10 text-crit-vivid' :
                  notif.type === 'success' ? 'bg-grow-main/10 text-grow-main' :
                  notif.type === 'info' ? 'bg-focus-neon/10 text-focus-neon' :
                  'bg-nrg-sun/10 text-nrg-sun'
                }`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-skel-glass truncate group-hover:text-focus-neon transition-colors">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-skel-matte flex items-center gap-1 shrink-0">
                      <Clock size={10} /> {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-skel-metal line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <Bell size={32} className="mx-auto text-skel-glass/5 mb-3" />
            <p className="text-xs text-skel-matte italic">Henüz bildirim bulunmuyor.</p>
          </div>
        )}
      </div>

      <button 
        onClick={onViewAll}
        className="w-full p-3 text-[10px] font-bold text-skel-metal uppercase tracking-widest hover:text-skel-glass hover:bg-skel-matte/20 transition-all flex items-center justify-center gap-2"
      >
        Tüm Bildirimleri Gör <ChevronRight size={12} />
      </button>
    </motion.div>
  );
}
