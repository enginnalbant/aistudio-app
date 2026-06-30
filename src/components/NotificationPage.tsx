import React from 'react';
import { useNotifications, Notification } from '../context/NotificationContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  ExternalLink, 
  Filter, 
  Search,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';

export const NotificationPage = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    handleAction, 
    removeNotification 
  } = useNotifications();

  const handleBack = () => {
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule('main-dashboard');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-full flex flex-col gap-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="w-10 h-10 rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 flex items-center justify-center text-text-secondary transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tight text-text-primary uppercase">
              Bildirim Merkezi
            </h1>
            <p className="text-xs text-text-secondary opacity-60 font-mono uppercase tracking-widest">
              Tüm sistem ve kullanıcı etkileşimleri
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4 rounded-xl border-skel-metal/20 hover:bg-focus-neon/10 hover:text-focus-neon font-bold text-xs gap-2"
            onClick={markAllAsRead}
          >
            <Check size={16} />
            Tümünü Okundu İşaretle
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40" size={18} />
          <input 
            type="text"
            placeholder="Bildirimlerde ara..."
            className="w-full h-12 bg-skel-space/50 border border-skel-metal/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-focus-neon/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-2xl border-skel-metal/10 bg-skel-space/50 px-4 gap-2 text-xs font-bold">
            <Filter size={16} />
            Filtrele
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 bento-card border-skel-metal/10 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-skel-metal/5 bg-skel-matte/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60">
            Son Bildirimler
          </span>
          <span className="text-[10px] font-bold text-focus-neon">
            {notifications.length} Toplam
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-skel-metal/5">
          {notifications.length > 0 ? (
            notifications.map((notification, idx) => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 hover:bg-focus-neon/5 transition-all group relative ${!notification.isRead ? 'bg-focus-neon/[0.02]' : ''}`}
              >
                <div className="flex gap-4">
                  <Avatar className="size-12 border border-skel-metal/10 shadow-sm">
                    <AvatarImage src={notification.user.avatar} />
                    <AvatarFallback>{notification.user.fallback}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-text-primary">{notification.user.name}</span>
                          <span className="text-text-secondary text-sm">{notification.action}</span>
                          {notification.target && (
                            <span className="font-bold text-focus-neon text-sm">{notification.target}</span>
                          )}
                          {!notification.isRead && (
                            <Badge className="bg-focus-neon text-[9px] uppercase tracking-tighter h-4 px-1">Yeni</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary opacity-50">
                            {notification.timestamp}
                          </span>
                          <span className="text-[10px] text-text-secondary opacity-40">•</span>
                          <span className="text-[10px] text-text-secondary opacity-50">
                            {notification.timeAgo}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 text-focus-neon hover:bg-focus-neon/10"
                            onClick={() => markAsRead(notification.id)}
                            title="Okundu İşaretle"
                          >
                            <Check size={16} />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 text-text-secondary hover:text-crit-vivid hover:bg-crit-blood/10"
                          onClick={() => removeNotification(notification.id)}
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-text-secondary">
                          <MoreVertical size={16} />
                        </Button>
                      </div>
                    </div>

                    {notification.content && (
                      <div className="rounded-2xl bg-skel-matte/5 p-4 text-sm leading-relaxed text-text-secondary border border-skel-metal/5 max-w-2xl">
                        {notification.content}
                      </div>
                    )}

                    {notification.file && (
                      <div className="flex items-center gap-4 rounded-2xl bg-skel-matte/5 p-3 border border-skel-metal/10 max-w-md">
                        <div className="w-12 h-12 rounded-xl bg-focus-neon/10 flex items-center justify-center text-focus-neon shrink-0">
                          <span className="text-xs font-black uppercase">{notification.file.type}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-text-primary truncate">
                            {notification.file.name}
                          </div>
                          <div className="text-xs text-text-secondary opacity-60">
                            {notification.file.size}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 rounded-xl border-skel-metal/20 hover:bg-focus-neon/10 text-focus-neon gap-2">
                          <ExternalLink size={14} />
                          Aç
                        </Button>
                      </div>
                    )}

                    {notification.hasActions && (
                      <div className="flex gap-3 mt-2">
                        <Button 
                          variant="outline" 
                          className="h-10 px-6 rounded-xl border-skel-metal/20 hover:bg-crit-blood/5 hover:text-crit-vivid hover:border-crit-blood/20 font-bold text-xs"
                          onClick={() => handleAction(notification.id, 'decline')}
                        >
                          Reddet
                        </Button>
                        <Button 
                          className="h-10 px-6 rounded-xl bg-focus-neon hover:bg-focus-main text-pure-white font-bold text-xs shadow-lg shadow-focus-neon/20"
                          onClick={() => handleAction(notification.id, 'accept')}
                        >
                          Kabul Et
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
              <div className="w-24 h-24 rounded-full bg-skel-matte/5 flex items-center justify-center text-skel-metal/20 mb-6">
                <Bell size={48} />
              </div>
              <h3 className="text-xl font-display font-black text-text-primary uppercase tracking-tight">
                Henüz Bildirim Yok
              </h3>
              <p className="text-sm text-text-secondary opacity-60 mt-2 max-w-xs mx-auto">
                Tüm bildirimleriniz burada listelenecektir. Şu an için her şey güncel görünüyor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
