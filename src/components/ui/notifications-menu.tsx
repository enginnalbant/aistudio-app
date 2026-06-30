import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, Notification } from "@/context/NotificationContext";
import { Check, Settings, ExternalLink, Trash2, Bell } from "lucide-react";

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onAction, 
  onRemove 
}: { 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onAction: (id: string, action: 'accept' | 'decline') => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div 
      className={`w-full py-4 first:pt-0 last:pb-0 transition-colors group relative ${!notification.isRead ? 'bg-focus-neon/5' : ''}`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3 px-4">
        <Avatar className="size-11 border border-skel-metal/10">
          <AvatarImage
            src={notification.user.avatar || "/placeholder.svg"}
            alt={`${notification.user.name}'s profile picture`}
            className="object-cover"
          />
          <AvatarFallback className="bg-skel-matte/10 text-text-secondary">{notification.user.fallback}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col space-y-2">
          <div className="w-full items-start">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <span className="font-bold text-text-primary">{notification.user.name}</span>
                  <span className="text-text-secondary">
                    {" "}
                    {notification.action}{" "}
                  </span>
                  {notification.target && (
                    <span className="font-bold text-focus-neon">{notification.target}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!notification.isRead && (
                    <div className="size-2 rounded-full bg-focus-neon shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(notification.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-crit-blood/10 text-text-secondary hover:text-crit-vivid rounded-md transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-text-secondary opacity-60 font-mono">
                  {notification.timestamp}
                </div>
                <div className="text-[10px] text-text-secondary opacity-60">
                  {notification.timeAgo}
                </div>
              </div>
            </div>
          </div>

          {notification.content && (
            <div className="rounded-xl bg-skel-matte/5 p-3 text-xs leading-relaxed text-text-secondary border border-skel-metal/5">
              {notification.content}
            </div>
          )}

          {notification.file && (
            <div className="flex items-center gap-3 rounded-xl bg-skel-matte/5 p-2.5 border border-skel-metal/10">
              <div className="w-10 h-10 rounded-lg bg-focus-neon/10 flex items-center justify-center text-focus-neon shrink-0">
                <span className="text-[10px] font-bold uppercase">{notification.file.type}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-text-primary truncate">
                  {notification.file.name}
                </div>
                <div className="text-[10px] text-text-secondary opacity-60">
                  {notification.file.size}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="size-8 hover:bg-focus-neon/10 text-focus-neon">
                <ExternalLink size={14} />
              </Button>
            </div>
          )}

          {notification.hasActions && (
            <div className="flex gap-2 mt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[11px] font-bold border-skel-metal/20 hover:bg-crit-blood/5 hover:text-crit-vivid hover:border-crit-blood/20 flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(notification.id, 'decline');
                }}
              >
                Reddet
              </Button>
              <Button 
                size="sm" 
                className="h-8 text-[11px] font-bold bg-focus-neon hover:bg-focus-main text-pure-white flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(notification.id, 'accept');
                }}
              >
                Kabul Et
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const NotificationsMenu = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    handleAction, 
    removeNotification 
  } = useNotifications();
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const verifiedCount = notifications.filter(
    (n) => n.type === "follow" || n.type === "like",
  ).length;
  const mentionCount = notifications.filter((n) => n.type === "mention").length;

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "verified":
        return notifications.filter(
          (n) => n.type === "follow" || n.type === "like",
        );
      case "mentions":
        return notifications.filter((n) => n.type === "mention");
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  const handleNavigate = (module: string) => {
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule(module);
    }
    // Close popover if possible (usually handled by clicking outside or state)
  };

  return (
    <Card className="flex w-full max-w-[520px] flex-col gap-0 p-0 bento-card border-skel-metal/20 overflow-hidden shadow-2xl">
      <CardHeader className="p-5 border-b border-skel-metal/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-display font-black tracking-tight text-text-primary uppercase">
              Bildirimler
            </h3>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge className="bg-focus-neon text-pure-white text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              className="size-8 hover:bg-focus-neon/10 text-text-secondary hover:text-focus-neon transition-colors" 
              variant="ghost" 
              size="icon"
              title="Tümünü Okundu İşaretle"
              onClick={markAllAsRead}
            >
              <Check size={16} />
            </Button>
            <Button 
              className="size-8 hover:bg-focus-neon/10 text-text-secondary hover:text-focus-neon transition-colors" 
              variant="ghost" 
              size="icon"
              title="Bildirim Ayarları"
              onClick={() => handleNavigate('notification-settings')}
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="bg-skel-matte/5 p-1 rounded-xl w-full border border-skel-metal/5">
            <TabsTrigger value="all" className="flex-1 text-[11px] font-bold data-[state=active]:bg-skel-space data-[state=active]:text-focus-neon data-[state=active]:shadow-sm rounded-lg py-1.5 transition-all">
              Tümü
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex-1 text-[11px] font-bold data-[state=active]:bg-skel-space data-[state=active]:text-focus-neon data-[state=active]:shadow-sm rounded-lg py-1.5 transition-all">
              Etkileşim
            </TabsTrigger>
            <TabsTrigger value="mentions" className="flex-1 text-[11px] font-bold data-[state=active]:bg-skel-space data-[state=active]:text-focus-neon data-[state=active]:shadow-sm rounded-lg py-1.5 transition-all">
              Bahsetmeler
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="max-h-[400px] overflow-y-auto custom-scrollbar p-0">
        <div className="divide-y divide-skel-metal/5">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onAction={handleAction}
                onRemove={removeNotification}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 py-16 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-skel-matte/5 flex items-center justify-center text-skel-metal/30">
                <Bell size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-text-primary">Henüz bildirim yok</p>
                <p className="text-[11px] text-text-secondary opacity-60">Yeni bir bildirim aldığınızda burada görünecektir.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <div className="p-3 border-t border-skel-metal/10 bg-skel-matte/5">
        <Button 
          variant="ghost" 
          className="w-full h-10 text-[11px] font-black uppercase tracking-widest text-focus-neon hover:bg-focus-neon/10 rounded-xl flex items-center justify-center gap-2 group"
          onClick={() => handleNavigate('notification-page')}
        >
          Tüm Bildirimleri Gör
          <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};
